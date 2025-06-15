const { PrismaClient } = require('@prisma/client');
const fs = require('fs').promises;
const path = require('path');

const prisma = new PrismaClient();
const UPLOAD_DIR = path.join(process.cwd(), 'uploads', 'images');

// Fonction pour obtenir des statistiques sur les images
async function getImageStats() {
  try {
    console.log('📊 Statistiques des images...\n');

    // Statistiques des fichiers
    const files = await fs.readdir(UPLOAD_DIR);
    let totalSize = 0;
    
    for (const file of files) {
      const filePath = path.join(UPLOAD_DIR, file);
      const stats = await fs.stat(filePath);
      totalSize += stats.size;
    }

    console.log(`📁 Fichiers sur le serveur: ${files.length}`);
    console.log(`💾 Taille totale: ${(totalSize / 1024 / 1024).toFixed(2)} MB`);

    // Statistiques de la base de données
    const sitesWithPhotos = await prisma.site.count({
      where: {
        photos: {
          not: null
        }
      }
    });

    const activitesWithPhotos = await prisma.activite.count({
      where: {
        photos: {
          not: null
        }
      }
    });

    const allSites = await prisma.site.findMany({
      select: { photos: true }
    });

    const allActivites = await prisma.activite.findMany({
      select: { photos: true }
    });

    let totalPhotosInDB = 0;
    let base64Photos = 0;
    let urlPhotos = 0;

    [...allSites, ...allActivites].forEach(item => {
      if (Array.isArray(item.photos)) {
        item.photos.forEach(photo => {
          totalPhotosInDB++;
          if (typeof photo === 'string') {
            if (photo.startsWith('data:image/')) {
              base64Photos++;
            } else if (photo.startsWith('/api/images/')) {
              urlPhotos++;
            }
          }
        });
      }
    });

    console.log(`\n🏢 Sites avec photos: ${sitesWithPhotos}`);
    console.log(`🎯 Activités avec photos: ${activitesWithPhotos}`);
    console.log(`📸 Total photos en DB: ${totalPhotosInDB}`);
    console.log(`🔗 Photos URL (migrées): ${urlPhotos}`);
    console.log(`📄 Photos Base64 (à migrer): ${base64Photos}`);

    if (base64Photos > 0) {
      console.log(`\n⚠️  Il reste ${base64Photos} photos en base64 à migrer`);
      console.log('💡 Utilisez: node scripts/migrate-images.js');
    }

  } catch (error) {
    console.error('❌ Erreur lors du calcul des statistiques:', error);
  }
}

// Fonction pour vérifier l'intégrité des images
async function checkImageIntegrity() {
  try {
    console.log('🔍 Vérification de l\'intégrité des images...\n');

    const allSites = await prisma.site.findMany({
      select: { id: true, nom: true, photos: true }
    });

    const allActivites = await prisma.activite.findMany({
      select: { id: true, type: true, photos: true }
    });

    let brokenImages = [];
    let totalChecked = 0;

    // Vérifier les sites
    for (const site of allSites) {
      if (Array.isArray(site.photos)) {
        for (const photo of site.photos) {
          totalChecked++;
          if (typeof photo === 'string' && photo.startsWith('/api/images/')) {
            const fileName = photo.split('/').pop();
            const filePath = path.join(UPLOAD_DIR, fileName);
            
            try {
              await fs.access(filePath);
            } catch {
              brokenImages.push({
                type: 'site',
                id: site.id,
                name: site.nom,
                photo: photo,
                fileName: fileName
              });
            }
          }
        }
      }
    }

    // Vérifier les activités
    for (const activite of allActivites) {
      if (Array.isArray(activite.photos)) {
        for (const photo of activite.photos) {
          totalChecked++;
          if (typeof photo === 'string' && photo.startsWith('/api/images/')) {
            const fileName = photo.split('/').pop();
            const filePath = path.join(UPLOAD_DIR, fileName);
            
            try {
              await fs.access(filePath);
            } catch {
              brokenImages.push({
                type: 'activite',
                id: activite.id,
                name: activite.type,
                photo: photo,
                fileName: fileName
              });
            }
          }
        }
      }
    }

    console.log(`✅ Images vérifiées: ${totalChecked}`);
    console.log(`❌ Images cassées: ${brokenImages.length}`);

    if (brokenImages.length > 0) {
      console.log('\n🔧 Images cassées détectées:');
      brokenImages.forEach(img => {
        console.log(`  - ${img.type} ${img.id} (${img.name}): ${img.fileName}`);
      });
      console.log('\n💡 Utilisez --fix pour nettoyer les références cassées');
    }

    return brokenImages;

  } catch (error) {
    console.error('❌ Erreur lors de la vérification:', error);
    return [];
  }
}

