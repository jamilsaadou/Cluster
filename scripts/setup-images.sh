#!/bin/bash

echo "🖼️  Configuration du système d'images"
echo "======================================"

# Créer le dossier d'upload s'il n'existe pas
if [ ! -d "uploads/images" ]; then
    echo "📁 Création du dossier uploads/images..."
    mkdir -p uploads/images
    echo "✅ Dossier créé"
else
    echo "✅ Dossier uploads/images existe déjà"
fi

# Vérifier les permissions
if [ -w "uploads/images" ]; then
    echo "✅ Permissions d'écriture OK"
else
    echo "❌ Problème de permissions sur uploads/images"
    echo "💡 Essayez: chmod 755 uploads/images"
fi

# Afficher les statistiques
echo ""
echo "📊 Statistiques actuelles:"
node scripts/image-management.js --stats

echo ""
echo "🚀 Configuration terminée!"
echo ""
echo "Commandes utiles:"
echo "  npm run dev                              # Démarrer le serveur"
echo "  node scripts/migrate-images.js          # Migrer les images base64"
echo "  node scripts/image-management.js --stats # Voir les statistiques"
echo "  node scripts/image-management.js --check # Vérifier l'intégrité"
echo ""
