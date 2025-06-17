#!/bin/bash

echo "🔍 DIAGNOSTIC CONFIGURATION SERVEUR"
echo "===================================="
echo ""

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}📊 1. Statut PM2:${NC}"
pm2 status
echo ""

echo -e "${BLUE}🔌 2. Ports en écoute sur le serveur:${NC}"
echo "Ports actifs:"
netstat -tlnp | grep -E "(80|443|3000|8080)" | while read line; do
    echo "  $line"
done
echo ""

echo -e "${BLUE}📝 3. Configuration PM2 de suivicluster:${NC}"
if pm2 describe suivicluster > /dev/null 2>&1; then
    pm2 describe suivicluster | grep -E "(exec_mode|port|env|script)"
else
    echo -e "${RED}❌ Application 'suivicluster' non trouvée dans PM2${NC}"
fi
echo ""

echo -e "${BLUE}📋 4. Logs récents de l'application:${NC}"
pm2 logs suivicluster --lines 5 2>/dev/null || echo -e "${RED}Pas de logs disponibles${NC}"
echo ""

echo -e "${BLUE}🧪 5. Tests de connectivité locale:${NC}"

# Test port 3000
if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 2>/dev/null | grep -q "200\|404\|401"; then
    echo -e "  Port 3000: ${GREEN}✅ ACCESSIBLE${NC}"
    PORT_3000_OK=true
else
    echo -e "  Port 3000: ${RED}❌ NON ACCESSIBLE${NC}"
    PORT_3000_OK=false
fi

# Test port 80
if curl -s -o /dev/null -w "%{http_code}" http://localhost:80 2>/dev/null | grep -q "200\|404\|401"; then
    echo -e "  Port 80: ${GREEN}✅ ACCESSIBLE${NC}"
    PORT_80_OK=true
else
    echo -e "  Port 80: ${RED}❌ NON ACCESSIBLE${NC}"
    PORT_80_OK=false
fi

# Test port 443 HTTPS
if curl -s -k -o /dev/null -w "%{http_code}" https://localhost:443 2>/dev/null | grep -q "200\|404\|401"; then
    echo -e "  Port 443 (HTTPS): ${GREEN}✅ ACCESSIBLE${NC}"
    PORT_443_OK=true
else
    echo -e "  Port 443 (HTTPS): ${RED}❌ NON ACCESSIBLE${NC}"
    PORT_443_OK=false
fi

echo ""

echo -e "${BLUE}🌐 6. Tests depuis l'extérieur:${NC}"

# Test depuis l'extérieur
echo "Test des URLs publiques..."

# Test port 3000
if curl -s -o /dev/null -w "%{http_code}" http://207.180.201.77:3000 2>/dev/null | grep -q "200\|404\|401"; then
    echo -e "  http://207.180.201.77:3000: ${GREEN}✅ ACCESSIBLE${NC}"
    PUBLIC_3000_OK=true
else
    echo -e "  http://207.180.201.77:3000: ${RED}❌ NON ACCESSIBLE${NC}"
    PUBLIC_3000_OK=false
fi

# Test port 80
if curl -s -o /dev/null -w "%{http_code}" http://207.180.201.77 2>/dev/null | grep -q "200\|404\|401"; then
    echo -e "  http://207.180.201.77: ${GREEN}✅ ACCESSIBLE${NC}"
    PUBLIC_80_OK=true
else
    echo -e "  http://207.180.201.77: ${RED}❌ NON ACCESSIBLE${NC}"
    PUBLIC_80_OK=false
fi

# Test HTTPS
if curl -s -k -o /dev/null -w "%{http_code}" https://207.180.201.77 2>/dev/null | grep -q "200\|404\|401"; then
    echo -e "  https://207.180.201.77: ${GREEN}✅ ACCESSIBLE${NC}"
    PUBLIC_443_OK=true
else
    echo -e "  https://207.180.201.77: ${RED}❌ NON ACCESSIBLE${NC}"
    PUBLIC_443_OK=false
