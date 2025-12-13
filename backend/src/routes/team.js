import express from 'express';
import { validate } from '../utils/validators.js';
import { inviteTeamMemberSchema, updateMemberRoleSchema } from '../utils/validators.js';
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/permissions.js';
import {
  getTeamMembers,
  inviteTeamMember,
  acceptInvitation,
  updateMemberRole,
  removeMember,
  getPendingInvitations,
  revokeInvitation,
} from '../controllers/teamController.js';

const router = express.Router();

// All team routes require authentication
router.use(requireAuth);

// Get team members
router.get('/members', getTeamMembers);

// Invite team member (admins only)
router.post('/invite', requireRole('admin'), validate(inviteTeamMemberSchema), inviteTeamMember);

// Accept invitation (user must be logged in)
router.post('/accept-invite', acceptInvitation);

// Update member role (admins only)
router.patch('/members/:memberId', requireRole('admin'), validate(updateMemberRoleSchema), updateMemberRole);

// Remove member (admins only)
router.delete('/members/:memberId', requireRole('admin'), removeMember);

// Get pending invitations
router.get('/invitations', getPendingInvitations);

// Revoke invitation (admins only)
router.delete('/invitations/:invitationId', requireRole('admin'), revokeInvitation);

export default router;
