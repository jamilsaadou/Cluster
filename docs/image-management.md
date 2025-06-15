# Gestion des Images - Système d'Upload

## Vue d'ensemble

Le système d'images a été migré du stockage base64 vers un système d'upload de fichiers sur le serveur pour améliorer les performances et réduire la taille de la base de données.

## Architecture

### Structure des fichiers
```
uploads/
└── images/           # Dossier de stockage des images (hors public)
    ├── uuid1.jpg
    ├── uuid2.png
    └── ...

app/api/
├── upload/images/    # API d'upload
└── images/[filename]/ # API de service des images

scripts/
├── migrate-images.js     # Migration base64 → fichiers
└── image-management.js   # Outils de maintenance
```

### Composants
- **Photos.js** : Composant React pour l'upload et l'affichage
- **API Upload** : `/api/upload/images` - Gestion de l'upload
- **API Images** : `/api/images/[filename]` - Service des images

## Fonctionnalités

### Upload d'images
- **Formats supportés** : JPEG, JPG, PNG, WebP
- **Taille maximale** : 5MB par fichier
- **Upload multiple** : Oui
- **Noms uniques** : UUID pour éviter les conflits
- **Validation** : Côté client et serveur

### Sécurité
- Validation des types MIME
- Limitation de taille
- Noms de fichiers sécurisés (UUID)
- Stockage hors du dossier public
- Protection contre les attaques de traversée de répertoire

### Performance
- Cache HTTP (1 an) pour les images
- Compression automatique des réponses
- Stockage optimisé sur disque

## Utilisation

### Dans les composants React
```jsx
import Photos from '@/components/sites/FormSections/Photos';

function MonComposant() {
  const [photos, setPhotos] = useState([]);
  
  return (
    <Photos 
      data={photos} 
      onChange={setPhotos}
      title="Photos du site"
    />
  );
}
```

### Format des données
```javascript
// Ancien format (base64)
photos: ["data:image/jpeg;base64,/9j/4AAQ..."]

// Nouveau format (URLs)
photos: ["/api/images/550e8400-e29b-41d4-a716-446655440000.jpg"]
```

## Scripts de maintenance

### Migration des données existantes
```bash
# Migrer toutes les images base64 vers des fichiers
node scripts/migrate-images.js

# Migrer + nettoyer les fichiers orphelins
node scripts/migrate-images.js --cleanup
```

### Gestion et maintenance
```bash
# Afficher les statistiques
node scripts/image-management.js --stats

# Vérifier l'intégrité des images
node scripts/image-management.js --check

# Réparer les références cassées
node scripts/image-management.js --fix

# Optimiser les images (à implémenter)
node scripts/image-management.js --optimize
```

## API Endpoints

### POST /api/upload/images
Upload de nouvelles images.

**Request:**
```javascript
const formData = new FormData();
formData.append('files', file1);
formData.append('files', file2);

fetch('/api/upload/images', {
  method: 'POST',
  body: formData
});
```

**Response:**
```json
{
  "success": true,
  "files": [
    {
      "originalName": "photo.jpg",
      "fileName": "550e8400-e29b-41d4-a716-446655440000.jpg",
      "url": "/api/images/550e8400-e29b-41d4-a716-446655440000.jpg",
      "size": 1024000,
      "type": "image/jpeg"
    }
  ],
  "message": "1 fichier(s) uploadé(s) avec succès"
}
```

### DELETE /api/upload/images?fileName=xxx
Suppression d'une image.

**Request:**
```javascript
fetch('/api/upload/images?fileName=550e8400-e29b-41d4-a716-446655440000.jpg', {
  method: 'DELETE'
});
```

### GET /api/images/[filename]
Service d'une image.

**Response:**
- Image avec headers de cache appropriés
- Type MIME automatiquement détecté
- 404 si l'image n'existe pas

## Avantages du nouveau système

### Performance
- ✅ Base de données plus légère
- ✅ Chargement plus rapide des pages
- ✅ Cache HTTP efficace
- ✅ Pas de conversion base64

### Maintenance
- ✅ Gestion centralisée des images
- ✅ Outils de diagnostic et réparation
- ✅ Nettoyage automatique des orphelins
- ✅ Statistiques détaillées

### Sécurité
- ✅ Validation stricte des fichiers
- ✅ Stockage sécurisé
- ✅ Protection contre les attaques
- ✅ Limitation des ressources

## Migration depuis l'ancien système

1. **Sauvegarde** : Faire une sauvegarde de la base de données
2. **Migration** : Exécuter `node scripts/migrate-images.js`
3. **Vérification** : Utiliser `node scripts/image-management.js --check`
4. **Nettoyage** : Optionnel `node scripts/migrate-images.js --cleanup`

## Dépannage

### Images qui ne s'affichent pas
1. Vérifier que le dossier `uploads/images` existe
2. Vérifier les permissions du dossier
3. Utiliser `--check` pour diagnostiquer
4. Utiliser `--fix` pour réparer les références cassées

### Erreurs d'upload
1. Vérifier la taille des fichiers (max 5MB)
2. Vérifier le format (JPEG, PNG, WebP)
3. Vérifier l'espace disque disponible
4. Consulter les logs du serveur

### Performance
1. Vérifier la configuration du cache HTTP
2. Optimiser les images avant upload
3. Surveiller l'utilisation disque
4. Utiliser `--stats` pour les métriques

## Configuration

### Variables d'environnement
Aucune configuration spéciale requise. Le système utilise les paramètres par défaut :
- Dossier : `uploads/images`
- Taille max : 5MB
- Cache : 1 an

### Personnalisation
Pour modifier les paramètres, éditer :
- `app/api/upload/images/route.js` (limites d'upload)
- `app/api/images/[filename]/route.js` (cache HTTP)
- `app/components/sites/FormSections/Photos.js` (validation client)
