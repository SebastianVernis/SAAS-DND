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

    // Optimized: Single query with JOINs to get user + membership + organization + subscription
    // This eliminates N+1 query pattern (4 queries → 1 query)
    const result = await db
      .select({
        // User fields
        userId: users.id,
        userEmail: users.email,
        userName: users.name,
        userImage: users.image,
        userEmailVerified: users.emailVerified,
        userCreatedAt: users.createdAt,
        // Membership fields
        membershipId: organizationMembers.id,
        membershipRole: organizationMembers.role,
        membershipStatus: organizationMembers.status,
        membershipJoinedAt: organizationMembers.joinedAt,
        // Organization fields
        orgId: organizations.id,
        orgName: organizations.name,
        orgSlug: organizations.slug,
        orgType: organizations.type,
        orgIndustry: organizations.industry,
        orgTeamSize: organizations.teamSize,
        // Subscription fields
        subId: subscriptions.id,
        subPlan: subscriptions.plan,
        subStatus: subscriptions.status,
        subCurrentPeriodStart: subscriptions.currentPeriodStart,
        subCurrentPeriodEnd: subscriptions.currentPeriodEnd,
        subCancelAtPeriodEnd: subscriptions.cancelAtPeriodEnd,
      })
      .from(users)
      .leftJoin(organizationMembers, eq(organizationMembers.userId, users.id))
      .leftJoin(organizations, eq(organizations.id, organizationMembers.organizationId))
      .leftJoin(subscriptions, eq(subscriptions.organizationId, organizations.id))
      .where(eq(users.id, decoded.userId))
      .limit(1);

    if (!result || result.length === 0) {
      return res.status(401).json({ error: 'User not found' });
    }

    const data = result[0];

    // Reconstruct user object
    req.user = {
      id: data.userId,
      email: data.userEmail,
      name: data.userName,
      image: data.userImage,
      emailVerified: data.userEmailVerified,
      createdAt: data.userCreatedAt,
    };

    // Add organization data if user has membership
    if (data.membershipId) {
      req.membership = {
        id: data.membershipId,
        organizationId: data.orgId,
        userId: data.userId,
        role: data.membershipRole,
        status: data.membershipStatus,
        joinedAt: data.membershipJoinedAt,
      };

      req.organization = {
        id: data.orgId,
        name: data.orgName,
        slug: data.orgSlug,
        type: data.orgType,
        industry: data.orgIndustry,
        teamSize: data.orgTeamSize,
      };

      req.subscription = {
        id: data.subId,
        organizationId: data.orgId,
        plan: data.subPlan,
        status: data.subStatus,
        currentPeriodStart: data.subCurrentPeriodStart,
        currentPeriodEnd: data.subCurrentPeriodEnd,
        cancelAtPeriodEnd: data.subCancelAtPeriodEnd,
      };
    }

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
