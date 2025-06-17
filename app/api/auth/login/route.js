import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../../../../lib/prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: { regions: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const passwordMatch = await bcrypt.compare(password, user.motDePasse);
    if (!passwordMatch) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Check if user account is active
    if (user.statut !== 'actif') {
      let errorMessage = 'Votre compte n\'est pas actif';
      if (user.statut === 'inactif') {
        errorMessage = 'Votre compte a été désactivé. Contactez un administrateur.';
      } else if (user.statut === 'suspendu') {
        errorMessage = 'Votre compte a été suspendu. Contactez un administrateur.';
      }
      return NextResponse.json({ error: errorMessage }, { status: 403 });
    }

    // Update last connection date
    await prisma.user.update({
      where: { id: user.id },
      data: { derniereConnexion: new Date() }
    });

    // Create JWT payload
    const payload = {
      userId: user.id,
      role: user.role,
      regions: user.regions.map(r => r.id),
      email: user.email
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '8h' });

    // Set token in HttpOnly cookie
    const response = NextResponse.json({ message: 'Login successful' });
    response.cookies.set('token', token, {
      httpOnly: true,
     // secure: process.env.NODE_ENV === 'production',
      secure: false,
      maxAge: 8 * 60 * 60,
      path: '/'
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
