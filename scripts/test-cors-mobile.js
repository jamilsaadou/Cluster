// Script de test pour vérifier la configuration CORS avec l'app mobile
const testEndpoints = async () => {
  const endpoints = [
    '/api/auth/login',
    '/api/auth/me',
    '/api/sites',
    '/api/users'
  ];

  const origins = [
    'https://rapports-c.org',
    'capacitor://rapports-c.org',
    'ionic://rapports-c.org'
  ];

  const testCases = [
    // Test 1: Requête OPTIONS (preflight)
    {
      method: 'OPTIONS',
      headers: {
        'Origin': 'https://rapports-c.org',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type, Authorization'
      }
    },
    // Test 2: Requête avec credentials
    {
      method: 'GET',
      headers: {
        'Origin': 'https://rapports-c.org',
        'Cookie': 'token=test-token'
      },
      credentials: 'include'
    },
    // Test 3: Requête avec Bearer token
    {
      method: 'GET',
      headers: {
        'Origin': 'capacitor://rapports-c.org',
        'Authorization': 'Bearer test-token'
      }
    }
  ];

  console.log('🚀 Démarrage des tests CORS pour l\'app mobile...\n');

  for (const endpoint of endpoints) {
    console.log(`📝 Test de l'endpoint: ${endpoint}`);
    
    for (const origin of origins) {
      console.log(`\n🌐 Origine testée: ${origin}`);
      
      for (const testCase of testCases) {
        try {
          const response = await fetch(`http://localhost:3000${endpoint}`, {
            ...testCase,
            headers: {
              ...testCase.headers,
              'Origin': origin
            }
          });

          console.log(`\n✨ ${testCase.method} ${endpoint}`);
          console.log('Headers de réponse:');
          console.log('Access-Control-Allow-Origin:', response.headers.get('Access-Control-Allow-Origin'));
          console.log('Access-Control-Allow-Credentials:', response.headers.get('Access-Control-Allow-Credentials'));
          
          if (testCase.method === 'OPTIONS') {
            console.log('Access-Control-Allow-Methods:', response.headers.get('Access-Control-Allow-Methods'));
            console.log('Access-Control-Allow-Headers:', response.headers.get('Access-Control-Allow-Headers'));
          }
          
          console.log('Status:', response.status);
          
        } catch (error) {
          console.error(`❌ Erreur pour ${testCase.method} ${endpoint} depuis ${origin}:`, error.message);
        }
      }
    }
    console.log('\n-------------------\n');
  }
};

testEndpoints().catch(console.error);
