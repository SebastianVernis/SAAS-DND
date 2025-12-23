#!/bin/bash
# Update Nginx configuration to point to new editor location

set -e

echo "🔧 Updating Nginx configuration for vanilla editor..."

# Backup current config
NGINX_CONF="/etc/nginx/sites-available/default"
BACKUP_CONF="${NGINX_CONF}.backup.$(date +%Y%m%d_%H%M%S)"

echo "📋 Backing up current config to: $BACKUP_CONF"
sudo cp "$NGINX_CONF" "$BACKUP_CONF"

# Update vanilla location
echo "🔄 Updating /vanilla location to point to /var/www/saasdnd/editor..."

sudo sed -i 's|alias /var/www/saasdnd/versions/vanilla|alias /var/www/saasdnd/editor|g' "$NGINX_CONF"

echo "✅ Configuration updated"

# Test configuration
echo "🧪 Testing Nginx configuration..."
sudo nginx -t

if [ $? -eq 0 ]; then
    echo "✅ Configuration is valid"
    echo "🔄 Reloading Nginx..."
    sudo nginx -s reload
    echo "✅ Nginx reloaded successfully"
    echo ""
    echo "🌐 Editor now available at: http://18.223.32.141/vanilla"
    echo "🔄 Remember to hard refresh (Ctrl+Shift+R) in browser"
else
    echo "❌ Configuration has errors - not reloading"
    echo "🔄 Restoring backup..."
    sudo cp "$BACKUP_CONF" "$NGINX_CONF"
    exit 1
fi
