import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

export function getUserFromRequest(request) {
  // For App Router, we need to get cookies differently
  const cookieHeader = request.headers.get('cookie');
  if (!cookieHeader) return null;
  
  const cookies = Object.fromEntries(
    cookieHeader.split('; ').map(cookie => {
      const [name, value] = cookie.split('=');
      return [name, decodeURIComponent(value)];
    })
  );
  
  const token = cookies.token;
  if (!token) return null;
  return verifyToken(token);
}

export function requireAuth(handler) {
  return async (request, context) => {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    request.user = user;
    return handler(request, context);
  };
}

export function isSuperAdmin(user) {
  return user?.role === 'superadmin';
}

export function hasRegionAccess(user, regionId) {
  if (isSuperAdmin(user)) return true;
  return user?.regions?.includes(regionId);
}
