#!/bin/bash

# ============================================================================
# SAAS-DND - Prerequisites Checker
# ============================================================================
# This script checks if all prerequisites are met before deployment
# ============================================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Counters
PASSED=0
FAILED=0
WARNINGS=0

# ============================================================================
# Helper Functions
# ============================================================================

print_header() {
    echo ""
    echo -e "${BLUE}============================================================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}============================================================================${NC}"
    echo ""
}

print_section() {
    echo ""
    echo -e "${YELLOW}>>> $1${NC}"
    echo ""
}

check_pass() {
    echo -e "${GREEN}✓${NC} $1"
    ((PASSED++))
}

check_fail() {
    echo -e "${RED}✗${NC} $1"
    ((FAILED++))
}

check_warn() {
    echo -e "${YELLOW}⚠${NC} $1"
    ((WARNINGS++))
}

# ============================================================================
# Check Functions
# ============================================================================

check_command() {
    local cmd=$1
    local name=$2
    local install_url=$3
    
    if command -v "$cmd" &> /dev/null; then
        local version=$($cmd --version 2>&1 | head -n 1)
        check_pass "$name is installed: $version"
        return 0
    else
        check_fail "$name is NOT installed"
        echo "   Install from: $install_url"
        return 1
    fi
}

check_gcloud_auth() {
    if gcloud auth list --filter=status:ACTIVE --format="value(account)" &> /dev/null; then
        local account=$(gcloud auth list --filter=status:ACTIVE --format="value(account)" 2>/dev/null | head -n 1)
        if [ -n "$account" ]; then
            check_pass "gcloud authenticated as: $account"
            return 0
        fi
    fi
    check_fail "gcloud is NOT authenticated"
    echo "   Run: gcloud auth login"
    return 1
}

check_gcloud_project() {
    local project=$(gcloud config get-value project 2>/dev/null)
    if [ -n "$project" ] && [ "$project" != "(unset)" ]; then
        check_pass "GCP project set: $project"
        echo "   Project ID: $project"
        return 0
    else
        check_fail "No GCP project configured"
        echo "   Run: gcloud config set project YOUR_PROJECT_ID"
        return 1
    fi
}

check_billing() {
    local project=$(gcloud config get-value project 2>/dev/null)
    if [ -n "$project" ] && [ "$project" != "(unset)" ]; then
        if gcloud beta billing projects describe "$project" &> /dev/null; then
            local billing_enabled=$(gcloud beta billing projects describe "$project" --format="value(billingEnabled)" 2>/dev/null)
            if [ "$billing_enabled" = "True" ]; then
                check_pass "Billing is enabled for project"
                return 0
            fi
        fi
    fi
    check_fail "Billing is NOT enabled"
    echo "   Enable at: https://console.cloud.google.com/billing"
    return 1
}

check_api() {
    local api=$1
    local name=$2
    
    if gcloud services list --enabled --filter="name:$api" --format="value(name)" 2>/dev/null | grep -q "$api"; then
        check_pass "$name API is enabled"
        return 0
    else
        check_fail "$name API is NOT enabled"
        echo "   Enable: gcloud services enable $api"
        return 1
    fi
}

check_node_version() {
    if command -v node &> /dev/null; then
        local version=$(node --version | sed 's/v//')
        local major=$(echo "$version" | cut -d. -f1)
        
        if [ "$major" -ge 18 ]; then
            check_pass "Node.js version is sufficient: v$version"
            return 0
        else
            check_fail "Node.js version is too old: v$version (need v18+)"
            echo "   Install Node.js 18+: https://nodejs.org"
            return 1
        fi
    else
        check_fail "Node.js is NOT installed"
        echo "   Install from: https://nodejs.org"
        return 1
    fi
}

check_env_file() {
    if [ -f ".env.example" ]; then
        check_pass ".env.example file exists"
        return 0
    else
        check_warn ".env.example file not found"
        return 1
    fi
}

check_dependencies() {
    if [ -f "package.json" ]; then
        if [ -d "node_modules" ]; then
            check_pass "Dependencies are installed"
            return 0
        else
            check_warn "Dependencies not installed"
            echo "   Run: npm install"
            return 1
        fi
    else
        check_fail "package.json not found"
        return 1
    fi
}

