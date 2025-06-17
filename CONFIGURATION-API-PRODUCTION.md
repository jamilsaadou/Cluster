# 🚨 Configuration API Production - Problème Identifié

## 📋 **Problème Actuel**

Vous mentionnez que votre production tourne sur `http://207.180.201.77:443/` - **c'est incorrect et problématique** !

### **❌ Configuration Actuelle (Incorrecte)**
```
http://207.180.201.77:443/
```

**Pourquoi c'est incorrect :**
- `http://` avec le port `443` est contradictoire
- Le port 443 est réservé pour HTTPS
- Cette configuration cause des erreurs de connexion
- Les navigateurs bloquent ce type de requête

## 🔧 **Configuration Correcte pour la Production**

### **✅ Option 1: HTTPS Standard (Recommandé)**
```
https://207.180.201.77/
```
- Utilise le port 443 par défaut (implicite)
- Sécurisé avec SSL/TLS
- Compatible avec tous les navigateurs
- **C'est ce que vous devriez utiliser**

### **✅ Option 2: HTTP avec Port Personnalisé**
```
http://207.180.201.77:3000/
```
- Si votre app Next.js tourne sur le port 3000
- Moins sécurisé mais fonctionnel
- Pour développement/test uniquement

### **✅ Option 3: HTTP Port Standard**
```
http://207.180.201.77/
```
- Utilise le port 80 par défaut
- Non sécurisé mais fonctionnel

## 🔍 **Diagnostic de votre Configuration Actuelle**

### **Vérifiez sur quel port votre application tourne :**

```bash
# Connectez-vous à votre serveur
ssh root@207.180.201.77

# Vérifiez les processus PM2
pm2 status

# Vérifiez sur quel port Next.js écoute
pm2 logs suivicluster | grep -i "ready\|listening\|port"

# Vérifiez les ports ouverts
netstat -tlnp | grep -E "(80|443|3000)"

# Testez l'accès direct
curl -I http://localhost:3000  # Si app sur port 3000
curl -I http://localhost:80    # Si app sur port 80
curl -I https://localhost:443  # Si app sur port 443 avec SSL
```

## 🚀 **Solutions selon votre Configuration**

### **Scénario 1: App Next.js sur port 3000 (Le plus probable)**

**Configuration serveur :**
```bash
# Votre app tourne probablement sur :
http://localhost:3000

# Accessible depuis l'extérieur via :
http://207.180.201.77:3000
```

**Configuration mobile app :**
```javascript
// ✅ CORRECT
const API_BASE_URL = 'http://207.180.201.77:3000';

// Exemple d'utilisation
fetch(`${API_BASE_URL}/api/auth/me`, {
  method: 'GET',
  credentials: 'include',
  headers: {
    'Content-Type': 'application/json'
  }
});
```

### **Scénario 2: Nginx Reverse Proxy vers HTTPS**

**Si vous avez Nginx configuré :**
```nginx
# Configuration Nginx
server {
    listen 443 ssl;
    server_name 207.180.201.77;
    
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

**Configuration mobile app :**
```javascript
// ✅ CORRECT avec HTTPS
const API_BASE_URL = 'https://207.180.201.77';
```

### **Scénario 3: App directement sur port 80**

**Configuration mobile app :**
```javascript
// ✅ CORRECT
const API_BASE_URL = 'http://207.180.201.77';
```

## 🧪 **Tests pour Identifier votre Configuration**

### **Test 1: Identifier le port de votre app**

```bash
# Sur votre serveur
pm2 describe suivicluster

# Regardez la section "exec_interpreter" et "args"
# Cherchez des mentions de port
```

### **Test 2: Tester les différentes URLs**

```bash
# Depuis votre machine locale, testez :

# Test port 3000
curl -I http://207.180.201.77:3000

# Test port 80
curl -I http://207.180.201.77

# Test HTTPS port 443
curl -I https://207.180.201.77

