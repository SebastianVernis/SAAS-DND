import { logger } from '../utils/logger.js';
import { db } from '../db/client.js';
import {
  organizationMembers,
  invitations,
  users,
  organizations,
} from '../db/schema.js';
import { eq, and } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import { sendTeamInvitationEmail } from '../services/emailService.js';
import { PLAN_LIMITS, INVITATION_EXPIRATION_DAYS } from '../config/constants.js';

// Get team members
export async function getTeamMembers(req, res, next) {
  try {
    const organizationId = req.organization.id;

    // Get all members with user details
    const members = await db
      .select({
        id: organizationMembers.id,
        userId: organizationMembers.userId,
        role: organizationMembers.role,
        status: organizationMembers.status,
        joinedAt: organizationMembers.joinedAt,
        userName: users.name,
        userEmail: users.email,
        userImage: users.image,
      })
      .from(organizationMembers)
      .innerJoin(users, eq(organizationMembers.userId, users.id))
      .where(eq(organizationMembers.organizationId, organizationId));

    res.json({
      members,
      total: members.length,
    });
  } catch (error) {
    next(error);
  }
}

// Invite team member
export async function inviteTeamMember(req, res, next) {
  try {
    const { email, role, message } = req.body;
    const organizationId = req.organization.id;
    const inviterId = req.user.id;

    // Check if user has permission (only admins can invite)
    if (req.membership.role !== 'admin') {
      return res.status(403).json({
        error: 'Only admins can invite team members',
      });
    }

    // Check plan limits
    const currentMembers = await db
      .select()
      .from(organizationMembers)
      .where(eq(organizationMembers.organizationId, organizationId));

    const planLimits = PLAN_LIMITS[req.subscription.plan];

    if (planLimits.members !== -1 && currentMembers.length >= planLimits.members) {
      return res.status(403).json({
        error: 'Member limit reached for your plan',
        limit: planLimits.members,
        current: currentMembers.length,
        upgrade: true,
      });
    }

    // Check if user already exists in organization
    const [existingUser] = await db.select().from(users).where(eq(users.email, email)).limit(1);

    if (existingUser) {
      const [existingMember] = await db
        .select()
        .from(organizationMembers)
        .where(
          and(
            eq(organizationMembers.organizationId, organizationId),
            eq(organizationMembers.userId, existingUser.id)
          )
        )
        .limit(1);

      if (existingMember) {
        return res.status(409).json({
          error: 'User is already a member of this organization',
        });
      }
    }

    // Check if there's a pending invitation
    const [existingInvitation] = await db
      .select()
      .from(invitations)
      .where(
        and(
          eq(invitations.organizationId, organizationId),
          eq(invitations.email, email),
          eq(invitations.status, 'pending')
        )
      )
      .limit(1);

    if (existingInvitation) {
      return res.status(409).json({
        error: 'Invitation already sent to this email',
      });
    }

    // Create invitation
    const token = uuidv4();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + INVITATION_EXPIRATION_DAYS);

    const [invitation] = await db
      .insert(invitations)
      .values({
        organizationId,
        email,
        role,
        token,
        invitedBy: inviterId,
        message: message || null,
        status: 'pending',
        expiresAt,
      })
      .returning();

    // Send invitation email
    const inviteLink = `${process.env.FRONTEND_URL}/accept-invite?token=${token}`;

    await sendTeamInvitationEmail({
      to: email,
      inviterName: req.user.name || 'Team Admin',
      organizationName: req.organization.name,
      inviteLink,
      message,
      role,
    });

    logger.info(`📧 Team invitation sent to: ${email} (${req.organization.name})`);

    res.status(201).json({
      message: 'Invitation sent successfully',
      invitation: {
        id: invitation.id,
        email: invitation.email,
        role: invitation.role,
        expiresAt: invitation.expiresAt,
      },
    });
  } catch (error) {
    next(error);
  }
}

