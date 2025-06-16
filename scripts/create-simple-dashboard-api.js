#!/usr/bin/env node

/**
 * Script pour créer une version simplifiée de l'API dashboard pour debug
 * Usage: node scripts/create-simple-dashboard-api.js
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 CRÉATION API DASHBOARD SIMPLIFIÉE POUR DEBUG');
console.log('=' .repeat(60));

const simplifiedApiContent = `import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { requireAuth } from '../../../../lib/auth';

export const GET = requireAuth(async (request) => {
  const user = request.user;

  try {
    console.log('🔍 Dashboard API - Début du traitement');
    console.log('👤 Utilisateur:', { userId: user.userId, role: user.role, regions: user.regions });

    // Test 1: Compter les utilisateurs (simple)
    console.log('📊 Test 1: Comptage des utilisateurs...');
    const userCount = await prisma.user.count();
    console.log('✅ Nombre d\'utilisateurs:', userCount);

    // Test 2: Compter les régions (simple)
    console.log('📊 Test 2: Comptage des régions...');
    const regionCount = await prisma.region.count();
    console.log('✅ Nombre de régions:', regionCount);

    // Test 3: Compter les sites (avec filtrage selon le rôle)
    console.log('📊 Test 3: Comptage des sites...');
    let siteWhereClause = {};
    if (user.role === 'conseiller') {
      siteWhereClause = { createdById: user.userId };
    } else if (user.role === 'admin') {
      siteWhereClause = { regionId: { in: user.regions || [] } };
    }
    console.log('🔍 Clause WHERE pour sites:', siteWhereClause);
    
    const siteCount = await prisma.site.count({ where: siteWhereClause });
    console.log('✅ Nombre de sites:', siteCount);

    // Test 4: Compter les activités (avec filtrage selon le rôle)
    console.log('📊 Test 4: Comptage des activités...');
    let activityWhereClause = {};
    if (user.role === 'conseiller') {
      activityWhereClause = { createdById: user.userId };
    } else if (user.role === 'admin') {
      activityWhereClause = { regionId: { in: user.regions || [] } };
    }
    console.log('🔍 Clause WHERE pour activités:', activityWhereClause);
    
    const activityCount = await prisma.activite.count({ where: activityWhereClause });
    console.log('✅ Nombre d\'activités:', activityCount);

    // Retourner des statistiques simplifiées
    const stats = {
      totalUsers: userCount,
      totalRegions: regionCount,
      totalSites: siteCount,
      totalActivities: activityCount,
      totalSurface: 0, // Simplifié pour le debug
      totalBeneficiaries: 0, // Simplifié pour le debug
      activitiesByStatus: {}, // Simplifié pour le debug
      regionDistribution: null, // Simplifié pour le debug
      recentActivities: [], // Simplifié pour le debug
      debug: {
        userRole: user.role,
        userRegions: user.regions,
        siteFilter: siteWhereClause,
        activityFilter: activityWhereClause
      }
    };

    console.log('✅ Statistiques calculées:', stats);
    console.log('🎉 Dashboard API - Traitement terminé avec succès');

    return NextResponse.json(stats);
  } catch (error) {
    console.error('❌ Erreur dans Dashboard API:', error);
    console.error('📍 Stack trace:', error.stack);
    return NextResponse.json(
      { 
        error: 'Erreur lors de la récupération des statistiques',
        details: error.message,
        stack: error.stack
      },
      { status: 500 }
    );
  }
});
`;

// Créer le fichier de sauvegarde de l'API originale
const originalApiPath = path.join(process.cwd(), 'app/api/dashboard/stats/route.js');
const backupApiPath = path.join(process.cwd(), 'app/api/dashboard/stats/route.js.backup');

console.log('\n📁 CRÉATION DES FICHIERS:');

try {
  // Sauvegarder l'API originale
  if (fs.existsSync(originalApiPath)) {
    fs.copyFileSync(originalApiPath, backupApiPath);
    console.log('✅ Sauvegarde créée:', backupApiPath);
  }

  // Créer l'API simplifiée
  fs.writeFileSync(originalApiPath, simplifiedApiContent);
  console.log('✅ API simplifiée créée:', originalApiPath);

  console.log('\n🚀 INSTRUCTIONS:');
  console.log('1. Redémarrer l\'application:');
  console.log('   pm2 restart suivicluster');
  console.log('');
  console.log('2. Surveiller les logs:');
  console.log('   pm2 logs suivicluster --lines 0');
  console.log('');
  console.log('3. Tester le dashboard dans le navigateur');
  console.log('   Les logs détaillés apparaîtront dans PM2');
  console.log('');
  console.log('4. Ou tester avec curl:');
  console.log('   curl -X POST https://207.180.201.77/api/auth/login \\');
  console.log('     -H "Content-Type: application/json" \\');
  console.log('     -d \'{"email":"admin@cluster.ne","password":"AdminCluster2025!"}\' \\');
  console.log('     -c cookies.txt');
  console.log('   ');
  console.log('   curl -X GET https://207.180.201.77/api/dashboard/stats \\');
  console.log('     -b cookies.txt');
  console.log('');
  console.log('5. Pour restaurer l\'API originale:');
  console.log('   cp app/api/dashboard/stats/route.js.backup app/api/dashboard/stats/route.js');
  console.log('   pm2 restart suivicluster');

  console.log('\n🔍 CETTE API SIMPLIFIÉE VA:');
  console.log('   • Afficher des logs détaillés dans PM2');
  console.log('   • Tester chaque requête Prisma individuellement');
  console.log('   • Identifier exactement où ça échoue');
  console.log('   • Retourner des informations de debug');

  console.log('\n⚠️  IMPORTANT:');
  console.log('   • Cette API est temporaire pour le debug');
  console.log('   • Elle affiche des informations sensibles dans les logs');
  console.log('   • Restaurez l\'API originale après le debug');

} catch (error) {
  console.error('❌ Erreur lors de la création des fichiers:', error);
}

console.log('\n' + '=' .repeat(60));
console.log('🏁 API simplifiée créée - Redémarrez l\'application et testez');
