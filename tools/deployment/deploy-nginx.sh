#!/bin/bash
set -e

echo "🔧 Configurando Nginx para SAAS-DND..."

# Crear configuración
cat > /tmp/saas-dnd.conf << 'EOF'
server {
    listen 80 default_server;
    server_name _;

    # Backend API
    location /api/ {
        proxy_pass http://localhost:3000/api/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Frontend (React)
    location / {
        proxy_pass http://localhost:5173;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

# Desactivar otros sitios
sudo rm -f /etc/nginx/sites-enabled/*

# Copiar y habilitar
sudo cp /tmp/saas-dnd.conf /etc/nginx/sites-available/saas-dnd
sudo ln -sf /etc/nginx/sites-available/saas-dnd /etc/nginx/sites-enabled/saas-dnd

# Test y reload
sudo nginx -t
sudo systemctl reload nginx

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Nginx configurado"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "URLs:"
echo "  Frontend: http://18.223.32.141"
echo "  API:      http://18.223.32.141/api"
echo ""
