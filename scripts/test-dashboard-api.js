#!/usr/bin/env node

/**
 * Script pour tester spécifiquement l'API dashboard
 * Usage: node scripts/test-dashboard-api.js
 */

console.log('🔍 TEST SPÉCIFIQUE API DASHBOARD');
console.log('=' .repeat(60));

console.log('\n📋 CONTEXTE:');
console.log('   ✅ La connexion utilisateur fonctionne');
console.log('   ✅ La base de données contient des utilisateurs');
console.log('   ❓ Le dashboard ne s\'affiche pas');
console.log('   🎯 Focus sur l\'API /api/dashboard/stats');

console.log('\n🧪 TESTS À EFFECTUER:');

console.log('\n1. Test de l\'API dashboard avec curl:');
console.log(`
   # Étape 1: Se connecter pour obtenir le cookie
   curl -X POST https://207.180.201.77/api/auth/login \\
     -H "Content-Type: application/json" \\
     -d '{"email":"admin@cluster.ne","password":"AdminCluster2025!"}' \\
     -c cookies.txt -v
   
   # Étape 2: Tester l'API dashboard
   curl -X GET https://207.180.201.77/api/dashboard/stats \\
     -b cookies.txt -v
   
   # Étape 3: Tester l'API auth/me pour comparaison
   curl -X GET https://207.180.201.77/api/auth/me \\
     -b cookies.txt -v
`);

console.log('\n2. Test dans le navigateur:');
console.log('   • Ouvrir DevTools (F12)');
console.log('   • Aller dans Network tab');
console.log('   • Recharger le dashboard');
console.log('   • Chercher la requête vers /api/dashboard/stats');
console.log('   • Vérifier le status code et la réponse');

console.log('\n3. Vérification des logs PM2:');
console.log('   # Surveiller les logs en temps réel');
console.log('   pm2 logs suivicluster --lines 0');
console.log('   ');
console.log('   # Puis recharger le dashboard dans le navigateur');
console.log('   # et observer les erreurs qui apparaissent');

console.log('\n🔍 CAUSES PROBABLES (base non vide):');

console.log('\n   Cause 1: Erreur dans les requêtes Prisma');
console.log('   • Champs manquants dans la base');
console.log('   • Relations cassées entre tables');
console.log('   • Types de données incompatibles');

console.log('\n   Cause 2: Problème de permissions utilisateur');
console.log('   • L\'utilisateur n\'a pas accès aux données');
console.log('   • Filtrage par région/rôle qui retourne vide');
console.log('   • Problème dans la logique de requireAuth');

console.log('\n   Cause 3: Erreur JavaScript dans l\'API');
console.log('   • Exception non catchée');
console.log('   • Problème de parsing JSON');
console.log('   • Timeout sur les requêtes');

console.log('\n   Cause 4: Structure de données incompatible');
console.log('   • Champs JSON mal formatés (operateurs, systemes, etc.)');
console.log('   • Données NULL non gérées');
console.log('   • Incohérence dans les types');

console.log('\n🛠️ SOLUTIONS CIBLÉES:');

console.log('\n   Solution 1: Vérifier la structure des données');
console.log(`
   mysql -u username -p database_name -e "
   SELECT id, email, role, regions FROM User LIMIT 5;
   SELECT id, nom, regionId, operateurs, systemes FROM Site LIMIT 5;
   SELECT id, type, statut, beneficiaires FROM Activite LIMIT 5;
   "
`);

console.log('\n   Solution 2: Tester les requêtes Prisma individuellement');
console.log('   • Créer un script de test pour chaque requête');
console.log('   • Vérifier les includes et relations');
console.log('   • Tester avec différents utilisateurs');

console.log('\n   Solution 3: Ajouter des logs détaillés dans l\'API');
console.log('   • Console.log avant chaque requête Prisma');
console.log('   • Vérifier les données retournées');
console.log('   • Identifier où ça échoue exactement');

console.log('\n   Solution 4: Simplifier temporairement l\'API');
console.log('   • Retourner des données statiques pour tester');
console.log('   • Ajouter les requêtes une par une');
console.log('   • Isoler le problème');

console.log('\n🚨 ACTIONS IMMÉDIATES:');

console.log('\n1. Vérifier les logs PM2 pendant le chargement du dashboard:');
console.log('   pm2 logs suivicluster --lines 0');

console.log('\n2. Tester l\'API manuellement:');
console.log('   # Se connecter');
console.log('   curl -X POST https://207.180.201.77/api/auth/login \\');
console.log('     -H "Content-Type: application/json" \\');
console.log('     -d \'{"email":"admin@cluster.ne","password":"AdminCluster2025!"}\' \\');
console.log('     -c cookies.txt');
console.log('   ');
console.log('   # Tester dashboard API');
console.log('   curl -X GET https://207.180.201.77/api/dashboard/stats \\');
console.log('     -b cookies.txt');

console.log('\n3. Vérifier les données utilisateur:');
console.log(`
   mysql -u username -p database_name -e "
   SELECT u.id, u.email, u.role, 
          GROUP_CONCAT(ur.regionId) as regions
   FROM User u 
   LEFT JOIN UserRegion ur ON u.id = ur.userId 
   WHERE u.email = 'admin@cluster.ne'
   GROUP BY u.id;"
`);

console.log('\n4. Vérifier les données de base:');
console.log(`
   mysql -u username -p database_name -e "
   SELECT 
     (SELECT COUNT(*) FROM Site) as total_sites,
     (SELECT COUNT(*) FROM Activite) as total_activites,
     (SELECT COUNT(*) FROM Region) as total_regions;"
`);

console.log('\n📊 RÉPONSES ATTENDUES:');

console.log('\n   API /api/auth/me doit retourner:');
console.log('   {');
console.log('     "userId": 1,');
console.log('     "email": "admin@cluster.ne",');
console.log('     "role": "admin",');
console.log('     "regions": [1, 2, ...]');
console.log('   }');

console.log('\n   API /api/dashboard/stats doit retourner:');
console.log('   {');
console.log('     "totalSites": 10,');
console.log('     "totalActivities": 25,');
console.log('     "totalBeneficiaries": 150,');
console.log('     "activitiesByStatus": {...},');
console.log('     "regionDistribution": {...}');
console.log('   }');

console.log('\n💡 CONSEILS DE DÉBOGAGE:');
console.log('   • Si l\'API retourne 500: Erreur serveur, vérifier les logs');
console.log('   • Si l\'API retourne 401: Problème d\'authentification');
console.log('   • Si l\'API retourne 200 mais données vides: Problème de filtrage');
console.log('   • Si l\'API timeout: Requête trop lente, optimiser');

console.log('\n' + '=' .repeat(60));
console.log('🏁 Testez l\'API dashboard avec ces commandes');

// Afficher des informations sur l'environnement
console.log('\n🔧 ENVIRONNEMENT ACTUEL:');
console.log('   NODE_ENV:', process.env.NODE_ENV || 'Non défini');
console.log('   JWT_SECRET:', process.env.JWT_SECRET ? 'Défini' : 'Non défini');
console.log('   DATABASE_URL:', process.env.DATABASE_URL ? 'Défini' : 'Non défini');
