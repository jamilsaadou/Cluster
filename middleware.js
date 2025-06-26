import { NextResponse } from "next/server";

// Whitelist des origines autorisées
const allowedOrigins = [
  'http://207.180.201.77',
  'https://207.180.201.77',
  'https://rapports-c.org',
  'capacitor://rapports-c.org', // Pour l'app mobile Capacitor/Ionic
  'ionic://rapports-c.org'      // Pour l'app mobile Ionic
];

// Patterns d'origines autorisées (pour ports variables)
const allowedOriginPatterns = [
  /^http:\/\/localhost(:\d+)?$/, // localhost avec port variable
  /^http:\/\/127\.0\.0\.1(:\d+)?$/, // 127.0.0.1 avec port variable
  /^capacitor:\/\/localhost(:\d+)?$/, // Capacitor localhost
  /^ionic:\/\/localhost(:\d+)?$/ // Ionic localhost
];

// Fonction utilitaire pour vérifier si une origine est autorisée
function isOriginAllowed(origin) {
  if (!origin) return false;
  
  // Vérifier les origines exactes
  if (allowedOrigins.includes(origin)) {
    return true;
  }
  
  // Vérifier les patterns (pour ports variables)
  return allowedOriginPatterns.some(pattern => pattern.test(origin));
}

// Fonction utilitaire pour extraire le token Bearer
function extractBearerToken(request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  return null;
}

export function middleware(request) {
  // Récupérer l'origine de la requête
  const origin = request.headers.get('origin');
  
  // Handle CORS for API routes and font files
  if (request.nextUrl.pathname.startsWith("/api/") || 
      request.nextUrl.pathname.match(/\/_next\/static\/media\/.*\.woff2$/)) {
    
    // Vérifier si l'origine est autorisée
    const validOrigin = origin && isOriginAllowed(origin) ? origin : null;
    
    // Handle preflight requests
    if (request.method === "OPTIONS") {
      const headers = {
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization, Cookie",
        "Access-Control-Max-Age": "86400",
        "Vary": "Origin"
      };

      // Only add CORS headers for valid origins
      if (validOrigin) {
        headers["Access-Control-Allow-Origin"] = validOrigin;
        headers["Access-Control-Allow-Credentials"] = "true";
      }

      return new NextResponse(null, {
        status: 200,
        headers
      });
    }

    // Handle actual requests
    const response = NextResponse.next();

    // Always add Vary: Origin header for security
    response.headers.set("Vary", "Origin");

    // Only add CORS headers for valid origins
    if (validOrigin) {
      response.headers.set("Access-Control-Allow-Origin", validOrigin);
      response.headers.set("Access-Control-Allow-Credentials", "true");
      response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
      response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization, Cookie");
    }

    return response;
  }

  // Pour les routes non-API, gérer l'authentification
  // EXCEPTION: Les routes d'images sont publiques
  if (request.nextUrl.pathname.startsWith("/api/images/")) {
    return NextResponse.next();
  }
  
  let token = request.cookies.get("token")?.value;
  
  // Si pas de cookie token, essayer le Bearer token
  if (!token) {
    token = extractBearerToken(request);
  }

  // Public routes that don't require authentication
  const publicRoutes = ["/", "/login"];
  const isPublicRoute = publicRoutes.includes(request.nextUrl.pathname);

  // If no token and trying to access protected route, redirect to login
  if (!token && !isPublicRoute) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // If token exists and trying to access login page, redirect to dashboard
  if (token && request.nextUrl.pathname === "/login") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match API routes
    '/api/:path*',
    // Match font files
    '/_next/static/media/:path*.woff2',
    // Match all other paths except static assets and public files
    '/((?!_next/static/(?!media)|_next/image|favicon.ico|public/).*)'
  ],
};
