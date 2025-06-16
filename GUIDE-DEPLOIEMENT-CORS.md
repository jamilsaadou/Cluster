# 🚀 Guide de Déploiement CORS - Next.js

## 📋 **Configuration CORS Complète**

Votre application Next.js a maintenant **deux niveaux de protection CORS** :

### **1. Middleware CORS (`middleware.js`)**
- Gère les requêtes OPTIONS (preflight)
- Ajoute les headers CORS à toutes les réponses API
- Contrôle l'authentification

### **2. Configuration Next.js (`next.config.mjs`)**
- Headers CORS au niveau du serveur Next.js
- Configuration globale pour toutes les routes API
- Optimisations pour la production

## 🔧 **Étapes de Déploiement sur le Serveur**

### **Étape 1: Sauvegarder les fichiers existants**

```bash
# Connexion au serveur
ssh root@207.180.201.77

# Aller dans le répertoire de l'application
cd /root/apps/suivicluster  # Ajustez le chemin selon votre installation

# Sauvegarder les fichiers existants
cp middleware.js middleware.js.backup 2>/dev/null || echo "Pas de middleware existant"
cp next.config.mjs next.config.mjs.backup 2>/dev/null || echo "Pas de config existante"
```

### **Étape 2: Uploader les nouveaux fichiers**

Vous devez uploader ces deux fichiers sur votre serveur :
- `middleware.js` (avec support CORS)
- `next.config.mjs` (avec configuration CORS)

```bash
# Exemple avec scp depuis votre machine locale
scp middleware.js root@207.180.201.77:/root/apps/suivicluster/
scp next.config.mjs root@207.180.201.77:/root/apps/suivicluster/
```

### **Étape 3: Rebuilder l'application**

```bash
# Sur le serveur
cd /root/apps/suivicluster

# Installer les dépendances (si nécessaire)
npm install

# Rebuilder l'application avec la nouvelle configuration
npm run build
```

### **Étape 4: Redémarrer l'application**

```bash
# Redémarrer PM2
pm2 restart suivicluster

# Vérifier le statut
pm2 status

# Vérifier les logs
pm2 logs suivicluster --lines 20
```

## 🧪 **Tests de Validation**

### **Test 1: Vérifier que l'application démarre**

```bash
# Vérifier PM2
pm2 status

# Vérifier les logs pour les erreurs
pm2 logs suivicluster --lines 50

# Tester l'accès direct
curl -I https://207.180.201.77
```

### **Test 2: Tester les headers CORS**

```bash
# Test OPTIONS (preflight)
curl -X OPTIONS https://207.180.201.77/api/auth/me \
  -H "Origin: http://localhost:19011" \
  -H "Access-Control-Request-Method: GET" \
  -H "Access-Control-Request-Headers: Content-Type" \
  -v

# Test GET avec Origin
curl -X GET https://207.180.201.77/api/auth/me \
  -H "Origin: http://localhost:19011" \
  -H "Content-Type: application/json" \
  -v
```

**Réponse attendue :**
```
< Access-Control-Allow-Origin: *
< Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
< Access-Control-Allow-Headers: Content-Type, Authorization, Cookie, X-Requested-With
< Access-Control-Allow-Credentials: true
```

### **Test 3: Diagnostic automatique**

```bash
# Depuis votre machine locale
node scripts/diagnose-cors.js
```

## 📱 **Configuration de votre Application Mobile**

### **URL API Correcte**

```javascript
// ❌ INCORRECT
const API_BASE_URL = 'http://207.180.201.77:443';

// ✅ CORRECT
const API_BASE_URL = 'https://207.180.201.77';
```

### **Service API avec CORS**

