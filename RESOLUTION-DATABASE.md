# 🗄️ RÉSOLUTION PROBLÈMES BASE DE DONNÉES

## 📋 PROBLÈME IDENTIFIÉ

Le dashboard ne se charge pas à cause d'un problème de connexion ou de données avec la base de données.

## 🔍 CAUSES PRINCIPALES

### 1. **Problème de connexion MySQL** (le plus fréquent)
- DATABASE_URL incorrecte dans `.env.production`
- Serveur MySQL arrêté ou inaccessible
- Credentials MySQL incorrects
- Base de données inexistante

### 2. **Base de données vide**
- Tables créées mais aucune donnée
- Migrations Prisma non exécutées
- Données supprimées accidentellement

### 3. **Structure de base incorrecte**
- Tables manquantes
- Colonnes manquantes ou mal typées
- Relations entre tables cassées

### 4. **Problème Prisma**
- Client Prisma non généré
- Cache Prisma corrompu
- Version incompatible

## 🚀 DIAGNOSTIC ÉTAPE PAR ÉTAPE

### Étape 1: Vérifier la connexion MySQL

```bash
# 1. Vérifier que MySQL est démarré
sudo systemctl status mysql
# ou
sudo systemctl status mariadb

# 2. Tester la connexion directe
mysql -h localhost -u username -p -e "SELECT VERSION();"

# 3. Vérifier que la base de données existe
mysql -u username -p -e "SHOW DATABASES;" | grep database_name
```

### Étape 2: Vérifier DATABASE_URL

```bash
# Dans le répertoire de l'application
cat .env.production | grep DATABASE_URL

# Exemple de format correct:
# DATABASE_URL="mysql://username:password@localhost:3306/database_name"
```

### Étape 3: Vérifier les tables

```bash
# Lister toutes les tables
mysql -u username -p database_name -e "SHOW TABLES;"

# Vérifier les tables essentielles
mysql -u username -p database_name -e "
SELECT TABLE_NAME, TABLE_ROWS 
FROM information_schema.TABLES 
WHERE TABLE_SCHEMA = 'database_name' 
AND TABLE_NAME IN ('User', 'Site', 'Activite', 'Region');"
```

### Étape 4: Compter les données

```bash
# Compter les enregistrements
mysql -u username -p database_name -e "
SELECT 'User' as table_name, COUNT(*) as count FROM User
UNION ALL
SELECT 'Site' as table_name, COUNT(*) as count FROM Site  
UNION ALL
SELECT 'Activite' as table_name, COUNT(*) as count FROM Activite
UNION ALL
SELECT 'Region' as table_name, COUNT(*) as count FROM Region;"
```

### Étape 5: Tester Prisma

```bash
# Dans le répertoire de l'application
cd /root/apps/suivicluster  # ou le bon répertoire

# Tester la connexion Prisma
npx prisma db pull

# Générer le client Prisma
npx prisma generate
```

## 🛠️ SOLUTIONS PAR PROBLÈME

### Solution 1: Problème de connexion MySQL

```bash
# Démarrer MySQL si arrêté
sudo systemctl start mysql
sudo systemctl enable mysql

# Créer la base de données si elle n'existe pas
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS database_name;"

# Créer un utilisateur avec tous les droits
mysql -u root -p -e "
CREATE USER IF NOT EXISTS 'username'@'%' IDENTIFIED BY 'password';
GRANT ALL PRIVILEGES ON database_name.* TO 'username'@'%';
FLUSH PRIVILEGES;"
```

### Solution 2: Base de données vide

```bash
# Option A: Exécuter les migrations Prisma
npx prisma migrate deploy
npx prisma generate

# Option B: Importer un fichier SQL de sauvegarde
mysql -u username -p database_name < backup.sql

# Option C: Créer des données minimales
node prisma/seed-superadmin.js
```

### Solution 3: Structure incorrecte

```bash
# Reset complet de la base (ATTENTION: supprime toutes les données)
npx prisma migrate reset --force

# Puis recréer la structure
npx prisma migrate deploy
npx prisma generate

# Créer le super admin
node prisma/seed-superadmin.js
```

### Solution 4: Problème Prisma

