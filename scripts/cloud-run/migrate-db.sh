#!/bin/bash
# Run database migrations on Cloud SQL
# This script connects to Cloud SQL and runs Drizzle migrations

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}🗄️  SAAS-DND Database Migration${NC}"
echo "=================================="

# Load configuration
if [ -f .env.gcp ]; then
    source .env.gcp
else
    echo -e "${RED}❌ .env.gcp not found${NC}"
    echo "Run ./setup-gcp.sh first"
    exit 1
fi

# Check if Cloud SQL Proxy is installed
if ! command -v cloud-sql-proxy &> /dev/null; then
    echo -e "${YELLOW}⚠️  Cloud SQL Proxy not found${NC}"
    echo "Installing Cloud SQL Proxy..."
    curl -o cloud-sql-proxy https://storage.googleapis.com/cloud-sql-connectors/cloud-sql-proxy/v2.8.0/cloud-sql-proxy.linux.amd64
    chmod +x cloud-sql-proxy
    sudo mv cloud-sql-proxy /usr/local/bin/
fi

# Start Cloud SQL Proxy
echo -e "${YELLOW}Starting Cloud SQL Proxy...${NC}"
cloud-sql-proxy $CONNECTION_NAME --port 5432 &
PROXY_PID=$!

# Wait for proxy to be ready
sleep 5

# Run migrations
echo -e "${YELLOW}Running database migrations...${NC}"
cd backend
npm run db:push

echo -e "${GREEN}✅ Migrations complete${NC}"

# Stop proxy
kill $PROXY_PID

echo ""
echo "Database is ready!"
