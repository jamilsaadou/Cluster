# 🌐 RÉSOLUTION PROBLÈME CORS

## 🚨 PROBLÈME IDENTIFIÉ

**Erreur CORS :** `Access to XMLHttpRequest at 'http://207.180.201.77:443/api/auth/login' from origin 'http://localhost:19007' has been blocked by CORS policy`

## 🔍 CAUSE

L'application mobile (localhost:19007) essaie d'accéder à l'API sur un autre domaine (207.180.201.77), ce qui déclenche la politique CORS du navigateur.

## 🛠️ SOLUTIONS CRÉÉES

### 1. Middleware CORS (`middleware-cors.js`)

**Fichier créé :** `middleware-cors.js`

Ce middleware :
- ✅ Gère les requêtes OPTIONS (preflight)
- ✅ Ajoute les headers CORS à toutes les APIs
- ✅ Permet l'accès depuis n'importe quel domaine
- ✅ Autorise les cookies et credentials

### 2. Configuration Next.js (`next.config.cors.mjs`)

**Fichier créé :** `next.config.cors.mjs`

Cette configuration :
- ✅ Ajoute les headers CORS au niveau Next.js
- ✅ Configure les domaines autorisés pour les images
- ✅ Optimise la configuration pour la production

## 🚀 DÉPLOIEMENT SUR LE SERVEUR

### Étape 1: Remplacer le middleware actuel

```bash
# Sur le serveur, dans le répertoire de l'application
cd /root/apps/suivicluster  # ou le bon répertoire

# Sauvegarder l'ancien middleware
cp middleware.js middleware.js.backup

# Remplacer par le nouveau middleware CORS
cp middleware-cors.js middleware.js
```

### Étape 2: Remplacer la configuration Next.js

```bash
# Sauvegarder l'ancienne configuration
cp next.config.mjs next.config.mjs.backup

# Remplacer par la nouvelle configuration CORS
cp next.config.cors.mjs next.config.mjs
```

### Étape 3: Redémarrer l'application

```bash
# Rebuilder l'application avec la nouvelle configuration
npm run build

# Redémarrer PM2
pm2 restart suivicluster

# Vérifier le statut
pm2 status
pm2 logs suivicluster --lines 10
```

## 🧪 TESTS DE VALIDATION

### Test 1: Vérifier les headers CORS

```bash
# Tester une requête OPTIONS (preflight)
curl -X OPTIONS https://207.180.201.77/api/auth/login \
  -H "Origin: http://localhost:19007" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type" \
  -v

# Doit retourner les headers CORS
```

### Test 2: Tester depuis l'application mobile

```javascript
// Dans votre application mobile
fetch('https://207.180.201.77/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'admin@cluster.ne',
    password: 'AdminCluster2025!'
  }),
  credentials: 'include' // Important pour les cookies
})
.then(response => response.json())
.then(data => console.log('Succès:', data))
.catch(error => console.error('Erreur:', error));
```

## ⚠️ POINTS IMPORTANTS

### 1. URL Correcte
**Problème dans votre erreur :** `http://207.180.201.77:443`

**Correction :** Utilisez `https://207.180.201.77` (sans le port 443)

```javascript
// ❌ Incorrect
const API_URL = 'http://207.180.201.77:443';

// ✅ Correct
const API_URL = 'https://207.180.201.77';
```

### 2. Credentials pour les cookies

```javascript
// Toujours inclure credentials pour les cookies
fetch(url, {
  method: 'POST',
  credentials: 'include', // Important !
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(data)
});
```

### 3. Gestion des cookies sur mobile

Pour les applications mobiles, vous devrez peut-être utiliser une approche différente pour les cookies :

```javascript
// Option 1: Stocker le token manuellement
const response = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
});

// Récupérer le token depuis les headers ou la réponse
const token = response.headers.get('Authorization');
// Stocker dans AsyncStorage ou équivalent

// Option 2: Modifier l'API pour retourner le token
```

## 🔧 CONFIGURATION ALTERNATIVE (SI NÉCESSAIRE)

### Configuration CORS plus restrictive

Si vous voulez limiter l'accès à certains domaines :

```javascript
// Dans middleware-cors.js, remplacer '*' par des domaines spécifiques
const allowedOrigins = [
  'http://localhost:19007',
  'http://localhost:3000',
  'https://votre-app-mobile.com'
];

const origin = request.headers.get('origin');
const allowOrigin = allowedOrigins.includes(origin) ? origin : 'null';

response.headers.set('Access-Control-Allow-Origin', allowOrigin);
```

### Configuration Nginx (optionnelle)

Si vous voulez aussi configurer CORS au niveau Nginx :

```nginx
# Dans votre configuration Nginx
location /api/ {
    add_header 'Access-Control-Allow-Origin' '*' always;
    add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
    add_header 'Access-Control-Allow-Headers' 'Content-Type, Authorization, Cookie' always;
    add_header 'Access-Control-Allow-Credentials' 'true' always;
    
    if ($request_method = 'OPTIONS') {
        return 204;
    }
    
    proxy_pass http://localhost:3000;
}
```

## 📱 EXEMPLE COMPLET POUR APPLICATION MOBILE

```javascript
// Configuration API pour application mobile
const API_BASE_URL = 'https://207.180.201.77';

class ApiService {
  async login(email, password) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur de connexion:', error);
      throw error;
    }
  }

  async getActivities() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/activites`, {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur récupération activités:', error);
      throw error;
    }
  }

  async createActivity(activityData) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/activites`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(activityData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur création activité:', error);
      throw error;
    }
  }
}

export default new ApiService();
```

## 🎯 RÉSULTAT ATTENDU

Après déploiement :
- ✅ **Pas d'erreur CORS** depuis l'application mobile
- ✅ **APIs accessibles** depuis localhost:19007
- ✅ **Cookies fonctionnels** pour l'authentification
- ✅ **Toutes les APIs** (login, activités, sites) accessibles

## 📞 SUPPORT

Si le problème persiste après ces modifications :

1. **Vérifier les logs PM2** : `pm2 logs suivicluster`
2. **Tester avec curl** les commandes ci-dessus
3. **Vérifier la configuration Nginx** si utilisée
4. **Contacter l'équipe** avec les logs d'erreur

---

**Date :** 16/06/2025  
**Serveur :** 207.180.201.77  
**Status :** Solution CORS complète fournie
