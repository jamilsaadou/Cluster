# 📦 LISTE DES DÉPENDANCES - SUIVICLUSTER

## 🚀 FRAMEWORK PRINCIPAL

### Next.js
- **`next`** : `15.3.3` - Framework React pour applications web
- **`react`** : `^19.0.0` - Bibliothèque JavaScript pour interfaces utilisateur
- **`react-dom`** : `^19.0.0` - Rendu DOM pour React

## 🗄️ BASE DE DONNÉES

### Prisma ORM
- **`@prisma/client`** : `^6.9.0` - Client Prisma pour accès base de données
- **`prisma`** : `^6.9.0` - ORM et générateur de schéma

## 🔐 AUTHENTIFICATION & SÉCURITÉ

### Authentification
- **`bcryptjs`** : `^3.0.2` - Hachage de mots de passe
- **`jsonwebtoken`** : `^9.0.2` - Génération et vérification de tokens JWT

## 📊 EXPORT & MANIPULATION DE DONNÉES

### Excel/Spreadsheet
- **`exceljs`** : `^4.4.0` - Création et manipulation de fichiers Excel
- **`xlsx`** : `^0.18.5` - Lecture/écriture de fichiers Excel et CSV

## 🗺️ CARTOGRAPHIE

### Leaflet Maps
- **`leaflet`** : `^1.9.4` - Bibliothèque de cartes interactives
- **`leaflet.markercluster`** : `^1.5.3` - Regroupement de marqueurs sur cartes

## 🛠️ UTILITAIRES

### Identifiants uniques
- **`uuid`** : `^11.1.0` - Génération d'identifiants uniques

## 🎨 STYLING (DEV DEPENDENCIES)

### Tailwind CSS
- **`@tailwindcss/postcss`** : `^4` - Plugin PostCSS pour Tailwind
- **`tailwindcss`** : `^4` - Framework CSS utilitaire

## 📋 SCRIPTS DISPONIBLES

```json
{
  "dev": "next dev --turbopack",     // Développement avec Turbopack
  "build": "next build",             // Build de production
  "start": "next start",             // Démarrage en production
  "lint": "next lint"                // Vérification du code
}
```

## 🔍 ANALYSE DES VERSIONS

### ✅ VERSIONS RÉCENTES
- **Next.js 15.3.3** - Version très récente (stable)
- **React 19.0.0** - Version la plus récente
- **Prisma 6.9.0** - Version récente et stable
- **Tailwind CSS 4** - Version la plus récente

### ⚠️ POINTS D'ATTENTION

1. **React 19** est très récent et peut avoir des incompatibilités
2. **Tailwind CSS 4** est en version majeure récente
3. **Next.js 15.3.3** avec React 19 peut causer des problèmes

## 🚨 PROBLÈMES POTENTIELS IDENTIFIÉS

### 1. **Compatibilité React 19 + Next.js 15**
- React 19 est très récent et peut avoir des bugs
- Certaines dépendances peuvent ne pas être compatibles
- Peut causer des erreurs de rendu côté serveur

### 2. **Turbopack en développement**
- `--turbopack` est encore expérimental
- Peut causer des problèmes de build en production

### 3. **Tailwind CSS 4**
- Version majeure récente
- Peut avoir des breaking changes

## 🛠️ RECOMMANDATIONS

### Pour résoudre les problèmes de dashboard :

1. **Vérifier la compatibilité React 19**
   ```bash
   # Downgrade vers React 18 si nécessaire
   npm install react@^18.2.0 react-dom@^18.2.0
   ```

2. **Tester sans Turbopack**
   ```bash
   # Modifier package.json
   "dev": "next dev"  // Retirer --turbopack
   ```

3. **Vérifier les logs de build**
   ```bash
   npm run build
   # Vérifier s'il y a des erreurs de compatibilité
   ```

## 📊 COMPARAISON AVEC VERSIONS STABLES

### Versions recommandées pour la production :
```json
{
  "next": "14.2.5",           // Version LTS stable
  "react": "^18.2.0",         // Version stable éprouvée
  "react-dom": "^18.2.0",     // Version stable éprouvée
  "tailwindcss": "^3.4.0"     // Version stable
}
```

## 🔧 COMMANDES DE DIAGNOSTIC

### Vérifier les incompatibilités :
```bash
# Vérifier les dépendances obsolètes
npm outdated

# Vérifier les vulnérabilités
npm audit

# Vérifier la compatibilité des versions
npm ls
```

### Tester avec versions stables :
```bash
# Sauvegarder package.json actuel
cp package.json package.json.backup

# Downgrade vers versions stables
npm install next@14.2.5 react@^18.2.0 react-dom@^18.2.0

# Rebuilder
npm run build
npm start
```

## 💡 CONCLUSION

Votre projet utilise des versions très récentes qui peuvent être la cause des problèmes de dashboard. Les versions React 19 + Next.js 15 sont très récentes et peuvent avoir des incompatibilités.

**Recommandation :** Tester avec des versions plus stables pour isoler le problème.

---

**Date de création :** 16/06/2025  
**Projet :** SuiviCluster  
**Version Node.js recommandée :** 18.x ou 20.x LTS
