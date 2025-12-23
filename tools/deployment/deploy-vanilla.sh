#!/bin/bash
# Deploy script for vanilla editor updates

set -e

echo "🚀 Deploying Vanilla Editor updates..."

# Variables
SOURCE_DIR="/home/admin/SAAS-DND/vanilla-editor"
TARGET_DIR="/var/www/saasdnd/versions/vanilla"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Verificar directorio fuente
if [ ! -d "$SOURCE_DIR" ]; then
    echo -e "❌ Source directory not found: $SOURCE_DIR"
    exit 1
fi

# Crear directorio destino si no existe
echo -e "${BLUE}ℹ${NC} Creating target directory..."
sudo mkdir -p "$TARGET_DIR"

# Copiar archivos actualizados
echo -e "${BLUE}ℹ${NC} Copying updated files..."
sudo cp -r "$SOURCE_DIR"/* "$TARGET_DIR/"
sudo rm -rf "$TARGET_DIR/node_modules" 2>/dev/null || true
sudo rm -f "$TARGET_DIR"/*.md 2>/dev/null || true

# Verificar archivos críticos
echo -e "${BLUE}ℹ${NC} Verifying deployment..."
if [ -f "$TARGET_DIR/script.js" ]; then
    echo -e "${GREEN}✓${NC} script.js deployed"
    SCRIPT_SIZE=$(stat -c%s "$TARGET_DIR/script.js")
    echo -e "${BLUE}ℹ${NC} script.js size: ${SCRIPT_SIZE} bytes"
fi

if [ -f "$TARGET_DIR/index.html" ]; then
    echo -e "${GREEN}✓${NC} index.html deployed"
fi

if [ -f "$TARGET_DIR/style.css" ]; then
    echo -e "${GREEN}✓${NC} style.css deployed"
fi

# Verificar directorio src
if [ -d "$TARGET_DIR/src" ]; then
    SRC_FILES=$(find "$TARGET_DIR/src" -type f | wc -l)
    echo -e "${GREEN}✓${NC} src/ deployed with ${SRC_FILES} files"
fi

# Ajustar permisos
echo -e "${BLUE}ℹ${NC} Setting permissions..."
sudo chown -R www-data:www-data "$TARGET_DIR"
sudo chmod -R 755 "$TARGET_DIR"

# Verificar timestamp del archivo principal
TIMESTAMP=$(stat -c '%y' "$TARGET_DIR/script.js" | cut -d'.' -f1)
echo -e "${GREEN}✓${NC} Deployment timestamp: $TIMESTAMP"

echo ""
echo -e "${GREEN}✅ Vanilla Editor deployed successfully!${NC}"
echo ""
echo "📍 URL: http://18.223.32.141/vanilla"
echo "🔄 Remember to hard refresh (Ctrl+Shift+R) in browser"
echo ""
