#!/bin/bash
# Update environment variables for Cloud Run services
# This script updates environment variables without redeploying

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${GREEN}⚙️  Update Cloud Run Environment Variables${NC}"
echo "==========================================="

# Load configuration
if [ -f .env.gcp ]; then
    source .env.gcp
else
    read -p "Enter your GCP Project ID: " PROJECT_ID
    read -p "Enter region (default: us-central1): " REGION
    REGION=${REGION:-us-central1}
fi

# Menu
echo ""
echo "Select service to update:"
echo "1) Backend API"
echo "2) Frontend Web"
echo "3) Both"
read -p "Choice: " CHOICE

update_backend() {
    echo -e "${YELLOW}Updating backend environment variables...${NC}"
    
    read -p "Enter FRONTEND_URL: " FRONTEND_URL
    
    gcloud run services update saas-dnd-backend \
        --region=$REGION \
        --set-env-vars FRONTEND_URL=$FRONTEND_URL
    
    echo -e "${GREEN}✅ Backend updated${NC}"
}

update_frontend() {
    echo -e "${YELLOW}⚠️  Frontend requires rebuild to update VITE_API_URL${NC}"
    echo "Run deployment with updated API URL in cloudbuild.yaml"
}

case $CHOICE in
    1)
        update_backend
        ;;
    2)
        update_frontend
        ;;
    3)
        update_backend
        update_frontend
        ;;
    *)
        echo -e "${RED}Invalid choice${NC}"
        exit 1
        ;;
esac

echo ""
echo -e "${GREEN}✅ Update complete${NC}"
