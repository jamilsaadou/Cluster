# 🚨 RÉSOLUTION PROBLÈME DASHBOARD

## 📋 PROBLÈME IDENTIFIÉ

La connexion fonctionne mais le tableau de bord ne s'affiche pas.

## 🔍 CAUSES POSSIBLES

### 1. **API Dashboard qui échoue** (le plus probable)
- L'API `/api/dashboard/stats` retourne une erreur
- Problème d'authentification sur l'API
- Erreur dans les requêtes de base de données

### 2. **Base de données vide**
- Aucun site ou activité en base
- Tables manquantes ou mal configurées

### 3. **Erreur JavaScript côté client**
- Erreur dans le code React du dashboard
- Problème de parsing des données

### 4. **Problème de réseau/proxy**
- Nginx bloque les requêtes API
- Timeout sur les requêtes

## 🛠️ SOLUTION ÉTAPE PAR ÉTAPE

### Étape 1: Vérifier les logs PM2

```bash
# Vérifier les logs en temps réel
pm2 logs suivicluster --lines 0

# Puis dans un autre terminal, recharger le dashboard dans le navigateur
# et observer les erreurs dans les logs
```

### Étape 2: Tester l'API dashboard manuellement

```bash
# 1. Se connecter pour obtenir le cookie
curl -X POST https://207.180.201.77/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@cluster.ne","password":"AdminCluster2025!"}' \
  -c cookies.txt -v

# 2. Tester l'API dashboard
curl -X GET https://207.180.201.77/api/dashboard/stats \
  -b cookies.txt -v

# 3. Tester l'API auth/me
curl -X GET https://207.180.201.77/api/auth/me \
  -b cookies.txt -v
```

### Étape 3: Vérifier la base de données

```bash
# Se connecter à MySQL
mysql -u username -p database_name

# Vérifier les tables
SHOW TABLES;

# Compter les enregistrements
SELECT COUNT(*) as total_sites FROM Site;
SELECT COUNT(*) as total_activites FROM Activite;
SELECT COUNT(*) as total_users FROM User;
SELECT COUNT(*) as total_regions FROM Region;

# Vérifier l'utilisateur admin
SELECT id, email, role, statut FROM User WHERE email = 'admin@cluster.ne';
```

### Étape 4: Tests dans le navigateur

1. **Ouvrir les DevTools (F12)**
2. **Aller dans l'onglet Network**
3. **Recharger le dashboard**
4. **Vérifier les requêtes vers `/api/dashboard/stats`**
5. **Regarder la réponse de l'API**

## 🔧 CORRECTIONS APPLIQUÉES

### 1. **Correction de l'API dashboard**
- Corrigé l'incohérence : `captureSystems` → `captageSystems`
- L'API est maintenant cohérente avec le code du dashboard

### 2. **Script de diagnostic créé**
- `scripts/diagnose-dashboard.js` pour identifier les problèmes
- Tests automatisés et manuels

## 🚨 ACTIONS IMMÉDIATES

### Si l'API retourne une erreur 401 (Unauthorized) :
```bash
# Problème d'authentification
# 1. Supprimer les cookies du navigateur
# 2. Se reconnecter
# 3. Vérifier JWT_SECRET
echo $JWT_SECRET
```

### Si l'API retourne une erreur 500 (Internal Server Error) :
```bash
# Problème serveur/base de données
# 1. Vérifier les logs PM2
pm2 logs suivicluster --lines 20

# 2. Vérifier la connexion à la base
mysql -u username -p -e "SELECT 1" database_name

# 3. Redémarrer l'application
pm2 restart suivicluster
```

### Si l'API retourne 200 mais données vides :
```bash
# Base de données vide
# 1. Vérifier les données
mysql -u username -p -e "SELECT COUNT(*) FROM Site" database_name

# 2. Créer des données de test si nécessaire
# (Importer un fichier SQL ou créer manuellement)
```

### Si timeout ou pas de réponse :
```bash
# Problème réseau/performance
# 1. Vérifier Nginx
sudo nginx -t
sudo tail -f /var/log/nginx/error.log

# 2. Vérifier les ressources serveur
top
df -h
```

## 🧪 TESTS DE VALIDATION

### Test 1: API fonctionne
```bash
curl -X GET https://207.180.201.77/api/dashboard/stats \
  -b cookies.txt
# Doit retourner un JSON avec les statistiques
```

### Test 2: Dashboard s'affiche
- Aller sur https://207.180.201.77/dashboard
- Le dashboard doit afficher les cartes de statistiques
- Pas d'erreur dans la console du navigateur

### Test 3: Données cohérentes
- Les chiffres affichés correspondent aux données en base
- Toutes les sections du dashboard sont visibles

## 🎯 RÉSULTAT ATTENDU

✅ **Dashboard accessible** via https://207.180.201.77/dashboard  
✅ **Statistiques affichées** (sites, activités, bénéficiaires)  
✅ **Graphiques visibles** (statuts, régions, systèmes)  
✅ **Activités récentes** listées  
✅ **Pas d'erreur** dans les logs ou la console  

## 📞 ESCALADE

Si le problème persiste après ces vérifications :

1. **Vérifier la structure de la base de données**
   - Tables existantes et relations correctes
   - Données cohérentes avec le schéma Prisma

2. **Vérifier la configuration Prisma**
   - DATABASE_URL correcte
   - Schéma Prisma à jour

3. **Redémarrage complet**
   ```bash
   pm2 stop all
   pm2 delete all
   pm2 start ecosystem-auto.config.js
   ```

4. **Vérifier les permissions de fichiers**
   ```bash
   chown -R root:root /root/apps/suivicluster
   chmod -R 755 /root/apps/suivicluster
   ```

---

**💡 CONSEIL :** Le problème est souvent lié à l'API `/api/dashboard/stats`. Commencez toujours par tester cette API avec curl avant de chercher ailleurs.

**Date de création :** 16/06/2025  
**Serveur concerné :** 207.180.201.77  
**Status :** Correction appliquée, tests requis
