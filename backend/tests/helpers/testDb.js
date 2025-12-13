import { db, sql } from '../../src/db/client.js';
import {
  users,
  otpCodes,
  organizations,
  organizationMembers,
  subscriptions,
  userPreferences,
  projects,
  components,
  invitations,
  usageTracking,
  auditLogs,
} from '../../src/db/schema.js';

/**
 * Clean all tables in the test database
 */
export async function cleanDatabase() {
  try {
    // Delete in order to respect foreign key constraints
    await db.delete(auditLogs);
    await db.delete(usageTracking);
    await db.delete(components);
    await db.delete(projects);
    await db.delete(invitations);
    await db.delete(organizationMembers);
    await db.delete(subscriptions);
    await db.delete(organizations);
    await db.delete(userPreferences);
    await db.delete(otpCodes);
    await db.delete(users);
  } catch (error) {
    console.error('Error cleaning database:', error);
    throw error;
  }
}

/**
 * Create test user with organization
 */
export async function createTestUser({
  email = 'test@example.com',
  password = 'Test1234',
  name = 'Test User',
  emailVerified = true,
  role = 'admin',
  plan = 'free',
} = {}) {
  const bcrypt = await import('bcryptjs');
  const passwordHash = await bcrypt.hash(password, 4);

  // Create user
  const [user] = await db
    .insert(users)
    .values({
      email,
      passwordHash,
      name,
      emailVerified,
    })
    .returning();

  // Create organization
  const [organization] = await db
    .insert(organizations)
    .values({
      name: `${name}'s Workspace`,
      slug: `${user.id.split('-')[0]}-workspace`,
      type: 'personal',
    })
    .returning();

  // Create membership
  const [membership] = await db
    .insert(organizationMembers)
    .values({
      organizationId: organization.id,
      userId: user.id,
      role,
      status: 'active',
    })
    .returning();

  // Create subscription
  const [subscription] = await db
    .insert(subscriptions)
    .values({
      organizationId: organization.id,
      plan,
      status: 'active',
    })
    .returning();

  // Create preferences
  const [preferences] = await db
    .insert(userPreferences)
    .values({
      userId: user.id,
      theme: 'dark',
      language: 'es',
      emailNotifications: true,
      onboardingCompleted: false,
    })
    .returning();

  return {
    user,
    organization,
    membership,
    subscription,
    preferences,
    password, // Return plain password for login tests
  };
}

/**
 * Create test project
 */
export async function createTestProject({
  organizationId,
  userId,
  name = 'Test Project',
  description = 'Test project description',
} = {}) {
  const [project] = await db
    .insert(projects)
    .values({
      organizationId,
      name,
      description,
      html: '<html><body>Test</body></html>',
      css: 'body { margin: 0; }',
      js: '',
      createdBy: userId,
    })
    .returning();

  return project;
}

/**
 * Create test invitation
 */
export async function createTestInvitation({
  organizationId,
  invitedBy,
  email = 'invited@example.com',
  role = 'editor',
  status = 'pending',
} = {}) {
  const { v4: uuidv4 } = await import('uuid');
  const token = uuidv4();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  const [invitation] = await db
    .insert(invitations)
    .values({
      organizationId,
      email,
      role,
      token,
      invitedBy,
      status,
      expiresAt,
    })
    .returning();

  return invitation;
}

/**
 * Generate JWT token for test user
 */
export async function generateTestToken(user, organizationId) {
  const { generateToken } = await import('../../src/utils/jwt.js');
  return generateToken({
    userId: user.id,
    email: user.email,
    organizationId,
  });
}

export default {
  cleanDatabase,
  createTestUser,
  createTestProject,
  createTestInvitation,
  generateTestToken,
};
