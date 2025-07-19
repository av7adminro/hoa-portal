#!/bin/bash
sudo pkill -f "next start"
sudo pkill -f "npm start"
sudo fuser -k 3000/tcp
sleep 3
cd /var/www/hoa-portal
sudo npm start &
echo "Server restarted"