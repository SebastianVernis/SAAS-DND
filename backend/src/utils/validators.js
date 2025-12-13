import { z } from 'zod';

// Auth validators
export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const verifyOtpSchema = z.object({
  email: z.string().email('Invalid email address'),
  code: z.string().length(6, 'OTP must be 6 digits'),
});

// Onboarding validators
export const onboardingSchema = z.object({
  accountType: z.enum(['personal', 'agency', 'enterprise']),
  organization: z
    .object({
      name: z.string().min(2, 'Organization name is required'),
      industry: z.string().optional(),
      teamSize: z.string().optional(),
    })
    .optional(),
  userRole: z.string().optional(),
  preferences: z
    .object({
      theme: z.enum(['light', 'dark', 'auto']).optional(),
      language: z.enum(['es', 'en']).optional(),
      emailNotifications: z.boolean().optional(),
    })
    .optional(),
});

// Team validators
export const inviteTeamMemberSchema = z.object({
  email: z.string().email('Invalid email address'),
  role: z.enum(['admin', 'editor', 'viewer']),
  message: z.string().max(500).optional(),
});

export const updateMemberRoleSchema = z.object({
  role: z.enum(['admin', 'editor', 'viewer']),
});

// Project validators
export const createProjectSchema = z.object({
  name: z.string().min(1, 'Project name is required').max(255),
  description: z.string().max(1000).optional(),
  template: z.enum(['blank', 'landing', 'dashboard', 'portfolio']).optional(),
});

export const updateProjectSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().max(1000).optional(),
  html: z.string().optional(),
  css: z.string().optional(),
  js: z.string().optional(),
  isPublic: z.boolean().optional(),
});

// Payment validators
export const createSubscriptionSchema = z.object({
  plan: z.enum(['free', 'pro', 'teams', 'enterprise']),
  billingCycle: z.enum(['monthly', 'yearly']).optional(),
  paymentMethod: z.string().optional(),
  mockup: z.boolean().optional(),
  mockupCard: z.string().optional(),
});

export const updateSubscriptionSchema = z.object({
  plan: z.enum(['free', 'pro', 'teams', 'enterprise']),
});

// Validation middleware
export const validate = (schema) => (req, res, next) => {
  try {
    schema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        })),
      });
    }
    next(error);
  }
};

export default {
  registerSchema,
  loginSchema,
  verifyOtpSchema,
  onboardingSchema,
  inviteTeamMemberSchema,
  updateMemberRoleSchema,
  createProjectSchema,
  updateProjectSchema,
  createSubscriptionSchema,
  updateSubscriptionSchema,
  validate,
};
