# 🚀 Google Cloud Run Deployment Guide - SAAS-DND

**Complete guide for deploying SAAS-DND to Google Cloud Run**

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Architecture](#architecture)
4. [Quick Start](#quick-start)
5. [Detailed Setup](#detailed-setup)
6. [Deployment Process](#deployment-process)
7. [Configuration](#configuration)
8. [Monitoring & Maintenance](#monitoring--maintenance)
9. [Troubleshooting](#troubleshooting)
10. [Cost Estimation](#cost-estimation)

---

## 🎯 Overview

This guide covers deploying the SAAS-DND application to Google Cloud Run, a fully managed serverless platform that automatically scales your containerized applications.

### What's Included

- **Backend API**: Express.js REST API (Node.js)
- **Frontend Web**: React SPA with Vite (served via Nginx)
- **Database**: Cloud SQL PostgreSQL
- **Secrets Management**: Secret Manager
- **CI/CD**: Cloud Build

### Key Benefits

✅ **Serverless**: Pay only for what you use, scale to zero  
✅ **Auto-scaling**: Handles traffic spikes automatically  
✅ **Managed**: No server maintenance required  
✅ **Secure**: Built-in SSL, IAM, and secrets management  
✅ **Fast**: Global CDN and edge caching  

---

## 📦 Prerequisites

### Required Tools

1. **Google Cloud SDK (gcloud)**
   ```bash
   # Install gcloud CLI
   curl https://sdk.cloud.google.com | bash
   exec -l $SHELL
   gcloud init
   ```

2. **Docker** (for local testing)
   ```bash
   # Install Docker
   curl -fsSL https://get.docker.com -o get-docker.sh
   sh get-docker.sh
   ```

3. **Node.js 18+**
   ```bash
   node --version  # Should be v18.x.x or higher
   ```

### GCP Account Setup

1. Create a Google Cloud account: https://cloud.google.com
2. Create a new project or select existing one
3. Enable billing for the project
4. Install and authenticate gcloud CLI:
   ```bash
   gcloud auth login
   gcloud config set project YOUR_PROJECT_ID
   ```

---

## 🏗️ Architecture

### Cloud Run Services

```
┌─────────────────────────────────────────────────────────┐
│                    Internet (HTTPS)                      │
└────────────────────┬────────────────────────────────────┘
                     │
         ┌───────────┴───────────┐
         │                       │
         ▼                       ▼
┌─────────────────┐    ┌─────────────────┐
│  Cloud Run      │    │  Cloud Run      │
│  Frontend       │    │  Backend API    │
│  (Nginx+React)  │◄───┤  (Express.js)   │
│  Port: 8080     │    │  Port: 8080     │
└─────────────────┘    └────────┬────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │  Cloud SQL      │
                       │  PostgreSQL 15  │
                       └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │ Secret Manager  │
                       │ (Credentials)   │
                       └─────────────────┘
```

### Resource Allocation

| Service | CPU | Memory | Min Instances | Max Instances |
|---------|-----|--------|---------------|---------------|
| Backend | 1 vCPU | 512 Mi | 0 | 10 |
| Frontend | 1 vCPU | 256 Mi | 0 | 10 |
| Database | Shared | 614 Mi | - | - |

---

## ⚡ Quick Start

### 1. Clone and Setup

```bash
# Clone repository
git clone https://github.com/SebastianVernis/SAAS-DND.git
cd SAAS-DND

# Install dependencies
npm install
cd backend && npm install --legacy-peer-deps && cd ..
cd apps/web && npm install && cd ../..
```

### 2. Configure GCP

```bash
# Run setup script
cd scripts/cloud-run
./setup-gcp.sh
```

This script will:
- Enable required GCP APIs
- Create service accounts
- Set up Cloud SQL database
- Create secrets in Secret Manager
- Generate `.env.gcp` configuration file

### 3. Deploy

```bash
# Deploy to Cloud Run
./deploy.sh
```

### 4. Run Migrations

```bash
# Apply database schema
./migrate-db.sh
```

### 5. Access Your Application

After deployment, you'll receive two URLs:
- **Frontend**: `https://saas-dnd-frontend-XXXXXXXXXX-uc.a.run.app`
- **Backend API**: `https://saas-dnd-backend-XXXXXXXXXX-uc.a.run.app`

---

## 🔧 Detailed Setup

### Step 1: Enable GCP APIs

```bash
gcloud services enable \
    cloudbuild.googleapis.com \
    run.googleapis.com \
    containerregistry.googleapis.com \
    sqladmin.googleapis.com \
    secretmanager.googleapis.com
```

### Step 2: Create Service Account

```bash
# Create service account
gcloud iam service-accounts create saas-dnd-backend-sa \
    --display-name="SAAS-DND Backend Service Account"

# Grant permissions
gcloud projects add-iam-policy-binding PROJECT_ID \
    --member="serviceAccount:saas-dnd-backend-sa@PROJECT_ID.iam.gserviceaccount.com" \
    --role="roles/cloudsql.client"

gcloud projects add-iam-policy-binding PROJECT_ID \
    --member="serviceAccount:saas-dnd-backend-sa@PROJECT_ID.iam.gserviceaccount.com" \
    --role="roles/secretmanager.secretAccessor"
```

### Step 3: Create Cloud SQL Instance

```bash
# Create PostgreSQL instance
gcloud sql instances create saas-dnd-db \
    --database-version=POSTGRES_15 \
    --tier=db-f1-micro \
    --region=us-central1 \
    --root-password=YOUR_SECURE_PASSWORD \
    --storage-type=SSD \
    --storage-size=10GB \
    --backup \
    --backup-start-time=03:00

# Create database
gcloud sql databases create saasdnd \
    --instance=saas-dnd-db

# Get connection name
gcloud sql instances describe saas-dnd-db \
    --format="value(connectionName)"
```

### Step 4: Create Secrets

```bash
# Generate JWT secret
JWT_SECRET=$(openssl rand -base64 32)

# Create secrets
echo -n "$JWT_SECRET" | gcloud secrets create JWT_SECRET --data-file=-
echo -n "your-email@gmail.com" | gcloud secrets create SMTP_USER --data-file=-
echo -n "your-app-password" | gcloud secrets create SMTP_PASS --data-file=-

# Database URL (replace with your connection name)
DATABASE_URL="postgresql://postgres:PASSWORD@/saasdnd?host=/cloudsql/PROJECT:REGION:saas-dnd-db"
echo -n "$DATABASE_URL" | gcloud secrets create DATABASE_URL --data-file=-
```

### Step 5: Update Configuration Files

**Update `cloudbuild.yaml`:**

```yaml
substitutions:
  _REGION: 'us-central1'  # Your region
  _API_URL: 'https://saas-dnd-backend-XXXXXXXXXX-uc.a.run.app'  # Update after first deploy
```

**Update `cloud-run-backend.yaml`:**

Replace `PROJECT_ID` with your actual project ID.

**Update `cloud-run-frontend.yaml`:**

Replace `PROJECT_ID` with your actual project ID.

---

## 🚀 Deployment Process

### Option 1: Automated Deployment (Recommended)

```bash
cd scripts/cloud-run
./deploy.sh
```

### Option 2: Manual Deployment

#### Build and Push Backend

```bash
# Build Docker image
cd backend
docker build -t gcr.io/PROJECT_ID/saas-dnd-backend:latest .

# Push to Container Registry
docker push gcr.io/PROJECT_ID/saas-dnd-backend:latest

# Deploy to Cloud Run
gcloud run deploy saas-dnd-backend \
    --image gcr.io/PROJECT_ID/saas-dnd-backend:latest \
    --region us-central1 \
    --platform managed \
    --allow-unauthenticated \
    --port 8080 \
    --memory 512Mi \
    --cpu 1 \
    --min-instances 0 \
    --max-instances 10 \
    --set-env-vars NODE_ENV=production,PORT=8080 \
    --set-secrets DATABASE_URL=DATABASE_URL:latest,JWT_SECRET=JWT_SECRET:latest,SMTP_USER=SMTP_USER:latest,SMTP_PASS=SMTP_PASS:latest \
    --service-account saas-dnd-backend-sa@PROJECT_ID.iam.gserviceaccount.com
```

#### Build and Push Frontend

```bash
# Build Docker image
cd apps/web
docker build -t gcr.io/PROJECT_ID/saas-dnd-frontend:latest \
    --build-arg VITE_API_URL=https://saas-dnd-backend-XXXXXXXXXX-uc.a.run.app .

# Push to Container Registry
docker push gcr.io/PROJECT_ID/saas-dnd-frontend:latest

# Deploy to Cloud Run
gcloud run deploy saas-dnd-frontend \
    --image gcr.io/PROJECT_ID/saas-dnd-frontend:latest \
    --region us-central1 \
    --platform managed \
    --allow-unauthenticated \
    --port 8080 \
    --memory 256Mi \
    --cpu 1 \
    --min-instances 0 \
    --max-instances 10
```

### Option 3: Cloud Build (CI/CD)

```bash
# Submit build to Cloud Build
gcloud builds submit \
    --config=cloudbuild.yaml \
    --substitutions=_REGION=us-central1 \
    --timeout=30m
```

---

## ⚙️ Configuration

### Environment Variables

#### Backend Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Environment | `production` |
| `PORT` | Server port | `8080` |
| `DATABASE_URL` | PostgreSQL connection | `postgresql://...` |
| `JWT_SECRET` | JWT signing key | `random-string` |
| `JWT_EXPIRES_IN` | Token expiration | `7d` |
| `FRONTEND_URL` | Frontend URL | `https://...` |
| `SMTP_HOST` | Email server | `smtp.gmail.com` |
| `SMTP_PORT` | Email port | `587` |
| `SMTP_USER` | Email username | `user@gmail.com` |
| `SMTP_PASS` | Email password | `app-password` |

#### Frontend Build Arguments

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `https://saas-dnd-backend-...` |

### Update Environment Variables

```bash
# Update backend environment
gcloud run services update saas-dnd-backend \
    --region us-central1 \
    --set-env-vars FRONTEND_URL=https://new-frontend-url.app

# Or use the script
cd scripts/cloud-run
./update-env.sh
```

### Database Migrations

```bash
# Option 1: Use migration script
cd scripts/cloud-run
./migrate-db.sh

# Option 2: Manual migration
# Install Cloud SQL Proxy
curl -o cloud-sql-proxy https://storage.googleapis.com/cloud-sql-connectors/cloud-sql-proxy/v2.8.0/cloud-sql-proxy.linux.amd64
chmod +x cloud-sql-proxy

# Start proxy
./cloud-sql-proxy PROJECT:REGION:saas-dnd-db --port 5432 &

# Run migrations
cd backend
npm run db:push

# Stop proxy
pkill cloud-sql-proxy
```

---

## 📊 Monitoring & Maintenance

### View Logs

```bash
# Backend logs
gcloud run services logs read saas-dnd-backend \
    --region us-central1 \
    --limit 50

# Frontend logs
gcloud run services logs read saas-dnd-frontend \
    --region us-central1 \
    --limit 50

# Follow logs in real-time
gcloud run services logs tail saas-dnd-backend --region us-central1
```

### Monitor Metrics

```bash
# View service details
gcloud run services describe saas-dnd-backend --region us-central1

# View metrics in Cloud Console
# https://console.cloud.google.com/run
```

### Health Checks

```bash
# Backend health
curl https://saas-dnd-backend-XXXXXXXXXX-uc.a.run.app/health

# Frontend health
curl https://saas-dnd-frontend-XXXXXXXXXX-uc.a.run.app/health
```

### Scaling Configuration

```bash
# Update scaling settings
gcloud run services update saas-dnd-backend \
    --region us-central1 \
    --min-instances 1 \
    --max-instances 20 \
    --concurrency 100
```

### Database Backups

Cloud SQL automatically creates daily backups. To create manual backup:

```bash
gcloud sql backups create \
    --instance=saas-dnd-db \
    --description="Manual backup before update"
```

---

## 🔍 Troubleshooting

### Common Issues

#### 1. Service Not Responding

**Symptoms**: 502 Bad Gateway or timeout errors

**Solutions**:
```bash
# Check service status
gcloud run services describe saas-dnd-backend --region us-central1

# View recent logs
gcloud run services logs read saas-dnd-backend --region us-central1 --limit 100

# Check if container is starting
gcloud run revisions list --service saas-dnd-backend --region us-central1
```

#### 2. Database Connection Failed

**Symptoms**: Backend logs show database connection errors

**Solutions**:
```bash
# Verify Cloud SQL instance is running
gcloud sql instances describe saas-dnd-db

# Check DATABASE_URL secret
gcloud secrets versions access latest --secret=DATABASE_URL

# Verify service account has cloudsql.client role
gcloud projects get-iam-policy PROJECT_ID \
    --flatten="bindings[].members" \
    --filter="bindings.members:saas-dnd-backend-sa@*"
```

#### 3. Frontend Can't Connect to Backend

**Symptoms**: API calls fail with CORS or network errors

**Solutions**:
```bash
# Verify FRONTEND_URL is set correctly in backend
gcloud run services describe saas-dnd-backend \
    --region us-central1 \
    --format="value(spec.template.spec.containers[0].env)"

# Update FRONTEND_URL
gcloud run services update saas-dnd-backend \
    --region us-central1 \
    --set-env-vars FRONTEND_URL=https://correct-frontend-url.app

# Rebuild frontend with correct API URL
# Update _API_URL in cloudbuild.yaml and redeploy
```

#### 4. Build Failures

**Symptoms**: Cloud Build fails during deployment

**Solutions**:
```bash
# View build logs
gcloud builds list --limit 5
gcloud builds log BUILD_ID

# Common fixes:
# - Check Dockerfile syntax
# - Verify all dependencies are in package.json
# - Ensure .dockerignore doesn't exclude required files
# - Check build timeout (increase if needed)
```

#### 5. Out of Memory Errors

**Symptoms**: Container crashes with OOM errors

**Solutions**:
```bash
# Increase memory allocation
gcloud run services update saas-dnd-backend \
    --region us-central1 \
    --memory 1Gi

# Or update in cloud-run-backend.yaml and redeploy
```

### Debug Commands

```bash
# Get service URL
gcloud run services describe saas-dnd-backend \
    --region us-central1 \
    --format="value(status.url)"

# List all revisions
gcloud run revisions list \
    --service saas-dnd-backend \
    --region us-central1

# Rollback to previous revision
gcloud run services update-traffic saas-dnd-backend \
    --region us-central1 \
    --to-revisions REVISION_NAME=100

# Delete old revisions
gcloud run revisions delete REVISION_NAME \
    --region us-central1
```

---

## 💰 Cost Estimation

### Monthly Cost Breakdown (Estimated)

Based on moderate usage (1000 users, 100k requests/month):

| Service | Usage | Cost |
|---------|-------|------|
| **Cloud Run - Backend** | 100k requests, 50 GB-hours | ~$5 |
| **Cloud Run - Frontend** | 100k requests, 25 GB-hours | ~$3 |
| **Cloud SQL** | db-f1-micro, 10GB storage | ~$10 |
| **Container Registry** | 5GB storage | ~$0.25 |
| **Secret Manager** | 10 secrets, 1000 accesses | ~$0.10 |
| **Cloud Build** | 10 builds/month | Free tier |
| **Networking** | 10GB egress | ~$1 |
| **Total** | | **~$20/month** |

### Cost Optimization Tips

1. **Use Scale-to-Zero**: Set `min-instances: 0` for development
2. **Optimize Images**: Use multi-stage builds to reduce image size
3. **Enable CPU Throttling**: Reduce costs when idle
4. **Use Shared-Core Instances**: db-f1-micro for development
5. **Monitor Usage**: Set up billing alerts

```bash
# Set billing alert
gcloud alpha billing budgets create \
    --billing-account=BILLING_ACCOUNT_ID \
    --display-name="SAAS-DND Monthly Budget" \
    --budget-amount=50 \
    --threshold-rule=percent=50 \
    --threshold-rule=percent=90 \
    --threshold-rule=percent=100
```

---

## 🔐 Security Best Practices

### 1. Use Secret Manager

Never hardcode secrets in code or environment variables:

```bash
# Store secrets securely
echo -n "secret-value" | gcloud secrets create SECRET_NAME --data-file=-

# Reference in Cloud Run
--set-secrets SECRET_NAME=SECRET_NAME:latest
```

### 2. Enable IAM Authentication

For internal services, disable public access:

```bash
gcloud run services update saas-dnd-backend \
    --region us-central1 \
    --no-allow-unauthenticated
```

### 3. Use Service Accounts

Assign minimal permissions:

```bash
# Create service account with specific roles
gcloud iam service-accounts create backend-sa
gcloud projects add-iam-policy-binding PROJECT_ID \
    --member="serviceAccount:backend-sa@PROJECT_ID.iam.gserviceaccount.com" \
    --role="roles/cloudsql.client"
```

### 4. Enable VPC Connector

For private database access:

```bash
# Create VPC connector
gcloud compute networks vpc-access connectors create saas-dnd-connector \
    --region us-central1 \
    --range 10.8.0.0/28

# Use in Cloud Run
--vpc-connector saas-dnd-connector
```

### 5. Set Up Cloud Armor

Protect against DDoS and common attacks:

```bash
# Create security policy
gcloud compute security-policies create saas-dnd-policy \
    --description "SAAS-DND security policy"

# Add rules
gcloud compute security-policies rules create 1000 \
    --security-policy saas-dnd-policy \
    --expression "origin.region_code == 'CN'" \
    --action "deny-403"
```

---

## 📚 Additional Resources

### Documentation

- [Cloud Run Documentation](https://cloud.google.com/run/docs)
- [Cloud SQL Documentation](https://cloud.google.com/sql/docs)
- [Secret Manager Documentation](https://cloud.google.com/secret-manager/docs)
- [Cloud Build Documentation](https://cloud.google.com/build/docs)

### Useful Commands

```bash
# List all Cloud Run services
gcloud run services list

# Get service details
gcloud run services describe SERVICE_NAME --region REGION

# Update service
gcloud run services update SERVICE_NAME --region REGION [OPTIONS]

# Delete service
gcloud run services delete SERVICE_NAME --region REGION

# View quotas
gcloud compute project-info describe --project PROJECT_ID
```

### Support

- **GitHub Issues**: https://github.com/SebastianVernis/SAAS-DND/issues
- **GCP Support**: https://cloud.google.com/support
- **Community**: https://stackoverflow.com/questions/tagged/google-cloud-run

---

## 🎉 Next Steps

After successful deployment:

1. ✅ Set up custom domain with Cloud Run
2. ✅ Configure Cloud CDN for better performance
3. ✅ Set up monitoring and alerting
4. ✅ Configure automated backups
5. ✅ Implement CI/CD with GitHub Actions
6. ✅ Set up staging environment
7. ✅ Configure load testing
8. ✅ Implement rate limiting

---

**Last Updated**: December 28, 2025  
**Version**: 1.0.0  
**Maintained by**: Sebastian Vernis

---

## 📝 Changelog

### v1.0.0 (2025-12-28)
- Initial Google Cloud Run deployment guide
- Dockerfiles for backend and frontend
- Cloud Build configuration
- Deployment scripts
- Comprehensive troubleshooting guide
