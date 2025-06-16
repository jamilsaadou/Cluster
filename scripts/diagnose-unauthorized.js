#!/usr/bin/env node

/**
 * Script pour diagnostiquer les erreurs "Unauthorized"
 * Usage: node scripts/diagnose-unauthorized.js
 */

console.log('🔍 DIAGNOSTIC AUTOMATIQUE - ERREUR "UNAUTHORIZED"');
console.log('=' .repeat(60));

console.log('\n📋 VÉRIFICATIONS AUTOMATIQUES:');

console.log('\n1. 🔐 Vérification des variables d\'environnement:');
console.log('   JWT_SECRET:', process.env.JWT_SECRET ? '✅ Défini' : '❌ Non défini');
console.log('   NODE_ENV:', process.env.NODE_ENV || 'Non défini');
console.log('   PORT:', process.env.PORT || 'Non défini');

console.log('\n2. 🍪 Configuration des cookies (dans le code):');
console.log('   • httpOnly: true');
console.log('   • secure: ' + (process.env.NODE_ENV === 'production'));
console.log('   • sameSite: "lax"');
console.log('   • maxAge: 8 heures');
console.log('   • path: "/"');

console.log('\n3. 🧪 TESTS À EFFECTUER MANUELLEMENT:');

console.log('\n   A. Test de connexion API:');
console.log(`
   curl -X POST https://207.180.201.77/api/auth/login \\
     -H "Content-Type: application/json" \\
     -d '{"email":"admin@cluster.ne","password":"AdminCluster2025!"}' \\
     -c cookies.txt -v
`);

console.log('\n   B. Test de l\'API /me:');
console.log(`
   curl -X GET https://207.180.201.77/api/auth/me \\
     -b cookies.txt -v
`);

console.log('\n   C. Test d\'une API protégée:');
console.log(`
   curl -X GET https://207.180.201.77/api/sites \\
     -b cookies.txt -v
`);

console.log('\n4. 🔍 Vérifications dans le navigateur:');
console.log('   • Ouvrir DevTools (F12)');
console.log('   • Aller dans Application > Cookies');
console.log('   • Vérifier la présence du cookie "token"');
console.log('   • Vérifier les attributs du cookie');

console.log('\n5. 📊 Vérifications des logs:');
console.log('   # Logs PM2:');
console.log('   pm2 logs suivicluster --lines 20');
console.log('   ');
console.log('   # Logs Nginx:');
console.log('   sudo tail -f /var/log/nginx/error.log');

console.log('\n🚨 CAUSES FRÉQUENTES ET SOLUTIONS:');

console.log('\n   Cause 1: Token JWT expiré (après 8h)');
console.log('   Solution: Se reconnecter');
console.log('   ');
console.log('   Cause 2: Cookie non transmis');
console.log('   Solution: Vérifier la configuration HTTPS/Nginx');
console.log('   ');
console.log('   Cause 3: JWT_SECRET différent');
console.log('   Solution: Redémarrer l\'application après vérification');
console.log('   ');
console.log('   Cause 4: Middleware mal configuré');
console.log('   Solution: Vérifier que les headers sont transmis');
console.log('   ');
console.log('   Cause 5: Utilisateur supprimé/désactivé');
console.log('   Solution: Vérifier en base de données');

console.log('\n🛠️ ACTIONS DE RÉSOLUTION RAPIDE:');

console.log('\n   1. Supprimer les cookies du navigateur:');
console.log('      • F12 > Application > Cookies > Supprimer "token"');
console.log('      • Ou navigation privée');

console.log('\n   2. Se reconnecter:');
console.log('      • Email: admin@cluster.ne');
console.log('      • Mot de passe: AdminCluster2025!');

console.log('\n   3. Redémarrer l\'application si nécessaire:');
console.log('      pm2 restart suivicluster');

console.log('\n   4. Vérifier la base de données:');
console.log(`
      mysql -u username -p database_name
      SELECT id, email, role, statut FROM User WHERE email = 'admin@cluster.ne';
`);

console.log('\n📱 TESTS SPÉCIFIQUES PAR SCÉNARIO:');

console.log('\n   Scénario A: Erreur immédiate après connexion');
console.log('   • Problème probable: Configuration des cookies');
console.log('   • Test: Vérifier les cookies dans DevTools');
console.log('   • Solution: Vérifier la configuration Nginx/HTTPS');

console.log('\n   Scénario B: Erreur après quelques heures');
console.log('   • Problème probable: Token expiré');
console.log('   • Test: Regarder l\'heure de création du cookie');
console.log('   • Solution: Se reconnecter');

console.log('\n   Scénario C: Erreur intermittente');
console.log('   • Problème probable: Base de données ou réseau');
console.log('   • Test: Vérifier les logs PM2 et Nginx');
console.log('   • Solution: Redémarrer les services');

console.log('\n   Scénario D: Erreur sur certaines pages seulement');
console.log('   • Problème probable: Permissions insuffisantes');
console.log('   • Test: Vérifier le rôle utilisateur en base');
console.log('   • Solution: Ajuster les permissions');

console.log('\n🎯 CHECKLIST DE DIAGNOSTIC:');

console.log('\n   ☐ Cookie "token" présent dans le navigateur');
console.log('   ☐ Cookie avec les bons attributs (Secure, SameSite)');
console.log('   ☐ JWT_SECRET défini et identique partout');
console.log('   ☐ Utilisateur existe et est actif en base');
console.log('   ☐ Permissions utilisateur correctes');
console.log('   ☐ Logs PM2 sans erreur');
console.log('   ☐ Logs Nginx sans erreur');
console.log('   ☐ Test API /auth/me réussi');

console.log('\n💡 CONSEILS:');
console.log('   • Toujours tester en navigation privée d\'abord');
console.log('   • Vérifier l\'heure système du serveur');
console.log('   • S\'assurer que HTTPS est utilisé partout');
console.log('   • Redémarrer l\'application après changement de config');

console.log('\n' + '=' .repeat(60));
console.log('🏁 Diagnostic terminé - Suivez les étapes ci-dessus');

// Afficher des informations supplémentaires si disponibles
if (process.env.JWT_SECRET) {
  console.log('\n🔑 JWT_SECRET: Défini (longueur: ' + process.env.JWT_SECRET.length + ' caractères)');
} else {
  console.log('\n⚠️  ATTENTION: JWT_SECRET non défini dans l\'environnement actuel');
}

console.log('\n📅 Heure actuelle du système:', new Date().toISOString());
