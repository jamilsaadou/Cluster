/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuration CORS pour les APIs
  async headers() {
    return [
      {
        // Appliquer les headers CORS à toutes les routes API
        source: '/api/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*', // Ou spécifiez des domaines spécifiques
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization, Cookie, X-Requested-With',
          },
          {
            key: 'Access-Control-Allow-Credentials',
            value: 'true',
          },
          {
            key: 'Access-Control-Max-Age',
            value: '86400', // 24 heures
          },
        ],
      },
    ];
  },

  // Configuration pour les images
  images: {
    domains: ['localhost', '207.180.201.77'],
    unoptimized: true,
  },

  // Configuration pour la production
  output: 'standalone',
  
  // Désactiver le strict mode pour éviter les problèmes avec React 19
  reactStrictMode: false,

  // Configuration pour les variables d'environnement
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },

  // Configuration pour les redirections
  async redirects() {
    return [
      {
        source: '/home',
        destination: '/dashboard',
        permanent: true,
      },
    ];
  },

  // Configuration pour les rewrites (si nécessaire)
  async rewrites() {
    return [
      {
        source: '/api/v1/:path*',
        destination: '/api/:path*',
      },
    ];
  },

  // Configuration webpack pour optimiser le build
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Optimisations pour la production
    if (!dev && !isServer) {
      config.optimization.splitChunks.chunks = 'all';
    }
    
    return config;
  },

  // Configuration expérimentale
  experimental: {
    // Désactiver Turbopack si problématique
    // turbo: false,
  },
};

export default nextConfig;
