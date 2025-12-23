#!/bin/bash
# 🔧 Development Setup Script - SAAS-DND
# Configuración completa del entorno de desarrollo

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}🔧 SAAS-DND - Development Setup${NC}"
echo "=================================="
echo ""

# Check if in root directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: Run from SAAS-DND root directory${NC}"
    exit 1
fi

# 1. Install dependencies
echo -e "${BLUE}Step 1/5: Installing dependencies...${NC}"
./tools/scripts/install-dependencies.sh
echo ""

# 2. Setup environment files
echo -e "${BLUE}Step 2/5: Setting up environment files...${NC}"

if [ ! -f "backend/.env" ]; then
    cp backend/.env.example backend/.env
    echo -e "${GREEN}✅ Created backend/.env${NC}"
    echo -e "${YELLOW}⚠️  Please edit backend/.env with your configuration${NC}"
else
    echo -e "${YELLOW}⚠️  backend/.env already exists, skipping${NC}"
fi

if [ ! -f "apps/web/.env" ]; then
    cp apps/web/.env.example apps/web/.env 2>/dev/null || echo "VITE_API_URL=http://localhost:3000" > apps/web/.env
    echo -e "${GREEN}✅ Created apps/web/.env${NC}"
else
    echo -e "${YELLOW}⚠️  apps/web/.env already exists, skipping${NC}"
fi

echo ""

# 3. Setup database
echo -e "${BLUE}Step 3/5: Database setup...${NC}"
read -p "Setup database now? (requires PostgreSQL running) (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    cd backend
    npm run db:push
    cd ..
    echo -e "${GREEN}✅ Database schema created${NC}"
    
    read -p "Seed database with demo data? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        cd backend
        npm run db:seed 2>/dev/null || echo -e "${YELLOW}⚠️  Seed script not available${NC}"
        cd ..
    fi
else
    echo -e "${YELLOW}⏭️  Skipping database setup${NC}"
    echo -e "${YELLOW}   Run manually: cd backend && npm run db:push${NC}"
fi

echo ""

# 4. Setup Git hooks
echo -e "${BLUE}Step 4/5: Setting up Git hooks...${NC}"
if [ -d ".husky" ]; then
    chmod +x .husky/pre-commit .husky/commit-msg 2>/dev/null || true
    echo -e "${GREEN}✅ Git hooks configured${NC}"
else
    echo -e "${YELLOW}⚠️  Husky not configured${NC}"
fi

echo ""

# 5. Verify setup
echo -e "${BLUE}Step 5/5: Verifying setup...${NC}"

# Check Node version
NODE_VERSION=$(node --version)
echo -e "  Node.js: ${GREEN}${NODE_VERSION}${NC}"

# Check if backend deps installed
if [ -d "backend/node_modules" ]; then
    echo -e "  Backend deps: ${GREEN}✓${NC}"
else
    echo -e "  Backend deps: ${RED}✗${NC}"
fi

# Check if frontend deps installed
if [ -d "apps/web/node_modules" ]; then
    echo -e "  Frontend deps: ${GREEN}✓${NC}"
else
    echo -e "  Frontend deps: ${RED}✗${NC}"
fi

# Check if .env exists
if [ -f "backend/.env" ]; then
    echo -e "  Backend .env: ${GREEN}✓${NC}"
else
    echo -e "  Backend .env: ${RED}✗${NC}"
fi

echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ Development setup complete!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${BLUE}📋 Next steps:${NC}"
echo "  1. Edit backend/.env with your database credentials"
echo "  2. Start dev servers:"
echo "     ${BLUE}npm run dev${NC}  # All services"
echo "  3. Access:"
echo "     - Frontend: http://localhost:5173"
echo "     - API: http://localhost:3000/api"
echo "     - Editor: Open vanilla-editor/index.html"
echo ""
echo "📚 Documentation:"
echo "  - Quick Start: docs/guides/QUICK_START.md"
echo "  - Agent Guide: docs/guides/AGENTS.md"
echo "  - Deployment: DEPLOYMENT.md"
echo ""
