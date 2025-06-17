# 🗺️ GUIDE DE LA CARTOGRAPHIE - SuiviCluster

## 📋 Vue d'ensemble

Le système de cartographie de SuiviCluster permet de visualiser géographiquement les sites agricoles et les activités sur une carte interactive utilisant Leaflet.

## ✅ Statut de Configuration

### Dépendances Installées
- ✅ **Leaflet** (^1.9.4) - Bibliothèque de cartographie principale
- ✅ **Leaflet.markercluster** (^1.5.3) - Plugin de clustering des marqueurs

### Fichiers Configurés
- ✅ **MapComponent.js** - Composant principal de la carte
- ✅ **Sites Map** - Page de cartographie des sites (`/sites/map`)
- ✅ **Activités Map** - Page de cartographie des activités (`/activites/map`)
- ✅ **APIs** - Toutes les APIs nécessaires sont présentes

## 🎯 Fonctionnalités

### 1. Cartographie des Sites (`/sites/map`)
- **Marqueurs verts** pour les sites agricoles
- **Filtres disponibles :**
  - Affichage/masquage des sites et activités
  - Filtre par région
  - Filtre par type d'activité
- **Informations dans les popups :**
  - Nom du site
  - Localisation (commune, village)
  - Superficie
  - Données des opérateurs
  - Types de cultures

### 2. Cartographie des Activités (`/activites/map`)
- **Marqueurs bleus** pour les activités
- **Filtres disponibles :**
  - Filtre par région
  - Filtre par type d'activité
  - Filtre par statut (en attente, approuvé, rejeté)
- **Informations dans les popups :**
  - Type d'activité
  - Thématique
  - Durée
  - Date de création
  - Statut
  - Données des bénéficiaires

### 3. Fonctionnalités Avancées
- **Clustering automatique** des marqueurs (plus de 10 marqueurs)
- **Popups interactives** avec liens vers les détails
- **Contrôles de carte** (zoom, échelle)
- **Responsive design** pour mobile et desktop
- **Mode sombre** supporté

## 🔧 Structure Technique

### Composant Principal
```javascript
// app/components/Map/MapComponent.js
- Import dynamique de Leaflet (évite les erreurs SSR)
- Gestion des marqueurs personnalisés
- Clustering intelligent
- Popups avec contenu riche
```

### Pages de Cartographie
```javascript
// app/(protected)/sites/map/page.js
// app/(protected)/activites/map/page.js
- Import dynamique du composant carte
- Gestion des filtres
- Appels API avec credentials
- Interface utilisateur complète
```

### Structure des Données

#### Sites
```javascript
{
  id: number,
  nom: string,
  commune: string,
  village: string,
  superficie: number,
  coordonnees: {
    lat: number,
    lng: number
  },
  region: { nom: string },
  operateurs: {
    hommes: number,
    femmes: number,
    jeunes: number
  },
  cultures: {
    types: string[]
  }
}
```

#### Activités
```javascript
{
  id: number,
  type: string,
  thematique: string,
  duree: number,
  statut: 'en_attente' | 'approuve' | 'rejete',
  geolocalisation: {
    lat: number,
    lng: number
  },
  beneficiaires: {
    hommes: number,
    femmes: number,
    jeunes: number
  },
  dateCreation: string
}
```

## 🚀 Instructions d'Utilisation

### Pour les Utilisateurs

1. **Accès aux cartes :**
   - Connectez-vous avec : `admin@cluster.ne` / `AdminCluster2025!`
   - Naviguez vers `/sites/map` ou `/activites/map`

2. **Navigation :**
   - Utilisez la molette pour zoomer
   - Cliquez et glissez pour déplacer la carte
   - Cliquez sur les marqueurs pour voir les détails

3. **Filtres :**
   - Utilisez les filtres en haut de page
   - Les statistiques se mettent à jour automatiquement
   - Les marqueurs se filtrent en temps réel

### Pour les Développeurs

1. **Ajouter des données géolocalisées :**
   ```sql
   -- Pour les sites
   UPDATE sites SET coordonnees = JSON_OBJECT('lat', 13.5137, 'lng', 2.1098) WHERE id = 1;
   
   -- Pour les activités
   UPDATE activites SET geolocalisation = JSON_OBJECT('lat', 13.5137, 'lng', 2.1098) WHERE id = 1;
   ```

