# 📱 API GUIDE POUR CONSEILLERS AGRICOLES

## 🎯 OBJECTIF

Ce guide présente toutes les APIs nécessaires pour permettre aux conseillers agricoles de se connecter et créer des activités dans l'application SuiviCluster.

## 🔐 AUTHENTIFICATION

### 1. Connexion (Login)

**Endpoint :** `POST /api/auth/login`

**Description :** Permet à un conseiller de se connecter à l'application.

**Headers :**
```
Content-Type: application/json
```

**Body :**
```json
{
  "email": "conseiller@example.com",
  "password": "motdepasse123"
}
```

**Réponse succès (200) :**
```json
{
  "message": "Login successful"
}
```

**Réponses d'erreur :**
- `400` : Email ou mot de passe manquant
- `401` : Identifiants incorrects
- `403` : Compte inactif/suspendu

**Cookie :** Un token JWT est automatiquement défini dans un cookie HttpOnly valide 8h.

### 2. Vérifier l'utilisateur connecté

**Endpoint :** `GET /api/auth/me`

**Description :** Récupère les informations de l'utilisateur connecté.

**Headers :** Cookie automatiquement envoyé

**Réponse succès (200) :**
```json
{
  "userId": 1,
  "email": "conseiller@example.com",
  "role": "conseiller",
  "prenom": "Jean",
  "nom": "Dupont",
  "regions": [1, 2]
}
```

### 3. Déconnexion

**Endpoint :** `POST /api/auth/logout`

**Description :** Déconnecte l'utilisateur et supprime le cookie.

**Réponse succès (200) :**
```json
{
  "message": "Logout successful"
}
```

## 🌍 GESTION DES RÉGIONS

### Lister les régions

**Endpoint :** `GET /api/regions`

**Description :** Récupère la liste de toutes les régions disponibles.

**Réponse succès (200) :**
```json
[
  {
    "id": 1,
    "nom": "Niamey",
    "code": "NIA"
  },
  {
    "id": 2,
    "nom": "Tillabéri",
    "code": "TIL"
  }
]
```

## 🏞️ GESTION DES SITES

### 1. Lister les sites

**Endpoint :** `GET /api/sites`

**Description :** Récupère les sites accessibles au conseiller (sites qui lui sont assignés).

**Paramètres optionnels :**
- `search` : Recherche par nom, commune ou village
- `regionId` : Filtrer par région
- `page` : Numéro de page (défaut: 1)
- `limit` : Nombre d'éléments par page (défaut: 50)

**Exemple :** `GET /api/sites?search=test&regionId=1&page=1&limit=10`

**Réponse succès (200) :**
```json
{
  "sites": [
    {
      "id": 1,
      "nom": "Site Agricole Test",
      "commune": "Niamey",
      "village": "Goudel",
      "superficie": 15.5,
      "coordonnees": {
        "lat": 13.5137,
        "lng": 2.1098
      },
      "operateurs": {
        "hommes": 10,
        "femmes": 8,
        "jeunes": 5
      },
      "systemes": {
        "captureSystems": ["Puits", "Forage"],
        "irrigationSystems": ["Goutte à goutte", "Aspersion"]
      },
      "cultures": {
        "types": ["Riz", "Mil", "Sorgho"]
      },
      "dateCreation": "2024-01-15T10:30:00Z",
      "regionId": 1,
      "region": {
        "id": 1,
        "nom": "Niamey"
      },
      "createdBy": {
        "id": 2,
        "prenom": "Marie",
        "nom": "Diallo",
        "email": "marie@example.com"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3
  }
}
```

### 2. Créer un site

**Endpoint :** `POST /api/sites`

**Description :** Permet à un conseiller de créer un nouveau site agricole.

**Body :**
```json
{
  "basicInfo": {
    "name": "Nouveau Site Agricole"
  },
  "location": {
    "region": 1,
    "commune": "Niamey",
    "village": "Goudel",
    "area": 15.5,
    "coordinates": {
      "lat": 13.5137,
      "lng": 2.1098
    }
  },
  "operators": {
    "men": 10,
    "women": 8,
    "youth": 5
  },
  "systems": {
    "captureSystems": ["Puits", "Forage"],
    "irrigationSystems": ["Goutte à goutte"]
  },
  "crops": {
    "types": ["Riz", "Mil"]
  },
  "photos": ["photo1.jpg", "photo2.jpg"]
}
```

**Réponse succès (201) :**
```json
{
  "id": 15,
  "nom": "Nouveau Site Agricole",
  "commune": "Niamey",
  "village": "Goudel",
  "superficie": 15.5,
  "regionId": 1,
  "createdById": 1,
  "dateCreation": "2024-01-20T14:30:00Z",
  "region": {
    "id": 1,
    "nom": "Niamey"
  },
  "createdBy": {
    "id": 1,
    "prenom": "Jean",
    "nom": "Dupont",
    "email": "jean@example.com"
  }
}
```

## 🚜 GESTION DES ACTIVITÉS

### 1. Lister les activités

**Endpoint :** `GET /api/activites`

**Description :** Récupère les activités créées par le conseiller connecté.

**Paramètres optionnels :**
- `search` : Recherche par type, thématique ou commentaires
- `regionId` : Filtrer par région
- `siteId` : Filtrer par site
- `statut` : Filtrer par statut (en_attente, approuve, rejete)

**Exemple :** `GET /api/activites?search=formation&statut=en_attente`

