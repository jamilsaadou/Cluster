#!/usr/bin/env node

/**
 * Script de diagnostic avancé pour les vignettes noires
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔍 Diagnostic avancé des vignettes noires...\n');

const UPLOAD_DIR = path.join(process.cwd(), 'uploads', 'images');

// 1. Vérifier les permissions du dossier
console.log('📁 Vérification des permissions:');
try {
  const stats = fs.statSync(UPLOAD_DIR);
  console.log(`   Dossier: ${UPLOAD_DIR}`);
  console.log(`   Permissions: ${stats.mode.toString(8)}`);
  console.log(`   Propriétaire: ${stats.uid}:${stats.gid}`);
} catch (error) {
  console.log(`❌ Erreur: ${error.message}`);
}

// 2. Lister les images avec détails
console.log('\n📸 Images disponibles:');
if (fs.existsSync(UPLOAD_DIR)) {
  const files = fs.readdirSync(UPLOAD_DIR);
  const imageFiles = files.filter(file => /\.(jpg|jpeg|png|webp|gif)$/i.test(file));
  
  imageFiles.forEach((file, index) => {
    const filePath = path.join(UPLOAD_DIR, file);
    const stats = fs.statSync(filePath);
    console.log(`   ${index + 1}. ${file}`);
    console.log(`      Taille: ${Math.round(stats.size / 1024)}KB`);
    console.log(`      Modifié: ${stats.mtime.toISOString()}`);
    console.log(`      Permissions: ${stats.mode.toString(8)}`);
    
    // Vérifier si le fichier est lisible
    try {
      const buffer = fs.readFileSync(filePath);
      console.log(`      ✅ Lisible (${buffer.length} bytes)`);
      
      // Vérifier les premiers bytes pour s'assurer que c'est une vraie image
      const header = buffer.slice(0, 10);
      if (file.toLowerCase().endsWith('.jpg') || file.toLowerCase().endsWith('.jpeg')) {
        if (header[0] === 0xFF && header[1] === 0xD8) {
          console.log(`      ✅ Format JPEG valide`);
        } else {
          console.log(`      ❌ Format JPEG invalide`);
        }
      } else if (file.toLowerCase().endsWith('.png')) {
        if (header[0] === 0x89 && header[1] === 0x50 && header[2] === 0x4E && header[3] === 0x47) {
          console.log(`      ✅ Format PNG valide`);
        } else {
          console.log(`      ❌ Format PNG invalide`);
        }
      }
    } catch (error) {
      console.log(`      ❌ Non lisible: ${error.message}`);
    }
    console.log('');
  });
  
  // 3. Tester l'API directement
  if (imageFiles.length > 0) {
    const testFile = imageFiles[0];
    console.log(`🧪 Test de l'API pour: ${testFile}`);
    console.log(`   URL: http://localhost:3000/api/images/${testFile}`);
    console.log('');
    console.log('   Pour tester manuellement:');
    console.log(`   1. Démarrez le serveur: npm run dev`);
    console.log(`   2. Ouvrez: http://localhost:3000/api/images/${testFile}`);
    console.log(`   3. Vérifiez si l'image s'affiche`);
    console.log('');
  }
}

// 4. Vérifier la configuration Next.js
console.log('⚙️ Vérification de la configuration Next.js:');
const nextConfigPath = path.join(process.cwd(), 'next.config.mjs');
if (fs.existsSync(nextConfigPath)) {
  console.log('   ✅ next.config.mjs trouvé');
  try {
    const config = fs.readFileSync(nextConfigPath, 'utf8');
    if (config.includes('images')) {
      console.log('   ✅ Configuration images présente');
    } else {
      console.log('   ⚠️ Pas de configuration images spécifique');
    }
  } catch (error) {
    console.log(`   ❌ Erreur lecture config: ${error.message}`);
  }
} else {
  console.log('   ⚠️ next.config.mjs non trouvé');
}

// 5. Vérifier le middleware
console.log('\n🛡️ Vérification du middleware:');
const middlewarePath = path.join(process.cwd(), 'middleware.js');
if (fs.existsSync(middlewarePath)) {
  console.log('   ✅ middleware.js trouvé');
  const middleware = fs.readFileSync(middlewarePath, 'utf8');
  if (middleware.includes('/api/images')) {
    console.log('   ⚠️ Le middleware mentionne /api/images');
    console.log('   💡 Cela pourrait causer des problèmes d\'authentification');
  } else {
    console.log('   ✅ Le middleware ne mentionne pas spécifiquement /api/images');
  }
} else {
  console.log('   ❌ middleware.js non trouvé');
}

console.log('\n🔧 Solutions possibles:');
console.log('');
console.log('1. 🌐 Problème de serveur de développement:');
console.log('   - Redémarrer le serveur: npm run dev');
console.log('   - Vider le cache: rm -rf .next');
console.log('');
console.log('2. 🔒 Problème d\'authentification persistant:');
console.log('   - Vérifier que l\'API /api/images/[filename] est bien publique');
console.log('   - Tester l\'URL directement dans un onglet privé');
console.log('');
console.log('3. 📱 Problème de navigateur:');
console.log('   - Vider le cache du navigateur');
console.log('   - Tester dans un autre navigateur');
console.log('   - Ouvrir les outils de développement (F12)');
console.log('   - Vérifier l\'onglet Network pour les requêtes d\'images');
console.log('');
console.log('4. 🎨 Problème CSS:');
console.log('   - Les images peuvent être masquées par du CSS');
console.log('   - Vérifier les styles appliqués aux éléments img');
console.log('');
console.log('5. 🔄 Problème de CORS:');
console.log('   - Même si l\'API est publique, il peut y avoir des problèmes CORS');
console.log('   - Vérifier les en-têtes de réponse');

console.log('\n📋 Checklist de débogage:');
console.log('');
console.log('□ Redémarrer le serveur de développement');
console.log('□ Tester l\'URL d\'image directement');
console.log('□ Vérifier la console du navigateur');
console.log('□ Vérifier l\'onglet Network');
console.log('□ Tester en navigation privée');
console.log('□ Vérifier les permissions des fichiers');
console.log('□ Vérifier que les fichiers ne sont pas corrompus');

console.log('\n✨ Diagnostic terminé !');
