# 🚨 DIAGNOSTIC ERREUR "UNAUTHORIZED"

## 📋 CAUSES POSSIBLES DE L'ERREUR "UNAUTHORIZED"

L'erreur "Unauthorized" lors du chargement des données peut survenir dans les cas suivants :

### 1. 🍪 PROBLÈMES DE COOKIES/TOKENS

#### A. Token JWT expiré ou invalide
- **Cause :** Le token JWT a une durée de vie de 8h
- **Symptôme :** Connexion réussie mais erreur après quelques heures
- **Solution :** Se reconnecter

#### B. Cookie non transmis
- **Cause :** Configuration SameSite, Secure, ou domaine incorrect
- **Symptôme :** Connexion réussie mais APIs retournent 401
- **Solution :** Vérifier la configuration des cookies

#### C. Token corrompu
- **Cause :** Problème de sérialisation/désérialisation
- **Symptôme :** Erreur immédiate après connexion
- **Solution :** Supprimer les cookies et se reconnecter

### 2. 🔐 PROBLÈMES D'AUTHENTIFICATION

#### A. JWT_SECRET incorrect
- **Cause :** Variable d'environnement JWT_SECRET différente entre login et vérification
- **Symptôme :** Connexion réussie mais middleware rejette le token
- **Solution :** Vérifier que JWT_SECRET est identique partout

#### B. Middleware mal configuré
- **Cause :** Headers non transmis correctement
- **Symptôme :** APIs ne reçoivent pas les informations utilisateur
- **Solution :** Vérifier la configuration du middleware

### 3. 🗄️ PROBLÈMES DE BASE DE DONNÉES

#### A. Utilisateur supprimé/désactivé
- **Cause :** Compte utilisateur supprimé après connexion
- **Symptôme :** Token valide mais utilisateur inexistant
- **Solution :** Vérifier l'existence de l'utilisateur en base

#### B. Permissions insuffisantes
- **Cause :** Rôle ou permissions modifiés
- **Symptôme :** Accès refusé à certaines ressources
- **Solution :** Vérifier les permissions utilisateur

#### C. Connexion base de données fermée
- **Cause :** Problème de connexion Prisma
- **Symptôme :** Erreurs intermittentes
- **Solution :** Redémarrer l'application

### 4. 🌐 PROBLÈMES DE CONFIGURATION RÉSEAU

#### A. Proxy/Nginx mal configuré
- **Cause :** Headers non transmis par le proxy
- **Symptôme :** Cookies perdus entre client et serveur
- **Solution :** Vérifier la configuration Nginx

#### B. HTTPS/HTTP mixte
- **Cause :** Cookies Secure sur connexion HTTP
- **Symptôme :** Cookies non transmis
- **Solution :** Utiliser HTTPS partout

## 🔍 DIAGNOSTIC ÉTAPE PAR ÉTAPE

### Étape 1: Vérifier les cookies dans le navigateur

1. Ouvrir les DevTools (F12)
2. Aller dans Application > Cookies
3. Vérifier la présence du cookie "token"
4. Vérifier les attributs du cookie (Secure, SameSite, etc.)

### Étape 2: Tester l'API d'authentification

```bash
# Test de connexion
curl -X POST https://207.180.201.77/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@cluster.ne","password":"AdminCluster2025!"}' \
  -c cookies.txt -v

# Test de l'API /me avec le cookie
curl -X GET https://207.180.201.77/api/auth/me \
  -b cookies.txt -v
```

### Étape 3: Vérifier les logs du serveur

```bash
# Logs PM2
pm2 logs suivicluster --lines 50

# Logs Nginx
sudo tail -f /var/log/nginx/error.log
```

### Étape 4: Vérifier la base de données

```bash
# Se connecter à la base de données
mysql -u username -p database_name

# Vérifier l'utilisateur
SELECT id, email, role, statut FROM User WHERE email = 'admin@cluster.ne';
```

## 🛠️ SOLUTIONS PAR CAS

### Solution 1: Token expiré
```javascript
// Dans le navigateur, supprimer les cookies
document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
// Puis se reconnecter
```

### Solution 2: JWT_SECRET incorrect
```bash
# Vérifier la variable d'environnement
echo $JWT_SECRET

# Ou dans le fichier .env.production
cat .env.production | grep JWT_SECRET
```

### Solution 3: Problème de cookies
```javascript
// Vérifier la configuration dans app/api/auth/login/route.js
response.cookies.set('token', token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 8 * 60 * 60,
  path: '/'
});
```

### Solution 4: Redémarrage complet
```bash
# Redémarrer l'application
pm2 restart suivicluster

# Redémarrer Nginx
sudo systemctl restart nginx

# Vider le cache du navigateur
# Ctrl+Shift+R ou navigation privée
```

## 🧪 TESTS DE VALIDATION

### Test 1: Connexion et cookie
```bash
# Connexion et sauvegarde du cookie
curl -X POST https://207.180.201.77/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@cluster.ne","password":"AdminCluster2025!"}' \
  -c cookies.txt

# Test d'une API protégée
curl -X GET https://207.180.201.77/api/auth/me \
  -b cookies.txt
```

### Test 2: Vérification du middleware
```bash
# Test d'accès au dashboard
curl -X GET https://207.180.201.77/dashboard \
  -b cookies.txt -L
```

### Test 3: Vérification de la base de données
```sql
-- Vérifier l'utilisateur admin
SELECT * FROM User WHERE email = 'admin@cluster.ne';

-- Vérifier les permissions
SELECT permissions FROM User WHERE email = 'admin@cluster.ne';
```

## 🚨 ACTIONS IMMÉDIATES EN CAS D'ERREUR

1. **Supprimer les cookies du navigateur**
2. **Se reconnecter avec les identifiants admin**
3. **Vérifier les logs PM2 : `pm2 logs`**
4. **Redémarrer l'application si nécessaire : `pm2 restart suivicluster`**
5. **Tester en navigation privée**

## 📞 ESCALADE

Si le problème persiste après ces vérifications :

1. Vérifier que la base de données est accessible
2. Vérifier que JWT_SECRET est défini et identique partout
3. Redémarrer complètement le serveur
4. Vérifier la configuration Nginx/proxy

---

**💡 CONSEIL :** L'erreur "Unauthorized" est souvent liée aux cookies ou au token JWT. Commencez toujours par supprimer les cookies et vous reconnecter.