**Réponse succès (200) :**
```json
[
  {
    "id": 1,
    "type": "Formation",
    "thematique": "Techniques d'irrigation",
    "duree": 4.5,
    "regionId": 1,
    "siteId": 1,
    "createdById": 1,
    "geolocalisation": {
      "lat": 13.5137,
      "lng": 2.1098
    },
    "beneficiaires": {
      "hommes": 15,
      "femmes": 12,
      "jeunes": 8
    },
    "statut": "en_attente",
    "dateCreation": "2024-01-20T09:00:00Z",
    "commentaires": "Formation très interactive",
    "region": {
      "id": 1,
      "nom": "Niamey"
    },
    "site": {
      "id": 1,
      "nom": "Site Agricole Test"
    },
    "createdBy": {
      "id": 1,
      "prenom": "Jean",
      "nom": "Dupont",
      "email": "jean@example.com"
    }
  }
]
```

### 2. Créer une activité

**Endpoint :** `POST /api/activites`

**Description :** Permet à un conseiller de créer une nouvelle activité.

**Body :**
```json
{
  "typeActivite": "Formation",
  "thematique": "Techniques d'irrigation moderne",
  "regionId": 1,
  "siteId": 1,
  "duree": 4.5,
  "geolocation": {
    "latitude": 13.5137,
    "longitude": 2.1098
  },
  "beneficiaires": {
    "hommes": 15,
    "femmes": 12,
    "jeunes": 8
  },
  "photos": ["activite1.jpg", "activite2.jpg"],
  "commentaires": "Formation très interactive avec démonstrations pratiques"
}
```

**Réponse succès (201) :**
```json
{
  "id": 25,
  "type": "Formation",
  "thematique": "Techniques d'irrigation moderne",
  "duree": 4.5,
  "regionId": 1,
  "siteId": 1,
  "createdById": 1,
  "geolocalisation": {
    "lat": 13.5137,
    "lng": 2.1098
  },
  "beneficiaires": {
    "hommes": 15,
    "femmes": 12,
    "jeunes": 8
  },
  "photos": ["activite1.jpg", "activite2.jpg"],
  "commentaires": "Formation très interactive avec démonstrations pratiques",
  "statut": "en_attente",
  "dateCreation": "2024-01-20T14:30:00Z",
  "region": {
    "id": 1,
    "nom": "Niamey"
  },
  "site": {
    "id": 1,
    "nom": "Site Agricole Test"
  },
  "createdBy": {
    "id": 1,
    "prenom": "Jean",
    "nom": "Dupont",
    "email": "jean@example.com"
  }
}
```

## 📸 GESTION DES IMAGES

### Upload d'images

**Endpoint :** `POST /api/upload/images`

**Description :** Upload d'images pour les sites ou activités.

**Content-Type :** `multipart/form-data`

**Body :** FormData avec fichiers images

**Réponse succès (200) :**
```json
{
  "filenames": ["image1_timestamp.jpg", "image2_timestamp.jpg"]
}
```

## 🔒 PERMISSIONS ET SÉCURITÉ

### Permissions des conseillers :

1. **Sites :**
   - ✅ Voir uniquement les sites qui leur sont assignés
   - ✅ Créer de nouveaux sites dans leurs régions
   - ❌ Modifier/supprimer les sites d'autres utilisateurs

2. **Activités :**
   - ✅ Voir uniquement leurs propres activités
   - ✅ Créer des activités sur leurs sites assignés
   - ✅ Modifier leurs propres activités
   - ❌ Voir/modifier les activités d'autres conseillers

3. **Régions :**
   - ✅ Accès limité aux régions qui leur sont assignées
   - ❌ Créer/modifier des régions

## 🚨 GESTION D'ERREURS

### Codes d'erreur courants :

- **400 Bad Request :** Données manquantes ou invalides
- **401 Unauthorized :** Non connecté ou token expiré
- **403 Forbidden :** Pas d'autorisation pour cette action
- **404 Not Found :** Ressource non trouvée
- **500 Internal Server Error :** Erreur serveur

### Format des erreurs :
```json
{
  "error": "Message d'erreur descriptif"
}
```

## 📱 EXEMPLE D'UTILISATION COMPLÈTE

### Workflow typique pour un conseiller :

```javascript
// 1. Connexion
const loginResponse = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'conseiller@example.com',
    password: 'motdepasse123'
  })
});

// 2. Récupérer les régions
const regionsResponse = await fetch('/api/regions');
const regions = await regionsResponse.json();

// 3. Récupérer les sites assignés
const sitesResponse = await fetch('/api/sites');
const sitesData = await sitesResponse.json();

// 4. Créer une nouvelle activité
const activityResponse = await fetch('/api/activites', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    typeActivite: 'Formation',
    thematique: 'Irrigation',
    regionId: 1,
    siteId: 1,
    duree: 3,
    beneficiaires: { hommes: 10, femmes: 8, jeunes: 5 },
    commentaires: 'Excellente participation'
  })
});

// 5. Récupérer ses activités
const activitiesResponse = await fetch('/api/activites');
const activities = await activitiesResponse.json();
```

## 🌐 URL DE BASE

**Production :** `https://207.180.201.77`  
**Développement :** `http://localhost:3000`

## 📞 SUPPORT

Pour toute question technique ou problème d'API, contactez l'équipe de développement.

---

**Version :** 1.0  
**Date :** 16/06/2025  
**Auteur :** Équipe SuiviCluster
