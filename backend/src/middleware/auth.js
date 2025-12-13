import { verifyToken } from '../utils/jwt.js';
import { db } from '../db/client.js';
import { users, organizationMembers, organizations, subscriptions } from '../db/schema.js';
import { eq } from 'drizzle-orm';

// Require authentication
export async function requireAuth(req, res, next) {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.replace('Bearer ', '');

    // Verify token
    let decoded;
    try {
      decoded = verifyToken(token);
    } catch (error) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    // Get user
    const [user] = await db.select().from(users).where(eq(users.id, decoded.userId)).limit(1);

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    // Get user's organization membership
    const [membership] = await db
      .select()
      .from(organizationMembers)
      .where(eq(organizationMembers.userId, user.id))
      .limit(1);

    if (membership) {
      // Get organization
      const [org] = await db
        .select()
        .from(organizations)
        .where(eq(organizations.id, membership.organizationId))
        .limit(1);

      // Get subscription
      const [sub] = await db
        .select()
        .from(subscriptions)
        .where(eq(subscriptions.organizationId, org.id))
        .limit(1);

      req.organization = org;
      req.subscription = sub;
      req.membership = membership;
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
}

// Optional auth (doesn't fail if no token)
export async function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  try {
    await requireAuth(req, res, next);
  } catch (error) {
    next();
  }
}

export default {
  requireAuth,
  optionalAuth,
};
