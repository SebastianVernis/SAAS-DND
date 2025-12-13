// Plan limits and features
export const PLAN_LIMITS = {
  free: {
    projects: 5,
    aiCalls: 10, // per day
    storage: 100 * 1024 * 1024, // 100MB in bytes
    members: 1,
    collaboration: false,
    deploy: false,
    sso: false,
    whiteLabel: false,
    price: 0,
  },
  pro: {
    projects: -1, // unlimited
    aiCalls: -1, // unlimited
    storage: 10 * 1024 * 1024 * 1024, // 10GB
    members: 1,
    collaboration: false,
    deploy: true,
    sso: false,
    whiteLabel: false,
    price: { monthly: 9, yearly: 86.4 }, // 20% discount on yearly
  },
  teams: {
    projects: -1,
    aiCalls: -1,
    storage: 100 * 1024 * 1024 * 1024, // 100GB
    members: 10,
    collaboration: true,
    deploy: true,
    sso: true,
    whiteLabel: false,
    price: { monthly: 29, yearly: 278.4 },
  },
  enterprise: {
    projects: -1,
    aiCalls: -1,
    storage: -1, // unlimited
    members: -1, // unlimited
    collaboration: true,
    deploy: true,
    sso: true,
    whiteLabel: true,
    price: 'custom',
  },
};

// Permissions by role
export const PERMISSIONS = {
  admin: {
    projects: ['create', 'read', 'update', 'delete'],
    team: ['invite', 'remove', 'changeRole'],
    billing: ['read', 'update'],
    settings: ['read', 'update'],
  },
  editor: {
    projects: ['create', 'read', 'update', 'delete'],
    team: ['read'],
    billing: ['read'],
    settings: ['read'],
  },
  viewer: {
    projects: ['read'],
    team: ['read'],
    billing: [],
    settings: ['read'],
  },
};

// OTP configuration
export const OTP_CONFIG = {
  length: 6,
  expirationMinutes: 10,
  maxAttempts: 3,
};

// Rate limiting
export const RATE_LIMITS = {
  general: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
  },
  auth: {
    windowMs: 15 * 60 * 1000,
    max: 5,
  },
  otp: {
    windowMs: 60 * 1000, // 1 minute
    max: 3,
  },
};

// JWT configuration
export const JWT_CONFIG = {
  secret: process.env.JWT_SECRET,
  expiresIn: process.env.JWT_EXPIRES_IN || '7d',
};

// Bcrypt rounds
export const BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS) || 10;

// Invitation expiration
export const INVITATION_EXPIRATION_DAYS = 7;

// Email templates
export const EMAIL_TEMPLATES = {
  OTP_VERIFICATION: 'otp-verification',
  TEAM_INVITATION: 'team-invitation',
  WELCOME: 'welcome',
  SUBSCRIPTION_CONFIRMED: 'subscription-confirmed',
  SUBSCRIPTION_CANCELED: 'subscription-canceled',
  INVOICE: 'invoice',
};

// Project templates
export const PROJECT_TEMPLATES = {
  blank: {
    name: 'Blank Project',
    html: '<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n  <title>New Project</title>\n</head>\n<body>\n  <h1>Hello World!</h1>\n</body>\n</html>',
    css: 'body {\n  font-family: Arial, sans-serif;\n  margin: 0;\n  padding: 20px;\n}',
    js: '',
  },
  landing: {
    name: 'Landing Page',
    html: '<!-- Landing page template -->\n<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n  <title>Landing Page</title>\n</head>\n<body>\n  <header>\n    <nav>Your Nav Here</nav>\n  </header>\n  <main>\n    <section class="hero">\n      <h1>Welcome</h1>\n    </section>\n  </main>\n</body>\n</html>',
    css: '',
    js: '',
  },
};

// Account types
export const ACCOUNT_TYPES = ['personal', 'agency', 'enterprise'];

// Industries
export const INDUSTRIES = [
  'design',
  'development',
  'marketing',
  'education',
  'ecommerce',
  'saas',
  'consulting',
  'other',
];

// Team sizes
export const TEAM_SIZES = ['1-5', '6-20', '21-50', '51-200', '200+'];

// User roles in projects
export const USER_ROLES = ['designer', 'developer', 'product-manager', 'marketing', 'other'];

export default {
  PLAN_LIMITS,
  PERMISSIONS,
  OTP_CONFIG,
  RATE_LIMITS,
  JWT_CONFIG,
  BCRYPT_ROUNDS,
  INVITATION_EXPIRATION_DAYS,
  EMAIL_TEMPLATES,
  PROJECT_TEMPLATES,
  ACCOUNT_TYPES,
  INDUSTRIES,
  TEAM_SIZES,
  USER_ROLES,
};
