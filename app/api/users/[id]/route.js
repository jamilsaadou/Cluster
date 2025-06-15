import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import bcrypt from 'bcryptjs';
import { requireAuth, isSuperAdmin } from '../../../../lib/auth';

// GET - Fetch single user
export const GET = requireAuth(async (request, { params }) => {
  const currentUser = request.user;
  
  try {
    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id);
    
    // Only superadmin or admin can view other users, or users can view themselves
    if (!['superadmin', 'admin'].includes(currentUser.role) && currentUser.userId !== id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    
    // Validate that id is a valid number
    if (isNaN(id) || id <= 0) {
      return NextResponse.json(
        { error: 'ID d\'utilisateur invalide' },
        { status: 400 }
      );
    }
    
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        prenom: true,
        nom: true,
        email: true,
        telephone: true,
        role: true,
        regions: {
          select: {
            id: true,
            nom: true
          }
        },
        statut: true,
        permissions: true,
        specialite: true,
        experience: true,
        dateCreation: true,
        derniereConnexion: true
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération de l\'utilisateur' },
      { status: 500 }
    );
  }
});

// PUT - Update user
export const PUT = requireAuth(async (request, { params }) => {
  const currentUser = request.user;
  
  // Only superadmin or admin can update users
  if (!['superadmin', 'admin'].includes(currentUser.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id);
    
    // Validate that id is a valid number
    if (isNaN(id) || id <= 0) {
      return NextResponse.json(
        { error: 'ID d\'utilisateur invalide' },
        { status: 400 }
      );
    }
    
    const body = await request.json();
    const {
      prenom,
      nom,
      email,
      telephone,
      motDePasse,
      role,
      regionIds,
      statut,
      permissions,
      specialite,
      experience
    } = body;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id }
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    // Check email uniqueness if email is being changed
    if (email !== existingUser.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email }
      });

      if (emailExists) {
        return NextResponse.json(
          { error: 'Un utilisateur avec cet email existe déjà' },
          { status: 400 }
        );
      }
    }

    // Prepare update data
    const updateData = {
      prenom,
      nom,
      email,
      telephone,
      role,
      statut,
      permissions
    };

    // Handle regions if provided
    if (regionIds && Array.isArray(regionIds)) {
      updateData.regions = {
        set: regionIds.map(id => ({ id: parseInt(id) }))
      };
    }

    // Handle conseiller-specific fields
    if (role === 'conseiller') {
      if (specialite && specialite.trim()) {
        updateData.specialite = specialite.trim();
      }
      if (experience !== undefined && experience !== null && experience !== '') {
        const expValue = parseInt(experience);
        if (!isNaN(expValue) && expValue >= 0) {
          updateData.experience = expValue;
        }
      }
    } else {
      // Clear conseiller-specific fields for non-conseiller roles
      updateData.specialite = null;
      updateData.experience = null;
    }

    // Only hash and update password if it's provided
    if (motDePasse) {
      updateData.motDePasse = await bcrypt.hash(motDePasse, 12);
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      include: {
        regions: true
      }
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour de l\'utilisateur' },
      { status: 500 }
    );
  }
});

// PATCH - Partial update user (e.g., status change)
export const PATCH = requireAuth(async (request, { params }) => {
  const currentUser = request.user;
  
  // Only superadmin or admin can update users
  if (!['superadmin', 'admin'].includes(currentUser.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id);
    
    // Validate that id is a valid number
    if (isNaN(id) || id <= 0) {
      return NextResponse.json(
        { error: 'ID d\'utilisateur invalide' },
        { status: 400 }
      );
    }
    
    const body = await request.json();

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id }
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    // Prepare update data with only provided fields
    const updateData = {};
    
    // Only update fields that are provided in the request
    if (body.statut !== undefined) {
      updateData.statut = body.statut;
    }
    
    if (body.role !== undefined) {
      updateData.role = body.role;
    }
    
    if (body.permissions !== undefined) {
      updateData.permissions = body.permissions;
    }

    // Update user with only the provided fields
    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      include: {
        regions: true
      }
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour de l\'utilisateur' },
      { status: 500 }
    );
  }
});

// DELETE - Delete user
export const DELETE = requireAuth(async (request, { params }) => {
  const currentUser = request.user;
  
  // Only superadmin can delete users
  if (!isSuperAdmin(currentUser)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id);
    
    // Validate that id is a valid number
    if (isNaN(id) || id <= 0) {
      return NextResponse.json(
        { error: 'ID d\'utilisateur invalide' },
        { status: 400 }
      );
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    // Delete user
    await prisma.user.delete({
      where: { id }
    });

    return NextResponse.json(
      { message: 'Utilisateur supprimé avec succès' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression de l\'utilisateur' },
      { status: 500 }
    );
  }
});
