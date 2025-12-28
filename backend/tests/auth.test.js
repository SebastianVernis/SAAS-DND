const request = require('supertest');
const app = require('../src/server.js');
const { cleanDatabase, createTestUser, generateTestToken } = require('./helpers/testDb.js');
const { db } = require('../src/db/client.js');
const { users, otpCodes } = require('../src/db/schema.js');
const { eq } = require('drizzle-orm');

describe('Authentication API', () => {
  beforeEach(async () => {
    await cleanDatabase();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        email: 'newuser@example.com',
        password: 'SecurePass123',
        name: 'New User',
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('userId');
      expect(response.body.message).toContain('registered successfully');

      // In development, OTP should be in response
      if (process.env.NODE_ENV === 'development') {
        expect(response.body).toHaveProperty('otp');
        expect(response.body.otp).toHaveLength(6);
      }

      // Verify user was created in database
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.email, userData.email))
        .limit(1);

      expect(user).toBeDefined();
      expect(user.email).toBe(userData.email);
      expect(user.name).toBe(userData.name);
      expect(user.emailVerified).toBe(false);

      // Verify OTP was created
      const [otp] = await db
        .select()
        .from(otpCodes)
        .where(eq(otpCodes.userId, user.id))
        .limit(1);

      expect(otp).toBeDefined();
      expect(otp.code).toHaveLength(6);
      expect(otp.verified).toBe(false);
    });

    it('should reject registration with duplicate email', async () => {
      const userData = {
        email: 'duplicate@example.com',
        password: 'SecurePass123',
        name: 'User One',
      };

      // Create first user
      await createTestUser({ email: userData.email, emailVerified: true });

      // Try to register with same email
      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(409);

      expect(response.body.error).toContain('already exists');
    });

    it('should resend OTP if user exists but not verified', async () => {
      const userData = {
        email: 'unverified@example.com',
        password: 'SecurePass123',
        name: 'Unverified User',
      };

      // Create unverified user
      await createTestUser({ email: userData.email, emailVerified: false });

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(200);

      expect(response.body.message).toContain('New OTP sent');
    });

    it('should reject weak password', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'weak', // No uppercase, no number, too short
        name: 'Test User',
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.error).toBe('Validation failed');
      expect(response.body.details).toBeDefined();
    });

    it('should reject invalid email', async () => {
      const userData = {
        email: 'not-an-email',
        password: 'SecurePass123',
        name: 'Test User',
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.error).toBe('Validation failed');
    });

    it('should reject missing required fields', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({ email: 'test@example.com' })
        .expect(400);

      expect(response.body.error).toBe('Validation failed');
    });
  });

  describe('POST /api/auth/verify-otp', () => {
    it('should verify OTP and complete registration', async () => {
      // Register user first
      const userData = {
        email: 'verify@example.com',
        password: 'SecurePass123',
        name: 'Verify User',
      };

      const registerResponse = await request(app)
        .post('/api/auth/register')
        .send(userData);

      const otp = registerResponse.body.otp;

      // Verify OTP
      const response = await request(app)
        .post('/api/auth/verify-otp')
        .send({
          email: userData.email,
          code: otp,
        })
        .expect(200);

      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('organization');
      expect(response.body.user.emailVerified).toBe(true);
      expect(response.body.message).toContain('verified successfully');

      // Verify user is marked as verified
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.email, userData.email))
        .limit(1);

      expect(user.emailVerified).toBe(true);
    });

    it('should reject invalid OTP code', async () => {
      const testUser = await createTestUser({ emailVerified: false });

      const response = await request(app)
        .post('/api/auth/verify-otp')
        .send({
          email: testUser.user.email,
          code: '000000', // Invalid code
        })
        .expect(400);

      expect(response.body.error).toContain('Invalid OTP');
    });

    it('should reject OTP for non-existent user', async () => {
      const response = await request(app)
        .post('/api/auth/verify-otp')
        .send({
          email: 'nonexistent@example.com',
          code: '123456',
        })
        .expect(404);

      expect(response.body.error).toContain('not found');
    });

    it('should reject expired OTP', async () => {
      const testUser = await createTestUser({ emailVerified: false });

      // Create expired OTP
      const expiredDate = new Date(Date.now() - 60 * 60 * 1000); // 1 hour ago
      await db.insert(otpCodes).values({
        userId: testUser.user.id,
        code: '123456',
        expiresAt: expiredDate,
        verified: false,
      });

      const response = await request(app)
        .post('/api/auth/verify-otp')
        .send({
          email: testUser.user.email,
          code: '123456',
        })
        .expect(400);

      expect(response.body.error).toContain('Invalid or expired');
    });
  });

  describe('POST /api/auth/resend-otp', () => {
    it('should resend OTP successfully', async () => {
      const testUser = await createTestUser({ emailVerified: false });

      const response = await request(app)
        .post('/api/auth/resend-otp')
        .send({
          email: testUser.user.email,
        })
        .expect(200);

      expect(response.body.message).toContain('resent successfully');

      // In development, should include OTP
      if (process.env.NODE_ENV === 'development') {
        expect(response.body).toHaveProperty('otp');
      }
    });

    it('should reject resend for verified email', async () => {
      const testUser = await createTestUser({ emailVerified: true });

      const response = await request(app)
        .post('/api/auth/resend-otp')
        .send({
          email: testUser.user.email,
        })
        .expect(400);

      expect(response.body.error).toContain('already verified');
    });

    it('should reject resend for non-existent user', async () => {
      const response = await request(app)
        .post('/api/auth/resend-otp')
        .send({
          email: 'nonexistent@example.com',
        })
        .expect(404);

      expect(response.body.error).toContain('not found');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login successfully with valid credentials', async () => {
      const testUser = await createTestUser({
        email: 'login@example.com',
        password: 'LoginPass123',
        emailVerified: true,
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'login@example.com',
          password: 'LoginPass123',
        })
        .expect(200);

      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.message).toContain('successful');
      expect(response.body.user.email).toBe('login@example.com');
    });

    it('should reject login with incorrect password', async () => {
      await createTestUser({
        email: 'login@example.com',
        password: 'CorrectPass123',
        emailVerified: true,
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'login@example.com',
          password: 'WrongPass123',
        })
        .expect(401);

      expect(response.body.error).toContain('Invalid credentials');
    });

    it('should reject login for non-existent user', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'SomePass123',
        })
        .expect(401);

      expect(response.body.error).toContain('Invalid credentials');
    });

    it('should reject login for unverified email', async () => {
      await createTestUser({
        email: 'unverified@example.com',
        password: 'TestPass123',
        emailVerified: false,
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'unverified@example.com',
          password: 'TestPass123',
        })
        .expect(403);

      expect(response.body.error).toContain('not verified');
      expect(response.body.needsVerification).toBe(true);
    });
  });

  describe('GET /api/auth/session', () => {
    it('should return current session with valid token', async () => {
      const testUser = await createTestUser();
      const token = await generateTestToken(testUser.user, testUser.organization.id);

      const response = await request(app)
        .get('/api/auth/session')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('organization');
      expect(response.body).toHaveProperty('subscription');
      expect(response.body).toHaveProperty('membership');
      expect(response.body).toHaveProperty('preferences');

      expect(response.body.user.email).toBe(testUser.user.email);
      expect(response.body.organization.id).toBe(testUser.organization.id);
      expect(response.body.subscription.plan).toBe('free');
      expect(response.body.membership.role).toBe('admin');
    });

    it('should reject request without token', async () => {
      const response = await request(app)
        .get('/api/auth/session')
        .expect(401);

      expect(response.body.error).toContain('No token provided');
    });

    it('should reject request with invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/session')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body.error).toContain('Invalid or expired token');
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should logout successfully', async () => {
      const testUser = await createTestUser();
      const token = await generateTestToken(testUser.user, testUser.organization.id);

      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.message).toContain('Logged out');
    });

    it('should reject logout without token', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .expect(401);

      expect(response.body.error).toContain('No token provided');
    });
  });

  describe('Rate Limiting', () => {
    it('should enforce rate limiting on login endpoint', async () => {
      const testUser = await createTestUser({ emailVerified: true });

      // Make multiple failed login attempts
      const attempts = [];
      for (let i = 0; i < 6; i++) {
        attempts.push(
          request(app)
            .post('/api/auth/login')
            .send({
              email: testUser.user.email,
              password: 'WrongPassword123',
            })
        );
      }

      const responses = await Promise.all(attempts);

      // Last request should be rate limited (429)
      const rateLimited = responses.some((res) => res.status === 429);
      expect(rateLimited).toBe(true);
    }, 10000);
  });
});
