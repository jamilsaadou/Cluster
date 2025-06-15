import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { requireAuth, isSuperAdmin } from '../../../../lib/auth';

// GET - Fetch site assignments for a user or all assignments
export const GET = requireAuth(async (request) => {
  const user = request.user;
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  const siteId = searchParams.get('siteId');

  // Only superadmin and admin can view assignments
  if (!isSuperAdmin(user) && user.role !== 'admin') {
    return NextResponse.json(
      { error: 'Accès non autorisé' },
      { status: 403 }
    );
  }

  try {
    if (userId) {
      // Get sites assigned to a specific user
      const userWithSites = await prisma.user.findUnique({
        where: { id: parseInt(userId) },
        include: {
          assignedSites: {
            include: {
              region: true
            }
          }
        }
      });

      if (!userWithSites) {
        return NextResponse.json(
          { error: 'Utilisateur non trouvé' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        user: {
          id: userWithSites.id,
          prenom: userWithSites.prenom,
          nom: userWithSites.nom,
          email: userWithSites.email,
          role: userWithSites.role
        },
        assignedSites: userWithSites.assignedSites
      });
    } else if (siteId) {
      // Get users assigned to a specific site
      const siteWithUsers = await prisma.site.findUnique({
        where: { id: parseInt(siteId) },
        include: {
          assignedUsers: {
            select: {
              id: true,
              prenom: true,
              nom: true,
              email: true,
              role: true
            }
          },
          region: true
        }
      });

      if (!siteWithUsers) {
        return NextResponse.json(
          { error: 'Site non trouvé' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        site: {
          id: siteWithUsers.id,
          nom: siteWithUsers.nom,
          commune: siteWithUsers.commune,
          village: siteWithUsers.village,
          region: siteWithUsers.region
        },
        assignedUsers: siteWithUsers.assignedUsers
      });
    } else {
      // Get all assignments with pagination and optimization
      const { searchParams } = new URL(request.url);
      const page = parseInt(searchParams.get('page')) || 1;
      const limit = parseInt(searchParams.get('limit')) || 50;
      const skip = (page - 1) * limit;

      try {
        // Get total count first
        const totalCount = await prisma.site.count();

        // Get assignments with pagination and limited includes
        const assignments = await prisma.site.findMany({
          skip,
          take: limit,
          select: {
            id: true,
            nom: true,
            commune: true,
            village: true,
            assignedUsers: {
              select: {
                id: true,
                prenom: true,
                nom: true,
                email: true,
                role: true
              }
            },
            region: {
              select: {
                id: true,
                nom: true
              }
            }
          },
          orderBy: {
            id: 'asc' // Use id instead of nom for better performance
          }
        });

        return NextResponse.json({ 
          assignments,
          pagination: {
            page,
            limit,
            total: totalCount,
            totalPages: Math.ceil(totalCount / limit)
          }
        });
      } catch (sortError) {
        // Fallback: if sorting still fails, get data without sorting
        console.warn('Sorting failed, fetching without order:', sortError);
        
        const assignments = await prisma.site.findMany({
          skip,
          take: limit,
          select: {
            id: true,
            nom: true,
            commune: true,
            village: true,
            assignedUsers: {
              select: {
                id: true,
                prenom: true,
                nom: true,
                email: true,
                role: true
              }
            },
            region: {
              select: {
                id: true,
                nom: true
              }
            }
          }
        });

        const totalCount = await prisma.site.count();

        return NextResponse.json({ 
          assignments,
          pagination: {
            page,
            limit,
            total: totalCount,
            totalPages: Math.ceil(totalCount / limit)
          }
        });
      }
    }
  } catch (error) {
    console.error('Error fetching site assignments:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des attributions' },
      { status: 500 }
    );
  }
});

// POST - Assign sites to a user
export const POST = requireAuth(async (request) => {
  const user = request.user;

  // Only superadmin and admin can manage assignments
  if (!isSuperAdmin(user) && user.role !== 'admin') {
    return NextResponse.json(
      { error: 'Accès non autorisé' },
      { status: 403 }
    );
  }

  try {
    const { userId, siteIds } = await request.json();

    if (!userId || !Array.isArray(siteIds)) {
      return NextResponse.json(
        { error: 'userId et siteIds (array) sont requis' },
        { status: 400 }
      );
    }

    // Verify user exists and is a conseiller with regions
    const targetUser = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
      include: {
        regions: {
          select: {
            id: true,
            nom: true
          }
        }
      }
    });

    if (!targetUser) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    if (targetUser.role !== 'conseiller') {
      return NextResponse.json(
        { error: 'Seuls les conseillers peuvent avoir des sites attribués' },
        { status: 400 }
      );
    }

    // Check if conseiller has regions assigned
    if (!targetUser.regions || targetUser.regions.length === 0) {
      return NextResponse.json(
        { error: 'Ce conseiller n\'a aucune région attribuée. Veuillez d\'abord lui attribuer une région.' },
        { status: 400 }
      );
    }

    // Get conseiller's region IDs
    const conseillerRegionIds = targetUser.regions.map(region => region.id);

    // Verify all sites exist and are in conseiller's regions
    const sites = await prisma.site.findMany({
      where: {
        id: { in: siteIds.map(id => parseInt(id)) }
      },
      include: {
        region: {
          select: {
            id: true,
            nom: true
          }
        }
      }
    });

    if (sites.length !== siteIds.length) {
      return NextResponse.json(
        { error: 'Un ou plusieurs sites n\'existent pas' },
        { status: 400 }
      );
    }

    // Check if all sites are in conseiller's regions
    const sitesOutsideRegions = sites.filter(site => 
      !conseillerRegionIds.includes(site.regionId)
    );

    if (sitesOutsideRegions.length > 0) {
      const outsideRegionNames = sitesOutsideRegions.map(site => 
        `${site.nom} (${site.region.nom})`
      ).join(', ');
      
      const conseillerRegionNames = targetUser.regions.map(r => r.nom).join(', ');
      
      return NextResponse.json(
        { 
          error: `Impossible d'attribuer des sites en dehors des régions du conseiller. Sites concernés: ${outsideRegionNames}. Régions du conseiller: ${conseillerRegionNames}` 
        },
        { status: 400 }
      );
    }

    // Update user's assigned sites
    const updatedUser = await prisma.user.update({
      where: { id: parseInt(userId) },
      data: {
        assignedSites: {
          set: siteIds.map(id => ({ id: parseInt(id) }))
        }
      },
      include: {
        assignedSites: {
          include: {
            region: true
          }
        }
      }
    });

    return NextResponse.json({
      message: 'Attribution des sites mise à jour avec succès',
      user: {
        id: updatedUser.id,
        prenom: updatedUser.prenom,
        nom: updatedUser.nom,
        email: updatedUser.email
      },
      assignedSites: updatedUser.assignedSites
    });
  } catch (error) {
    console.error('Error assigning sites:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'attribution des sites' },
      { status: 500 }
    );
  }
});

// DELETE - Remove site assignment
export const DELETE = requireAuth(async (request) => {
  const user = request.user;

  // Only superadmin and admin can manage assignments
  if (!isSuperAdmin(user) && user.role !== 'admin') {
    return NextResponse.json(
      { error: 'Accès non autorisé' },
      { status: 403 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const siteId = searchParams.get('siteId');

    if (!userId || !siteId) {
      return NextResponse.json(
        { error: 'userId et siteId sont requis' },
        { status: 400 }
      );
    }

    // Remove the specific site assignment
    await prisma.user.update({
      where: { id: parseInt(userId) },
      data: {
        assignedSites: {
          disconnect: { id: parseInt(siteId) }
        }
      }
    });

    return NextResponse.json({
      message: 'Attribution du site supprimée avec succès'
    });
  } catch (error) {
    console.error('Error removing site assignment:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression de l\'attribution' },
      { status: 500 }
    );
  }
});
