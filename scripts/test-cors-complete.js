// Script de test complet pour la configuration CORS
const fetch = require('node-fetch');

const endpoints = [
  // Endpoints d'authentification
  { path: '/api/auth/login', methods: ['POST', 'OPTIONS'] },
  { path: '/api/auth/me', methods: ['GET', 'OPTIONS'] },
  { path: '/api/auth/logout', methods: ['POST', 'OPTIONS'] },
  
  // Endpoints de données
  { path: '/api/sites', methods: ['GET', 'POST', 'OPTIONS'] },
  { path: '/api/users', methods: ['GET', 'POST', 'OPTIONS'] },
  { path: '/api/activites', methods: ['GET', 'POST', 'OPTIONS'] },
  { path: '/api/dashboard/stats', methods: ['GET', 'OPTIONS'] },
  
  // Endpoints de ressources
  { path: '/_next/static/media/test.woff2', methods: ['GET', 'OPTIONS'] }
];

const origins = [
  // Origines de production
  'https://rapports-c.org',
  'capacitor://rapports-c.org',
  'ionic://rapports-c.org',
  
  // Origines de développement avec ports variables
  'http://localhost:3000',
  'http://localhost:8100',
  'http://localhost:19000',
  'capacitor://localhost:8100',
  'ionic://localhost:8100',
  
  // Origines non autorisées pour test
  'http://evil.com',
  'http://unauthorized.com'
];

const authScenarios = [
  {
    name: 'Sans authentification',
    headers: {}
  },
  {
    name: 'Avec cookie token',
    headers: {
      'Cookie': 'token=test-token'
    }
  },
  {
    name: 'Avec Bearer token',
    headers: {
      'Authorization': 'Bearer test-token'
    }
  },
  {
    name: 'Avec les deux (cookie + bearer)',
    headers: {
      'Cookie': 'token=test-token',
      'Authorization': 'Bearer test-token'
    }
  }
];

async function testEndpoint(endpoint, method, origin, authScenario) {
  const url = `http://localhost:3000${endpoint}`;
  console.log(`\n🔍 Test: ${method} ${endpoint}`);
  console.log(`📍 Origine: ${origin}`);
  console.log(`🔐 Scénario: ${authScenario.name}`);

  try {
    const headers = {
      ...authScenario.headers,
      'Origin': origin
    };

    // Ajouter les headers spécifiques pour OPTIONS
    if (method === 'OPTIONS') {
      headers['Access-Control-Request-Method'] = 'POST';
      headers['Access-Control-Request-Headers'] = 'Content-Type, Authorization';
    }

    const response = await fetch(url, {
      method,
      headers,
      credentials: 'include'
    });

    // Vérifier les headers CORS
    console.log('\n📋 Headers CORS:');
    console.log('Access-Control-Allow-Origin:', response.headers.get('Access-Control-Allow-Origin'));
    console.log('Access-Control-Allow-Credentials:', response.headers.get('Access-Control-Allow-Credentials'));
    console.log('Access-Control-Allow-Methods:', response.headers.get('Access-Control-Allow-Methods'));
    console.log('Access-Control-Allow-Headers:', response.headers.get('Access-Control-Allow-Headers'));
    console.log('Vary:', response.headers.get('Vary'));

    // Vérifier le statut de la réponse
    console.log('\n📊 Résultat:');
    console.log('Status:', response.status);
    
    // Pour les origines non autorisées, on s'attend à ne pas avoir de headers CORS
    const isAllowedOrigin = origin.includes('localhost') || 
                           origin.includes('rapports-c.org');
    
    if (!isAllowedOrigin && response.headers.get('Access-Control-Allow-Origin')) {
      console.error('❌ Erreur: Les headers CORS sont présents pour une origine non autorisée');
    }

    // Vérifier que le header Vary est présent
    if (!response.headers.get('Vary')?.includes('Origin')) {
      console.warn('⚠️ Attention: Header Vary:Origin manquant');
    }

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

async function runLoadTest(endpoint, origin, duration = 10000, rps = 10) {
  console.log(`\n🔄 Test de charge: ${endpoint}`);
  console.log(`📍 Origine: ${origin}`);
  console.log(`⏱️ Durée: ${duration}ms`);
  console.log(`🚀 Requêtes par seconde: ${rps}`);

  const startTime = Date.now();
  const results = {
    success: 0,
    failed: 0,
    totalTime: 0
  };

  while (Date.now() - startTime < duration) {
    const requests = Array(rps).fill().map(() => 
      fetch(`http://localhost:3000${endpoint}`, {
        headers: { 'Origin': origin },
        credentials: 'include'
      })
      .then(() => results.success++)
      .catch(() => results.failed++)
    );

    await Promise.all(requests);
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  results.totalTime = Date.now() - startTime;
  
  console.log('\n📊 Résultats du test de charge:');
  console.log(`✅ Succès: ${results.success}`);
  console.log(`❌ Échecs: ${results.failed}`);
  console.log(`⏱️ Temps total: ${results.totalTime}ms`);
  console.log(`🚀 RPS moyen: ${(results.success / (results.totalTime / 1000)).toFixed(2)}`);
}

async function runAllTests() {
  console.log('🚀 Démarrage des tests CORS complets...\n');

  // 1. Tests fonctionnels
  for (const { path, methods } of endpoints) {
    for (const method of methods) {
      for (const origin of origins) {
        for (const authScenario of authScenarios) {
          await testEndpoint(path, method, origin, authScenario);
          // Petite pause entre les requêtes
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }
    }
  }

  // 2. Tests de charge (uniquement pour les origines autorisées)
  const allowedOrigin = 'https://rapports-c.org';
  await runLoadTest('/api/sites', allowedOrigin);
  await runLoadTest('/api/users', allowedOrigin);
  await runLoadTest('/_next/static/media/test.woff2', allowedOrigin);

  console.log('\n✅ Tests terminés!');
}

// Lancer les tests
runAllTests().catch(console.error);