// Fonction pour réparer les références d'images cassées
async function fixBrokenImages() {
  try {
    console.log('🔧 Réparation des références d\'images cassées...\n');

    const brokenImages = await checkImageIntegrity();
    
    if (brokenImages.length === 0) {
      console.log('✅ Aucune image cassée détectée');
      return;
    }

    let fixedCount = 0;

    // Grouper par type et ID
    const groupedBroken = {};
    brokenImages.forEach(img => {
      const key = `${img.type}-${img.id}`;
      if (!groupedBroken[key]) {
        groupedBroken[key] = {
          type: img.type,
          id: img.id,
          name: img.name,
          brokenPhotos: []
        };
      }
      groupedBroken[key].brokenPhotos.push(img.photo);
    });

    // Réparer chaque entité
    for (const key in groupedBroken) {
      const item = groupedBroken[key];
      
      try {
        if (item.type === 'site') {
          const site = await prisma.site.findUnique({
            where: { id: item.id },
            select: { photos: true }
          });

          if (site && Array.isArray(site.photos)) {
            const cleanedPhotos = site.photos.filter(photo => 
              !item.brokenPhotos.includes(photo)
            );

            await prisma.site.update({
              where: { id: item.id },
              data: { photos: cleanedPhotos }
            });

            console.log(`  ✅ Site ${item.id} (${item.name}): ${item.brokenPhotos.length} références supprimées`);
            fixedCount += item.brokenPhotos.length;
          }
        } else if (item.type === 'activite') {
          const activite = await prisma.activite.findUnique({
            where: { id: item.id },
            select: { photos: true }
          });

          if (activite && Array.isArray(activite.photos)) {
            const cleanedPhotos = activite.photos.filter(photo => 
              !item.brokenPhotos.includes(photo)
            );

            await prisma.activite.update({
              where: { id: item.id },
              data: { photos: cleanedPhotos }
            });

            console.log(`  ✅ Activité ${item.id} (${item.name}): ${item.brokenPhotos.length} références supprimées`);
            fixedCount += item.brokenPhotos.length;
          }
        }
      } catch (error) {
        console.error(`  ❌ Erreur réparation ${item.type} ${item.id}:`, error);
      }
    }

    console.log(`\n✅ Réparation terminée: ${fixedCount} références cassées supprimées`);

  } catch (error) {
    console.error('❌ Erreur lors de la réparation:', error);
  }
}

// Fonction pour optimiser les images (placeholder pour future implémentation)
async function optimizeImages() {
  console.log('🎨 Optimisation des images...');
  console.log('💡 Fonctionnalité à implémenter: compression, redimensionnement, etc.');
}

// Fonction principale
async function main() {
  try {
    const args = process.argv.slice(2);
    
    if (args.includes('--stats')) {
      await getImageStats();
    } else if (args.includes('--check')) {
      await checkImageIntegrity();
    } else if (args.includes('--fix')) {
      await fixBrokenImages();
    } else if (args.includes('--optimize')) {
      await optimizeImages();
    } else {
      console.log('🖼️  Script de gestion des images\n');
      console.log('Usage:');
      console.log('  node scripts/image-management.js --stats     # Afficher les statistiques');
      console.log('  node scripts/image-management.js --check     # Vérifier l\'intégrité');
      console.log('  node scripts/image-management.js --fix       # Réparer les références cassées');
      console.log('  node scripts/image-management.js --optimize  # Optimiser les images');
      console.log('\nAutres scripts utiles:');
      console.log('  node scripts/migrate-images.js              # Migrer base64 vers fichiers');
      console.log('  node scripts/migrate-images.js --cleanup    # + nettoyer les orphelins');
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Exécuter le script
if (require.main === module) {
  main();
}

module.exports = {
  getImageStats,
  checkImageIntegrity,
  fixBrokenImages,
  optimizeImages
};
