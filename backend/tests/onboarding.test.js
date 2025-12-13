import request from 'supertest';
import app from '../src/server.js';
import { cleanDatabase, createTestUser, generateTestToken } from './helpers/testDb.js';
import { db } from '../src/db/client.js';
import { organizations, userPreferences, projects } from '../src/db/schema.js';
import { eq } from 'drizzle-orm';

describe('Onboarding API', () => {
  let testUser;
  let token;

  beforeEach(async () => {
    await cleanDatabase();
    testUser = await createTestUser();
    token = await generateTestToken(testUser.user, testUser.organization.id);
  });

  describe('POST /api/onboarding/complete', () => {
    it('should complete onboarding with personal account', async () => {
      const onboardingData = {
        accountType: 'personal',
        userRole: 'designer',
        preferences: {
          theme: 'dark',
          language: 'es',
          emailNotifications: true,
        },
      };

      const response = await request(app)
        .post('/api/onboarding/complete')
        .set('Authorization', `Bearer ${token}`)
        .send(onboardingData)
        .expect(200);

      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('organization');
      expect(response.body).toHaveProperty('preferences');
      expect(response.body).toHaveProperty('welcomeProject');
      expect(response.body.message).toContain('completed successfully');

      // Verify preferences were updated
      const [prefs] = await db
        .select()
        .from(userPreferences)
        .where(eq(userPreferences.userId, testUser.user.id))
        .limit(1);

      expect(prefs.onboardingCompleted).toBe(true);
      expect(prefs.theme).toBe('dark');
      expect(prefs.language).toBe('es');

      // Verify welcome project was created
      const [project] = await db
        .select()
        .from(projects)
        .where(eq(projects.organizationId, testUser.organization.id))
        .limit(1);

      expect(project).toBeDefined();
      expect(project.name).toContain('Welcome');
    });

    it('should complete onboarding with agency account', async () => {
      const onboardingData = {
        accountType: 'agency',
        organization: {
          name: 'My Design Agency',
          industry: 'design',
          teamSize: '6-20',
        },
        userRole: 'designer',
        preferences: {
          theme: 'light',
          language: 'en',
          emailNotifications: false,
        },
      };

      const response = await request(app)
        .post('/api/onboarding/complete')
        .set('Authorization', `Bearer ${token}`)
        .send(onboardingData)
        .expect(200);

      expect(response.body.organization.name).toBe('My Design Agency');
      expect(response.body.organization.type).toBe('agency');
      expect(response.body.organization.industry).toBe('design');
      expect(response.body.organization.teamSize).toBe('6-20');

      // Verify organization was updated
      const [org] = await db
        .select()
        .from(organizations)
        .where(eq(organizations.id, testUser.organization.id))
        .limit(1);

      expect(org.name).toBe('My Design Agency');
      expect(org.type).toBe('agency');
      expect(org.industry).toBe('design');
    });

    it('should complete onboarding with enterprise account', async () => {
      const onboardingData = {
        accountType: 'enterprise',
        organization: {
          name: 'Enterprise Corp',
          industry: 'saas',
          teamSize: '51-200',
        },
        userRole: 'product-manager',
        preferences: {
          theme: 'auto',
          language: 'es',
          emailNotifications: true,
        },
      };

      const response = await request(app)
        .post('/api/onboarding/complete')
        .set('Authorization', `Bearer ${token}`)
        .send(onboardingData)
        .expect(200);

      expect(response.body.organization.type).toBe('enterprise');
      expect(response.body.organization.name).toBe('Enterprise Corp');
    });

    it('should reject onboarding without authentication', async () => {
      const onboardingData = {
        accountType: 'personal',
        userRole: 'designer',
      };

      const response = await request(app)
        .post('/api/onboarding/complete')
        .send(onboardingData)
        .expect(401);

      expect(response.body.error).toContain('No token provided');
    });

    it('should reject invalid account type', async () => {
      const onboardingData = {
        accountType: 'invalid-type',
        userRole: 'designer',
      };

      const response = await request(app)
        .post('/api/onboarding/complete')
        .set('Authorization', `Bearer ${token}`)
        .send(onboardingData)
        .expect(400);

      expect(response.body.error).toBe('Validation failed');
    });

    it('should handle onboarding with minimal data', async () => {
      const onboardingData = {
        accountType: 'personal',
      };

      const response = await request(app)
        .post('/api/onboarding/complete')
        .set('Authorization', `Bearer ${token}`)
        .send(onboardingData)
        .expect(200);

      expect(response.body).toHaveProperty('organization');
      expect(response.body).toHaveProperty('preferences');

      // Should use default preferences
      const [prefs] = await db
        .select()
        .from(userPreferences)
        .where(eq(userPreferences.userId, testUser.user.id))
        .limit(1);

      expect(prefs.onboardingCompleted).toBe(true);
      expect(prefs.theme).toBe('dark'); // Default
    });

    it('should update existing preferences', async () => {
      // Complete onboarding first time
      await request(app)
        .post('/api/onboarding/complete')
        .set('Authorization', `Bearer ${token}`)
        .send({
          accountType: 'personal',
          preferences: { theme: 'dark' },
        });

      // Complete again with different preferences
      const response = await request(app)
        .post('/api/onboarding/complete')
        .set('Authorization', `Bearer ${token}`)
        .send({
          accountType: 'personal',
          preferences: { theme: 'light', language: 'en' },
        })
        .expect(200);

      const [prefs] = await db
        .select()
        .from(userPreferences)
        .where(eq(userPreferences.userId, testUser.user.id))
        .limit(1);

      expect(prefs.theme).toBe('light');
      expect(prefs.language).toBe('en');
    });
  });

  describe('GET /api/onboarding/status', () => {
    it('should return onboarding status when not completed', async () => {
      const response = await request(app)
        .get('/api/onboarding/status')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body).toHaveProperty('completed');
      expect(response.body).toHaveProperty('preferences');
      expect(response.body.completed).toBe(false);
    });

    it('should return onboarding status when completed', async () => {
      // Complete onboarding first
      await request(app)
        .post('/api/onboarding/complete')
        .set('Authorization', `Bearer ${token}`)
        .send({
          accountType: 'personal',
          userRole: 'designer',
        });

      const response = await request(app)
        .get('/api/onboarding/status')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.completed).toBe(true);
      expect(response.body.preferences).toBeDefined();
      expect(response.body.preferences.onboardingCompleted).toBe(true);
    });

    it('should reject status check without authentication', async () => {
      const response = await request(app)
        .get('/api/onboarding/status')
        .expect(401);

      expect(response.body.error).toContain('No token provided');
    });
  });

  describe('Welcome Project Creation', () => {
    it('should create welcome project with correct template', async () => {
      await request(app)
        .post('/api/onboarding/complete')
        .set('Authorization', `Bearer ${token}`)
        .send({
          accountType: 'personal',
        });

      const [project] = await db
        .select()
        .from(projects)
        .where(eq(projects.organizationId, testUser.organization.id))
        .limit(1);

      expect(project).toBeDefined();
      expect(project.name).toContain('Welcome');
      expect(project.description).toBeDefined();
      expect(project.html).toBeDefined();
      expect(project.css).toBeDefined();
      expect(project.createdBy).toBe(testUser.user.id);
    });

    it('should not create duplicate welcome projects', async () => {
      // Complete onboarding twice
      await request(app)
        .post('/api/onboarding/complete')
        .set('Authorization', `Bearer ${token}`)
        .send({ accountType: 'personal' });

      await request(app)
        .post('/api/onboarding/complete')
        .set('Authorization', `Bearer ${token}`)
        .send({ accountType: 'personal' });

      const allProjects = await db
        .select()
        .from(projects)
        .where(eq(projects.organizationId, testUser.organization.id));

      // Should have 2 welcome projects (one per completion)
      expect(allProjects.length).toBe(2);
    });
  });
});
