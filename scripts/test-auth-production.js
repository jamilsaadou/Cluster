require('dotenv').config({ path: '.env.local' });
const jwt = require('jsonwebtoken');

// Configuration avec les vraies variables d'environnement
const JWT_SECRET = process.env.JWT_SECRET;
const TEST_URL = 'http://207.180.201.77:3000';

console.log('=== TEST AUTHENTIFICATION PRODUCTION ===\n');

// 1. Vérifier la configuration JWT
console.log('1. Configuration JWT:');
console.log(`   JWT_SECRET: ${JWT_SECRET ? 'DÉFINI' : 'NON DÉFINI'}`);
console.log(`   JWT_SECRET value: ${JWT_SECRET}`);
console.log('');

// 2. Test de l'API de login
async function testLogin() {
  console.log('2. Test de l\'API de login:');
  
  try {
    const loginResponse = await fetch(`${TEST_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@cluster.ne',
        password: 'AdminCluster2025!'
      })
    });
    
    console.log(`   Status login: ${loginResponse.status}`);
    
    if (loginResponse.ok) {
      const loginData = await loginResponse.json();
      console.log(`   Login response: ${JSON.stringify(loginData)}`);
      
      // Récupérer les cookies
      const cookies = loginResponse.headers.get('set-cookie');
      console.log(`   Cookies reçus: ${cookies}`);
      
      if (cookies) {
        // Extraire le token du cookie
        const tokenMatch = cookies.match(/token=([^;]+)/);
        if (tokenMatch) {
          const token = tokenMatch[1];
          console.log(`   Token extrait: ${token.substring(0, 50)}...`);
          
          // Tester l'API /me avec ce token
          console.log('\n3. Test /api/auth/me avec le token du login:');
          const meResponse = await fetch(`${TEST_URL}/api/auth/me`, {
            headers: {
              'Cookie': `token=${token}`
            }
          });
          
          console.log(`   Status /me: ${meResponse.status}`);
          const meData = await meResponse.json();
          console.log(`   Response /me: ${JSON.stringify(meData, null, 2)}`);
        } else {
          console.log('   ERREUR: Token non trouvé dans les cookies');
        }
      } else {
        console.log('   ERREUR: Aucun cookie reçu');
      }
    } else {
      const errorData = await loginResponse.json();
      console.log(`   Erreur login: ${JSON.stringify(errorData)}`);
    }
    
  } catch (error) {
    console.log(`   ERREUR lors du test login: ${error.message}`);
  }
}

// 4. Test direct de l'API /me sans authentification
async function testMeWithoutAuth() {
  console.log('\n4. Test /api/auth/me sans authentification:');
  
  try {
    const response = await fetch(`${TEST_URL}/api/auth/me`);
    console.log(`   Status: ${response.status}`);
    const data = await response.json();
    console.log(`   Response: ${JSON.stringify(data)}`);
  } catch (error) {
    console.log(`   ERREUR: ${error.message}`);
  }
}

// 5. Vérifier la connectivité du serveur
async function testServerConnectivity() {
  console.log('\n5. Test de connectivité du serveur:');
  
  try {
    const response = await fetch(`${TEST_URL}/api/auth/login`, {
      method: 'OPTIONS'
    });
    console.log(`   Server accessible: ${response.status}`);
  } catch (error) {
    console.log(`   ERREUR de connectivité: ${error.message}`);
  }
}

// Exécuter tous les tests
async function runAllTests() {
  await testServerConnectivity();
  await testMeWithoutAuth();
  await testLogin();
  
  console.log('\n=== RÉSUMÉ DES SOLUTIONS ===');
  console.log('Si l\'erreur 401 persiste:');
  console.log('1. Vérifiez que vous êtes bien connecté (cookie token présent)');
  console.log('2. Essayez de vous reconnecter');
  console.log('3. Vérifiez que le JWT_SECRET est cohérent entre login et vérification');
  console.log('4. Vérifiez les paramètres des cookies (secure, httpOnly, domain)');
}

runAllTests();
