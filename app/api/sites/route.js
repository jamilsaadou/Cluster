import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import { requireAuth, isSuperAdmin } from '../../../lib/auth';

// GET - Fetch all sites
export const GET = requireAuth(async (request) => {
  const user = request.user;

  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search') || '';
  const regionId = searchParams.get('regionId') || '';
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '50');
  const offset = (page - 1) * limit;

  // Build query filters
  const filters = {
    AND: [
      search ? {
        OR: [
          { nom: { contains: search, mode: 'insensitive' } },
          { commune: { contains: search, mode: 'insensitive' } },
          { village: { contains: search, mode: 'insensitive' } }
        ]
      } : {}
    ]
  };

  // Filter based on user role and permissions
  if (!isSuperAdmin(user)) {
    if (user.role === 'conseiller') {
      // For conseillers, only show assigned sites
      filters.AND.push({
        assignedUsers: {
          some: {
            id: user.userId
          }
        }
      });
    } else {
      // For other non-superadmin users, filter by regions
      filters.AND.push({
        regionId: { in: user.regions }
      });
    }
  } else if (regionId) {
    filters.AND.push({
      regionId: parseInt(regionId)
    });
  }

  try {
    // Get total count for pagination
    const totalCount = await prisma.site.count({
      where: filters
    });

    // Get sites with pagination and optimized query
    const sites = await prisma.site.findMany({
      where: filters,
      select: {
        id: true,
        nom: true,
        commune: true,
        village: true,
        superficie: true,
        coordonnees: true,
        operateurs: true,
        systemes: true,
        cultures: true,
        dateCreation: true,
        regionId: true,
        createdById: true,
        region: {
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
        },
        // Exclude photos from list view to reduce memory usage
        // photos: false (implicitly excluded by select)
      },
      orderBy: {
        dateCreation: 'desc'
      },
      take: limit,
      skip: offset
    });

    return NextResponse.json({
      sites,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching sites:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des sites' },
      { status: 500 }
    );
  }
});

// POST - Create new site
export const POST = requireAuth(async (request) => {
  const user = request.user;
  
  try {
    const body = await request.json();
    const {
      basicInfo,
      location,
      operators,
      systems,
      crops,
      photos
    } = body;

    // Validate required fields
    if (!basicInfo?.name?.trim()) {
      return NextResponse.json(
        { error: 'Le nom du site est obligatoire' },
        { status: 400 }
      );
    }

    if (!location?.region || !location?.commune?.trim() || !location?.village?.trim()) {
      return NextResponse.json(
        { error: 'La région, commune et village sont obligatoires' },
        { status: 400 }
      );
    }

    if (!location?.area || Number(location.area) <= 0) {
      return NextResponse.json(
        { error: 'La superficie doit être un nombre positif' },
        { status: 400 }
      );
    }

    // Validate region exists and user has access
    const regionId = parseInt(location.region);
    
    if (isNaN(regionId) || regionId <= 0) {
      return NextResponse.json(
        { error: 'ID de région invalide' },
        { status: 400 }
      );
    }

    const region = await prisma.region.findUnique({
      where: { id: regionId }
    });

    if (!region) {
      return NextResponse.json(
        { error: 'Région non trouvée' },
        { status: 400 }
      );
    }

    // Check if user has access to this region
    if (!isSuperAdmin(user) && !user.regions.includes(regionId)) {
      return NextResponse.json(
        { error: 'Vous n\'avez pas accès à cette région' },
        { status: 403 }
      );
    }

    // Prepare site data
    const siteData = {
      nom: basicInfo.name.trim(),
      commune: location.commune.trim(),
      village: location.village.trim(),
      superficie: parseFloat(location.area),
      regionId: regionId,
      createdById: user.userId,
      coordonnees: location.coordinates?.lat && location.coordinates?.lng ? {
        lat: parseFloat(location.coordinates.lat),
        lng: parseFloat(location.coordinates.lng)
      } : null,
      operateurs: {
        hommes: parseInt(operators?.men || 0),
        femmes: parseInt(operators?.women || 0),
        jeunes: parseInt(operators?.youth || 0)
      },
      systemes: {
        captureSystems: systems?.captureSystems || [],
        irrigationSystems: systems?.irrigationSystems || []
      },
      cultures: {
        types: crops?.types || []
      },
      photos: photos || []
    };

    // Create site
    const newSite = await prisma.site.create({
      data: siteData,
      include: {
        region: true,
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

    return NextResponse.json(newSite, { status: 201 });
  } catch (error) {
    console.error('Error creating site:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création du site' },
      { status: 500 }
    );
  }
});