```bash
# Nettoyer le cache Prisma
rm -rf node_modules/.prisma
rm -rf prisma/migrations/.migration_lock.toml

# Régénérer le client
npx prisma generate

# Redémarrer l'application
pm2 restart suivicluster
```

## 🚨 ACTIONS IMMÉDIATES

### Test rapide de diagnostic :

```bash
# 1. Exécuter le script de diagnostic
node scripts/diagnose-database.js

# 2. Test de connexion MySQL
mysql -h localhost -u username -p -e "SELECT 1 as test;"

# 3. Test Prisma
npx prisma db pull

# 4. Vérifier les logs de l'application
pm2 logs suivicluster --lines 20
```

### Si MySQL ne fonctionne pas :

```bash
# Redémarrer MySQL
sudo systemctl restart mysql

# Vérifier les logs MySQL
sudo tail -f /var/log/mysql/error.log

# Vérifier l'espace disque
df -h
```

### Si la base est vide :

```bash
# Importer des données depuis un fichier SQL
mysql -u username -p database_name < suivicluster.sql

# Ou créer des données minimales
mysql -u username -p database_name -e "
INSERT INTO Region (nom, code) VALUES ('Niamey', 'NIA');
"

# Créer le super admin
node prisma/seed-superadmin.js
```

## 📊 DONNÉES MINIMALES REQUISES

Pour que le dashboard fonctionne, il faut au minimum :

### 1. **Table Region**
```sql
INSERT INTO Region (nom, code) VALUES ('Niamey', 'NIA');
```

### 2. **Table User (super admin)**
```bash
# Exécuter le script
node prisma/seed-superadmin.js
```

### 3. **Données de test optionnelles**
```sql
-- Site de test
INSERT INTO Site (nom, regionId, superficie, createdById) 
VALUES ('Site Test', 1, 10.5, 1);

-- Activité de test
INSERT INTO Activite (type, thematique, siteId, regionId, statut, createdById) 
VALUES ('Formation', 'Agriculture', 1, 1, 'approuve', 1);
```

## 🧪 TESTS DE VALIDATION

### Test 1: Connexion MySQL
```bash
mysql -u username -p -e "SELECT VERSION();"
# Doit afficher la version de MySQL
```

### Test 2: Tables présentes
```bash
mysql -u username -p database_name -e "SHOW TABLES;"
# Doit lister User, Site, Activite, Region, etc.
```

### Test 3: Données présentes
```bash
mysql -u username -p database_name -e "SELECT COUNT(*) FROM User;"
# Doit retourner au moins 1 (le super admin)
```

### Test 4: Prisma fonctionne
```bash
npx prisma db pull
# Doit se connecter sans erreur
```

### Test 5: API dashboard
```bash
# Tester l'API après correction
curl -X GET https://207.180.201.77/api/dashboard/stats \
  -H "Cookie: token=VOTRE_TOKEN" -v
# Doit retourner un JSON avec les statistiques
```

## 🎯 RÉSULTAT ATTENDU

Après correction :
- ✅ **MySQL accessible** et base de données existante
- ✅ **Tables créées** avec la bonne structure
- ✅ **Données présentes** (au minimum super admin et 1 région)
- ✅ **Prisma fonctionne** sans erreur
- ✅ **API dashboard** retourne des données
- ✅ **Dashboard s'affiche** correctement

## 📞 ESCALADE

Si le problème persiste :

1. **Vérifier l'espace disque**
   ```bash
   df -h
   # MySQL a besoin d'espace libre
   ```

2. **Vérifier les logs système**
   ```bash
   sudo tail -f /var/log/syslog | grep mysql
   ```

3. **Recréer complètement la base**
   ```bash
   # ATTENTION: Supprime toutes les données
   mysql -u root -p -e "DROP DATABASE IF EXISTS database_name;"
   mysql -u root -p -e "CREATE DATABASE database_name;"
   npx prisma migrate deploy
   node prisma/seed-superadmin.js
   ```

---

**💡 CONSEIL :** La plupart des problèmes de dashboard sont liés à une base de données vide ou mal configurée. Commencez toujours par vérifier la connexion MySQL et la présence de données.

**Date de création :** 16/06/2025  
**Serveur concerné :** 207.180.201.77  
**Status :** Guide de diagnostic complet