```javascript
class ApiService {
  constructor() {
    this.baseURL = 'https://207.180.201.77';
  }

  async makeRequest(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    const defaultOptions = {
      credentials: 'include', // Important pour les cookies
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    };

    const finalOptions = { ...defaultOptions, ...options };

    try {
      const response = await fetch(url, finalOptions);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API Error for ${endpoint}:`, error);
      throw error;
    }
  }

  // Méthodes spécifiques
  async login(email, password) {
    return this.makeRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
  }

  async getCurrentUser() {
    return this.makeRequest('/api/auth/me', {
      method: 'GET'
    });
  }

  async getActivities() {
    return this.makeRequest('/api/activites', {
      method: 'GET'
    });
  }

  async createActivity(data) {
    return this.makeRequest('/api/activites', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }
}

export default new ApiService();
```

## 🔍 **Résolution des Problèmes**

### **Problème 1: Application ne démarre pas après rebuild**

```bash
# Vérifier les erreurs de syntaxe
npm run build

# Vérifier les logs PM2
pm2 logs suivicluster --lines 100

# Revenir à la version précédente si nécessaire
cp middleware.js.backup middleware.js
cp next.config.mjs.backup next.config.mjs
npm run build
pm2 restart suivicluster
```

### **Problème 2: CORS headers toujours manquants**

```bash
# Vérifier que les fichiers sont bien en place
ls -la middleware.js next.config.mjs

# Vérifier le contenu
head -20 middleware.js
head -20 next.config.mjs

# Forcer un rebuild complet
rm -rf .next
npm run build
pm2 restart suivicluster
```

### **Problème 3: 500 Internal Server Error**

```bash
# Vérifier les logs détaillés
pm2 logs suivicluster --lines 200

# Vérifier la configuration Node.js
node --version
npm --version

# Tester la configuration Next.js
npx next info
```

## 📊 **Monitoring et Logs**

### **Commandes de monitoring**

```bash
# Statut en temps réel
pm2 monit

# Logs en temps réel
pm2 logs suivicluster --lines 0 -f

# Statistiques détaillées
pm2 describe suivicluster

# Redémarrage automatique en cas de crash
pm2 startup
pm2 save
```

### **Logs à surveiller**

```bash
# Logs d'erreur CORS
pm2 logs suivicluster | grep -i cors

# Logs d'erreur 401/403
pm2 logs suivicluster | grep -E "(401|403)"

# Logs de requêtes OPTIONS
pm2 logs suivicluster | grep OPTIONS
```

## ✅ **Checklist de Validation**

### **Sur le Serveur :**
- [ ] `middleware.js` uploadé et en place
- [ ] `next.config.mjs` uploadé et en place
- [ ] `npm run build` exécuté sans erreur
- [ ] `pm2 restart suivicluster` exécuté
- [ ] Application accessible via `curl -I https://207.180.201.77`
- [ ] Headers CORS présents dans les réponses API

### **Dans l'Application Mobile :**
- [ ] URL changée vers `https://207.180.201.77`
- [ ] `credentials: 'include'` ajouté à toutes les requêtes
- [ ] Test de login fonctionnel
- [ ] Test d'accès aux APIs authentifiées

### **Tests de Validation :**
- [ ] `node scripts/diagnose-cors.js` passe tous les tests
- [ ] Pas d'erreurs CORS dans la console du navigateur
- [ ] Authentification fonctionne correctement
- [ ] Toutes les APIs sont accessibles depuis l'app mobile

## 🎯 **Résultat Attendu**

Après ce déploiement, votre application mobile devrait pouvoir :

✅ **Se connecter sans erreur CORS**  
✅ **S'authentifier correctement**  
✅ **Accéder à toutes les APIs**  
✅ **Maintenir la session utilisateur**  

## 📞 **Support**

Si vous rencontrez des problèmes :

1. **Vérifiez les logs** : `pm2 logs suivicluster`
2. **Testez avec curl** : Utilisez les commandes de test ci-dessus
3. **Exécutez le diagnostic** : `node scripts/diagnose-cors.js`
4. **Vérifiez la configuration** : Assurez-vous que les fichiers sont corrects

---

**Date :** 16/06/2025  
**Serveur :** 207.180.201.77  
**Configuration :** CORS Double Niveau (Middleware + Next.js)  
**Status :** Prêt pour déploiement
