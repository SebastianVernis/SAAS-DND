# SAAS-DND Backend Testing Suite

## Overview

Comprehensive testing suite for the SAAS-DND backend API covering authentication, onboarding, team management, and projects CRUD operations.

## Test Structure

```
tests/
├── setup.js                 # Global test setup and mocks
├── helpers/
│   └── testDb.js           # Database helper functions
├── auth.test.js            # Authentication tests (20+ tests)
├── onboarding.test.js      # Onboarding tests (10+ tests)
├── team.test.js            # Team management tests (25+ tests)
├── projects.test.js        # Projects CRUD tests (30+ tests)
├── run-tests.sh            # Test runner script
└── generate-qa-report.js   # QA report generator
```

## Prerequisites

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Setup Test Database

The tests require a PostgreSQL database. You have two options:

#### Option A: Local PostgreSQL

```bash
# Install PostgreSQL (if not installed)
sudo dnf install postgresql postgresql-server

# Initialize database
sudo postgresql-setup --initdb

# Start PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create test database and user
sudo -u postgres psql << EOF
CREATE USER test WITH PASSWORD 'test';
CREATE DATABASE dragndrop_test OWNER test;
GRANT ALL PRIVILEGES ON DATABASE dragndrop_test TO test;
EOF
```

#### Option B: Docker PostgreSQL

```bash
# Run PostgreSQL in Docker
docker run -d \
  --name postgres-test \
  -e POSTGRES_USER=test \
  -e POSTGRES_PASSWORD=test \
  -e POSTGRES_DB=dragndrop_test \
  -p 5432:5432 \
  postgres:15-alpine

# Wait for PostgreSQL to be ready
sleep 5
```

### 3. Configure Environment

The `.env.test` file is already configured with test settings:

```env
DATABASE_URL=postgresql://test:test@localhost:5432/dragndrop_test
JWT_SECRET=test-jwt-secret-key-for-testing-only-min-32-chars-long
SMTP_HOST=smtp.example.com  # Mocked in tests
```

### 4. Run Database Migrations

```bash
cd backend
npm run db:push
```

## Running Tests

### Run All Tests

```bash
npm test
```

### Run Tests with Coverage

```bash
npm test -- --coverage
```

### Run Specific Test Suite

```bash
# Authentication tests only
npm test -- auth.test.js

# Onboarding tests only
npm test -- onboarding.test.js

# Team management tests only
npm test -- team.test.js

# Projects tests only
npm test -- projects.test.js
```

### Run Tests in Watch Mode

```bash
npm test -- --watch
```

### Run Tests with Verbose Output

```bash
npm test -- --verbose
```

### Use Test Runner Script

```bash
./tests/run-tests.sh
```

## Test Coverage

The test suite covers:

### Authentication (20+ tests)
- ✅ User registration with email/password
- ✅ OTP generation and verification
- ✅ OTP resend functionality
- ✅ Login with credentials
- ✅ Session management
- ✅ Logout
- ✅ Password validation
- ✅ Email validation
- ✅ Rate limiting
- ✅ Token expiration

### Onboarding (10+ tests)
- ✅ Complete onboarding flow
- ✅ Personal account setup
- ✅ Agency account setup
- ✅ Enterprise account setup
- ✅ Organization details
- ✅ User preferences
- ✅ Welcome project creation
- ✅ Onboarding status check

### Team Management (25+ tests)
- ✅ List team members
- ✅ Invite team members
- ✅ Accept invitations
- ✅ Update member roles
- ✅ Remove members
- ✅ Revoke invitations
- ✅ Permission checks (admin/editor/viewer)
- ✅ Member limit enforcement
- ✅ Invitation expiration
- ✅ Email validation

### Projects CRUD (30+ tests)
- ✅ List projects with pagination
- ✅ Search projects
- ✅ Create project with templates
- ✅ Get project details
- ✅ Update project content
- ✅ Delete project
- ✅ Duplicate project
- ✅ Permission checks
- ✅ Project limit enforcement
- ✅ Component cascade deletion

