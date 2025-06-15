import { NextResponse } from 'next/server';
import { getUserFromRequest } from '../../../../lib/auth';

export async function GET(request) {
  try {
    const user = getUserFromRequest(request);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }

    // Return user info without sensitive data
    const userInfo = {
      userId: user.userId,
      email: user.email,
      prenom: user.prenom,
      nom: user.nom,
      role: user.role,
      regions: user.regions || [],
      permissions: user.permissions || []
    };

    return NextResponse.json(userInfo);
  } catch (error) {
    console.error('Error fetching current user:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
