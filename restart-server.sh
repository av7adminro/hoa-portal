#!/bin/bash
sudo fuser -k 3000/tcp
sleep 3
cd /var/www/hoa-portal
nohup npm start > /var/log/hoa-portal.log 2>&1 &
echo "Server restarted"