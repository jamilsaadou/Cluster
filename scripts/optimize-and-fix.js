const fs = require('fs');
const path = require('path');

console.log('🔧 OPTIMISATION ET CORRECTION DES BUGS\n');

// Liste des optimisations à appliquer
const optimizations = [
  {
    name: 'Ajout de credentials aux appels fetch manqués',
    files: [
      'app/(protected)/sites/assignments/page.js',
      'app/(protected)/utilisateurs/page.js',
      'app/(protected)/utilisateurs/[id]/page.js',
      'app/(protected)/utilisateurs/edit/[id]/page.js'
    ]
  },
  {
    name: 'Gestion d\'erreur améliorée',
    files: [
      'app/(protected)/sites/assignments/page.js'
    ]
  }
];

// Fonction pour corriger les appels fetch sans credentials
function fixFetchCredentials(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  Fichier non trouvé: ${filePath}`);
    return false;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // Patterns pour les appels fetch qui ont besoin de credentials
  const apiPatterns = [
    /fetch\(['"`]\/api\/[^'"`]*['"`]\)/g,
    /fetch\(`\/api\/[^`]*`\)/g
  ];

  apiPatterns.forEach(pattern => {
    const matches = content.match(pattern);
    if (matches) {
      matches.forEach(match => {
        // Vérifier si le fetch n'a pas déjà credentials
        const contextStart = content.indexOf(match);
        const contextEnd = content.indexOf(')', contextStart) + 1;
        const context = content.substring(contextStart, contextEnd + 100);
        
        if (!context.includes('credentials') && !context.includes('method:')) {
          const newMatch = match.replace(
            /fetch\((['"`][^'"`]*['"`])\)/,
            'fetch($1, {\n        credentials: \'include\'\n      })'
          );
          content = content.replace(match, newMatch);
          modified = true;
        }
      });
    }
  });

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    return true;
  }
  return false;
}

// Fonction pour améliorer la gestion d'erreur
function improveErrorHandling(filePath) {
  if (!fs.existsSync(filePath)) {
    return false;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // Remplacer les alert() par des notifications plus élégantes
  if (content.includes('alert(')) {
    content = content.replace(
      /alert\(['"`]([^'"`]*?)['"`]\);/g,
      'console.error(\'$1\');\n    // TODO: Remplacer par une notification toast'
    );
    modified = true;
  }

  // Ajouter des try-catch manquants
  const fetchWithoutTryCatch = /(?<!try\s*\{[^}]*?)fetch\(/g;
  if (fetchWithoutTryCatch.test(content)) {
    // Cette optimisation nécessite une analyse plus complexe
    console.log(`   ℹ️  ${filePath}: Détecté des appels fetch sans try-catch`);
  }

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    return true;
  }
  return false;
}

// Fonction pour optimiser les imports
function optimizeImports(filePath) {
  if (!fs.existsSync(filePath)) {
    return false;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // Regrouper les imports React
  const reactImports = content.match(/import\s+\{[^}]*\}\s+from\s+['"`]react['"`];?/g);
  if (reactImports && reactImports.length > 1) {
    console.log(`   ℹ️  ${filePath}: Imports React multiples détectés`);
  }

  return modified;
}

// Exécuter les optimisations
console.log('1️⃣  Correction des appels fetch sans credentials...');
let fetchFixed = 0;
optimizations[0].files.forEach(file => {
  if (fixFetchCredentials(file)) {
    console.log(`   ✅ ${file}`);
    fetchFixed++;
  } else {
    console.log(`   ℹ️  ${file} (déjà correct)`);
  }
});

console.log('\n2️⃣  Amélioration de la gestion d\'erreur...');
let errorHandlingImproved = 0;
optimizations[1].files.forEach(file => {
  if (improveErrorHandling(file)) {
    console.log(`   ✅ ${file}`);
    errorHandlingImproved++;
  } else {
    console.log(`   ℹ️  ${file} (déjà optimisé)`);
  }
});

console.log('\n3️⃣  Optimisation des imports...');
const allJSFiles = [
  'app/(protected)/sites/assignments/page.js',
  'app/(protected)/dashboard/page.js',
  'app/components/Sidebar/index.js'
];

allJSFiles.forEach(file => {
  optimizeImports(file);
});

console.log('\n📊 RÉSUMÉ DES OPTIMISATIONS:');
console.log(`   • Appels fetch corrigés: ${fetchFixed}`);
console.log(`   • Gestion d'erreur améliorée: ${errorHandlingImproved}`);
console.log(`   • Imports analysés: ${allJSFiles.length}`);

console.log('\n🎯 RECOMMANDATIONS SUPPLÉMENTAIRES:');
console.log('   1. Remplacer alert() par des notifications toast');
console.log('   2. Ajouter des loading states plus granulaires');
console.log('   3. Implémenter une gestion d\'erreur centralisée');
console.log('   4. Ajouter des tests unitaires pour les composants critiques');
console.log('   5. Optimiser les requêtes API avec du caching');

console.log('\n✅ Optimisation terminée !');