2. **Personnaliser les marqueurs :**
   ```javascript
   // Dans MapComponent.js
   const createCustomIcon = (color, iconPath, size = 32) => {
     // Personnaliser l'apparence des marqueurs
   }
   ```

3. **Ajouter de nouveaux filtres :**
   ```javascript
   // Dans les pages de cartographie
   const [filters, setFilters] = useState({
     // Ajouter de nouveaux filtres ici
   });
   ```

## 🧪 Tests et Validation

### Script de Test
```bash
node scripts/test-map-functionality.js
```

### Tests Manuels
1. **Test de base :**
   - Démarrez le serveur : `npm run dev`
   - Naviguez vers `/sites/map` et `/activites/map`
   - Vérifiez que les cartes se chargent

2. **Test des fonctionnalités :**
   - Testez les filtres
   - Cliquez sur les marqueurs
   - Vérifiez les popups
   - Testez le clustering

3. **Test responsive :**
   - Testez sur mobile
   - Testez sur tablette
   - Vérifiez le mode sombre

## 🔧 Dépannage

### Problèmes Courants

#### 1. Carte ne s'affiche pas
**Symptômes :** Zone grise à la place de la carte
**Solutions :**
- Vérifiez que Leaflet est correctement importé
- Vérifiez les erreurs de console
- Assurez-vous que l'import est dynamique

#### 2. Marqueurs manquants
**Symptômes :** Carte vide sans marqueurs
**Solutions :**
- Vérifiez que les données ont des coordonnées
- Vérifiez les appels API (credentials: 'include')
- Vérifiez la structure des données

#### 3. Erreurs SSR
**Symptômes :** Erreurs lors du rendu côté serveur
**Solutions :**
- Utilisez l'import dynamique avec `ssr: false`
- Vérifiez que `window` est disponible avant d'utiliser Leaflet

#### 4. Clustering ne fonctionne pas
**Symptômes :** Tous les marqueurs sont visibles individuellement
**Solutions :**
- Vérifiez que `leaflet.markercluster` est installé
- Vérifiez l'import du plugin
- Vérifiez la configuration du clustering

### Logs de Débogage
```javascript
// Activer les logs dans MapComponent.js
console.log('Sites avec coordonnées:', sitesWithCoords);
console.log('Activités avec géolocalisation:', activitesWithCoords);
```

## 📊 Métriques et Performance

### Optimisations Appliquées
- **Import dynamique** pour éviter les erreurs SSR
- **Clustering automatique** pour les performances
- **Filtrage côté client** pour la réactivité
- **Popups lazy-loaded** pour la mémoire

### Limites Recommandées
- **Sites :** Jusqu'à 1000 marqueurs avec clustering
- **Activités :** Jusqu'à 1000 marqueurs avec clustering
- **Zoom minimum :** Niveau 6 (vue pays)
- **Zoom maximum :** Niveau 18 (vue détaillée)

## 🔮 Améliorations Futures

### Fonctionnalités Prévues
- [ ] **Heatmap** pour la densité des activités
- [ ] **Couches multiples** (satellite, terrain)
- [ ] **Géolocalisation utilisateur**
- [ ] **Export de cartes** en PDF/PNG
- [ ] **Mesure de distances**
- [ ] **Zones de dessin** pour délimiter des régions

### Intégrations Possibles
- [ ] **GPS tracking** pour les conseillers
- [ ] **Données météo** en temps réel
- [ ] **Images satellite** récentes
- [ ] **Données démographiques**

## 📚 Ressources

### Documentation Leaflet
- [Leaflet Documentation](https://leafletjs.com/reference.html)
- [Leaflet Tutorials](https://leafletjs.com/examples.html)
- [MarkerCluster Plugin](https://github.com/Leaflet/Leaflet.markercluster)

### Exemples de Code
- Voir `app/components/Map/MapComponent.js` pour l'implémentation
- Voir les pages de cartographie pour l'utilisation
- Voir `scripts/test-map-functionality.js` pour les tests

---

**Date de création :** 17/06/2025  
**Version :** 1.0  
**Statut :** ✅ Fonctionnel et testé
