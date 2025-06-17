const fs = require('fs');
const path = require('path');

// Liste des fichiers à corriger
const filesToFix = [
  'app/(protected)/sites/page.js',
  'app/(protected)/activites/page.js',
  'app/(protected)/activites/add/page.js'
];

console.log('🔧 Correction des appels à /api/auth/me sans credentials...\n');

filesToFix.forEach(filePath => {
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  Fichier non trouvé: ${filePath}`);
      return;
    }

    let content = fs.readFileSync(filePath, 'utf8');
    
    // Pattern pour trouver les appels fetch à /api/auth/me sans credentials
    const pattern = /fetch\(['"`]\/api\/auth\/me['"`]\)/g;
    const patternWithOptions = /fetch\(['"`]\/api\/auth\/me['"`],\s*\{[^}]*\}\)/g;
    
    let modified = false;
    
    // Vérifier s'il y a des appels sans credentials
    if (pattern.test(content)) {
      content = content.replace(
        /fetch\(['"`]\/api\/auth\/me['"`]\)/g,
        "fetch('/api/auth/me', {\n        credentials: 'include'\n      })"
      );
      modified = true;
    }
    
    // Vérifier s'il y a des appels avec options mais sans credentials
    const matchesWithOptions = content.match(patternWithOptions);
    if (matchesWithOptions) {
      matchesWithOptions.forEach(match => {
        if (!match.includes('credentials')) {
          const newMatch = match.replace(
            /fetch\(['"`]\/api\/auth\/me['"`],\s*\{/,
            "fetch('/api/auth/me', {\n        credentials: 'include',"
          );
          content = content.replace(match, newMatch);
          modified = true;
        }
      });
    }
    
    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Corrigé: ${filePath}`);
    } else {
      console.log(`ℹ️  Déjà correct: ${filePath}`);
    }
    
  } catch (error) {
    console.log(`❌ Erreur avec ${filePath}: ${error.message}`);
  }
});

console.log('\n🎉 Correction terminée !');
console.log('\n📝 Résumé des modifications:');
console.log('- Ajout de credentials: "include" aux appels fetch(/api/auth/me)');
console.log('- Cela permet l\'envoi automatique des cookies d\'authentification');
console.log('\n🔄 Redémarrez le serveur de développement pour appliquer les changements.');
