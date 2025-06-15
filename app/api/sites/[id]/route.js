import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { requireAuth, isSuperAdmin } from '../../../../lib/auth';

// GET - Fetch single site
export const GET = requireAuth(async (request, { params }) => {
  const user = request.user;
  
  try {
    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id);
    
    // Validate that id is a valid number
    if (isNaN(id) || id <= 0) {
      return NextResponse.json(
        { error: 'ID de site invalide' },
        { status: 400 }
      );
    }
    
    const site = await prisma.site.findUnique({
      where: { id },
      include: {
        region: true,
        createdBy: {
          select: {
            id: true,
            prenom: true,
            nom: true,
            email: true
          }
        },
        activites: {
          include: {
            createdBy: {
              select: {
                id: true,
                prenom: true,
                nom: true
              }
            }
          }
        }
      }
    });

    if (!site) {
      return NextResponse.json(
        { error: 'Site non trouvé' },
        { status: 404 }
      );
    }

    // Check if user has access to this site
    if (!isSuperAdmin(user)) {
      if (user.role === 'conseiller') {
        // For conseillers, check if site is assigned to them
        const assignedSite = await prisma.site.findFirst({
          where: {
            id: id,
            assignedUsers: {
              some: {
                id: user.userId
              }
            }
          }
        });
        
        if (!assignedSite) {
          return NextResponse.json(
            { error: 'Vous n\'avez pas accès à ce site' },
            { status: 403 }
          );
        }
      } else {
        // For other non-superadmin users, check region access
        if (!user.regions.includes(site.regionId)) {
          return NextResponse.json(
            { error: 'Vous n\'avez pas accès à ce site' },
            { status: 403 }
          );
        }
      }
    }

    return NextResponse.json(site);
  } catch (error) {
    console.error('Error fetching site:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération du site' },
      { status: 500 }
    );
  }
});

// PUT - Update site
export const PUT = requireAuth(async (request, { params }) => {
  const user = request.user;
  
  // Only superadmin and admin can update sites
  if (!['superadmin', 'admin'].includes(user.role)) {
    return NextResponse.json(
      { error: 'Vous n\'avez pas les permissions pour modifier les sites' },
      { status: 403 }
    );
  }
  
  try {
    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id);
    
    // Validate that id is a valid number
    if (isNaN(id) || id <= 0) {
      return NextResponse.json(
        { error: 'ID de site invalide' },
        { status: 400 }
      );
    }
    
    const body = await request.json();
    const {
      basicInfo,
      location,
      operators,
      systems,
      crops,
      photos
    } = body;

    // Check if site exists
    const existingSite = await prisma.site.findUnique({
      where: { id }
    });

    if (!existingSite) {
      return NextResponse.json(
        { error: 'Site non trouvé' },
        { status: 404 }
      );
    }

    // Check if user has access to this site's region (only for non-superadmin)
    if (!isSuperAdmin(user)) {
      const userRegions = user.regions || [];
      if (!userRegions.includes(existingSite.regionId)) {
        return NextResponse.json(
          { error: 'Vous n\'avez pas accès à ce site' },
          { status: 403 }
        );
      }
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

    // Check if user has access to the new region
    if (!isSuperAdmin(user) && !user.regions.includes(regionId)) {
      return NextResponse.json(
        { error: 'Vous n\'avez pas accès à cette région' },
        { status: 403 }
      );
    }

    // Prepare update data
    const updateData = {
      nom: basicInfo.name.trim(),
      commune: location.commune.trim(),
      village: location.village.trim(),
      superficie: parseFloat(location.area),
      regionId: regionId,
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

    // Update site
    const updatedSite = await prisma.site.update({
      where: { id },
      data: updateData,
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

    return NextResponse.json(updatedSite);
  } catch (error) {
    console.error('Error updating site:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour du site' },
      { status: 500 }
    );
  }
});

// DELETE - Delete site
export const DELETE = requireAuth(async (request, { params }) => {
  const user = request.user;
  console.log(`DELETE request for site. User: ${user.email}, Role: ${user.role}`);
  
  // Only superadmin or admin can delete sites
  if (!['superadmin', 'admin'].includes(user.role)) {
    console.log(`Unauthorized deletion attempt by user ${user.email} with role ${user.role}`);
    return NextResponse.json({ 
      error: 'Unauthorized', 
      detail: 'Only superadmin or admin can delete sites',
      userRole: user.role
    }, { status: 403 });
  }

  try {
    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id);
    console.log(`Attempting to delete site with ID: ${resolvedParams.id} (parsed as: ${id})`);
    
    // Validate that id is a valid number
    if (isNaN(id) || id <= 0) {
      console.log(`Invalid site ID provided: ${resolvedParams.id}`);
      return NextResponse.json(
        { 
          error: 'ID de site invalide',
          detail: `L'ID fourni "${resolvedParams.id}" n'est pas un nombre valide ou est inférieur ou égal à 0`,
          providedId: resolvedParams.id
        },
        { status: 400 }
      );
    }

    // Check if site exists
    const site = await prisma.site.findUnique({
      where: { id },
      include: {
        activites: true,
        region: true
      }
    });

    if (!site) {
      console.log(`Site not found with ID: ${id}`);
      return NextResponse.json(
        { 
          error: 'Site non trouvé',
          detail: `Aucun site trouvé avec l'ID ${id}`,
          requestedId: id
        },
        { status: 404 }
      );
    }

    console.log(`Found site: ${site.nom} (ID: ${id}) in region: ${site.region.nom}`);

    // Check if user has access to this site's region
    if (!isSuperAdmin(user) && !user.regions.includes(site.regionId)) {
      console.log(`User ${user.email} attempted to delete site in region ${site.regionId} without access`);
      return NextResponse.json(
        { 
          error: 'Vous n\'avez pas accès à ce site',
          detail: 'Vous n\'avez pas les permissions nécessaires pour cette région',
          userRegions: user.regions,
          siteRegion: site.regionId
        },
        { status: 403 }
      );
    }

    // Check if site has activities
    if (site.activites.length > 0) {
      console.log(`Cannot delete site ${id} - has ${site.activites.length} activities`);
      return NextResponse.json(
        { 
          error: 'Impossible de supprimer un site qui contient des activités',
          detail: `Le site contient ${site.activites.length} activité(s). Veuillez d'abord supprimer toutes les activités.`,
          activitiesCount: site.activites.length,
          activityIds: site.activites.map(a => a.id)
        },
        { status: 400 }
      );
    }

    // Delete site
    console.log(`Deleting site ${id}`);
    await prisma.site.delete({
      where: { id }
    });
    console.log(`Successfully deleted site ${id}`);

    return NextResponse.json(
      { 
        message: 'Site supprimé avec succès',
        deletedSiteId: id
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting site:', error);
    return NextResponse.json(
      { 
        error: 'Erreur lors de la suppression du site',
        detail: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
});
