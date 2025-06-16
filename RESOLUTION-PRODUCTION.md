# 🚨 RÉSOLUTION PROBLÈMES EN PRODUCTION

## 📋 SITUATION ACTUELLE

✅ **Application accessible** : https://207.180.201.77/  
✅ **Connexion fonctionne** : Utilisateurs peuvent se connecter  
✅ **Navigation fonctionne** : Menu et pages accessibles  
❌ **Contenu "Unauthorized"** : APIs retournent des erreurs d'autorisation  

## 🔍 PROBLÈME IDENTIFIÉ

D'après la capture d'écran, l'application fonctionne mais les APIs retournent "Unauthorized". Cela indique un problème spécifique avec l'authentification des APIs, pas avec l'application en général.

## 🚨 APPROCHE SÉCURISÉE POUR LA PRODUCTION

### Étape 1: Diagnostic sans modification

```bash
# 1. Vérifier les logs PM2 en temps réel
pm2 logs suivicluster --lines 20

# 2. Tester l'API auth/me
curl -X POST https://207.180.201.77/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@cluster.ne","password":"AdminCluster2025!"}' \
  -c cookies.txt

curl -X GET https://207.180.201.77/api/auth/me \
  -b cookies.txt -v

# 3. Tester l'API activités
curl -X GET https://207.180.201.77/api/activites \
  -b cookies.txt -v

# 4. Tester l'API dashboard
curl -X GET https://207.180.201.77/api/dashboard/stats \
  -b cookies.txt -v
```

### Étape 2: Vérifier les variables d'environnement

```bash
# Dans le répertoire de l'application
cd /root/apps/suivicluster  # ou le bon répertoire

# Vérifier les variables critiques
echo "JWT_SECRET: $(echo $JWT_SECRET | wc -c) caractères"
echo "DATABASE_URL: $(echo $DATABASE_URL | grep -o 'mysql://' | wc -l) (doit être 1)"
echo "NODE_ENV: $NODE_ENV"

# Vérifier le fichier .env.production
cat .env.production | grep -E "(JWT_SECRET|DATABASE_URL|NODE_ENV)"
```

### Étape 3: Vérifier la base de données

```bash
# Test de connexion rapide
mysql -h localhost -u username -p -e "SELECT COUNT(*) as users FROM User; SELECT COUNT(*) as sites FROM Site;" database_name
```

## 🛠️ SOLUTIONS SÉCURISÉES (SANS CASSER LA PROD)

### Solution 1: Redémarrage simple

```bash
# Redémarrer l'application (sans modification)
pm2 restart suivicluster

# Vérifier le statut
pm2 status
pm2 logs suivicluster --lines 10
```

### Solution 2: Vérifier et corriger JWT_SECRET

```bash
# Si JWT_SECRET est manquant ou incorrect
# 1. Sauvegarder la config actuelle
cp .env.production .env.production.backup

# 2. Vérifier/ajouter JWT_SECRET
echo 'JWT_SECRET=votre_secret_jwt_securise_ici' >> .env.production

# 3. Redémarrer
pm2 restart suivicluster
```

### Solution 3: Régénérer le client Prisma (si problème DB)

```bash
# Régénérer le client Prisma sans toucher aux données
npx prisma generate

# Redémarrer l'application
pm2 restart suivicluster
```

### Solution 4: API de debug temporaire (SÉCURISÉE)

```bash
# Créer une API de debug temporaire
node scripts/create-simple-dashboard-api.js

# Redémarrer pour tester
pm2 restart suivicluster

# Tester et observer les logs
pm2 logs suivicluster --lines 0

# IMPORTANT: Restaurer l'API originale après debug
cp app/api/dashboard/stats/route.js.backup app/api/dashboard/stats/route.js
pm2 restart suivicluster
```

## 🔍 DIAGNOSTIC BASÉ SUR LA CAPTURE D'ÉCRAN

### Observations :
1. **Interface complète** : Menu, navigation, boutons fonctionnent
2. **Authentification OK** : Utilisateur connecté (menu visible)
3. **Erreur "Unauthorized"** : Spécifique aux APIs de données

### Causes probables :
1. **JWT_SECRET manquant** en production
2. **Problème de cookies** entre domaines
3. **Erreur dans les requêtes Prisma**
4. **Permissions utilisateur** incorrectes

## 🧪 TESTS PRIORITAIRES

### Test 1: Vérifier l'authentification
```bash
# Dans le navigateur, ouvrir DevTools (F12)
# Aller dans Application > Cookies
# Vérifier la présence du cookie "token"
```

### Test 2: Tester les APIs manuellement
```bash
# Utiliser les commandes curl ci-dessus
# Vérifier quelle API retourne 401 vs 200
```

### Test 3: Vérifier les logs
```bash
# Surveiller les logs pendant l'utilisation
pm2 logs suivicluster --lines 0
# Puis naviguer dans l'application
```

## ⚠️ PRÉCAUTIONS PRODUCTION

### À FAIRE :
- ✅ Toujours sauvegarder avant modification
- ✅ Tester les commandes curl avant les modifications
- ✅ Surveiller les logs en temps réel
- ✅ Faire des modifications une par une
- ✅ Redémarrer après chaque modification

### À NE PAS FAIRE :
- ❌ Modifier plusieurs fichiers à la fois
- ❌ Changer les versions des dépendances
- ❌ Faire des migrations de base de données
- ❌ Supprimer des fichiers de configuration
- ❌ Arrêter PM2 complètement

## 🎯 PLAN D'ACTION RECOMMANDÉ

### Étape 1 (5 min) : Diagnostic
```bash
pm2 logs suivicluster --lines 20
curl -X GET https://207.180.201.77/api/auth/me -b cookies.txt
```

### Étape 2 (2 min) : Redémarrage simple
```bash
pm2 restart suivicluster
```

### Étape 3 (5 min) : Vérifier JWT_SECRET
```bash
echo $JWT_SECRET
cat .env.production | grep JWT_SECRET
```

### Étape 4 (10 min) : API de debug si nécessaire
```bash
node scripts/create-simple-dashboard-api.js
pm2 restart suivicluster
# Observer les logs détaillés
```

## 📞 ESCALADE

Si le problème persiste après ces étapes :
1. **Sauvegarder l'état actuel**
2. **Documenter les erreurs exactes**
3. **Considérer un rollback** vers une version stable
4. **Planifier une maintenance** pour corrections majeures

---

**💡 CONSEIL PRODUCTION :** L'application fonctionne globalement bien. Le problème semble spécifique aux APIs. Procédez étape par étape pour ne pas casser ce qui fonctionne déjà.

**Date :** 16/06/2025  
**Serveur :** 207.180.201.77  
**Status :** Application en ligne, problème API à résoudre