# ============================================================================
# Main Checks
# ============================================================================

print_header "SAAS-DND Prerequisites Checker"

echo "This script will verify that all prerequisites are met for deployment."
echo "Checking your system configuration..."

# Check 1: Command Line Tools
print_section "1. Command Line Tools"

check_command "gcloud" "Google Cloud SDK" "https://cloud.google.com/sdk/docs/install"
check_command "docker" "Docker" "https://docs.docker.com/get-docker/" || check_warn "Docker is optional but recommended for local testing"
check_command "git" "Git" "https://git-scm.com/downloads"
check_node_version

# Check 2: Google Cloud Authentication
print_section "2. Google Cloud Authentication"

check_gcloud_auth
check_gcloud_project

# Check 3: Google Cloud Configuration
print_section "3. Google Cloud Configuration"

check_billing

# Check 4: Required APIs
print_section "4. Required Google Cloud APIs"

check_api "cloudbuild.googleapis.com" "Cloud Build"
check_api "run.googleapis.com" "Cloud Run"
check_api "containerregistry.googleapis.com" "Container Registry"
check_api "sqladmin.googleapis.com" "Cloud SQL Admin"
check_api "secretmanager.googleapis.com" "Secret Manager"

# Check 5: Project Structure
print_section "5. Project Structure"

if [ -d "backend" ]; then
    check_pass "Backend directory exists"
else
    check_fail "Backend directory not found"
fi

if [ -d "apps/web" ]; then
    check_pass "Frontend directory exists"
else
    check_fail "Frontend directory not found"
fi

if [ -d "scripts/cloud-run" ]; then
    check_pass "Deployment scripts directory exists"
else
    check_fail "Deployment scripts directory not found"
fi

# Check 6: Configuration Files
print_section "6. Configuration Files"

check_env_file

if [ -f "backend/Dockerfile" ]; then
    check_pass "Backend Dockerfile exists"
else
    check_fail "Backend Dockerfile not found"
fi

if [ -f "apps/web/Dockerfile" ]; then
    check_pass "Frontend Dockerfile exists"
else
    check_fail "Frontend Dockerfile not found"
fi

if [ -f "cloudbuild.yaml" ]; then
    check_pass "cloudbuild.yaml exists"
else
    check_fail "cloudbuild.yaml not found"
fi

# Check 7: Dependencies
print_section "7. Project Dependencies"

check_dependencies

# Check 8: Credentials Reminder
print_section "8. Required Credentials (Manual Check)"

echo "Please ensure you have the following credentials ready:"
echo ""
echo "  [ ] JWT_SECRET (generate: openssl rand -base64 32)"
echo "  [ ] Database password (generate: openssl rand -base64 24)"
echo "  [ ] SMTP credentials (Gmail App Password or SendGrid API Key)"
echo "  [ ] OAuth credentials (optional - Google/GitHub Client ID & Secret)"
echo ""
echo "These will be needed when running setup-gcp.sh"

# ============================================================================
# Summary
# ============================================================================

print_header "Prerequisites Check Summary"

echo -e "${GREEN}Passed:${NC}   $PASSED"
echo -e "${YELLOW}Warnings:${NC} $WARNINGS"
echo -e "${RED}Failed:${NC}   $FAILED"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✓ All critical prerequisites are met!${NC}"
    echo ""
    echo "Next steps:"
    echo "  1. Prepare your credentials (JWT_SECRET, SMTP, etc.)"
    echo "  2. Run: cd scripts/cloud-run && ./setup-gcp.sh"
    echo "  3. Run: ./deploy.sh"
    echo "  4. Run: ./migrate-db.sh"
    echo ""
    exit 0
else
    echo -e "${RED}✗ Some prerequisites are missing.${NC}"
    echo ""
    echo "Please fix the failed checks above before proceeding."
    echo ""
    echo "For detailed instructions, see:"
    echo "  - PREREQUISITES.md"
    echo "  - QUICK_START_PREREQUISITES.md"
    echo ""
    exit 1
fi
