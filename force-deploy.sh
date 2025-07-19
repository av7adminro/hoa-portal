#!/bin/bash
echo "🚀 Forçând deployment complet..."

# Oprire completă
sudo pkill -f "next start"
sudo pkill -f "npm start"
sudo fuser -k 3000/tcp

# Ștergere cache
sudo rm -rf /var/www/hoa-portal/.next
sudo rm -rf /var/www/hoa-portal/node_modules

# Copiere forțată
sudo rsync -av --delete /root/hoa-portal/ /var/www/hoa-portal/ \
    --exclude .git \
    --exclude node_modules \
    --exclude .next

# Rebuild complet
cd /var/www/hoa-portal
sudo npm ci
sudo npm run build

# Start server
sudo nohup npm start > /var/log/hoa-portal.log 2>&1 &

echo "✅ Deployment forțat completat!"