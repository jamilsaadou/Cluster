#!/usr/bin/env node

/**
 * Script pour diagnostiquer les problèmes de base de données
 * Usage: node scripts/diagnose-database.js
 */

console.log('🗄️ DIAGNOSTIC BASE DE DONNÉES');
console.log('=' .repeat(60));

console.log('\n📋 PROBLÈMES POSSIBLES AVEC LA BASE DE DONNÉES:');

console.log('\n1. 🔌 Problème de connexion');
console.log('   • DATABASE_URL incorrecte ou mal formatée');
console.log('   • Serveur MySQL arrêté ou inaccessible');
console.log('   • Credentials incorrects (username/password)');
console.log('   • Base de données inexistante');

console.log('\n2. 📊 Base de données vide');
console.log('   • Tables créées mais aucune donnée');
console.log('   • Migration Prisma non exécutée');
console.log('   • Données supprimées accidentellement');

console.log('\n3. 🏗️ Structure incorrecte');
console.log('   • Tables manquantes');
console.log('   • Colonnes manquantes ou mal typées');
console.log('   • Relations entre tables cassées');
console.log('   • Index manquants');

console.log('\n4. 🔐 Problème de permissions');
console.log('   • Utilisateur MySQL sans droits suffisants');
console.log('   • Accès refusé à certaines tables');
console.log('   • Firewall bloquant la connexion');

console.log('\n🧪 TESTS DE DIAGNOSTIC:');

console.log('\n1. Vérification de DATABASE_URL:');
console.log('   DATABASE_URL:', process.env.DATABASE_URL ? 'Défini' : '❌ Non défini');
if (process.env.DATABASE_URL) {
  try {
    const url = new URL(process.env.DATABASE_URL);
    console.log('   • Protocole:', url.protocol);
    console.log('   • Host:', url.hostname);
    console.log('   • Port:', url.port || '3306 (défaut)');
    console.log('   • Database:', url.pathname.substring(1));
    console.log('   • Username:', url.username);
    console.log('   • Password:', url.password ? '***' : 'Non défini');
  } catch (e) {
    console.log('   ❌ URL mal formatée:', e.message);
  }
}

console.log('\n2. Test de connexion MySQL:');
console.log(`
   # Test de connexion basique
   mysql -h HOST -P PORT -u USERNAME -p DATABASE_NAME -e "SELECT 1 as test;"
   
   # Exemple avec les valeurs de DATABASE_URL:
   mysql -h localhost -P 3306 -u username -p database_name -e "SELECT 1 as test;"
`);

console.log('\n3. Vérification des tables:');
console.log(`
   # Lister toutes les tables
   mysql -u username -p database_name -e "SHOW TABLES;"
   
   # Vérifier la structure des tables principales
   mysql -u username -p database_name -e "DESCRIBE User; DESCRIBE Site; DESCRIBE Activite; DESCRIBE Region;"
`);

console.log('\n4. Comptage des données:');
console.log(`
   # Compter les enregistrements dans chaque table
   mysql -u username -p database_name -e "
   SELECT 'User' as table_name, COUNT(*) as count FROM User
   UNION ALL
   SELECT 'Site' as table_name, COUNT(*) as count FROM Site  
   UNION ALL
   SELECT 'Activite' as table_name, COUNT(*) as count FROM Activite
   UNION ALL
   SELECT 'Region' as table_name, COUNT(*) as count FROM Region;"
`);

console.log('\n🛠️ SOLUTIONS PAR PROBLÈME:');

console.log('\n   Problème 1: Connexion impossible');
console.log('   Solutions:');
console.log('   • Vérifier que MySQL est démarré: sudo systemctl status mysql');
console.log('   • Tester la connexion: mysql -u username -p');
console.log('   • Vérifier DATABASE_URL dans .env.production');
console.log('   • Vérifier les credentials MySQL');

console.log('\n   Problème 2: Base de données vide');
console.log('   Solutions:');
console.log('   • Exécuter les migrations Prisma: npx prisma migrate deploy');
console.log('   • Générer le client Prisma: npx prisma generate');
console.log('   • Importer des données: mysql -u username -p database < backup.sql');
console.log('   • Créer le super admin: node prisma/seed-superadmin.js');

