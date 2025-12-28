# 🚀 Google Cloud Run Deployment Checklist

Quick reference checklist for deploying SAAS-DND to Google Cloud Run.

---

## ✅ Pre-Deployment Checklist

### Local Environment
- [ ] Node.js 18+ installed
- [ ] npm/pnpm installed
- [ ] Git repository cloned
- [ ] Dependencies installed (`npm install`)
- [ ] Frontend builds successfully (`cd apps/web && npm run build`)
- [ ] Backend syntax validated (`cd backend && node -c src/server.js`)

### GCP Account
- [ ] Google Cloud account created
- [ ] Billing enabled
- [ ] Project created
- [ ] gcloud CLI installed
- [ ] Authenticated with gcloud (`gcloud auth login`)
- [ ] Project set (`gcloud config set project PROJECT_ID`)

---

## 🔧 Setup Phase

### 1. Enable APIs
```bash
gcloud services enable \
    cloudbuild.googleapis.com \
    run.googleapis.com \
    containerregistry.googleapis.com \
    sqladmin.googleapis.com \
    secretmanager.googleapis.com
```
- [ ] APIs enabled successfully

### 2. Service Account
```bash
gcloud iam service-accounts create saas-dnd-backend-sa
```
- [ ] Service account created
- [ ] Permissions granted (cloudsql.client, secretmanager.secretAccessor)

### 3. Cloud SQL
```bash
gcloud sql instances create saas-dnd-db \
    --database-version=POSTGRES_15 \
    --tier=db-f1-micro \
    --region=us-central1
```
- [ ] PostgreSQL instance created
- [ ] Database `saasdnd` created
- [ ] Connection name noted

### 4. Secrets
```bash
echo -n "secret" | gcloud secrets create SECRET_NAME --data-file=-
```
- [ ] JWT_SECRET created
- [ ] DATABASE_URL created
- [ ] SMTP_USER created
- [ ] SMTP_PASS created

### 5. Configuration Files
- [ ] `cloudbuild.yaml` updated with PROJECT_ID
- [ ] `cloud-run-backend.yaml` updated
- [ ] `cloud-run-frontend.yaml` updated
- [ ] `.env.gcp` file generated

---

## 🚀 Deployment Phase

### 1. Build Images
```bash
cd backend
docker build -t gcr.io/PROJECT_ID/saas-dnd-backend:latest .
cd ../apps/web
docker build -t gcr.io/PROJECT_ID/saas-dnd-frontend:latest .
```
- [ ] Backend image built
- [ ] Frontend image built

### 2. Push Images
```bash
docker push gcr.io/PROJECT_ID/saas-dnd-backend:latest
docker push gcr.io/PROJECT_ID/saas-dnd-frontend:latest
```
- [ ] Backend image pushed
- [ ] Frontend image pushed

### 3. Deploy Services
```bash
gcloud run deploy saas-dnd-backend --image gcr.io/PROJECT_ID/saas-dnd-backend:latest
gcloud run deploy saas-dnd-frontend --image gcr.io/PROJECT_ID/saas-dnd-frontend:latest
```
- [ ] Backend deployed
- [ ] Frontend deployed
- [ ] Service URLs obtained

### 4. Database Migration
```bash
cd scripts/cloud-run
./migrate-db.sh
```
- [ ] Cloud SQL Proxy installed
- [ ] Migrations executed
- [ ] Schema applied

### 5. Update Environment
```bash
gcloud run services update saas-dnd-backend \
    --set-env-vars FRONTEND_URL=https://frontend-url.app
```
- [ ] FRONTEND_URL updated in backend
- [ ] Frontend rebuilt with correct API_URL (if needed)

---

## ✅ Post-Deployment Verification

### Health Checks
```bash
curl https://BACKEND_URL/health
curl https://FRONTEND_URL/health
```
- [ ] Backend health check passes
- [ ] Frontend health check passes

### Functionality Tests
- [ ] Frontend loads in browser
- [ ] Can access registration page
- [ ] Backend API responds to requests
- [ ] Database connection works

### Monitoring
```bash
gcloud run services logs read saas-dnd-backend --region us-central1
```
- [ ] No errors in backend logs
- [ ] No errors in frontend logs
- [ ] Services auto-scaling correctly

---

## 🔐 Security Checklist

- [ ] Secrets stored in Secret Manager (not in code)
- [ ] Service accounts have minimal permissions
- [ ] Database has strong password
- [ ] JWT_SECRET is random and secure
- [ ] CORS configured correctly
- [ ] Rate limiting enabled
- [ ] HTTPS enforced (automatic with Cloud Run)

---

## 💰 Cost Optimization

- [ ] Min instances set to 0 for development
- [ ] CPU throttling enabled
- [ ] Appropriate memory limits set
- [ ] Billing alerts configured
- [ ] Unused resources cleaned up

---

## 📊 Monitoring Setup

- [ ] Cloud Monitoring enabled
- [ ] Log-based metrics created
- [ ] Uptime checks configured
- [ ] Alert policies set up
- [ ] Error reporting enabled

---

## 🔄 CI/CD Setup (Optional)

- [ ] GitHub Actions workflow created
- [ ] Cloud Build triggers configured
- [ ] Automated testing enabled
- [ ] Staging environment set up
- [ ] Production deployment approval required

---

## 📝 Documentation

- [ ] Service URLs documented
- [ ] Environment variables documented
- [ ] Deployment process documented
- [ ] Troubleshooting guide reviewed
- [ ] Team members trained

---

## 🎯 Quick Commands Reference

### View Services
```bash
gcloud run services list
```

### View Logs
```bash
gcloud run services logs read saas-dnd-backend --region us-central1 --limit 50
```

### Update Service
```bash
gcloud run services update saas-dnd-backend --region us-central1 --set-env-vars KEY=VALUE
```

### Rollback
```bash
gcloud run services update-traffic saas-dnd-backend --to-revisions REVISION=100
```

### Delete Service
```bash
gcloud run services delete saas-dnd-backend --region us-central1
```

---

## 🆘 Emergency Contacts

- **GCP Support**: https://cloud.google.com/support
- **GitHub Issues**: https://github.com/SebastianVernis/SAAS-DND/issues
- **Documentation**: See GOOGLE_CLOUD_RUN_DEPLOYMENT.md

---

## ✅ Final Verification

Before considering deployment complete:

- [ ] All services running
- [ ] All health checks passing
- [ ] Frontend accessible
- [ ] Backend API responding
- [ ] Database connected
- [ ] Emails sending (if configured)
- [ ] No errors in logs
- [ ] Performance acceptable
- [ ] Costs within budget
- [ ] Team notified

---

**Deployment Date**: _______________  
**Deployed By**: _______________  
**Project ID**: _______________  
**Region**: _______________  
**Backend URL**: _______________  
**Frontend URL**: _______________

---

**Status**: ⬜ Not Started | 🟡 In Progress | ✅ Complete

**Overall Progress**: _____ / 100%
