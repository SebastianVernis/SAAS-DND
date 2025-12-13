#!/bin/bash
# Setup Nginx para SAAS-DND con subdirectorios

set -e

echo "⚙️  Setting up Nginx for SAAS-DND..."

# Colores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log() { echo -e "${GREEN}✓${NC} $1"; }
log_info() { echo -e "${BLUE}ℹ${NC} $1"; }
log_warning() { echo -e "${YELLOW}⚠${NC} $1"; }
log_error() { echo -e "${RED}✗${NC} $1"; }

# Verificar si se está ejecutando como root
if [ "$EUID" -ne 0 ]; then 
    log_error "Please run as root or with sudo"
    exit 1
fi

# Instalar Nginx si no está instalado
if ! command -v nginx &> /dev/null; then
    log_info "Nginx not found. Installing..."
    
    # Detectar OS
    if [ -f /etc/debian_version ]; then
        apt update
        apt install -y nginx
    elif [ -f /etc/redhat-release ]; then
        yum install -y nginx
    else
        log_error "Unsupported OS. Please install Nginx manually."
        exit 1
    fi
    
    log "Nginx installed"
else
    log "Nginx already installed"
fi

# Crear directorio de configuración si no existe
log_info "Setting up Nginx configuration..."
NGINX_CONF_DIR="/etc/nginx"
SITES_AVAILABLE="$NGINX_CONF_DIR/sites-available"
SITES_ENABLED="$NGINX_CONF_DIR/sites-enabled"

# Crear directorios si no existen
mkdir -p $SITES_AVAILABLE
mkdir -p $SITES_ENABLED

# Copiar configuración
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$(dirname $(dirname $SCRIPT_DIR))"

log_info "Copying Nginx configuration..."
cp "$PROJECT_ROOT/infrastructure/nginx/sites-available/saasdnd-subdirs.conf" \
   "$SITES_AVAILABLE/saasdnd.conf"
log "Configuration copied"

# Copiar proxy params
if [ -f "$PROJECT_ROOT/infrastructure/nginx/proxy_params" ]; then
    cp "$PROJECT_ROOT/infrastructure/nginx/proxy_params" \
       "$NGINX_CONF_DIR/proxy_params"
    log "Proxy params copied"
fi

# Crear symlink para habilitar sitio
log_info "Enabling site..."
ln -sf "$SITES_AVAILABLE/saasdnd.conf" "$SITES_ENABLED/saasdnd.conf"
log "Site enabled"

# Deshabilitar sitio default si existe
if [ -f "$SITES_ENABLED/default" ]; then
    log_info "Disabling default site..."
    rm -f "$SITES_ENABLED/default"
    log "Default site disabled"
fi

# Crear directorios de logs si no existen
mkdir -p /var/log/nginx
touch /var/log/nginx/saasdnd-access.log
touch /var/log/nginx/saasdnd-error.log

# Verificar configuración
log_info "Testing Nginx configuration..."
if nginx -t 2>&1 | grep -q "successful"; then
    log "Nginx configuration is valid"
else
    log_error "Nginx configuration test failed!"
    nginx -t
    exit 1
fi

# Reiniciar Nginx
log_info "Restarting Nginx..."
if systemctl restart nginx 2>/dev/null; then
    log "Nginx restarted (systemctl)"
elif service nginx restart 2>/dev/null; then
    log "Nginx restarted (service)"
else
    log_error "Could not restart Nginx. Please restart manually."
    exit 1
fi

# Habilitar Nginx en boot
systemctl enable nginx 2>/dev/null || chkconfig nginx on 2>/dev/null || log_warning "Could not enable Nginx on boot"

# Verificar estado
log_info "Nginx status:"
systemctl status nginx --no-pager 2>/dev/null || service nginx status 2>/dev/null || log_warning "Could not check status"

# Obtener IP
PUBLIC_IP=$(curl -s ifconfig.me 2>/dev/null || hostname -I | awk '{print $1}')

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Nginx setup completed successfully!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📍 Your SAAS-DND will be accessible at:"
echo "   http://$PUBLIC_IP/"
echo ""
echo "🔧 Configuration file:"
echo "   $SITES_AVAILABLE/saasdnd.conf"
echo ""
echo "📝 Log files:"
echo "   Access: /var/log/nginx/saasdnd-access.log"
echo "   Error:  /var/log/nginx/saasdnd-error.log"
echo ""
echo "💡 Next steps:"
echo "   1. Run: ./deploy-subdirs.sh (to deploy versions)"
echo "   2. Start API: cd /home/admin/SAAS-DND/apps/api && npm run dev"
echo "   3. Start Web: cd /home/admin/SAAS-DND/apps/web && npm run dev"
echo "   4. Visit: http://$PUBLIC_IP/catalog"
echo ""
