#!/bin/bash
# Setup Google Cloud Platform for SAAS-DND deployment
# This script configures GCP project, enables APIs, and creates necessary resources

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 SAAS-DND Google Cloud Platform Setup${NC}"
echo "=========================================="

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo -e "${RED}❌ gcloud CLI is not installed${NC}"
    echo "Please install it from: https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# Get project ID
read -p "Enter your GCP Project ID: " PROJECT_ID
if [ -z "$PROJECT_ID" ]; then
    echo -e "${RED}❌ Project ID is required${NC}"
    exit 1
fi

# Set project
echo -e "${YELLOW}Setting GCP project...${NC}"
gcloud config set project $PROJECT_ID

# Get region
read -p "Enter your preferred region (default: us-central1): " REGION
REGION=${REGION:-us-central1}

echo -e "${YELLOW}Using region: $REGION${NC}"

# Enable required APIs
echo -e "${YELLOW}Enabling required GCP APIs...${NC}"
gcloud services enable \
    cloudbuild.googleapis.com \
    run.googleapis.com \
    containerregistry.googleapis.com \
    sqladmin.googleapis.com \
    secretmanager.googleapis.com \
    cloudresourcemanager.googleapis.com

echo -e "${GREEN}✅ APIs enabled${NC}"

# Create service account for backend
echo -e "${YELLOW}Creating service account for backend...${NC}"
gcloud iam service-accounts create saas-dnd-backend-sa \
    --display-name="SAAS-DND Backend Service Account" \
    --description="Service account for SAAS-DND backend API" \
    || echo "Service account already exists"

# Grant necessary permissions
echo -e "${YELLOW}Granting permissions to service account...${NC}"
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:saas-dnd-backend-sa@$PROJECT_ID.iam.gserviceaccount.com" \
    --role="roles/cloudsql.client"

gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:saas-dnd-backend-sa@$PROJECT_ID.iam.gserviceaccount.com" \
    --role="roles/secretmanager.secretAccessor"

echo -e "${GREEN}✅ Service account configured${NC}"

# Create Cloud SQL instance (PostgreSQL)
echo -e "${YELLOW}Creating Cloud SQL PostgreSQL instance...${NC}"
read -p "Create Cloud SQL instance? (y/n): " CREATE_SQL
if [ "$CREATE_SQL" = "y" ]; then
    read -p "Enter database password: " DB_PASSWORD
    
    gcloud sql instances create saas-dnd-db \
        --database-version=POSTGRES_15 \
        --tier=db-f1-micro \
        --region=$REGION \
        --root-password=$DB_PASSWORD \
        --storage-type=SSD \
        --storage-size=10GB \
        --backup \
        --backup-start-time=03:00 \
        || echo "SQL instance already exists"
    
    # Create database
    gcloud sql databases create saasdnd \
        --instance=saas-dnd-db \
        || echo "Database already exists"
    
    # Get connection name
    CONNECTION_NAME=$(gcloud sql instances describe saas-dnd-db --format="value(connectionName)")
    echo -e "${GREEN}✅ Cloud SQL instance created${NC}"
    echo -e "${YELLOW}Connection name: $CONNECTION_NAME${NC}"
    
    # Create DATABASE_URL secret
    DATABASE_URL="postgresql://postgres:$DB_PASSWORD@/$saasdnd?host=/cloudsql/$CONNECTION_NAME"
    echo -n "$DATABASE_URL" | gcloud secrets create DATABASE_URL --data-file=- || echo "Secret already exists"
else
    echo -e "${YELLOW}⚠️  Skipping Cloud SQL creation${NC}"
fi

# Create secrets
echo -e "${YELLOW}Creating secrets in Secret Manager...${NC}"

# JWT_SECRET
read -p "Enter JWT secret (or press enter to generate): " JWT_SECRET
if [ -z "$JWT_SECRET" ]; then
    JWT_SECRET=$(openssl rand -base64 32)
fi
echo -n "$JWT_SECRET" | gcloud secrets create JWT_SECRET --data-file=- || echo "Secret already exists"

# SMTP credentials
read -p "Enter SMTP user (email): " SMTP_USER
read -p "Enter SMTP password: " SMTP_PASS
echo -n "$SMTP_USER" | gcloud secrets create SMTP_USER --data-file=- || echo "Secret already exists"
echo -n "$SMTP_PASS" | gcloud secrets create SMTP_PASS --data-file=- || echo "Secret already exists"

echo -e "${GREEN}✅ Secrets created${NC}"

# Create .env.gcp file for reference
cat > .env.gcp << EOF
# GCP Configuration
PROJECT_ID=$PROJECT_ID
REGION=$REGION
CONNECTION_NAME=$CONNECTION_NAME

# Service URLs (update after deployment)
BACKEND_URL=https://saas-dnd-backend-XXXXXXXXXX-uc.a.run.app
FRONTEND_URL=https://saas-dnd-frontend-XXXXXXXXXX-uc.a.run.app
EOF

echo -e "${GREEN}✅ GCP setup complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Update cloudbuild.yaml with your PROJECT_ID and REGION"
echo "2. Run ./deploy.sh to deploy the application"
echo "3. Update FRONTEND_URL in backend environment variables after deployment"
echo ""
echo "Configuration saved to .env.gcp"
