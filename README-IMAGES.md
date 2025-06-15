# 🖼️ Système de Gestion des Images

## Résumé des Améliorations

Le système d'images a été complètement refactorisé pour remplacer le stockage base64 par un système d'upload de fichiers sur le serveur. Cette amélioration apporte de meilleures performances, une base de données plus légère et une meilleure expérience utilisateur.

## 🚀 Démarrage Rapide

```bash
# Configuration automatique
./scripts/setup-images.sh

# Ou manuellement :
mkdir -p uploads/images
node scripts/migrate-images.js
node scripts/image-management.js --stats
```

## 📁 Structure des Fichiers Créés

```
uploads/
└── images/                           # Stockage sécurisé des images

app/api/
├── upload/images/route.js           # API d'upload
└── images/[filename]/route.js       # API de service

app/components/sites/FormSections/
└── Photos.js                        # Composant React mis à jour

scripts/
├── migrate-images.js                # Migration base64 → fichiers
├── image-management.js              # Outils de maintenance
└── setup-images.sh                  # Configuration rapide

docs/
└── image-management.md              # Documentation complète
```

## ✨ Nouvelles Fonctionnalités

### Upload d'Images
- ✅ **Formats supportés** : JPEG, PNG, WebP
- ✅ **Taille maximale** : 5MB par fichier
- ✅ **Upload multiple** : Plusieurs fichiers simultanément
- ✅ **Noms uniques** : UUID pour éviter les conflits
- ✅ **Validation** : Côté client et serveur
- ✅ **Barre de progression** : Feedback visuel

### Sécurité
- ✅ **Validation MIME** : Types de fichiers strictement contrôlés
- ✅ **Stockage sécurisé** : Hors du dossier public
- ✅ **Protection traversée** : Empêche l'accès aux fichiers système
- ✅ **Limitation ressources** : Taille et nombre de fichiers

### Performance
- ✅ **Cache HTTP** : 1 an de cache pour les images
- ✅ **Base allégée** : Plus de stockage base64
- ✅ **Chargement rapide** : Images servies directement
- ✅ **Fallback** : Image placeholder en cas d'erreur

## 🔧 Scripts de Maintenance

### Migration des Données
```bash
# Migrer toutes les images base64 existantes
node scripts/migrate-images.js

# Migrer + nettoyer les fichiers orphelins
node scripts/migrate-images.js --cleanup
```

### Gestion et Diagnostic
```bash
# Statistiques détaillées
node scripts/image-management.js --stats

# Vérifier l'intégrité des images
node scripts/image-management.js --check

# Réparer les références cassées
node scripts/image-management.js --fix
```

## 📊 Exemple de Statistiques

```
📊 Statistiques des images...

📁 Fichiers sur le serveur: 5
💾 Taille totale: 6.78 MB

🏢 Sites avec photos: 3
🎯 Activités avec photos: 5
📸 Total photos en DB: 6
🔗 Photos URL (migrées): 5
📄 Photos Base64 (à migrer): 0
```

## 🔄 Migration Automatique

Le système détecte automatiquement les images base64 existantes et les migre vers des fichiers :

**Avant (Base64)** :
```json
{
  "photos": ["data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ..."]
}
```

**Après (URLs)** :
```json
{
  "photos": ["/api/images/550e8400-e29b-41d4-a716-446655440000.jpg"]
}
```

## 🛠️ Utilisation dans le Code

### Composant React
```jsx
import Photos from '@/components/sites/FormSections/Photos';

function MonFormulaire() {
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

### API Upload
```javascript
const formData = new FormData();
formData.append('files', file);

const response = await fetch('/api/upload/images', {
  method: 'POST',
  body: formData
});

const result = await response.json();
// result.files contient les URLs des images uploadées
```

## 🔍 Dépannage

### Images qui ne s'affichent pas
1. Vérifier que `uploads/images` existe
2. Vérifier les permissions du dossier
3. Utiliser `--check` pour diagnostiquer
4. Utiliser `--fix` pour réparer

### Erreurs d'upload
1. Vérifier la taille (max 5MB)
2. Vérifier le format (JPEG, PNG, WebP)
3. Vérifier l'espace disque
4. Consulter les logs serveur

## 📈 Avantages du Nouveau Système

| Aspect | Ancien (Base64) | Nouveau (Fichiers) |
|--------|----------------|-------------------|
| **Taille DB** | ❌ Très lourde | ✅ Légère |
| **Performance** | ❌ Lente | ✅ Rapide |
| **Cache** | ❌ Impossible | ✅ Efficace |
| **Maintenance** | ❌ Difficile | ✅ Outils dédiés |
| **Sécurité** | ❌ Basique | ✅ Renforcée |
| **Évolutivité** | ❌ Limitée | ✅ Extensible |

## 🔐 Sécurité

- **Validation stricte** des types MIME
- **Stockage hors public** pour éviter l'accès direct
- **Noms UUID** pour éviter les conflits et devinettes
- **Limitation de taille** pour éviter les attaques DoS
- **Protection traversée** contre les attaques de chemin

## 📝 Configuration

Le système fonctionne avec les paramètres par défaut. Pour personnaliser :

- **Taille max** : Modifier `MAX_FILE_SIZE` dans `app/api/upload/images/route.js`
- **Types autorisés** : Modifier `ALLOWED_TYPES` dans le même fichier
- **Cache** : Modifier les headers dans `app/api/images/[filename]/route.js`
- **Dossier** : Modifier `UPLOAD_DIR` dans les scripts

## 🎯 Prochaines Étapes

- [ ] Compression automatique des images
- [ ] Génération de thumbnails
- [ ] Support des formats additionnels (GIF, SVG)
- [ ] Interface d'administration des images
- [ ] Statistiques avancées et monitoring

## 📞 Support

Pour toute question ou problème :
1. Consulter `docs/image-management.md` pour la documentation complète
2. Utiliser les scripts de diagnostic
3. Vérifier les logs du serveur Next.js

---

**✅ Système opérationnel et prêt à l'emploi !**