# Test votre URL actuelle (devrait échouer)
curl -I http://207.180.201.77:443
```

### **Test 3: Vérifier avec votre mobile app**

```javascript
// Testez chaque URL dans votre app mobile
const urlsToTest = [
  'http://207.180.201.77:3000',
  'http://207.180.201.77',
  'https://207.180.201.77'
];

for (const url of urlsToTest) {
  try {
    const response = await fetch(`${url}/api/auth/me`);
    console.log(`✅ ${url} - Status: ${response.status}`);
  } catch (error) {
    console.log(`❌ ${url} - Error: ${error.message}`);
  }
}
```

## 📱 **Configuration Mobile App Finale**

### **Template de Service API**

```javascript
// Déterminez d'abord la bonne URL de base
const API_BASE_URL = 'http://207.180.201.77:3000'; // Ajustez selon vos tests

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  async makeRequest(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    console.log(`🔗 API Request: ${url}`); // Pour debug
    
    const defaultOptions = {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    };

    const finalOptions = { ...defaultOptions, ...options };

    try {
      const response = await fetch(url, finalOptions);
      
      console.log(`📡 Response Status: ${response.status}`); // Pour debug
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`❌ API Error for ${endpoint}:`, error);
      throw error;
    }
  }

  // Méthodes API
  async getCurrentUser() {
    return this.makeRequest('/api/auth/me');
  }

  async login(email, password) {
    return this.makeRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
  }
}

export default new ApiService();
```

## 🔧 **Script de Diagnostic Automatique**

```bash
# Créez ce script sur votre serveur pour diagnostiquer
cat > diagnostic-port.sh << 'EOF'
#!/bin/bash

echo "🔍 DIAGNOSTIC CONFIGURATION SERVEUR"
echo "=================================="

echo ""
echo "📊 Statut PM2:"
pm2 status

echo ""
echo "🔌 Ports en écoute:"
netstat -tlnp | grep -E "(80|443|3000|8080)"

echo ""
echo "📝 Logs récents de l'application:"
pm2 logs suivicluster --lines 10

echo ""
echo "🧪 Tests de connectivité:"
echo "Port 3000:" $(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 2>/dev/null || echo "FAIL")
echo "Port 80:" $(curl -s -o /dev/null -w "%{http_code}" http://localhost:80 2>/dev/null || echo "FAIL")
echo "Port 443:" $(curl -s -o /dev/null -w "%{http_code}" https://localhost:443 2>/dev/null || echo "FAIL")

echo ""
echo "🌐 Configuration recommandée pour mobile app:"
if curl -s -o /dev/null http://localhost:3000 2>/dev/null; then
    echo "const API_BASE_URL = 'http://207.180.201.77:3000';"
elif curl -s -o /dev/null https://localhost:443 2>/dev/null; then
    echo "const API_BASE_URL = 'https://207.180.201.77';"
elif curl -s -o /dev/null http://localhost:80 2>/dev/null; then
    echo "const API_BASE_URL = 'http://207.180.201.77';"
else
    echo "❌ Aucune configuration fonctionnelle détectée"
fi
EOF

chmod +x diagnostic-port.sh
./diagnostic-port.sh
```

## 📞 **Actions Immédiates**

1. **Exécutez le diagnostic** sur votre serveur
2. **Identifiez le bon port** de votre application
3. **Mettez à jour l'URL** dans votre mobile app
4. **Testez la connexion** avec la nouvelle URL

## 🎯 **Résultat Attendu**

Une fois la bonne URL identifiée et configurée :
- ✅ **Connexion réussie** depuis votre mobile app
- ✅ **Pas d'erreur CORS** (grâce aux configurations précédentes)
- ✅ **Authentification fonctionnelle**
- ✅ **Accès complet aux APIs**

---

**IMPORTANT :** L'URL `http://207.180.201.77:443/` ne peut pas fonctionner. Vous devez identifier la vraie configuration de votre serveur et utiliser l'URL correcte.
