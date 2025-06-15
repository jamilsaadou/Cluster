import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { requireAuth, isSuperAdmin } from '../../../../lib/auth';

// GET - Fetch single activity
export const GET = requireAuth(async (request, context) => {
  const user = request.user;
  const { params } = context || {};
  
  try {
    const resolvedParams = await params;
    const id = parseInt(resolvedParams?.id);
    
    // Validate that id is a valid number
    if (isNaN(id) || id <= 0) {
      return NextResponse.json(
        { error: 'ID d\'activité invalide' },
        { status: 400 }
      );
    }
    
    const activite = await prisma.activite.findUnique({
      where: { id },
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

    if (!activite) {
      return NextResponse.json(
        { error: 'Activité non trouvée' },
        { status: 404 }
      );
    }

    // Check access based on user role
    if (isSuperAdmin(user)) {
      // Superadmin can access all activities
    } else if (user.role === 'conseiller') {
      // Conseillers can only access their own activities
      if (activite.createdById !== user.userId) {
        return NextResponse.json(
          { error: 'Vous n\'avez pas accès à cette activité' },
          { status: 403 }
        );
      }
    } else {
      // Admin and other roles can access activities in their regions
      if (!user.regions.includes(activite.regionId)) {
        return NextResponse.json(
          { error: 'Vous n\'avez pas accès à cette activité' },
          { status: 403 }
        );
      }
    }

    return NextResponse.json(activite);
  } catch (error) {
    console.error('Error fetching activity:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération de l\'activité' },
      { status: 500 }
    );
  }
});

// PUT - Update activity (including status approval)
export const PUT = requireAuth(async (request, context) => {
  const user = request.user;
  const { params } = context || {};
  
  try {
    const resolvedParams = await params;
    const id = parseInt(resolvedParams?.id);
    
    // Validate that id is a valid number
    if (isNaN(id) || id <= 0) {
      return NextResponse.json(
        { error: 'ID d\'activité invalide' },
        { status: 400 }
      );
    }
    
    const body = await request.json();
    const { statut, ...otherData } = body;

    // Check if activity exists
    const existingActivite = await prisma.activite.findUnique({
      where: { id }
    });

    if (!existingActivite) {
      return NextResponse.json(
        { error: 'Activité non trouvée' },
        { status: 404 }
      );
    }

    // Check access based on user role
    if (isSuperAdmin(user)) {
      // Superadmin can modify all activities
    } else if (user.role === 'conseiller') {
      // Conseillers can only modify their own activities and only if they are pending
      if (existingActivite.createdById !== user.userId) {
        return NextResponse.json(
          { error: 'Vous n\'avez pas accès à cette activité' },
          { status: 403 }
        );
      }
      // Conseillers can only modify activities that are still pending
      if (existingActivite.statut !== 'en_attente') {
        return NextResponse.json(
          { error: 'Vous ne pouvez modifier que les activités en attente de validation' },
          { status: 403 }
        );
      }
    } else {
      // Admin and other roles can modify activities in their regions
      if (!user.regions.includes(existingActivite.regionId)) {
        return NextResponse.json(
          { error: 'Vous n\'avez pas accès à cette activité' },
          { status: 403 }
        );
      }
    }

    // For status changes, admin, superadmin, and superviseurs can approve/reject
    if (statut && statut !== existingActivite.statut) {
      if (!['admin', 'superadmin', 'superviseur'].includes(user.role)) {
        return NextResponse.json(
          { error: 'Seuls les administrateurs et superviseurs peuvent modifier le statut des activités' },
          { status: 403 }
        );
      }
      
      // Superviseurs can only approve/reject activities in their regions
      if (user.role === 'superviseur' && !user.regions.includes(existingActivite.regionId)) {
        return NextResponse.json(
          { error: 'Vous ne pouvez valider que les activités de votre région' },
          { status: 403 }
        );
      }
    }

    // Prepare update data
    const updateData = {};
    
    // If only updating status (approval/rejection)
    if (statut && Object.keys(body).length === 1) {
      updateData.statut = statut;
    } else {
      // Full update (for editing activity details)
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
      } = otherData;

      if (typeActivite) updateData.type = typeActivite.trim();
      if (thematique) updateData.thematique = thematique.trim();
      if (duree) updateData.duree = parseFloat(duree);
      if (regionId) updateData.regionId = parseInt(regionId);
      if (siteId) updateData.siteId = parseInt(siteId);
      if (statut) updateData.statut = statut;
      
      if (geolocation?.latitude && geolocation?.longitude) {
        updateData.geolocalisation = {
          lat: parseFloat(geolocation.latitude),
          lng: parseFloat(geolocation.longitude)
        };
      }
      
      if (beneficiaires) {
        updateData.beneficiaires = {
          hommes: parseInt(beneficiaires.hommes || 0),
          femmes: parseInt(beneficiaires.femmes || 0),
          jeunes: parseInt(beneficiaires.jeunes || 0)
        };
      }
      
      if (photos) updateData.photos = photos;
      if (commentaires !== undefined) updateData.commentaires = commentaires?.trim() || null;
    }

    // Update activity
    const updatedActivite = await prisma.activite.update({
      where: { id },
      data: updateData,
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

    return NextResponse.json(updatedActivite);
  } catch (error) {
    console.error('Error updating activity:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour de l\'activité' },
      { status: 500 }
    );
  }
});

// DELETE - Delete activity
export const DELETE = requireAuth(async (request, context) => {
  const user = request.user;
  const { params } = context || {};
  
  // Only superadmin or admin can delete activities
  if (!['superadmin', 'admin'].includes(user.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const resolvedParams = await params;
    const id = parseInt(resolvedParams?.id);
    
    // Validate that id is a valid number
    if (isNaN(id) || id <= 0) {
      return NextResponse.json(
        { error: 'ID d\'activité invalide' },
        { status: 400 }
      );
    }

    // Check if activity exists
    const activite = await prisma.activite.findUnique({
      where: { id }
    });

    if (!activite) {
      return NextResponse.json(
        { error: 'Activité non trouvée' },
        { status: 404 }
      );
    }

    // Check access based on user role
    if (isSuperAdmin(user)) {
      // Superadmin can delete all activities
    } else if (user.role === 'conseiller') {
      // Conseillers cannot delete activities (or only their own if allowed)
      return NextResponse.json(
        { error: 'Vous n\'avez pas l\'autorisation de supprimer des activités' },
        { status: 403 }
      );
    } else {
      // Admin and other roles can delete activities in their regions
      if (!user.regions.includes(activite.regionId)) {
        return NextResponse.json(
          { error: 'Vous n\'avez pas accès à cette activité' },
          { status: 403 }
        );
      }
    }

    // Delete activity
    await prisma.activite.delete({
      where: { id }
    });

    return NextResponse.json(
      { message: 'Activité supprimée avec succès' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting activity:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression de l\'activité' },
      { status: 500 }
    );
  }
});
