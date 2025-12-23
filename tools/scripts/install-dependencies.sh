#!/bin/bash
# 📦 Install Dependencies Script - SAAS-DND
# Instala todas las dependencias del proyecto (root, backend, frontend)

set -e  # Exit on error

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}📦 SAAS-DND - Dependency Installation${NC}"
echo "========================================"
echo ""

# Check if in correct directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: package.json not found${NC}"
    echo "Please run this script from the SAAS-DND root directory"
    exit 1
fi

# Detect package manager
if command -v pnpm &> /dev/null; then
    PKG_MANAGER="pnpm"
    echo -e "${GREEN}✓ Using pnpm${NC}"
elif command -v npm &> /dev/null; then
    PKG_MANAGER="npm"
    echo -e "${GREEN}✓ Using npm${NC}"
else
    echo -e "${RED}❌ No package manager found (npm or pnpm required)${NC}"
    exit 1
fi

echo ""

# 1. Root dependencies
echo -e "${BLUE}1/4 Installing root dependencies...${NC}"
$PKG_MANAGER install
echo -e "${GREEN}✅ Root dependencies installed${NC}"
echo ""

# 2. Backend dependencies
echo -e "${BLUE}2/4 Installing backend dependencies...${NC}"
cd backend
npm install
cd ..
echo -e "${GREEN}✅ Backend dependencies installed${NC}"
echo ""

# 3. Frontend dependencies
echo -e "${BLUE}3/4 Installing frontend dependencies...${NC}"
cd apps/web
npm install
cd ../..
echo -e "${GREEN}✅ Frontend dependencies installed${NC}"
echo ""

# 4. Playwright browsers (optional)
echo -e "${BLUE}4/4 Installing Playwright browsers (optional)...${NC}"
read -p "Install Playwright browsers for E2E testing? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    npx playwright install chromium
    echo -e "${GREEN}✅ Playwright browsers installed${NC}"
else
    echo -e "${BLUE}⏭️  Skipping Playwright browsers${NC}"
fi

echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ All dependencies installed successfully!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "📋 Next steps:"
echo "  1. Configure environment: cp backend/.env.example backend/.env"
echo "  2. Setup database: cd backend && npm run db:push"
echo "  3. Start dev servers: npm run dev"
echo ""
echo "📚 See DEPLOYMENT.md for complete deployment guide"