// Accept invitation
export async function acceptInvitation(req, res, next) {
  try {
    const { token } = req.body;

    // Find invitation
    const [invitation] = await db
      .select()
      .from(invitations)
      .where(and(eq(invitations.token, token), eq(invitations.status, 'pending')))
      .limit(1);

    if (!invitation) {
      return res.status(404).json({
        error: 'Invitation not found or already used',
      });
    }

    // Check if expired
    if (new Date() > invitation.expiresAt) {
      await db
        .update(invitations)
        .set({ status: 'expired' })
        .where(eq(invitations.id, invitation.id));

      return res.status(400).json({
        error: 'Invitation has expired',
      });
    }

    // Check if user exists (they should be logged in)
    if (!req.user) {
      return res.status(401).json({
        error: 'You must be logged in to accept an invitation',
      });
    }

    // Check if invitation email matches user email
    if (invitation.email !== req.user.email) {
      return res.status(403).json({
        error: 'Invitation email does not match your account',
      });
    }

    // Add user to organization
    const [membership] = await db
      .insert(organizationMembers)
      .values({
        organizationId: invitation.organizationId,
        userId: req.user.id,
        role: invitation.role,
        status: 'active',
        invitedBy: invitation.invitedBy,
      })
      .returning();

    // Mark invitation as accepted
    await db.update(invitations).set({ status: 'accepted' }).where(eq(invitations.id, invitation.id));

    // Get organization details
    const [organization] = await db
      .select()
      .from(organizations)
      .where(eq(organizations.id, invitation.organizationId))
      .limit(1);

    logger.info(`✅ User ${req.user.email} accepted invitation to ${organization.name}`);

    res.json({
      message: 'Invitation accepted successfully',
      organization: {
        id: organization.id,
        name: organization.name,
        type: organization.type,
      },
      membership: {
        role: membership.role,
        status: membership.status,
      },
    });
  } catch (error) {
    next(error);
  }
}

// Update member role
export async function updateMemberRole(req, res, next) {
  try {
    const { memberId } = req.params;
    const { role } = req.body;
    const organizationId = req.organization.id;

    // Check if user has permission (only admins)
    if (req.membership.role !== 'admin') {
      return res.status(403).json({
        error: 'Only admins can update member roles',
      });
    }

    // Get member
    const [member] = await db
      .select()
      .from(organizationMembers)
      .where(
        and(
          eq(organizationMembers.id, memberId),
          eq(organizationMembers.organizationId, organizationId)
        )
      )
      .limit(1);

    if (!member) {
      return res.status(404).json({
        error: 'Member not found',
      });
    }

    // Can't change your own role
    if (member.userId === req.user.id) {
      return res.status(400).json({
        error: 'You cannot change your own role',
      });
    }

    // Update role
    const [updated] = await db
      .update(organizationMembers)
      .set({ role })
      .where(eq(organizationMembers.id, memberId))
      .returning();

    logger.info(`✅ Member role updated: ${memberId} → ${role}`);

    res.json({
      message: 'Member role updated successfully',
      member: {
        id: updated.id,
        role: updated.role,
      },
    });
  } catch (error) {
    next(error);
  }
}

// Remove member
export async function removeMember(req, res, next) {
  try {
    const { memberId } = req.params;
    const organizationId = req.organization.id;

    // Check if user has permission (only admins)
    if (req.membership.role !== 'admin') {
      return res.status(403).json({
        error: 'Only admins can remove members',
      });
    }

    // Get member
    const [member] = await db
      .select()
      .from(organizationMembers)
      .where(
        and(
          eq(organizationMembers.id, memberId),
          eq(organizationMembers.organizationId, organizationId)
        )
      )
      .limit(1);

    if (!member) {
      return res.status(404).json({
        error: 'Member not found',
      });
    }

    // Can't remove yourself
    if (member.userId === req.user.id) {
      return res.status(400).json({
        error: 'You cannot remove yourself from the organization',
      });
    }

    // Delete member
    await db.delete(organizationMembers).where(eq(organizationMembers.id, memberId));

    logger.info(`✅ Member removed: ${memberId}`);

    res.json({
      message: 'Member removed successfully',
    });
  } catch (error) {
    next(error);
  }
}

// Get pending invitations
export async function getPendingInvitations(req, res, next) {
  try {
    const organizationId = req.organization.id;

    const pendingInvitations = await db
      .select()
      .from(invitations)
      .where(
        and(
          eq(invitations.organizationId, organizationId),
          eq(invitations.status, 'pending')
        )
      );

    res.json({
      invitations: pendingInvitations,
      total: pendingInvitations.length,
    });
  } catch (error) {
    next(error);
  }
}

// Revoke invitation
export async function revokeInvitation(req, res, next) {
  try {
    const { invitationId } = req.params;
    const organizationId = req.organization.id;

    // Check if user has permission (only admins)
    if (req.membership.role !== 'admin') {
      return res.status(403).json({
        error: 'Only admins can revoke invitations',
      });
    }

    // Update invitation status
    const result = await db
      .update(invitations)
      .set({ status: 'revoked' })
      .where(
        and(
          eq(invitations.id, invitationId),
          eq(invitations.organizationId, organizationId)
        )
      )
      .returning();

    if (result.length === 0) {
      return res.status(404).json({
        error: 'Invitation not found',
      });
    }

    logger.info(`✅ Invitation revoked: ${invitationId}`);

    res.json({
      message: 'Invitation revoked successfully',
    });
  } catch (error) {
    next(error);
  }
}

export default {
  getTeamMembers,
  inviteTeamMember,
  acceptInvitation,
  updateMemberRole,
  removeMember,
  getPendingInvitations,
  revokeInvitation,
};
