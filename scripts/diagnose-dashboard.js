#!/usr/bin/env node

/**
 * Script pour diagnostiquer les problèmes du tableau de bord
 * Usage: node scripts/diagnose-dashboard.js
 */

console.log('🔍 DIAGNOSTIC DU TABLEAU DE BORD');
console.log('=' .repeat(60));

console.log('\n📋 PROBLÈMES POSSIBLES:');

console.log('\n1. 🗄️ Base de données vide ou mal configurée');
console.log('   • Aucun site ou activité en base');
console.log('   • Tables manquantes ou corrompues');
console.log('   • Relations entre tables incorrectes');

console.log('\n2. 🔐 Problème d\'authentification API');
console.log('   • Token non transmis à l\'API /api/dashboard/stats');
console.log('   • Fonction requireAuth qui échoue');
console.log('   • JWT_SECRET incorrect');

console.log('\n3. 🐛 Erreur dans le code de l\'API');
console.log('   • Erreur dans les requêtes Prisma');
console.log('   • Champs manquants dans la base');
console.log('   • Incohérence dans les noms de propriétés');

console.log('\n4. 🌐 Problème de réseau/proxy');
console.log('   • Nginx qui bloque les requêtes API');
console.log('   • Timeout sur les requêtes');
console.log('   • CORS ou headers manquants');

console.log('\n🧪 TESTS DE DIAGNOSTIC:');

console.log('\n1. Test de l\'API dashboard directement:');
console.log(`
   # Test avec curl
   curl -X GET https://207.180.201.77/api/dashboard/stats \\
     -H "Cookie: token=VOTRE_TOKEN" \\
     -v
`);

console.log('\n2. Test de l\'API auth/me:');
console.log(`
   curl -X GET https://207.180.201.77/api/auth/me \\
     -H "Cookie: token=VOTRE_TOKEN" \\
     -v
`);

console.log('\n3. Vérification de la base de données:');
console.log(`
   # Se connecter à MySQL
   mysql -u username -p database_name
   
   # Vérifier les tables
   SHOW TABLES;
   
   # Vérifier les données
   SELECT COUNT(*) FROM Site;
   SELECT COUNT(*) FROM Activite;
   SELECT COUNT(*) FROM User;
   SELECT COUNT(*) FROM Region;
`);

console.log('\n4. Vérification des logs:');
console.log('   # Logs PM2 en temps réel');
console.log('   pm2 logs suivicluster --lines 0');
console.log('   ');
console.log('   # Puis tester le dashboard dans le navigateur');

console.log('\n🛠️ SOLUTIONS PAR PROBLÈME:');

console.log('\n   Problème 1: Base de données vide');
console.log('   Solution: Importer des données de test ou créer des données');
console.log('   ');
console.log('   Problème 2: Authentification API');
console.log('   Solution: Vérifier les cookies et JWT_SECRET');
console.log('   ');
console.log('   Problème 3: Erreur de code');
console.log('   Solution: Corriger l\'API et redémarrer');
console.log('   ');
console.log('   Problème 4: Problème réseau');
console.log('   Solution: Vérifier la configuration Nginx');

console.log('\n🔧 CORRECTIONS IMMÉDIATES:');

console.log('\n1. Corriger l\'incohérence dans l\'API dashboard:');
console.log('   • captureSystems → captageSystems');
console.log('   • Vérifier tous les noms de propriétés');

console.log('\n2. Ajouter une gestion d\'erreur robuste:');
console.log('   • Try/catch autour des requêtes Prisma');
console.log('   • Logs détaillés des erreurs');
console.log('   • Valeurs par défaut si pas de données');

console.log('\n3. Vérifier la structure de la base:');
console.log('   • Tables Site, Activite, User, Region existent');
console.log('   • Relations correctement définies');
console.log('   • Index et contraintes en place');

console.log('\n📱 TESTS DANS LE NAVIGATEUR:');

console.log('\n1. Ouvrir les DevTools (F12)');
console.log('2. Aller dans l\'onglet Network');
console.log('3. Recharger le dashboard');
console.log('4. Vérifier les requêtes vers /api/dashboard/stats');
console.log('5. Regarder la réponse de l\'API');

console.log('\n   Si l\'API retourne:');
console.log('   • 401 Unauthorized → Problème d\'authentification');
console.log('   • 500 Internal Error → Erreur serveur/base de données');
console.log('   • Timeout → Problème de performance/réseau');
console.log('   • 200 mais données vides → Base de données vide');

console.log('\n🚨 ACTIONS IMMÉDIATES:');

console.log('\n1. Vérifier les logs PM2:');
console.log('   pm2 logs suivicluster --lines 20');

console.log('\n2. Tester l\'API manuellement:');
console.log('   # D\'abord se connecter pour obtenir le cookie');
console.log('   curl -X POST https://207.180.201.77/api/auth/login \\');
console.log('     -H "Content-Type: application/json" \\');
console.log('     -d \'{"email":"admin@cluster.ne","password":"AdminCluster2025!"}\' \\');
console.log('     -c cookies.txt');
console.log('   ');
console.log('   # Puis tester l\'API dashboard');
console.log('   curl -X GET https://207.180.201.77/api/dashboard/stats \\');
console.log('     -b cookies.txt -v');

console.log('\n3. Vérifier la base de données:');
console.log('   # Compter les enregistrements');
console.log('   mysql -u username -p -e "SELECT COUNT(*) as sites FROM Site; SELECT COUNT(*) as activites FROM Activite;" database_name');

console.log('\n4. Si la base est vide, créer des données de test:');
console.log('   # Exécuter le script de seed si disponible');
console.log('   node prisma/seed.js');
console.log('   ');
console.log('   # Ou créer manuellement quelques enregistrements');

console.log('\n💡 CONSEILS DE DÉBOGAGE:');
console.log('   • Toujours vérifier les logs PM2 en premier');
console.log('   • Tester les APIs avec curl avant le navigateur');
console.log('   • Vérifier que la base de données contient des données');
console.log('   • S\'assurer que JWT_SECRET est identique partout');

console.log('\n' + '=' .repeat(60));
console.log('🏁 Diagnostic terminé - Suivez les étapes ci-dessus');

// Afficher des informations sur l'environnement
console.log('\n🔧 INFORMATIONS ENVIRONNEMENT:');
console.log('   NODE_ENV:', process.env.NODE_ENV || 'Non défini');
console.log('   JWT_SECRET:', process.env.JWT_SECRET ? 'Défini' : 'Non défini');
console.log('   DATABASE_URL:', process.env.DATABASE_URL ? 'Défini' : 'Non défini');
