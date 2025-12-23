#!/bin/bash
# 🧪 Run All Tests Script - SAAS-DND
# Ejecuta todos los tests del proyecto (backend + frontend + E2E)

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}🧪 SAAS-DND - Test Suite Runner${NC}"
echo "================================="
echo ""

FAILED=0

# 1. Backend Tests (Jest)
echo -e "${BLUE}1/3 Running Backend Tests (Jest)...${NC}"
cd backend
if npm test; then
    echo -e "${GREEN}✅ Backend tests passed${NC}"
else
    echo -e "${RED}❌ Backend tests failed${NC}"
    FAILED=$((FAILED + 1))
fi
cd ..
echo ""

# 2. Frontend Tests (Vitest)
echo -e "${BLUE}2/3 Running Frontend Tests (Vitest)...${NC}"
cd apps/web
if npm test -- --run; then
    echo -e "${GREEN}✅ Frontend tests passed${NC}"
else
    echo -e "${RED}❌ Frontend tests failed${NC}"
    FAILED=$((FAILED + 1))
fi
cd ../..
echo ""

# 3. E2E Tests (Playwright)
echo -e "${BLUE}3/3 Running E2E Tests (Playwright)...${NC}"
if npx playwright test; then
    echo -e "${GREEN}✅ E2E tests passed${NC}"
else
    echo -e "${RED}❌ E2E tests failed${NC}"
    FAILED=$((FAILED + 1))
fi
echo ""

# Summary
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ All test suites passed!${NC}"
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    exit 0
else
    echo -e "${RED}❌ $FAILED test suite(s) failed${NC}"
    echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    exit 1
fi
