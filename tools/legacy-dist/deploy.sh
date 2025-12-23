#!/bin/bash
# Universal Deploy Script for SAAS-DND Editor
# Works with any target directory and web server

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Default configuration
SOURCE_DIR="$(dirname "$0")/editor"
TARGET_DIR="${1:-/var/www/saasdnd/editor}"
WEB_USER="${2:-www-data}"
DRY_RUN="${DRY_RUN:-false}"

# Functions
log_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

log_success() {
    echo -e "${GREEN}✓${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

log_error() {
    echo -e "${RED}✗${NC} $1"
}

# Banner
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🚀  SAAS-DND Editor - Universal Deployment Script"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Verify source directory
if [ ! -d "$SOURCE_DIR" ]; then
    log_error "Source directory not found: $SOURCE_DIR"
    exit 1
fi

log_info "Source: $SOURCE_DIR"
log_info "Target: $TARGET_DIR"
log_info "Web User: $WEB_USER"
echo ""

# Verify critical files
log_info "Verifying source files..."
CRITICAL_FILES=("index.html" "script.js" "style.css")
MISSING_FILES=0

for file in "${CRITICAL_FILES[@]}"; do
    if [ -f "$SOURCE_DIR/$file" ]; then
        SIZE=$(stat -c%s "$SOURCE_DIR/$file")
        log_success "$file (${SIZE} bytes)"
    else
        log_error "Missing critical file: $file"
        MISSING_FILES=$((MISSING_FILES + 1))
    fi
done

if [ $MISSING_FILES -gt 0 ]; then
    log_error "Cannot deploy: $MISSING_FILES critical files missing"
    exit 1
fi

# Count files
TOTAL_FILES=$(find "$SOURCE_DIR" -type f | wc -l)
TOTAL_SIZE=$(du -sh "$SOURCE_DIR" | cut -f1)
log_info "Total files: $TOTAL_FILES"
log_info "Total size: $TOTAL_SIZE"
echo ""

# Dry run check
if [ "$DRY_RUN" = "true" ]; then
    log_warning "DRY RUN MODE - No files will be copied"
    echo ""
    log_info "Would execute:"
    echo "  1. Create directory: $TARGET_DIR"
    echo "  2. Copy $TOTAL_FILES files"
    echo "  3. Set owner: $WEB_USER"
    echo "  4. Set permissions: 755"
    echo ""
    exit 0
fi

# Create target directory
log_info "Creating target directory..."
sudo mkdir -p "$TARGET_DIR"
log_success "Directory created: $TARGET_DIR"

# Backup existing deployment (if exists)
if [ -d "$TARGET_DIR" ] && [ "$(ls -A $TARGET_DIR)" ]; then
    BACKUP_DIR="${TARGET_DIR}.backup.$(date +%Y%m%d_%H%M%S)"
    log_info "Backing up existing deployment to: $BACKUP_DIR"
    sudo mv "$TARGET_DIR" "$BACKUP_DIR"
    sudo mkdir -p "$TARGET_DIR"
    log_success "Backup created"
fi

# Copy files
log_info "Copying files to target..."
sudo cp -r "$SOURCE_DIR"/* "$TARGET_DIR/"
log_success "Files copied"

# Clean up unwanted files
log_info "Cleaning up..."
sudo rm -rf "$TARGET_DIR/node_modules" 2>/dev/null || true
sudo rm -f "$TARGET_DIR/README.md" 2>/dev/null || true
sudo rm -f "$TARGET_DIR"/.DS_Store 2>/dev/null || true
sudo rm -f "$TARGET_DIR"/.gitkeep 2>/dev/null || true
log_success "Cleaned up"

# Set permissions
log_info "Setting permissions..."
sudo chown -R "$WEB_USER:$WEB_USER" "$TARGET_DIR"
sudo chmod -R 755 "$TARGET_DIR"
sudo find "$TARGET_DIR" -type f -exec chmod 644 {} \;
log_success "Permissions set"

# Verify deployment
echo ""
log_info "Verifying deployment..."
DEPLOYED_FILES=$(find "$TARGET_DIR" -type f | wc -l)
log_success "Deployed files: $DEPLOYED_FILES"

# Verify critical files in target
for file in "${CRITICAL_FILES[@]}"; do
    if [ -f "$TARGET_DIR/$file" ]; then
        SIZE=$(stat -c%s "$TARGET_DIR/$file")
        TIMESTAMP=$(stat -c '%y' "$TARGET_DIR/$file" | cut -d'.' -f1)
        log_success "$file deployed (${SIZE} bytes, $TIMESTAMP)"
    else
        log_error "Critical file missing after deploy: $file"
        exit 1
    fi
done

# Verify src/ directory
if [ -d "$TARGET_DIR/src" ]; then
    SRC_FILES=$(find "$TARGET_DIR/src" -type f | wc -l)
    log_success "src/ directory deployed with $SRC_FILES files"
else
    log_error "src/ directory missing after deploy"
    exit 1
fi

# Summary
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}✅  Deployment Successful!${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📊 Deployment Info:"
echo "   • Source: $SOURCE_DIR"
echo "   • Target: $TARGET_DIR"
echo "   • Files: $DEPLOYED_FILES"
echo "   • Size: $TOTAL_SIZE"
echo ""
echo "🌐 Next Steps:"
echo "   1. Configure Nginx/Apache to serve from: $TARGET_DIR"
echo "   2. Test URL in browser"
echo "   3. Hard refresh: Ctrl+Shift+R"
echo ""
echo "📝 Example Nginx config:"
echo ""
echo "   location /editor {"
echo "       alias $TARGET_DIR;"
echo "       index index.html;"
echo "       try_files \$uri \$uri/ /editor/index.html;"
echo "   }"
echo ""
