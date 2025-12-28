#!/bin/bash
# Deploy SAAS-DND to Google Cloud Run
# This script builds and deploys both backend and frontend services

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 SAAS-DND Cloud Run Deployment${NC}"
echo "===================================="

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo -e "${RED}❌ gcloud CLI is not installed${NC}"
    exit 1
fi

# Load configuration
if [ -f .env.gcp ]; then
    source .env.gcp
    echo -e "${GREEN}✅ Loaded configuration from .env.gcp${NC}"
else
    echo -e "${YELLOW}⚠️  .env.gcp not found, using defaults${NC}"
    read -p "Enter your GCP Project ID: " PROJECT_ID
    read -p "Enter region (default: us-central1): " REGION
    REGION=${REGION:-us-central1}
fi

# Confirm deployment
echo ""
echo -e "${BLUE}Deployment Configuration:${NC}"
echo "  Project ID: $PROJECT_ID"
echo "  Region: $REGION"
echo ""
read -p "Continue with deployment? (y/n): " CONFIRM
if [ "$CONFIRM" != "y" ]; then
    echo "Deployment cancelled"
    exit 0
fi

# Set project
gcloud config set project $PROJECT_ID

# Build and deploy using Cloud Build
echo -e "${YELLOW}Starting Cloud Build...${NC}"
gcloud builds submit \
    --config=cloudbuild.yaml \
    --substitutions=_REGION=$REGION \
    --timeout=30m

echo -e "${GREEN}✅ Deployment complete!${NC}"

# Get service URLs
echo ""
echo -e "${BLUE}Getting service URLs...${NC}"
BACKEND_URL=$(gcloud run services describe saas-dnd-backend --region=$REGION --format="value(status.url)")
FRONTEND_URL=$(gcloud run services describe saas-dnd-frontend --region=$REGION --format="value(status.url)")

echo ""
echo -e "${GREEN}🎉 Deployment successful!${NC}"
echo ""
echo "Service URLs:"
echo "  Backend API: $BACKEND_URL"
echo "  Frontend Web: $FRONTEND_URL"
echo ""
echo "Next steps:"
echo "1. Update FRONTEND_URL environment variable in backend service:"
echo "   gcloud run services update saas-dnd-backend --region=$REGION --set-env-vars FRONTEND_URL=$FRONTEND_URL"
echo ""
echo "2. Update API URL in frontend (rebuild with correct VITE_API_URL)"
echo ""
echo "3. Run database migrations:"
echo "   ./migrate-db.sh"
echo ""
echo "4. Test the deployment:"
echo "   curl $BACKEND_URL/health"
echo "   curl $FRONTEND_URL/health"

# Save URLs to .env.gcp
if [ -f .env.gcp ]; then
    sed -i "s|BACKEND_URL=.*|BACKEND_URL=$BACKEND_URL|" .env.gcp
    sed -i "s|FRONTEND_URL=.*|FRONTEND_URL=$FRONTEND_URL|" .env.gcp
    echo ""
    echo -e "${GREEN}✅ URLs saved to .env.gcp${NC}"
fi
