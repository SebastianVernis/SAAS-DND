import { pgTable, uuid, varchar, text, boolean, timestamp, integer, bigint, jsonb, inet, index, uniqueIndex } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Users table (Better Auth compatible)
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  emailVerified: boolean('email_verified').default(false),
  name: varchar('name', { length: 255 }),
  image: varchar('image', { length: 500 }),
  passwordHash: varchar('password_hash', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  emailIdx: index('idx_users_email').on(table.email),
}));

// OTP codes for email verification
export const otpCodes = pgTable('otp_codes', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),
  code: varchar('code', { length: 6 }).notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  verified: boolean('verified').default(false),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  userIdIdx: index('idx_otp_user_id').on(table.userId),
  expiresIdx: index('idx_otp_expires').on(table.expiresAt),
}));

// Organizations (companies, agencies, personal accounts)
export const organizations = pgTable('organizations', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  type: varchar('type', { length: 50 }), // personal, agency, enterprise
  industry: varchar('industry', { length: 100 }),
  teamSize: varchar('team_size', { length: 50 }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  slugIdx: index('idx_organizations_slug').on(table.slug),
}));

// Subscriptions (plan management)
export const subscriptions = pgTable('subscriptions', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id').references(() => organizations.id, { onDelete: 'cascade' }).notNull(),
  plan: varchar('plan', { length: 50 }).notNull(), // free, pro, teams, enterprise
  status: varchar('status', { length: 50 }).notNull(), // active, canceled, past_due, trialing
  currentPeriodStart: timestamp('current_period_start'),
  currentPeriodEnd: timestamp('current_period_end'),
  cancelAtPeriodEnd: boolean('cancel_at_period_end').default(false),
  stripeCustomerId: varchar('stripe_customer_id', { length: 255 }),
  stripeSubscriptionId: varchar('stripe_subscription_id', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  orgIdx: index('idx_subscriptions_org').on(table.organizationId),
  stripeCustomerIdx: index('idx_subscriptions_stripe_customer').on(table.stripeCustomerId),
}));

// Organization members (team management)
export const organizationMembers = pgTable('organization_members', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id').references(() => organizations.id, { onDelete: 'cascade' }).notNull(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  role: varchar('role', { length: 50 }).notNull(), // admin, editor, viewer
  status: varchar('status', { length: 50 }).default('active'), // active, pending, suspended
  invitedBy: uuid('invited_by').references(() => users.id),
  joinedAt: timestamp('joined_at').defaultNow(),
}, (table) => ({
  orgIdx: index('idx_org_members_org').on(table.organizationId),
  userIdx: index('idx_org_members_user').on(table.userId),
  uniqueMembership: uniqueIndex('unique_org_user').on(table.organizationId, table.userId),
}));

// Invitations (team invites)
export const invitations = pgTable('invitations', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id').references(() => organizations.id, { onDelete: 'cascade' }).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  role: varchar('role', { length: 50 }).notNull(),
  token: varchar('token', { length: 255 }).notNull().unique(),
  invitedBy: uuid('invited_by').references(() => users.id),
  message: text('message'),
  status: varchar('status', { length: 50 }).default('pending'), // pending, accepted, expired, revoked
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  tokenIdx: index('idx_invitations_token').on(table.token),
  emailIdx: index('idx_invitations_email').on(table.email),
  orgIdx: index('idx_invitations_org').on(table.organizationId),
  // Composite index for common query pattern: WHERE organizationId = ? AND status = ?
  orgStatusIdx: index('idx_invitations_org_status').on(table.organizationId, table.status),
}));

// Projects
export const projects = pgTable('projects', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id').references(() => organizations.id, { onDelete: 'cascade' }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  html: text('html'),
  css: text('css'),
  js: text('js'),
  thumbnail: varchar('thumbnail', { length: 500 }),
  isPublic: boolean('is_public').default(false),
  createdBy: uuid('created_by').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  orgIdx: index('idx_projects_org').on(table.organizationId),
  createdByIdx: index('idx_projects_created_by').on(table.createdBy),
  // Composite index for sorting by updatedAt within organization
  orgUpdatedIdx: index('idx_projects_org_updated').on(table.organizationId, table.updatedAt),
}));

// Components (project elements)
export const components = pgTable('components', {
  id: uuid('id').primaryKey().defaultRandom(),
  projectId: uuid('project_id').references(() => projects.id, { onDelete: 'cascade' }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  type: varchar('type', { length: 50 }).notNull(),
  html: text('html').notNull(),
  css: text('css'),
  props: jsonb('props'),
  position: jsonb('position'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  projectIdx: index('idx_components_project').on(table.projectId),
}));

// User preferences
export const userPreferences = pgTable('user_preferences', {
  userId: uuid('user_id').primaryKey().references(() => users.id, { onDelete: 'cascade' }),
  theme: varchar('theme', { length: 20 }).default('dark'),
  language: varchar('language', { length: 10 }).default('es'),
  emailNotifications: boolean('email_notifications').default(true),
  onboardingCompleted: boolean('onboarding_completed').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Usage tracking (for plan limits)
export const usageTracking = pgTable('usage_tracking', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id').references(() => organizations.id, { onDelete: 'cascade' }).notNull(),
  month: varchar('month', { length: 7 }).notNull(), // '2024-01'
  aiCalls: integer('ai_calls').default(0),
  storageBytes: bigint('storage_bytes', { mode: 'number' }).default(0),
  projectsCount: integer('projects_count').default(0),
}, (table) => ({
  uniqueOrgMonth: uniqueIndex('unique_org_month').on(table.organizationId, table.month),
  orgMonthIdx: index('idx_usage_org_month').on(table.organizationId, table.month),
}));

// Audit logs
export const auditLogs = pgTable('audit_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id),
  organizationId: uuid('organization_id').references(() => organizations.id),
  action: varchar('action', { length: 100 }).notNull(),
  resourceType: varchar('resource_type', { length: 50 }),
  resourceId: uuid('resource_id'),
  metadata: jsonb('metadata'),
  ipAddress: inet('ip_address'),
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  userIdx: index('idx_audit_user').on(table.userId),
  orgIdx: index('idx_audit_org').on(table.organizationId),
}));

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  preferences: one(userPreferences),
  memberships: many(organizationMembers),
  createdProjects: many(projects),
}));

export const organizationsRelations = relations(organizations, ({ one, many }) => ({
  subscription: one(subscriptions),
  members: many(organizationMembers),
  projects: many(projects),
  invitations: many(invitations),
  usageTracking: many(usageTracking),
}));

export const organizationMembersRelations = relations(organizationMembers, ({ one }) => ({
  organization: one(organizations, {
    fields: [organizationMembers.organizationId],
    references: [organizations.id],
  }),
  user: one(users, {
    fields: [organizationMembers.userId],
    references: [users.id],
  }),
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [projects.organizationId],
    references: [organizations.id],
  }),
  creator: one(users, {
    fields: [projects.createdBy],
    references: [users.id],
  }),
  components: many(components),
}));

export const componentsRelations = relations(components, ({ one }) => ({
  project: one(projects, {
    fields: [components.projectId],
    references: [projects.id],
  }),
}));