fi

echo ""

echo -e "${YELLOW}🎯 7. RECOMMANDATIONS POUR VOTRE MOBILE APP:${NC}"
echo "=============================================="

# Déterminer la meilleure configuration
if [ "$PUBLIC_443_OK" = true ]; then
    echo -e "${GREEN}✅ RECOMMANDATION PRINCIPALE:${NC}"
    echo "const API_BASE_URL = 'https://207.180.201.77';"
    echo ""
    echo -e "${GREEN}Votre serveur supporte HTTPS - c'est la meilleure option !${NC}"
    
elif [ "$PUBLIC_3000_OK" = true ]; then
    echo -e "${GREEN}✅ RECOMMANDATION PRINCIPALE:${NC}"
    echo "const API_BASE_URL = 'http://207.180.201.77:3000';"
    echo ""
    echo -e "${YELLOW}⚠️  Votre app tourne sur le port 3000${NC}"
    
elif [ "$PUBLIC_80_OK" = true ]; then
    echo -e "${GREEN}✅ RECOMMANDATION PRINCIPALE:${NC}"
    echo "const API_BASE_URL = 'http://207.180.201.77';"
    echo ""
    echo -e "${YELLOW}⚠️  Votre app tourne sur le port 80 standard${NC}"
    
else
    echo -e "${RED}❌ PROBLÈME DÉTECTÉ:${NC}"
    echo "Aucune configuration publique fonctionnelle trouvée !"
    echo ""
    echo "Vérifiez:"
    echo "1. Que votre application PM2 fonctionne"
    echo "2. Que les ports sont ouverts dans le firewall"
    echo "3. Que Nginx est configuré correctement (si utilisé)"
fi

echo ""

echo -e "${BLUE}🔧 8. Configuration API Service pour votre mobile app:${NC}"
echo "=================================================="

if [ "$PUBLIC_443_OK" = true ]; then
    API_URL="https://207.180.201.77"
elif [ "$PUBLIC_3000_OK" = true ]; then
    API_URL="http://207.180.201.77:3000"
elif [ "$PUBLIC_80_OK" = true ]; then
    API_URL="http://207.180.201.77"
else
    API_URL="URL_NON_DETERMINEE"
fi

cat << EOF
// Configuration pour votre mobile app
const API_BASE_URL = '$API_URL';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  async makeRequest(endpoint, options = {}) {
    const url = \`\${this.baseURL}\${endpoint}\`;
    
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
        throw new Error(\`HTTP error! status: \${response.status}\`);
      }

      return await response.json();
    } catch (error) {
      console.error(\`API Error for \${endpoint}:\`, error);
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
EOF

echo ""

echo -e "${BLUE}🧪 9. Test de votre API:${NC}"
echo "======================"

if [ "$API_URL" != "URL_NON_DETERMINEE" ]; then
    echo "Test de l'endpoint /api/auth/me:"
    
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$API_URL/api/auth/me" 2>/dev/null)
    
    if [ "$HTTP_CODE" = "401" ]; then
        echo -e "${GREEN}✅ API fonctionne (401 = non authentifié, c'est normal)${NC}"
    elif [ "$HTTP_CODE" = "200" ]; then
        echo -e "${GREEN}✅ API fonctionne parfaitement${NC}"
    elif [ "$HTTP_CODE" = "404" ]; then
        echo -e "${YELLOW}⚠️  API endpoint non trouvé (vérifiez vos routes)${NC}"
    else
        echo -e "${RED}❌ Problème avec l'API (Code: $HTTP_CODE)${NC}"
    fi
else
    echo -e "${RED}❌ Impossible de tester - aucune URL fonctionnelle${NC}"
fi

echo ""
echo -e "${GREEN}🎯 DIAGNOSTIC TERMINÉ${NC}"
echo "===================="
echo ""
echo "Utilisez la configuration recommandée ci-dessus dans votre mobile app."
echo "Si vous avez des problèmes, vérifiez les logs PM2: pm2 logs suivicluster"