## Test Features

### Mocking

- **Email Service**: Nodemailer is mocked to prevent actual email sending
- **Console Logs**: Suppressed during tests (except errors)
- **Database**: Uses test database with automatic cleanup

### Database Helpers

```javascript
import { 
  cleanDatabase,
  createTestUser,
  createTestProject,
  createTestInvitation,
  generateTestToken 
} from './helpers/testDb.js';

// Clean database before each test
beforeEach(async () => {
  await cleanDatabase();
});

// Create test user with organization
const testUser = await createTestUser({
  email: 'test@example.com',
  password: 'Test1234',
  role: 'admin',
  plan: 'pro'
});

// Generate JWT token
const token = await generateTestToken(testUser.user, testUser.organization.id);
```

### Test Structure

Each test follows this pattern:

```javascript
describe('Feature Name', () => {
  beforeEach(async () => {
    // Setup: Clean database, create test data
  });

  describe('Endpoint Name', () => {
    it('should handle successful scenario', async () => {
      // Arrange: Prepare test data
      // Act: Make API request
      // Assert: Verify response and database state
    });

    it('should handle error scenario', async () => {
      // Test error cases
    });
  });
});
```

## Generating QA Report

After running tests, generate a comprehensive QA report:

```bash
node tests/generate-qa-report.js
```

This creates `QA_TEST_REPORT.md` with:
- Executive summary
- Detailed test results
- Security analysis
- Coverage metrics
- Known issues
- Recommendations

## Troubleshooting

### Database Connection Errors

```bash
# Check if PostgreSQL is running
sudo systemctl status postgresql

# Check if test database exists
psql -U test -d dragndrop_test -c "SELECT 1"

# Recreate test database
sudo -u postgres psql -c "DROP DATABASE IF EXISTS dragndrop_test;"
sudo -u postgres psql -c "CREATE DATABASE dragndrop_test OWNER test;"
```

### Port Already in Use

```bash
# Kill process using port 3002
lsof -ti:3002 | xargs kill -9
```

### Module Not Found Errors

```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Jest Timeout Errors

Increase timeout in `jest.config.js`:

```javascript
testTimeout: 60000, // 60 seconds
```

## CI/CD Integration

### GitHub Actions

```yaml
name: Backend Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_USER: test
          POSTGRES_PASSWORD: test
          POSTGRES_DB: dragndrop_test
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: cd backend && npm install
      
      - name: Run migrations
        run: cd backend && npm run db:push
        env:
          DATABASE_URL: postgresql://test:test@localhost:5432/dragndrop_test
      
      - name: Run tests
        run: cd backend && npm test -- --coverage
        env:
          DATABASE_URL: postgresql://test:test@localhost:5432/dragndrop_test
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./backend/coverage/lcov.info
```

## Best Practices

1. **Clean Database**: Always clean database before each test
2. **Isolated Tests**: Each test should be independent
3. **Descriptive Names**: Use clear, descriptive test names
4. **Arrange-Act-Assert**: Follow AAA pattern
5. **Test Edge Cases**: Test both success and failure scenarios
6. **Mock External Services**: Mock emails, payments, etc.
7. **Use Helpers**: Leverage test helpers for common operations
8. **Check Database State**: Verify database changes after operations

## Performance

- **Test Execution Time**: ~30 seconds for full suite
- **Database Cleanup**: ~100ms per test
- **API Requests**: ~50-200ms per request

## Coverage Goals

- **Statements**: >80%
- **Branches**: >75%
- **Functions**: >80%
- **Lines**: >80%

## Contributing

When adding new features:

1. Write tests first (TDD)
2. Ensure all tests pass
3. Maintain coverage above 80%
4. Update this README if needed
5. Generate QA report

## Support

For issues or questions:
- Check troubleshooting section
- Review test logs
- Check database connection
- Verify environment variables

## License

Proprietary - SAAS-DND Project
