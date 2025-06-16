# 🔐 INFORMATIONS DE CONNEXION SUPER ADMIN

## 👤 Identifiants du Super Administrateur

**Email :** `admin@cluster.ne`  
**Mot de passe :** `AdminCluster2025!`

## 🛡️ Permissions du Super Admin

- **Rôle :** Admin
- **Statut :** Actif
- **Accès :** Toutes les régions
- **Permissions :**
  - ✅ Gestion des sites
  - ✅ Gestion des activités
  - ✅ Gestion des rapports
  - ✅ Gestion des utilisateurs

## 🚀 Comment se connecter

1. Aller sur : `https://207.180.201.77/`
2. Cliquer sur "Se connecter" ou aller directement sur `/login`
3. Saisir les identifiants :
   - **Email :** `admin@cluster.ne`
   - **Mot de passe :** `AdminCluster2025!`
4. Cliquer sur "Se connecter"
5. Vous serez redirigé vers le tableau de bord

## 🔧 Création du Super Admin

Si le super admin n'existe pas encore dans la base de données, exécutez :

```bash
# Aller dans le répertoire de l'application
cd /root/apps/suivicluster  # ou /root/apps/Cluster

# Exécuter le script de création
node prisma/seed-superadmin.js
```

## ⚠️ Sécurité

- **Changez le mot de passe** après la première connexion
- **Créez d'autres utilisateurs admin** si nécessaire
- **Ne partagez pas ces identifiants** avec des personnes non autorisées

## 🧪 Test de connexion

Vous pouvez tester la connexion avec curl :

```bash
curl -X POST https://207.180.201.77/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@cluster.ne","password":"AdminCluster2025!"}' \
  -c cookies.txt -v
```

---

**⚠️ IMPORTANT :** Gardez ces informations en sécurité et changez le mot de passe après la première connexion !
