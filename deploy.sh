#!/bin/bash

# Script de deployment pentru HOA Portal
# Rulează acest script pe serverul live pentru a face deploy

echo "🚀 Începe deployment-ul HOA Portal..."

# Stop serverul existent
echo "🛑 Opresc serverul existent..."
pkill -f "next start" || true
pkill -f "npm run start" || true

# Backup-ul aplicației curente
echo "💾 Creez backup..."
if [ -d "/var/www/hoa-portal.backup" ]; then
    rm -rf /var/www/hoa-portal.backup
fi
if [ -d "/var/www/hoa-portal" ]; then
    cp -r /var/www/hoa-portal /var/www/hoa-portal.backup
fi

# Copiază fișierele noi
echo "📁 Copiez fișierele noi..."
rsync -av --delete /root/hoa-portal/ /var/www/hoa-portal/ \
    --exclude node_modules \
    --exclude .next \
    --exclude .git \
    --exclude deploy.sh

# Intră în directorul de deployment
cd /var/www/hoa-portal

# Instalează dependențele
echo "📦 Instalez dependențele..."
npm ci --only=production

# Construiește aplicația
echo "🔨 Construiesc aplicația..."
npm run build

# Verifică build-ul
if [ $? -eq 0 ]; then
    echo "✅ Build-ul a fost successful!"
else
    echo "❌ Build-ul a eșuat!"
    exit 1
fi

# Pornește serverul
echo "🚀 Pornesc serverul..."
nohup npm start > /var/log/hoa-portal.log 2>&1 &

# Verifică dacă serverul a pornit
sleep 5
if pgrep -f "next start" > /dev/null; then
    echo "✅ Serverul a pornit cu succes!"
    echo "🌐 Aplicația este disponibilă la: http://av7.rowebhost.ro"
else
    echo "❌ Serverul nu a pornit corect. Verifică logurile în /var/log/hoa-portal.log"
    exit 1
fi

echo "🎉 Deployment completat cu succes!"
echo ""
echo "📋 Informații utile:"
echo "   - Loguri server: /var/log/hoa-portal.log"
echo "   - Aplicație: http://av7.rowebhost.ro"
echo "   - Backup: /var/www/hoa-portal.backup"
echo ""
echo "🔐 Conturi de test:"
echo "   - Admin: admin@asociatia.ro / admin123"
echo "   - Locatar: locatar@asociatia.ro / locatar123"
echo "   - Costel: costelmiron51@gmail.com / 53715371mcM1.."