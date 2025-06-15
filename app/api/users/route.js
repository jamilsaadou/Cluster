import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import bcrypt from 'bcryptjs';
import { requireAuth, isSuperAdmin } from '../../../lib/auth';

// GET - Fetch all users
export const GET = requireAuth(async (request) => {
  const user = request.user;

  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search') || '';
  const role = searchParams.get('role') || '';
  const statut = searchParams.get('statut') || '';
  const regionId = searchParams.get('regionId') || '';

  // Build query filters
  const filters = {
    AND: [
      search ? {
        OR: [
          { prenom: { contains: search, mode: 'insensitive' } },
          { nom: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } }
        ]
      } : {},
      role ? { role } : {},
      statut ? { statut } : {}
    ]
  };

  // If user is not superadmin, filter by user's regions
  if (!isSuperAdmin(user)) {
    filters.AND.push({
      regions: {
        some: {
          id: { in: user.regions }
        }
      }
    });
  } else if (regionId) {
    filters.AND.push({
      regions: {
        some: {
          id: parseInt(regionId)
        }
      }
    });
  }

  const users = await prisma.user.findMany({
    where: filters,
    include: {
      regions: true
    },
    orderBy: {
      dateCreation: 'desc'
    }
  });

  return NextResponse.json({ users });
});

// POST - Create new user
export const POST = requireAuth(async (request) => {
  const user = request.user;
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

  // Only superadmin or admin can create users
  if (!['superadmin', 'admin'].includes(user.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  // Validate required fields
  if (!prenom || !nom || !email || !telephone || !motDePasse || !role || !regionIds || regionIds.length === 0) {
    return NextResponse.json(
      { error: 'Tous les champs obligatoires doivent être remplis' },
      { status: 400 }
    );
  }

  // Validate regions exist
  const regions = await prisma.region.findMany({
    where: { id: { in: regionIds.map(id => parseInt(id)) } }
  });

  if (regions.length !== regionIds.length) {
    return NextResponse.json(
      { error: 'Une ou plusieurs régions sont invalides' },
      { status: 400 }
    );
  }

  // Additional validation for conseiller role
  if (role === 'conseiller') {
    if (!specialite || !specialite.trim()) {
      return NextResponse.json(
        { error: 'La spécialité est obligatoire pour un conseiller' },
        { status: 400 }
      );
    }
    if (experience === undefined || experience === null || experience < 0) {
      return NextResponse.json(
        { error: 'L\'expérience est obligatoire pour un conseiller' },
        { status: 400 }
      );
    }
  }

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email }
  });

  if (existingUser) {
    return NextResponse.json(
      { error: 'Un utilisateur avec cet email existe déjà' },
      { status: 400 }
    );
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(motDePasse, 12);

  // Prepare user data
  const userData = {
    prenom,
    nom,
    email,
    telephone,
    motDePasse: hashedPassword,
    role,
    statut: statut || 'actif',
    permissions: permissions || {},
    regions: {
      connect: regionIds.map(id => ({ id: parseInt(id) }))
    }
  };

  // Only add conseiller-specific fields if role is conseiller and values are provided
  if (role === 'conseiller') {
    if (specialite && specialite.trim()) {
      userData.specialite = specialite.trim();
    }
    if (experience !== undefined && experience !== null && experience !== '') {
      const expValue = parseInt(experience);
      if (!isNaN(expValue) && expValue >= 0) {
        userData.experience = expValue;
      }
    }
  } else {
    // For non-conseiller roles, ensure these fields are not included
    // This prevents empty strings from being passed to Prisma
  }

  // Create user
  try {
    const newUser = await prisma.user.create({
      data: userData,
      include: {
        regions: true
      }
    });

    // Remove password from response
    const { motDePasse: _, ...userResponse } = newUser;

    return NextResponse.json(userResponse, { status: 201 });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création de l\'utilisateur' },
      { status: 500 }
    );
  }
});
