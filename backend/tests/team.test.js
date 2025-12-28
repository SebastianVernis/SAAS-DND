const request = require('supertest');
const app = require('../src/server.js');
import {
  cleanDatabase,
  createTestUser,
  generateTestToken,
  createTestInvitation,
} from './helpers/testDb.js';
const { db } = require('../src/db/client.js');
const { organizationMembers, invitations } = require('../src/db/schema.js');
const { eq, and } = require('drizzle-orm');

describe('Team Management API', () => {
  let adminUser;
  let editorUser;
  let viewerUser;
  let adminToken;
  let editorToken;
  let viewerToken;
  let organization;

  beforeEach(async () => {
    await cleanDatabase();

    // Create admin user
    adminUser = await createTestUser({
      email: 'admin@example.com',
      name: 'Admin User',
      role: 'admin',
      plan: 'teams', // Teams plan allows multiple members
    });
    adminToken = await generateTestToken(adminUser.user, adminUser.organization.id);
    organization = adminUser.organization;

    // Create editor user in same organization
    editorUser = await createTestUser({
      email: 'editor@example.com',
      name: 'Editor User',
      role: 'editor',
    });
    // Add editor to admin's organization
    await db.insert(organizationMembers).values({
      organizationId: organization.id,
      userId: editorUser.user.id,
      role: 'editor',
      status: 'active',
    });
    editorToken = await generateTestToken(editorUser.user, organization.id);

    // Create viewer user in same organization
    viewerUser = await createTestUser({
      email: 'viewer@example.com',
      name: 'Viewer User',
      role: 'viewer',
    });
    await db.insert(organizationMembers).values({
      organizationId: organization.id,
      userId: viewerUser.user.id,
      role: 'viewer',
      status: 'active',
    });
    viewerToken = await generateTestToken(viewerUser.user, organization.id);
  });

  describe('GET /api/team/members', () => {
    it('should return all team members', async () => {
      const response = await request(app)
        .get('/api/team/members')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('members');
      expect(response.body).toHaveProperty('total');
      expect(response.body.members).toBeInstanceOf(Array);
      expect(response.body.total).toBeGreaterThanOrEqual(3); // admin, editor, viewer

      // Check member structure
      const member = response.body.members[0];
      expect(member).toHaveProperty('userId');
      expect(member).toHaveProperty('role');
      expect(member).toHaveProperty('status');
      expect(member).toHaveProperty('userName');
      expect(member).toHaveProperty('userEmail');
    });

    it('should allow editors to view members', async () => {
      const response = await request(app)
        .get('/api/team/members')
        .set('Authorization', `Bearer ${editorToken}`)
        .expect(200);

      expect(response.body.members).toBeDefined();
    });

    it('should allow viewers to view members', async () => {
      const response = await request(app)
        .get('/api/team/members')
        .set('Authorization', `Bearer ${viewerToken}`)
        .expect(200);

      expect(response.body.members).toBeDefined();
    });

    it('should reject request without authentication', async () => {
      const response = await request(app)
        .get('/api/team/members')
        .expect(401);

      expect(response.body.error).toContain('No token provided');
    });
  });

  describe('POST /api/team/invite', () => {
    it('should allow admin to invite new member', async () => {
      const inviteData = {
        email: 'newmember@example.com',
        role: 'editor',
        message: 'Welcome to the team!',
      };

      const response = await request(app)
        .post('/api/team/invite')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(inviteData)
        .expect(201);

      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('invitation');
      expect(response.body.message).toContain('sent successfully');
      expect(response.body.invitation.email).toBe(inviteData.email);
      expect(response.body.invitation.role).toBe(inviteData.role);

      // Verify invitation was created in database
      const [invitation] = await db
        .select()
        .from(invitations)
        .where(eq(invitations.email, inviteData.email))
        .limit(1);

      expect(invitation).toBeDefined();
      expect(invitation.status).toBe('pending');
      expect(invitation.token).toBeDefined();
    });

    it('should reject invitation from editor', async () => {
      const inviteData = {
        email: 'newmember@example.com',
        role: 'editor',
      };

      const response = await request(app)
        .post('/api/team/invite')
        .set('Authorization', `Bearer ${editorToken}`)
        .send(inviteData)
        .expect(403);

      expect(response.body.error).toContain('Only admins');
    });

    it('should reject invitation from viewer', async () => {
      const inviteData = {
        email: 'newmember@example.com',
        role: 'editor',
      };

      const response = await request(app)
        .post('/api/team/invite')
        .set('Authorization', `Bearer ${viewerToken}`)
        .send(inviteData)
        .expect(403);

      expect(response.body.error).toContain('Only admins');
    });

    it('should reject duplicate invitation', async () => {
      const inviteData = {
        email: 'duplicate@example.com',
        role: 'editor',
      };

      // Send first invitation
      await request(app)
        .post('/api/team/invite')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(inviteData);

      // Try to send again
      const response = await request(app)
        .post('/api/team/invite')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(inviteData)
        .expect(409);

      expect(response.body.error).toContain('already sent');
    });

    it('should reject invitation for existing member', async () => {
      const inviteData = {
        email: editorUser.user.email, // Already a member
        role: 'editor',
      };

      const response = await request(app)
        .post('/api/team/invite')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(inviteData)
        .expect(409);

      expect(response.body.error).toContain('already a member');
    });

    it('should enforce member limit for plan', async () => {
      // Create a free plan user (limit: 1 member)
      const freeUser = await createTestUser({
        email: 'free@example.com',
        plan: 'free',
      });
      const freeToken = await generateTestToken(freeUser.user, freeUser.organization.id);

      const inviteData = {
        email: 'newmember@example.com',
        role: 'editor',
      };

      const response = await request(app)
        .post('/api/team/invite')
        .set('Authorization', `Bearer ${freeToken}`)
        .send(inviteData)
        .expect(403);

      expect(response.body.error).toContain('Member limit reached');
      expect(response.body.upgrade).toBe(true);
    });

    it('should validate email format', async () => {
      const inviteData = {
        email: 'invalid-email',
        role: 'editor',
      };

      const response = await request(app)
        .post('/api/team/invite')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(inviteData)
        .expect(400);

      expect(response.body.error).toBe('Validation failed');
    });

    it('should validate role', async () => {
      const inviteData = {
        email: 'test@example.com',
        role: 'invalid-role',
      };

      const response = await request(app)
        .post('/api/team/invite')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(inviteData)
        .expect(400);

      expect(response.body.error).toBe('Validation failed');
    });
  });

  describe('POST /api/team/accept-invite', () => {
    it('should accept valid invitation', async () => {
      // Create invitation
      const invitation = await createTestInvitation({
        organizationId: organization.id,
        invitedBy: adminUser.user.id,
        email: 'invited@example.com',
        role: 'editor',
      });

      // Create user with matching email
      const invitedUser = await createTestUser({
        email: 'invited@example.com',
        name: 'Invited User',
      });
      const invitedToken = await generateTestToken(
        invitedUser.user,
        invitedUser.organization.id
      );

      const response = await request(app)
        .post('/api/team/accept-invite')
        .set('Authorization', `Bearer ${invitedToken}`)
        .send({ token: invitation.token })
        .expect(200);

      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('organization');
      expect(response.body).toHaveProperty('membership');
      expect(response.body.message).toContain('accepted successfully');
      expect(response.body.membership.role).toBe('editor');

      // Verify membership was created
      const [membership] = await db
        .select()
        .from(organizationMembers)
        .where(
          and(
            eq(organizationMembers.organizationId, organization.id),
            eq(organizationMembers.userId, invitedUser.user.id)
          )
        )
        .limit(1);

      expect(membership).toBeDefined();
      expect(membership.role).toBe('editor');
      expect(membership.status).toBe('active');

      // Verify invitation was marked as accepted
      const [updatedInvitation] = await db
        .select()
        .from(invitations)
        .where(eq(invitations.id, invitation.id))
        .limit(1);

      expect(updatedInvitation.status).toBe('accepted');
    });

    it('should reject invalid token', async () => {
      const invitedUser = await createTestUser({ email: 'invited@example.com' });
      const invitedToken = await generateTestToken(
        invitedUser.user,
        invitedUser.organization.id
      );

      const response = await request(app)
        .post('/api/team/accept-invite')
        .set('Authorization', `Bearer ${invitedToken}`)
        .send({ token: 'invalid-token' })
        .expect(404);

      expect(response.body.error).toContain('not found');
    });

    it('should reject expired invitation', async () => {
      // Create expired invitation
      const expiredDate = new Date(Date.now() - 8 * 24 * 60 * 60 * 1000); // 8 days ago
      const invitation = await createTestInvitation({
        organizationId: organization.id,
        invitedBy: adminUser.user.id,
        email: 'invited@example.com',
      });

      // Manually set expiration date
      await db
        .update(invitations)
        .set({ expiresAt: expiredDate })
        .where(eq(invitations.id, invitation.id));

      const invitedUser = await createTestUser({ email: 'invited@example.com' });
      const invitedToken = await generateTestToken(
        invitedUser.user,
        invitedUser.organization.id
      );

      const response = await request(app)
        .post('/api/team/accept-invite')
        .set('Authorization', `Bearer ${invitedToken}`)
        .send({ token: invitation.token })
        .expect(400);

      expect(response.body.error).toContain('expired');
    });

    it('should reject invitation with mismatched email', async () => {
      const invitation = await createTestInvitation({
        organizationId: organization.id,
        invitedBy: adminUser.user.id,
        email: 'invited@example.com',
      });

      // Create user with different email
      const wrongUser = await createTestUser({ email: 'wrong@example.com' });
      const wrongToken = await generateTestToken(wrongUser.user, wrongUser.organization.id);

      const response = await request(app)
        .post('/api/team/accept-invite')
        .set('Authorization', `Bearer ${wrongToken}`)
        .send({ token: invitation.token })
        .expect(403);

      expect(response.body.error).toContain('does not match');
    });

    it('should require authentication', async () => {
      const invitation = await createTestInvitation({
        organizationId: organization.id,
        invitedBy: adminUser.user.id,
      });

      const response = await request(app)
        .post('/api/team/accept-invite')
        .send({ token: invitation.token })
        .expect(401);

      expect(response.body.error).toContain('No token provided');
    });
  });

  describe('PATCH /api/team/members/:memberId', () => {
    it('should allow admin to change member role', async () => {
      // Get editor membership
      const [editorMembership] = await db
        .select()
        .from(organizationMembers)
        .where(
          and(
            eq(organizationMembers.organizationId, organization.id),
            eq(organizationMembers.userId, editorUser.user.id)
          )
        )
        .limit(1);

      const response = await request(app)
        .patch(`/api/team/members/${editorMembership.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ role: 'viewer' })
        .expect(200);

      expect(response.body.message).toContain('updated successfully');
      expect(response.body.member.role).toBe('viewer');

      // Verify in database
      const [updated] = await db
        .select()
        .from(organizationMembers)
        .where(eq(organizationMembers.id, editorMembership.id))
        .limit(1);

      expect(updated.role).toBe('viewer');
    });

    it('should reject role change from editor', async () => {
      const [viewerMembership] = await db
        .select()
        .from(organizationMembers)
        .where(
          and(
            eq(organizationMembers.organizationId, organization.id),
            eq(organizationMembers.userId, viewerUser.user.id)
          )
        )
        .limit(1);

      const response = await request(app)
        .patch(`/api/team/members/${viewerMembership.id}`)
        .set('Authorization', `Bearer ${editorToken}`)
        .send({ role: 'editor' })
        .expect(403);

      expect(response.body.error).toContain('Only admins');
    });

    it('should prevent admin from changing own role', async () => {
      const [adminMembership] = await db
        .select()
        .from(organizationMembers)
        .where(
          and(
            eq(organizationMembers.organizationId, organization.id),
            eq(organizationMembers.userId, adminUser.user.id)
          )
        )
        .limit(1);

      const response = await request(app)
        .patch(`/api/team/members/${adminMembership.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ role: 'editor' })
        .expect(400);

      expect(response.body.error).toContain('cannot change your own role');
    });

    it('should reject invalid role', async () => {
      const [editorMembership] = await db
        .select()
        .from(organizationMembers)
        .where(
          and(
            eq(organizationMembers.organizationId, organization.id),
            eq(organizationMembers.userId, editorUser.user.id)
          )
        )
        .limit(1);

      const response = await request(app)
        .patch(`/api/team/members/${editorMembership.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ role: 'invalid-role' })
        .expect(400);

      expect(response.body.error).toBe('Validation failed');
    });
  });

  describe('DELETE /api/team/members/:memberId', () => {
    it('should allow admin to remove member', async () => {
      const [editorMembership] = await db
        .select()
        .from(organizationMembers)
        .where(
          and(
            eq(organizationMembers.organizationId, organization.id),
            eq(organizationMembers.userId, editorUser.user.id)
          )
        )
        .limit(1);

      const response = await request(app)
        .delete(`/api/team/members/${editorMembership.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.message).toContain('removed successfully');

      // Verify member was deleted
      const [deleted] = await db
        .select()
        .from(organizationMembers)
        .where(eq(organizationMembers.id, editorMembership.id))
        .limit(1);

      expect(deleted).toBeUndefined();
    });

    it('should reject removal from editor', async () => {
      const [viewerMembership] = await db
        .select()
        .from(organizationMembers)
        .where(
          and(
            eq(organizationMembers.organizationId, organization.id),
            eq(organizationMembers.userId, viewerUser.user.id)
          )
        )
        .limit(1);

      const response = await request(app)
        .delete(`/api/team/members/${viewerMembership.id}`)
        .set('Authorization', `Bearer ${editorToken}`)
        .expect(403);

      expect(response.body.error).toContain('Only admins');
    });

    it('should prevent admin from removing themselves', async () => {
      const [adminMembership] = await db
        .select()
        .from(organizationMembers)
        .where(
          and(
            eq(organizationMembers.organizationId, organization.id),
            eq(organizationMembers.userId, adminUser.user.id)
          )
        )
        .limit(1);

      const response = await request(app)
        .delete(`/api/team/members/${adminMembership.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(400);

      expect(response.body.error).toContain('cannot remove yourself');
    });
  });

  describe('GET /api/team/invitations', () => {
    it('should return pending invitations', async () => {
      // Create some invitations
      await createTestInvitation({
        organizationId: organization.id,
        invitedBy: adminUser.user.id,
        email: 'pending1@example.com',
      });
      await createTestInvitation({
        organizationId: organization.id,
        invitedBy: adminUser.user.id,
        email: 'pending2@example.com',
      });

      const response = await request(app)
        .get('/api/team/invitations')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('invitations');
      expect(response.body).toHaveProperty('total');
      expect(response.body.invitations).toBeInstanceOf(Array);
      expect(response.body.total).toBeGreaterThanOrEqual(2);
    });
  });

  describe('DELETE /api/team/invitations/:invitationId', () => {
    it('should allow admin to revoke invitation', async () => {
      const invitation = await createTestInvitation({
        organizationId: organization.id,
        invitedBy: adminUser.user.id,
      });

      const response = await request(app)
        .delete(`/api/team/invitations/${invitation.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.message).toContain('revoked successfully');

      // Verify invitation was revoked
      const [revoked] = await db
        .select()
        .from(invitations)
        .where(eq(invitations.id, invitation.id))
        .limit(1);

      expect(revoked.status).toBe('revoked');
    });

    it('should reject revocation from editor', async () => {
      const invitation = await createTestInvitation({
        organizationId: organization.id,
        invitedBy: adminUser.user.id,
      });

      const response = await request(app)
        .delete(`/api/team/invitations/${invitation.id}`)
        .set('Authorization', `Bearer ${editorToken}`)
        .expect(403);

      expect(response.body.error).toContain('Only admins');
    });
  });
});
