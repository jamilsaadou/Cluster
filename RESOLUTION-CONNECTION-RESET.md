# 🔌 RÉSOLUTION ERREUR CONNECTION RESET

## 🚨 NOUVELLE ERREUR IDENTIFIÉE

**Erreur :** `GET https://207.180.201.77/api/auth/me net::ERR_CONNECTION_RESET`

## 🔍 ANALYSE

L'erreur `ERR_CONNECTION_RESET` indique que :
- ✅ **CORS résolu** (plus d'erreur CORS)
- ❌ **Connexion fermée** par le serveur ou réseau
- ❌ **Serveur inaccessible** ou en panne

## 🛠️ CAUSES POSSIBLES

### 1. **Serveur Next.js arrêté ou en panne**
- PM2 process arrêté
- Application crashée
- Port 3000 non accessible

### 2. **Problème Nginx**
- Nginx arrêté
- Configuration proxy incorrecte
- Timeout de connexion

### 3. **Problème réseau**
- Firewall bloquant les connexions
- Problème de routage réseau
- Serveur surchargé

### 4. **Problème SSL/HTTPS**
- Certificat SSL expiré ou invalide
- Configuration HTTPS incorrecte

## 🧪 DIAGNOSTIC ÉTAPE PAR ÉTAPE

### Étape 1: Vérifier l'état du serveur

```bash
# 1. Vérifier PM2
pm2 status
pm2 logs suivicluster --lines 20

# 2. Vérifier si Next.js répond sur le port 3000
curl -I http://localhost:3000/api/auth/me
curl -I http://127.0.0.1:3000/api/auth/me

# 3. Vérifier les processus
ps aux | grep node
netstat -tlnp | grep 3000
```

### Étape 2: Vérifier Nginx

```bash
# 1. Statut Nginx
sudo systemctl status nginx

# 2. Tester Nginx
sudo nginx -t

# 3. Logs Nginx
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log

# 4. Vérifier les ports
netstat -tlnp | grep :80
netstat -tlnp | grep :443
```

### Étape 3: Tests de connectivité

```bash
# 1. Test ping
ping 207.180.201.77

# 2. Test telnet sur les ports
telnet 207.180.201.77 80
telnet 207.180.201.77 443

# 3. Test curl direct
curl -I http://207.180.201.77
curl -I https://207.180.201.77

# 4. Test API spécifique
curl -v https://207.180.201.77/api/auth/me
```

### Étape 4: Vérifier les certificats SSL

```bash
# Vérifier le certificat SSL
openssl s_client -connect 207.180.201.77:443 -servername 207.180.201.77

# Ou avec curl
curl -vI https://207.180.201.77 2>&1 | grep -E "(SSL|TLS|certificate)"
```

## 🚀 SOLUTIONS PAR PROBLÈME

### Solution 1: Redémarrer les services

```bash
# 1. Redémarrer PM2
pm2 restart suivicluster
pm2 status

# 2. Si PM2 ne répond pas, redémarrer complètement
pm2 stop all
pm2 delete all
pm2 start ecosystem-auto.config.js

# 3. Redémarrer Nginx
sudo systemctl restart nginx
sudo systemctl status nginx
```

### Solution 2: Vérifier la configuration Nginx

```bash
# Vérifier la configuration
sudo nginx -t

# Si erreur, vérifier le fichier de config
sudo nano /etc/nginx/sites-available/suivicluster

# Configuration proxy correcte :
```

```nginx
server {
    listen 80;
    listen 443 ssl;
    server_name 207.180.201.77;

    # Configuration SSL
    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    location /api/ {
        proxy_pass http://localhost:3000/api/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Headers CORS
        add_header 'Access-Control-Allow-Origin' '*' always;
        add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
        add_header 'Access-Control-Allow-Headers' 'Content-Type, Authorization, Cookie' always;
        add_header 'Access-Control-Allow-Credentials' 'true' always;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
```

### Solution 3: Vérifier les logs et diagnostiquer

```bash
# 1. Logs PM2 détaillés
pm2 logs suivicluster --lines 50 --raw

# 2. Logs système
sudo journalctl -u nginx -f
sudo tail -f /var/log/syslog

# 3. Vérifier l'espace disque
df -h
du -sh /var/log/*

# 4. Vérifier la mémoire
free -h
top
```

### Solution 4: Rebuild complet si nécessaire

```bash
# Si l'application est corrompue
cd /root/apps/suivicluster  # ou le bon répertoire

# 1. Arrêter PM2
pm2 stop suivicluster

# 2. Nettoyer et rebuilder
rm -rf .next
rm -rf node_modules/.cache
npm run build

# 3. Redémarrer
pm2 start ecosystem-auto.config.js

# 4. Vérifier
pm2 logs suivicluster --lines 10
```

## 🧪 TESTS DE VALIDATION

### Test 1: Serveur local

```bash
# Tester directement sur le serveur
curl -I http://localhost:3000/api/auth/me
# Doit retourner 200 ou 401, pas de connection reset
```

### Test 2: Via Nginx

```bash
# Tester via Nginx
curl -I http://207.180.201.77/api/auth/me
curl -I https://207.180.201.77/api/auth/me
# Doit retourner une réponse, pas de connection reset
```

### Test 3: Depuis l'application mobile

```javascript
// Test simple de connectivité
fetch('https://207.180.201.77/api/regions')
  .then(response => {
    console.log('Status:', response.status);
    return response.json();
  })
  .then(data => console.log('Data:', data))
  .catch(error => console.error('Error:', error));
```

## 🚨 ACTIONS IMMÉDIATES

### 1. Diagnostic rapide (5 min)

```bash
# Vérifier les services essentiels
pm2 status
sudo systemctl status nginx
curl -I http://localhost:3000
curl -I https://207.180.201.77
```

### 2. Redémarrage des services (2 min)

```bash
# Redémarrer tout
pm2 restart suivicluster
sudo systemctl restart nginx
```

### 3. Vérification des logs (5 min)

```bash
# Surveiller les logs
pm2 logs suivicluster --lines 0 &
sudo tail -f /var/log/nginx/error.log &
# Puis tester l'API depuis l'app mobile
```

## 🔧 CONFIGURATION TEMPORAIRE POUR DEBUG

Si le problème persiste, créer une API de test simple :

```bash
# Créer un fichier de test
echo 'export async function GET() { return new Response("API OK", { status: 200 }); }' > app/api/test/route.js

# Rebuilder
npm run build
pm2 restart suivicluster

# Tester
curl https://207.180.201.77/api/test
```

## 📱 ALTERNATIVE POUR L'APPLICATION MOBILE

En attendant la résolution, utiliser HTTP au lieu de HTTPS pour les tests :

```javascript
// Configuration temporaire pour debug
const API_BASE_URL = 'http://207.180.201.77'; // Sans HTTPS

// Ou tester avec l'IP directe du serveur Next.js
const API_BASE_URL = 'http://207.180.201.77:3000'; // Direct sur Next.js
```

## 🎯 RÉSULTAT ATTENDU

Après résolution :
- ✅ **Pas d'erreur CONNECTION_RESET**
- ✅ **API /api/auth/me accessible**
- ✅ **Réponse 200 ou 401** (pas de reset)
- ✅ **Application mobile fonctionnelle**

## 📞 ESCALADE

Si le problème persiste :

1. **Vérifier l'infrastructure serveur** (CPU, RAM, disque)
2. **Contacter l'hébergeur** pour problèmes réseau
3. **Vérifier les certificats SSL** avec l'autorité de certification
4. **Considérer un redémarrage serveur** complet

---

**Date :** 16/06/2025  
**Serveur :** 207.180.201.77  
**Status :** Diagnostic CONNECTION_RESET fourni
