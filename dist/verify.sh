#!/bin/bash
# Verification script for deployed editor
# Checks integrity and functionality of the deployment package

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

EDITOR_DIR="${1:-./editor}"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔍  SAAS-DND Editor - Package Verification"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Verify directory exists
if [ ! -d "$EDITOR_DIR" ]; then
    echo -e "${RED}✗${NC} Editor directory not found: $EDITOR_DIR"
    exit 1
fi

echo -e "${BLUE}ℹ${NC} Verifying: $EDITOR_DIR"
echo ""

# Check critical files
echo "📄 Critical Files:"
CRITICAL_FILES=("index.html" "script.js" "style.css" "DEPLOY.md" "MANIFEST.json")
PASSED=0
FAILED=0

for file in "${CRITICAL_FILES[@]}"; do
    if [ -f "$EDITOR_DIR/$file" ]; then
        SIZE=$(stat -c%s "$EDITOR_DIR/$file" 2>/dev/null || stat -f%z "$EDITOR_DIR/$file")
        SIZE_KB=$((SIZE / 1024))
        echo -e "${GREEN}✓${NC} $file (${SIZE_KB}KB)"
        PASSED=$((PASSED + 1))
    else
        echo -e "${RED}✗${NC} $file - MISSING"
        FAILED=$((FAILED + 1))
    fi
done

echo ""

# Check src directory
echo "📁 Source Modules:"
if [ -d "$EDITOR_DIR/src" ]; then
    SRC_FILES=$(find "$EDITOR_DIR/src" -type f | wc -l)
    SRC_DIRS=$(find "$EDITOR_DIR/src" -type d | wc -l)
    echo -e "${GREEN}✓${NC} src/ directory found"
    echo -e "${BLUE}ℹ${NC} Files: $SRC_FILES"
    echo -e "${BLUE}ℹ${NC} Directories: $SRC_DIRS"
    
    # Check key modules
    KEY_MODULES=("core/resizeManager.js" "core/undoRedo.js" "init.js" "storage/projectManager.js")
    for module in "${KEY_MODULES[@]}"; do
        if [ -f "$EDITOR_DIR/src/$module" ]; then
            echo -e "${GREEN}✓${NC} src/$module"
            PASSED=$((PASSED + 1))
        else
            echo -e "${RED}✗${NC} src/$module - MISSING"
            FAILED=$((FAILED + 1))
        fi
    done
else
    echo -e "${RED}✗${NC} src/ directory - MISSING"
    FAILED=$((FAILED + 1))
fi

echo ""

# Check for external dependencies
echo "🔗 External Dependencies:"
HTTP_DEPS=$(grep -r "https://" "$EDITOR_DIR" --include="*.js" --include="*.html" 2>/dev/null | grep -v "via.placeholder" | grep -v "example.com" | grep -v "EditorConfig.org" | wc -l || echo 0)

if [ "$HTTP_DEPS" -eq 0 ]; then
    echo -e "${GREEN}✓${NC} No critical external dependencies"
    PASSED=$((PASSED + 1))
else
    echo -e "${YELLOW}⚠${NC} Found $HTTP_DEPS external references (check if critical)"
fi

# Check for relative paths
echo ""
echo "📍 Path Configuration:"
ABSOLUTE_PATHS=$(grep -r "src=\"/[^v]" "$EDITOR_DIR" --include="*.html" 2>/dev/null | wc -l || echo 0)

if [ "$ABSOLUTE_PATHS" -eq 0 ]; then
    echo -e "${GREEN}✓${NC} All paths are relative"
    PASSED=$((PASSED + 1))
else
    echo -e "${YELLOW}⚠${NC} Found $ABSOLUTE_PATHS absolute paths (may cause issues)"
fi

# Total size
echo ""
echo "💾 Package Size:"
TOTAL_SIZE=$(du -sh "$EDITOR_DIR" | cut -f1)
TOTAL_FILES=$(find "$EDITOR_DIR" -type f | wc -l)
echo -e "${BLUE}ℹ${NC} Total: $TOTAL_SIZE ($TOTAL_FILES files)"

# Summary
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✅  Verification Passed!${NC}"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo -e "${GREEN}✓${NC} Checks passed: $PASSED"
    echo -e "${BLUE}ℹ${NC} Package is ready for deployment"
    echo ""
    exit 0
else
    echo -e "${RED}❌  Verification Failed!${NC}"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo -e "${GREEN}✓${NC} Checks passed: $PASSED"
    echo -e "${RED}✗${NC} Checks failed: $FAILED"
    echo ""
    echo -e "${RED}⚠${NC}  Package has issues - fix before deploying"
    echo ""
    exit 1
fi
