#!/usr/bin/env node

/**
 * Script de diagnostic pour les problèmes d'affichage des images
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Diagnostic des problèmes d\'affichage des images...\n');

const UPLOAD_DIR = path.join(process.cwd(), 'uploads', 'images');

// Vérifier le dossier d'upload
console.log('📁 Vérification du dossier d\'upload:');
console.log(`   Chemin: ${UPLOAD_DIR}`);

if (!fs.existsSync(UPLOAD_DIR)) {
  console.log('❌ Le dossier d\'upload n\'existe pas');
  process.exit(1);
}

// Lister les images
const images = fs.readdirSync(UPLOAD_DIR).filter(file => 
  /\.(jpg|jpeg|png|webp|gif)$/i.test(file)
);

console.log(`✅ Dossier existe - ${images.length} image(s) trouvée(s)`);

if (images.length > 0) {
  console.log('\n📸 Images disponibles:');
  images.slice(0, 5).forEach((image, index) => {
    const filePath = path.join(UPLOAD_DIR, image);
    const stats = fs.statSync(filePath);
    console.log(`   ${index + 1}. ${image} (${Math.round(stats.size / 1024)}KB)`);
  });
  
  if (images.length > 5) {
    console.log(`   ... et ${images.length - 5} autres`);
  }
}

console.log('\n🔗 URLs d\'exemple pour tester:');
if (images.length > 0) {
  const testImage = images[0];
  console.log(`   http://localhost:3000/api/images/${testImage}`);
  console.log(`   (Testez cette URL dans votre navigateur)`);
}

console.log('\n🧪 Tests à effectuer:');
console.log('1. Démarrer l\'application: npm run dev');
console.log('2. Ouvrir l\'URL d\'exemple ci-dessus dans le navigateur');
console.log('3. Vérifier si l\'image s\'affiche correctement');
console.log('4. Ouvrir les outils de développement (F12)');
console.log('5. Vérifier la console pour les erreurs');
console.log('6. Vérifier l\'onglet Network pour les requêtes d\'images');

console.log('\n🔍 Causes possibles des vignettes noires:');
console.log('');
console.log('1. 🚫 Problème de CORS:');
console.log('   - Les images sont bloquées par la politique CORS');
console.log('   - Solution: Vérifier les en-têtes CORS dans l\'API');
console.log('');
console.log('2. 🔒 Problème d\'authentification:');
console.log('   - L\'API des images nécessite une authentification');
console.log('   - Solution: Rendre l\'API publique ou gérer l\'auth');
console.log('');
console.log('3. 🎨 Problème CSS:');
console.log('   - Les images ont une hauteur/largeur de 0');
console.log('   - Les images sont masquées par du CSS');
console.log('   - Solution: Vérifier les styles CSS');
console.log('');
console.log('4. 📱 Problème de chargement:');
console.log('   - Les images ne se chargent pas à temps');
console.log('   - Solution: Ajouter des états de chargement');
console.log('');
console.log('5. 🔗 Problème d\'URL:');
console.log('   - Les URLs des images sont incorrectes');
console.log('   - Solution: Vérifier le format des URLs');

console.log('\n🛠️ Solutions à essayer:');
console.log('');
console.log('1. Vérifier l\'API des images:');
console.log('   - Tester manuellement /api/images/[filename]');
console.log('   - Vérifier les en-têtes de réponse');
console.log('');
console.log('2. Vérifier le composant Photos:');
console.log('   - Ajouter des logs pour les URLs des images');
console.log('   - Vérifier les événements onError des images');
console.log('');
console.log('3. Vérifier les styles CSS:');
console.log('   - S\'assurer que les images ont une taille définie');
console.log('   - Vérifier object-fit et autres propriétés');
console.log('');
console.log('4. Ajouter des fallbacks:');
console.log('   - Image de placeholder en cas d\'erreur');
console.log('   - Gestion des états de chargement');

console.log('\n✨ Diagnostic terminé !');
