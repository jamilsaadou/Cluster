import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import { requireAuth, isSuperAdmin } from '../../../lib/auth';

// GET - Fetch all activities
export const GET = requireAuth(async (request) => {
  const user = request.user;

  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search') || '';
  const regionId = searchParams.get('regionId') || '';
  const siteId = searchParams.get('siteId') || '';
  const statut = searchParams.get('statut') || '';

  // Build query filters
  const filters = {
    AND: [
      search ? {
        OR: [
          { type: { contains: search, mode: 'insensitive' } },
          { thematique: { contains: search, mode: 'insensitive' } },
          { commentaires: { contains: search, mode: 'insensitive' } }
        ]
      } : {},
      statut ? { statut } : {}
    ]
  };

  // Apply role-based filtering
  if (isSuperAdmin(user)) {
    // Superadmin can see all activities, optionally filtered by region
    if (regionId) {
      filters.AND.push({
        regionId: parseInt(regionId)
      });
    }
  } else if (user.role === 'conseiller') {
    // Conseillers can only see their own activities
    filters.AND.push({
      createdById: user.userId
    });
  } else {
    // Admin and other roles can see activities in their regions
    filters.AND.push({
      regionId: { in: user.regions }
    });
    if (regionId) {
      filters.AND.push({
        regionId: parseInt(regionId)
      });
    }
  }

  // Filter by site if specified
  if (siteId) {
    filters.AND.push({
      siteId: parseInt(siteId)
    });
  }

  try {
    const activites = await prisma.activite.findMany({
      where: filters,
      select: {
        id: true,
        type: true,
        thematique: true,
        duree: true,
        regionId: true,
        siteId: true,
        createdById: true,
        geolocalisation: true,
        beneficiaires: true,
        statut: true,
        dateCreation: true,
        commentaires: true,
        // Exclude photos from list view to avoid memory issues
        region: {
          select: {
            id: true,
            nom: true
          }
        },
        site: {
          select: {
            id: true,
            nom: true
          }
        },
        createdBy: {
          select: {
            id: true,
            prenom: true,
            nom: true,
            email: true
          }
        }
      },
      orderBy: {
        dateCreation: 'desc'
      }
    });

    return NextResponse.json(activites);
  } catch (error) {
    console.error('Error fetching activities:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des activités' },
      { status: 500 }
    );
  }
});

// POST - Create new activity
export const POST = requireAuth(async (request) => {
  const user = request.user;
  
  try {
    const body = await request.json();
    const {
      typeActivite,
      thematique,
      regionId,
      siteId,
      duree,
      geolocation,
      beneficiaires,
      photos,
      commentaires
    } = body;

    // Validate required fields
    if (!typeActivite?.trim()) {
      return NextResponse.json(
        { error: 'Le type d\'activité est obligatoire' },
        { status: 400 }
      );
    }

    if (!thematique?.trim()) {
      return NextResponse.json(
        { error: 'La thématique est obligatoire' },
        { status: 400 }
      );
    }

    if (!regionId || !siteId) {
      return NextResponse.json(
        { error: 'La région et le site sont obligatoires' },
        { status: 400 }
      );
    }

    if (!duree || Number(duree) <= 0) {
      return NextResponse.json(
        { error: 'La durée doit être un nombre positif' },
        { status: 400 }
      );
    }

    // Validate region and site IDs
    const regionIdInt = parseInt(regionId);
    const siteIdInt = parseInt(siteId);

    if (isNaN(regionIdInt) || regionIdInt <= 0) {
      return NextResponse.json(
        { error: 'ID de région invalide' },
        { status: 400 }
      );
    }

    if (isNaN(siteIdInt) || siteIdInt <= 0) {
      return NextResponse.json(
        { error: 'ID de site invalide' },
        { status: 400 }
      );
    }

    // Validate region exists and user has access
    const region = await prisma.region.findUnique({
      where: { id: regionIdInt }
    });

    if (!region) {
      return NextResponse.json(
        { error: 'Région non trouvée' },
        { status: 400 }
      );
    }

    // Check if user has access to this region
    if (!isSuperAdmin(user) && !user.regions.includes(regionIdInt)) {
      return NextResponse.json(
        { error: 'Vous n\'avez pas accès à cette région' },
        { status: 403 }
      );
    }

    // Validate site exists and belongs to the region
    const site = await prisma.site.findUnique({
      where: { id: siteIdInt }
    });

    if (!site) {
      return NextResponse.json(
        { error: 'Site non trouvé' },
        { status: 400 }
      );
    }

    if (site.regionId !== regionIdInt) {
      return NextResponse.json(
        { error: 'Le site ne correspond pas à la région sélectionnée' },
        { status: 400 }
      );
    }

    // Prepare activity data
    const activiteData = {
      type: typeActivite.trim(),
      thematique: thematique.trim(),
      duree: parseFloat(duree),
      regionId: regionIdInt,
      siteId: siteIdInt,
      createdById: user.userId,
      geolocalisation: geolocation?.latitude && geolocation?.longitude ? {
        lat: parseFloat(geolocation.latitude),
        lng: parseFloat(geolocation.longitude)
      } : null,
      beneficiaires: {
        hommes: parseInt(beneficiaires?.hommes || 0),
        femmes: parseInt(beneficiaires?.femmes || 0),
        jeunes: parseInt(beneficiaires?.jeunes || 0)
      },
      photos: photos || [],
      commentaires: commentaires?.trim() || null,
      statut: 'en_attente' // Default status
    };

    // Create activity
    const newActivite = await prisma.activite.create({
      data: activiteData,
      include: {
        region: true,
        site: true,
        createdBy: {
          select: {
            id: true,
            prenom: true,
            nom: true,
            email: true
          }
        }
      }
    });

    return NextResponse.json(newActivite, { status: 201 });
  } catch (error) {
    console.error('Error creating activity:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création de l\'activité' },
      { status: 500 }
    );
  }
});