console.log('\n   Problème 3: Structure incorrecte');
console.log('   Solutions:');
console.log('   • Reset de la base: npx prisma migrate reset');
console.log('   • Push du schéma: npx prisma db push');
console.log('   • Vérifier le schéma: npx prisma db pull');

console.log('\n   Problème 4: Permissions insuffisantes');
console.log('   Solutions:');
console.log('   • Créer un utilisateur avec tous les droits');
console.log('   • GRANT ALL PRIVILEGES ON database.* TO \'user\'@\'%\';');
console.log('   • FLUSH PRIVILEGES;');

console.log('\n🚨 ACTIONS IMMÉDIATES:');

console.log('\n1. Test de connexion rapide:');
console.log('   # Remplacez les valeurs par celles de votre DATABASE_URL');
console.log('   mysql -h localhost -u username -p -e "SELECT VERSION();"');

console.log('\n2. Vérification des tables essentielles:');
console.log(`
   mysql -u username -p database_name -e "
   SELECT TABLE_NAME, TABLE_ROWS 
   FROM information_schema.TABLES 
   WHERE TABLE_SCHEMA = 'database_name' 
   AND TABLE_NAME IN ('User', 'Site', 'Activite', 'Region');"
`);

console.log('\n3. Test avec Prisma:');
console.log('   # Dans le répertoire de l\'application');
console.log('   npx prisma db pull');
console.log('   npx prisma generate');

console.log('\n4. Création du super admin si nécessaire:');
console.log('   node prisma/seed-superadmin.js');

console.log('\n📊 DONNÉES DE TEST MINIMALES:');

console.log('\n   Si la base est vide, créer au minimum:');
console.log('   • 1 région (pour les relations)');
console.log('   • 1 utilisateur admin');
console.log('   • 1 site de test');
console.log('   • 1 activité de test');

console.log('\n   SQL pour créer des données de test:');
console.log(`
   -- Insérer une région
   INSERT INTO Region (nom, code) VALUES ('Test Region', 'TR');
   
   -- Vérifier l'ID de la région
   SELECT id FROM Region WHERE nom = 'Test Region';
   
   -- Insérer un site (remplacez REGION_ID par l'ID obtenu)
   INSERT INTO Site (nom, regionId, superficie, createdById) 
   VALUES ('Site Test', REGION_ID, 10.5, USER_ID);
`);

console.log('\n🔧 COMMANDES DE RÉPARATION:');

console.log('\n   Si la base est corrompue:');
console.log('   1. Sauvegarder les données importantes');
console.log('   2. npx prisma migrate reset --force');
console.log('   3. npx prisma migrate deploy');
console.log('   4. npx prisma generate');
console.log('   5. node prisma/seed-superadmin.js');

console.log('\n   Si Prisma ne fonctionne pas:');
console.log('   1. rm -rf node_modules/.prisma');
console.log('   2. npx prisma generate');
console.log('   3. pm2 restart suivicluster');

console.log('\n💡 CONSEILS:');
console.log('   • Toujours tester la connexion MySQL avant Prisma');
console.log('   • Vérifier les logs MySQL: sudo tail -f /var/log/mysql/error.log');
console.log('   • S\'assurer que la base de données existe avant de s\'y connecter');
console.log('   • Utiliser des outils comme phpMyAdmin pour visualiser les données');

console.log('\n' + '=' .repeat(60));
console.log('🏁 Diagnostic terminé - Testez la connexion à la base de données');

// Test de connexion Prisma si possible
console.log('\n🧪 TEST PRISMA (si disponible):');
try {
  console.log('   Tentative de connexion avec Prisma...');
  // Note: Ce test nécessiterait d'importer Prisma, ce qui peut échouer
  console.log('   ⚠️  Exécutez: npx prisma db pull pour tester la connexion');
} catch (error) {
  console.log('   ❌ Impossible de tester Prisma depuis ce script');
  console.log('   💡 Exécutez manuellement: npx prisma db pull');
}
