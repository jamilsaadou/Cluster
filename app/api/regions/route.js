import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

// GET - Fetch all regions
export async function GET(request) {
  try {
    const regions = await prisma.region.findMany({
      orderBy: {
        nom: 'asc'
      }
    });

    return NextResponse.json(regions);
  } catch (error) {
    console.error('Error fetching regions:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des régions' },
      { status: 500 }
    );
  }
}

// POST - Create new region (admin only)
export async function POST(request) {
  try {
    const body = await request.json();
    const { nom } = body;

    // Validate required fields
    if (!nom || !nom.trim()) {
      return NextResponse.json(
        { error: 'Le nom de la région est obligatoire' },
        { status: 400 }
      );
    }

    // Check if region already exists
    const existingRegion = await prisma.region.findUnique({
      where: { nom: nom.trim() }
    });

    if (existingRegion) {
      return NextResponse.json(
        { error: 'Une région avec ce nom existe déjà' },
        { status: 400 }
      );
    }

    // Create region
    const region = await prisma.region.create({
      data: {
        nom: nom.trim()
      }
    });

    return NextResponse.json(region, { status: 201 });
  } catch (error) {
    console.error('Error creating region:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création de la région' },
      { status: 500 }
    );
  }
}
