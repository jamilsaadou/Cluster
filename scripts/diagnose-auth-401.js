const jwt = require('jsonwebtoken');

// Configuration
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';
const TEST_URL = 'http://207.180.201.77:3000';

console.log('=== DIAGNOSTIC ERREUR 401 /api/auth/me ===\n');

// 1. Vérifier la configuration JWT
console.log('1. Configuration JWT:');
console.log(`   JWT_SECRET défini: ${process.env.JWT_SECRET ? 'OUI' : 'NON (utilise valeur par défaut)'}`);
console.log(`   JWT_SECRET utilisé: ${JWT_SECRET}`);
console.log('');

// 2. Créer un token de test
console.log('2. Test de génération de token:');
try {
  const testPayload = {
    userId: 1,
    role: 'admin',
    regions: [],
    email: 'test@example.com'
  };
  
  const testToken = jwt.sign(testPayload, JWT_SECRET, { expiresIn: '8h' });
  console.log(`   Token généré: ${testToken.substring(0, 50)}...`);
  
  // Vérifier le token
  const decoded = jwt.verify(testToken, JWT_SECRET);
  console.log(`   Token vérifié avec succès: ${JSON.stringify(decoded, null, 2)}`);
} catch (error) {
  console.log(`   ERREUR lors de la génération/vérification du token: ${error.message}`);
}
console.log('');

// 3. Test de l'API /api/auth/me
console.log('3. Test de l\'API /api/auth/me:');

async function testAuthAPI() {
  try {
    // Test sans cookie
    console.log('   Test sans cookie d\'authentification:');
    const responseWithoutCookie = await fetch(`${TEST_URL}/api/auth/me`);
    console.log(`   Status: ${responseWithoutCookie.status}`);
    const dataWithoutCookie = await responseWithoutCookie.json();
    console.log(`   Response: ${JSON.stringify(dataWithoutCookie)}`);
    console.log('');
    
    // Test avec un token valide
    console.log('   Test avec token valide:');
    const testPayload = {
      userId: 1,
      role: 'admin',
      regions: [],
      email: 'test@example.com',
      prenom: 'Test',
      nom: 'User'
    };
    
    const validToken = jwt.sign(testPayload, JWT_SECRET, { expiresIn: '8h' });
    
    const responseWithToken = await fetch(`${TEST_URL}/api/auth/me`, {
      headers: {
        'Cookie': `token=${validToken}`
      }
    });
    
    console.log(`   Status: ${responseWithToken.status}`);
    const dataWithToken = await responseWithToken.json();
    console.log(`   Response: ${JSON.stringify(dataWithToken, null, 2)}`);
    
  } catch (error) {
    console.log(`   ERREUR lors du test API: ${error.message}`);
  }
}

// 4. Vérifier les cookies dans le navigateur
console.log('4. Instructions pour vérifier les cookies:');
console.log('   - Ouvrez les outils de développement (F12)');
console.log('   - Allez dans l\'onglet Application/Storage');
console.log('   - Vérifiez la section Cookies');
console.log('   - Cherchez un cookie nommé "token"');
console.log('   - Si absent, le problème vient du login');
console.log('   - Si présent, vérifiez sa valeur et son expiration');
console.log('');

// 5. Solutions possibles
console.log('5. Solutions possibles:');
console.log('   a) Ajouter JWT_SECRET dans .env.local');
console.log('   b) Vérifier que le cookie est bien défini lors du login');
console.log('   c) Vérifier la configuration des cookies (secure, httpOnly, etc.)');
console.log('   d) Vérifier que le serveur fonctionne correctement');
console.log('');

// Exécuter le test API
testAuthAPI();
