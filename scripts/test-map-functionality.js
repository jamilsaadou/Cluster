const fs = require('fs');
const path = require('path');

console.log('🗺️  TEST DE FONCTIONNALITÉ DE LA CARTOGRAPHIE\n');

// Vérifier les dépendances Leaflet
console.log('1️⃣  Vérification des dépendances...');

try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const dependencies = packageJson.dependencies || {};
  
  const requiredDeps = {
    'leaflet': 'Bibliothèque de cartographie principale',
    'leaflet.markercluster': 'Plugin de clustering des marqueurs'
  };
  
  let allDepsPresent = true;
  
  Object.entries(requiredDeps).forEach(([dep, description]) => {
    if (dependencies[dep]) {
      console.log(`   ✅ ${dep} (${dependencies[dep]}) - ${description}`);
    } else {
      console.log(`   ❌ ${dep} - MANQUANT - ${description}`);
      allDepsPresent = false;
    }
  });
  
  if (allDepsPresent) {
    console.log('   🎉 Toutes les dépendances sont présentes !');
  } else {
    console.log('   ⚠️  Certaines dépendances sont manquantes');
  }
  
} catch (error) {
  console.log(`   ❌ Erreur lors de la lecture du package.json: ${error.message}`);
}

// Vérifier les fichiers de cartographie
console.log('\n2️⃣  Vérification des fichiers de cartographie...');

const mapFiles = [
  {
    path: 'app/components/Map/MapComponent.js',
    description: 'Composant principal de la carte'
  },
  {
    path: 'app/(protected)/sites/map/page.js',
    description: 'Page de cartographie des sites'
  },
  {
    path: 'app/(protected)/activites/map/page.js',
    description: 'Page de cartographie des activités'
  }
];

mapFiles.forEach(file => {
  if (fs.existsSync(file.path)) {
    const content = fs.readFileSync(file.path, 'utf8');
    
    // Vérifications spécifiques
    const checks = [
      {
        test: content.includes('credentials: \'include\''),
        message: 'Appels API avec credentials'
      },
      {
        test: content.includes('dynamic'),
        message: 'Import dynamique pour SSR'
      },
      {
        test: content.includes('leaflet'),
        message: 'Import de Leaflet'
      }
    ];
    
    console.log(`   📁 ${file.path} - ${file.description}`);
    checks.forEach(check => {
      if (check.test) {
        console.log(`      ✅ ${check.message}`);
      } else {
        console.log(`      ⚠️  ${check.message} - Non trouvé`);
      }
    });
    
  } else {
    console.log(`   ❌ ${file.path} - FICHIER MANQUANT`);
  }
});

// Vérifier la structure des données attendues
console.log('\n3️⃣  Vérification de la structure des données...');

const dataStructureChecks = [
  {
    file: 'app/components/Map/MapComponent.js',
    checks: [
      'site.coordonnees',
      'activite.geolocalisation',
      'site.coordonnees.lat',
      'site.coordonnees.lng',
      'activite.geolocalisation.lat',
      'activite.geolocalisation.lng'
    ]
  }
];

dataStructureChecks.forEach(fileCheck => {
  if (fs.existsSync(fileCheck.file)) {
    const content = fs.readFileSync(fileCheck.file, 'utf8');
    console.log(`   📊 Structure des données dans ${fileCheck.file}:`);
    
    fileCheck.checks.forEach(check => {
      if (content.includes(check)) {
        console.log(`      ✅ ${check}`);
      } else {
        console.log(`      ⚠️  ${check} - Non trouvé`);
      }
    });
  }
});

// Vérifier les APIs nécessaires
console.log('\n4️⃣  Vérification des APIs...');

const apiFiles = [
  {
    path: 'app/api/sites/route.js',
    description: 'API des sites'
  },
  {
    path: 'app/api/activites/route.js',
    description: 'API des activités'
  },
  {
    path: 'app/api/regions/route.js',
    description: 'API des régions'
  }
];

apiFiles.forEach(api => {
  if (fs.existsSync(api.path)) {
    console.log(`   ✅ ${api.path} - ${api.description}`);
  } else {
    console.log(`   ❌ ${api.path} - MANQUANT - ${api.description}`);
  }
});

// Recommandations
console.log('\n🎯 RECOMMANDATIONS POUR LA CARTOGRAPHIE:');
console.log('   1. Assurez-vous que les sites ont des coordonnées GPS (lat, lng)');
console.log('   2. Assurez-vous que les activités ont une géolocalisation (lat, lng)');
console.log('   3. Testez la carte sur différents navigateurs');
console.log('   4. Vérifiez que les popups s\'affichent correctement');
console.log('   5. Testez les filtres de région et de type');

// Instructions de test
console.log('\n🧪 INSTRUCTIONS DE TEST:');
console.log('   1. Démarrez le serveur: npm run dev');
console.log('   2. Connectez-vous avec: admin@cluster.ne / AdminCluster2025!');
console.log('   3. Naviguez vers: /sites/map');
console.log('   4. Naviguez vers: /activites/map');
console.log('   5. Vérifiez que les marqueurs s\'affichent');
console.log('   6. Testez les filtres et les popups');

// Problèmes courants et solutions
console.log('\n🔧 PROBLÈMES COURANTS ET SOLUTIONS:');
console.log('   • Carte ne s\'affiche pas: Vérifiez les imports Leaflet');
console.log('   • Marqueurs manquants: Vérifiez les coordonnées dans la DB');
console.log('   • Erreurs SSR: Vérifiez l\'import dynamique');
console.log('   • Erreurs 401: Vérifiez credentials: "include"');
console.log('   • Clustering ne fonctionne pas: Vérifiez leaflet.markercluster');

console.log('\n✅ Test de fonctionnalité terminé !');
