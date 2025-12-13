#!/bin/bash
# Deploy SAAS-DND y demos a subdirectorios con Nginx

set -e

echo "🚀 Deploying SAAS-DND to subdirectories..."

# Variables
DEPLOY_DIR="/var/www/saasdnd"
VERSIONS_DIR="$DEPLOY_DIR/versions"
SOURCE_VERSIONS="/home/admin/DragNDrop/versions"

# Colores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Función para log
log() {
    echo -e "${GREEN}✓${NC} $1"
}

log_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# Verificar que existe el directorio fuente
if [ ! -d "$SOURCE_VERSIONS" ]; then
    echo "❌ Error: Source directory not found: $SOURCE_VERSIONS"
    exit 1
fi

# Crear estructura de directorios
log_info "Creating directory structure..."
sudo mkdir -p $VERSIONS_DIR/{vanilla,landing,react,catalog}
sudo mkdir -p $DEPLOY_DIR/assets

# Deploy Vanilla Version (v1)
log_info "Deploying Vanilla version to /vanilla..."
if [ -d "$SOURCE_VERSIONS/v1-vanilla-standalone" ]; then
    sudo rsync -av --delete \
        $SOURCE_VERSIONS/v1-vanilla-standalone/ \
        $VERSIONS_DIR/vanilla/
    log "Vanilla version deployed"
else
    log_warning "Vanilla version source not found, skipping..."
fi

# Deploy Landing Version (v2)
log_info "Deploying Landing version to /landing..."
if [ -d "$SOURCE_VERSIONS/v2-landing-page" ]; then
    sudo rsync -av --delete \
        $SOURCE_VERSIONS/v2-landing-page/ \
        $VERSIONS_DIR/landing/
    log "Landing version deployed"
else
    log_warning "Landing version source not found, skipping..."
fi

# Build y deploy React Version (v9) si existe
log_info "Building and deploying React version to /react..."
if [ -d "$SOURCE_VERSIONS/v9-frontend-react-vite" ]; then
    cd $SOURCE_VERSIONS/v9-frontend-react-vite
    
    # Install dependencies si no existen
    if [ ! -d "node_modules" ]; then
        log_info "Installing React version dependencies..."
        npm install
    fi
    
    # Build
    log_info "Building React version..."
    npm run build 2>/dev/null || log_warning "React build failed or no build script"
    
    # Copy dist if exists
    if [ -d "dist" ]; then
        sudo rsync -av --delete dist/ $VERSIONS_DIR/react/
        log "React version deployed"
    fi
    
    cd - > /dev/null
else
    log_warning "React version source not found, skipping..."
fi

