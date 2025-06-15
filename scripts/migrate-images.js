const { PrismaClient } = require('@prisma/client');
const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const prisma = new PrismaClient();

// Configuration
const UPLOAD_DIR = path.join(process.cwd(), 'uploads', 'images');

// Fonction pour créer le dossier d'upload s'il n'existe pas
async function ensureUploadDir() {
  try {
    await fs.access(UPLOAD_DIR);
  } catch {
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
    console.log('✅ Dossier uploads/images créé');
  }
}

// Fonction pour convertir base64 en fichier
async function base64ToFile(base64Data, fileName) {
  try {
    // Extraire les données base64 (enlever le préfixe data:image/...)
    const matches = base64Data.match(/^data:image\/([a-zA-Z]+);base64,(.+)$/);
    if (!matches) {
      throw new Error('Format base64 invalide');
    }

    const imageType = matches[1];
    const imageData = matches[2];
    
    // Générer un nom de fichier unique
    const fileExtension = imageType === 'jpeg' ? 'jpg' : imageType;
    const uniqueFileName = `${uuidv4()}.${fileExtension}`;
    const filePath = path.join(UPLOAD_DIR, uniqueFileName);

    // Convertir et sauvegarder
    const buffer = Buffer.from(imageData, 'base64');
    await fs.writeFile(filePath, buffer);

    return {
      fileName: uniqueFileName,
      url: `/api/images/${uniqueFileName}`,
      originalSize: buffer.length
    };
  } catch (error) {
    console.error('Erreur conversion base64:', error);
    return null;
  }
}

// Fonction pour migrer les photos des sites
async function migrateSitePhotos() {
  console.log('🔄 Migration des photos des sites...');
  
  const sites = await prisma.site.findMany({
    where: {
      photos: {
        not: null
      }
    }
  });

  let migratedCount = 0;
  let totalPhotos = 0;

  for (const site of sites) {
    try {
      const photos = Array.isArray(site.photos) ? site.photos : [];
      const newPhotoUrls = [];

      for (const photo of photos) {
        totalPhotos++;
        
        // Vérifier si c'est déjà une URL (déjà migré)
        if (typeof photo === 'string' && photo.startsWith('/api/images/')) {
          newPhotoUrls.push(photo);
          continue;
        }

        // Vérifier si c'est du base64
        if (typeof photo === 'string' && photo.startsWith('data:image/')) {
          const result = await base64ToFile(photo, `site-${site.id}`);
          if (result) {
            newPhotoUrls.push(result.url);
            migratedCount++;
            console.log(`  ✅ Photo migrée pour le site ${site.id}: ${result.fileName}`);
          } else {
            console.log(`  ❌ Échec migration photo pour le site ${site.id}`);
          }
        }
      }

      // Mettre à jour le site avec les nouvelles URLs
      if (newPhotoUrls.length > 0) {
        await prisma.site.update({
          where: { id: site.id },
          data: { photos: newPhotoUrls }
        });
      }

    } catch (error) {
      console.error(`Erreur migration site ${site.id}:`, error);
    }
  }

  console.log(`✅ Migration sites terminée: ${migratedCount}/${totalPhotos} photos migrées`);
}

// Fonction pour migrer les photos des activités
async function migrateActivityPhotos() {
  console.log('🔄 Migration des photos des activités...');
  
  const activites = await prisma.activite.findMany({
    where: {
      photos: {
        not: null
      }
    }
  });

  let migratedCount = 0;
  let totalPhotos = 0;

  for (const activite of activites) {
    try {
      const photos = Array.isArray(activite.photos) ? activite.photos : [];
      const newPhotoUrls = [];

      for (const photo of photos) {
        totalPhotos++;
        
        // Vérifier si c'est déjà une URL (déjà migré)
        if (typeof photo === 'string' && photo.startsWith('/api/images/')) {
          newPhotoUrls.push(photo);
          continue;
        }

        // Vérifier si c'est du base64
        if (typeof photo === 'string' && photo.startsWith('data:image/')) {
          const result = await base64ToFile(photo, `activite-${activite.id}`);
          if (result) {
            newPhotoUrls.push(result.url);
            migratedCount++;
            console.log(`  ✅ Photo migrée pour l'activité ${activite.id}: ${result.fileName}`);
          } else {
            console.log(`  ❌ Échec migration photo pour l'activité ${activite.id}`);
          }
        }
      }

      // Mettre à jour l'activité avec les nouvelles URLs
      if (newPhotoUrls.length > 0) {
        await prisma.activite.update({
          where: { id: activite.id },
          data: { photos: newPhotoUrls }
        });
      }

    } catch (error) {
      console.error(`Erreur migration activité ${activite.id}:`, error);
    }
  }

  console.log(`✅ Migration activités terminée: ${migratedCount}/${totalPhotos} photos migrées`);
}

// Fonction pour nettoyer les fichiers orphelins
async function cleanupOrphanFiles() {
  console.log('🧹 Nettoyage des fichiers orphelins...');
  
  try {
    // Lister tous les fichiers dans le dossier uploads
    const files = await fs.readdir(UPLOAD_DIR);
    
    // Récupérer toutes les URLs d'images utilisées
    const sites = await prisma.site.findMany({
      select: { photos: true }
    });
    
    const activites = await prisma.activite.findMany({
      select: { photos: true }
    });

    const usedFiles = new Set();
    
    // Extraire les noms de fichiers utilisés
    [...sites, ...activites].forEach(item => {
      if (Array.isArray(item.photos)) {
        item.photos.forEach(photo => {
          if (typeof photo === 'string' && photo.startsWith('/api/images/')) {
            const fileName = photo.split('/').pop();
            usedFiles.add(fileName);
          }
        });
      }
    });

    // Supprimer les fichiers non utilisés
    let deletedCount = 0;
    for (const file of files) {
      if (!usedFiles.has(file)) {
        await fs.unlink(path.join(UPLOAD_DIR, file));
        deletedCount++;
        console.log(`  🗑️ Fichier supprimé: ${file}`);
      }
    }

    console.log(`✅ Nettoyage terminé: ${deletedCount} fichiers supprimés`);
  } catch (error) {
    console.error('Erreur lors du nettoyage:', error);
  }
}

// Fonction principale
async function main() {
  try {
    console.log('🚀 Début de la migration des images...');
    
    // Créer le dossier d'upload
    await ensureUploadDir();
    
    // Migrer les photos
    await migrateSitePhotos();
    await migrateActivityPhotos();
    
    // Nettoyer les fichiers orphelins (optionnel)
    if (process.argv.includes('--cleanup')) {
      await cleanupOrphanFiles();
    }
    
    console.log('✅ Migration terminée avec succès!');
    console.log('💡 Utilisez --cleanup pour nettoyer les fichiers orphelins');
    
  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Exécuter le script
if (require.main === module) {
  main();
}

module.exports = {
  migrateSitePhotos,
  migrateActivityPhotos,
  cleanupOrphanFiles,
  base64ToFile
};