# Crear página de catálogo
log_info "Creating catalog page..."
cat << 'EOF' | sudo tee $VERSIONS_DIR/catalog/index.html > /dev/null
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Catálogo de Versiones - DragNDrop</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; padding: 40px 20px; }
        .container { max-width: 1200px; margin: 0 auto; }
        h1 { text-align: center; color: white; font-size: 48px; margin-bottom: 20px; }
        .subtitle { text-align: center; color: rgba(255,255,255,0.9); font-size: 20px; margin-bottom: 60px; }
        .versions-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 30px; }
        .version-card { background: white; border-radius: 12px; padding: 30px; box-shadow: 0 10px 30px rgba(0,0,0,0.2); transition: transform 0.3s ease, box-shadow 0.3s ease; }
        .version-card:hover { transform: translateY(-5px); box-shadow: 0 15px 40px rgba(0,0,0,0.3); }
        .version-header { display: flex; align-items: center; gap: 15px; margin-bottom: 15px; }
        .version-icon { font-size: 40px; }
        .version-title { font-size: 24px; font-weight: bold; color: #333; }
        .version-subtitle { color: #666; font-size: 14px; margin-bottom: 15px; }
        .version-features { list-style: none; margin: 20px 0; }
        .version-features li { padding: 8px 0; color: #555; }
        .version-features li:before { content: '✓ '; color: #10b981; font-weight: bold; }
        .btn { display: inline-block; padding: 12px 24px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 8px; font-weight: 600; transition: opacity 0.3s ease; }
        .btn:hover { opacity: 0.9; }
        .badge { display: inline-block; padding: 4px 12px; background: #10b981; color: white; border-radius: 20px; font-size: 12px; font-weight: 600; }
        .badge.dev { background: #f59e0b; }
        .footer { text-align: center; margin-top: 60px; color: white; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🎨 DragNDrop Versions</h1>
        <p class="subtitle">Explora todas las versiones y demos disponibles</p>
        
        <div class="versions-grid">
            <div class="version-card">
                <div class="version-header">
                    <span class="version-icon">🚀</span>
                    <div>
                        <div class="version-title">SAAS App</div>
                        <span class="badge">Producción</span>
                    </div>
                </div>
                <p class="version-subtitle">Sistema comercial completo</p>
                <ul class="version-features">
                    <li>Autenticación con OTP</li>
                    <li>Team Management</li>
                    <li>Planes de pago</li>
                    <li>Editor integrado</li>
                </ul>
                <a href="/" class="btn">Ir a App Principal</a>
            </div>

            <div class="version-card">
                <div class="version-header">
                    <span class="version-icon">🎨</span>
                    <div>
                        <div class="version-title">Vanilla Editor</div>
                        <span class="badge">Demo</span>
                    </div>
                </div>
                <p class="version-subtitle">Editor original sin frameworks</p>
                <ul class="version-features">
                    <li>34 componentes drag & drop</li>
                    <li>Templates profesionales</li>
                    <li>Export HTML/CSS/JS</li>
                    <li>AI integrada</li>
                </ul>
                <a href="/vanilla" class="btn">Ver Demo</a>
            </div>

            <div class="version-card">
                <div class="version-header">
                    <span class="version-icon">🌐</span>
                    <div>
                        <div class="version-title">Landing Page</div>
                        <span class="badge">Demo</span>
                    </div>
                </div>
                <p class="version-subtitle">Landing page de marketing</p>
                <ul class="version-features">
                    <li>Hero section</li>
                    <li>Features showcase</li>
                    <li>Pricing cards</li>
                    <li>Responsive design</li>
                </ul>
                <a href="/landing" class="btn">Ver Demo</a>
            </div>

            <div class="version-card">
                <div class="version-header">
                    <span class="version-icon">⚛️</span>
                    <div>
                        <div class="version-title">React Version</div>
                        <span class="badge dev">En Desarrollo</span>
                    </div>
                </div>
                <p class="version-subtitle">Editor con React + TypeScript</p>
                <ul class="version-features">
                    <li>Componentes React</li>
                    <li>TypeScript</li>
                    <li>Vite HMR</li>
                    <li>Modern tooling</li>
                </ul>
                <a href="/react" class="btn">Ver Demo</a>
            </div>
        </div>

        <div class="footer">
            <p>© 2024 DragNDrop SAAS. All rights reserved.</p>
            <p style="margin-top: 10px; opacity: 0.8;">Sistema unificado con Nginx reverse proxy</p>
        </div>
    </div>
</body>
</html>
EOF
log "Catalog page created"

# Ajustar permisos
log_info "Setting permissions..."
sudo chown -R www-data:www-data $DEPLOY_DIR 2>/dev/null || sudo chown -R nginx:nginx $DEPLOY_DIR 2>/dev/null || log_warning "Could not set www-data/nginx ownership"
sudo chmod -R 755 $DEPLOY_DIR

# Verificar configuración de Nginx
log_info "Testing Nginx configuration..."
if sudo nginx -t 2>/dev/null; then
    log "Nginx configuration is valid"
    
    # Recargar Nginx
    log_info "Reloading Nginx..."
    sudo systemctl reload nginx 2>/dev/null || sudo service nginx reload 2>/dev/null || log_warning "Could not reload Nginx automatically"
    log "Nginx reloaded"
else
    log_warning "Nginx configuration test failed. Please check manually."
fi

# Mostrar resumen
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Deployment completed successfully!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Obtener IP pública
PUBLIC_IP=$(curl -s ifconfig.me 2>/dev/null || hostname -I | awk '{print $1}')

echo ""
echo "📍 URLs disponibles:"
echo "   Main App:    http://$PUBLIC_IP/"
echo "   API:         http://$PUBLIC_IP/api"
echo "   Vanilla:     http://$PUBLIC_IP/vanilla"
echo "   Landing:     http://$PUBLIC_IP/landing"
echo "   Catalog:     http://$PUBLIC_IP/catalog"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "💡 Next steps:"
echo "   1. Verify URLs are accessible"
echo "   2. Check Nginx logs: sudo tail -f /var/log/nginx/saasdnd-access.log"
echo "   3. Start backend: cd apps/api && npm run dev"
echo "   4. Start frontend: cd apps/web && npm run dev"
echo ""
