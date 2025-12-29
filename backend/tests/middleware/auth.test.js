const { requireAuth, optionalAuth } = require('../../src/middleware/auth.js');
const { generateToken } = require('../../src/utils/jwt.js');
const { db } = require('../../src/db/client.js');

// Mock database
jest.mock('../../src/db/client.js', () => ({
  db: {
    select: jest.fn(),
  },
}));

describe('Auth Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      headers: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  describe('requireAuth', () => {
    it('should authenticate valid token and attach user to request', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
      };

      const mockMembership = {
        id: 'membership-123',
        userId: 'user-123',
        organizationId: 'org-123',
        role: 'admin',
      };

      const mockOrganization = {
        id: 'org-123',
        name: 'Test Org',
      };

      const mockSubscription = {
        id: 'sub-123',
        organizationId: 'org-123',
        plan: 'pro',
      };

      const token = generateToken({ userId: mockUser.id });
      req.headers.authorization = `Bearer ${token}`;

      // Mock database calls for optimized JOIN query
      const mockJoinResult = [{
        userId: mockUser.id,
        userEmail: mockUser.email,
        userName: mockUser.name,
        userImage: null,
        userEmailVerified: false,
        userCreatedAt: new Date(),
        membershipId: mockMembership.id,
        membershipRole: mockMembership.role,
        membershipStatus: 'active',
        membershipJoinedAt: new Date(),
        orgId: mockOrganization.id,
        orgName: mockOrganization.name,
        orgSlug: 'test-org',
        orgType: 'personal',
        orgIndustry: null,
        orgTeamSize: null,
        subId: mockSubscription.id,
        subPlan: mockSubscription.plan,
        subStatus: 'active',
        subCurrentPeriodStart: new Date(),
        subCurrentPeriodEnd: new Date(),
        subCancelAtPeriodEnd: false,
      }];

      const selectMock = jest.fn().mockReturnValue({
        from: jest.fn().mockReturnValue({
          leftJoin: jest.fn().mockReturnValue({
            leftJoin: jest.fn().mockReturnValue({
              leftJoin: jest.fn().mockReturnValue({
                where: jest.fn().mockReturnValue({
                  limit: jest.fn().mockResolvedValue(mockJoinResult),
                }),
              }),
            }),
          }),
        }),
      });

      db.select = selectMock;

      await requireAuth(req, res, next);

      expect(req.user).toEqual(mockUser);
      expect(req.organization).toEqual(mockOrganization);
      expect(req.subscription).toEqual(mockSubscription);
      expect(req.membership).toEqual(mockMembership);
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should return 401 when no token provided', async () => {
      await requireAuth(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'No token provided' });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 401 when token does not start with Bearer', async () => {
      req.headers.authorization = 'InvalidFormat token123';

      await requireAuth(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'No token provided' });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 401 for invalid token', async () => {
      req.headers.authorization = 'Bearer invalid-token';

      await requireAuth(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Invalid or expired token' });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 401 when user not found in database', async () => {
      const token = generateToken({ userId: 'non-existent-user' });
      req.headers.authorization = `Bearer ${token}`;

      const selectMock = jest.fn().mockReturnValue({
        from: jest.fn().mockReturnValue({
          leftJoin: jest.fn().mockReturnValue({
            leftJoin: jest.fn().mockReturnValue({
              leftJoin: jest.fn().mockReturnValue({
                where: jest.fn().mockReturnValue({
                  limit: jest.fn().mockResolvedValue([]), // No user found
                }),
              }),
            }),
          }),
        }),
      });
      db.select = selectMock;

      await requireAuth(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'User not found' });
      expect(next).not.toHaveBeenCalled();
    });

    it('should handle user without organization', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
      };

      const token = generateToken({ userId: mockUser.id });
      req.headers.authorization = `Bearer ${token}`;

      // Mock database calls - user exists but no membership (LEFT JOIN returns nulls)
      const mockJoinResult = [{
        userId: mockUser.id,
        userEmail: mockUser.email,
        userName: mockUser.name,
        userImage: null,
        userEmailVerified: false,
        userCreatedAt: new Date(),
        membershipId: null, // No membership
        membershipRole: null,
        membershipStatus: null,
        membershipJoinedAt: null,
        orgId: null,
        orgName: null,
        orgSlug: null,
        orgType: null,
        orgIndustry: null,
        orgTeamSize: null,
        subId: null,
        subPlan: null,
        subStatus: null,
        subCurrentPeriodStart: null,
        subCurrentPeriodEnd: null,
        subCancelAtPeriodEnd: null,
      }];

      const selectMock = jest.fn().mockReturnValue({
        from: jest.fn().mockReturnValue({
          leftJoin: jest.fn().mockReturnValue({
            leftJoin: jest.fn().mockReturnValue({
              leftJoin: jest.fn().mockReturnValue({
                where: jest.fn().mockReturnValue({
                  limit: jest.fn().mockResolvedValue(mockJoinResult),
                }),
              }),
            }),
          }),
        }),
      });

      db.select = selectMock;

      await requireAuth(req, res, next);

      expect(req.user).toEqual(mockUser);
      expect(req.organization).toBeUndefined();
      expect(req.subscription).toBeUndefined();
      expect(next).toHaveBeenCalled();
    });

    it('should return 500 on database error', async () => {
      const token = generateToken({ userId: 'user-123' });
      req.headers.authorization = `Bearer ${token}`;

      const selectMock = jest.fn().mockReturnValue({
        from: jest.fn().mockReturnValue({
          leftJoin: jest.fn().mockReturnValue({
            leftJoin: jest.fn().mockReturnValue({
              leftJoin: jest.fn().mockReturnValue({
                where: jest.fn().mockReturnValue({
                  limit: jest.fn().mockRejectedValue(new Error('Database error')),
                }),
              }),
            }),
          }),
        }),
      });
      db.select = selectMock;

      await requireAuth(req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Authentication failed' });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('optionalAuth', () => {
    it('should call next() when no token provided', async () => {
      await optionalAuth(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should authenticate when valid token provided', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
      };

      const token = generateToken({ userId: mockUser.id });
      req.headers.authorization = `Bearer ${token}`;

      const selectMock = jest.fn()
        .mockReturnValueOnce({
          from: jest.fn().mockReturnValue({
            where: jest.fn().mockReturnValue({
              limit: jest.fn().mockResolvedValue([mockUser]),
            }),
          }),
        })
        .mockReturnValueOnce({
          from: jest.fn().mockReturnValue({
            where: jest.fn().mockReturnValue({
              limit: jest.fn().mockResolvedValue([]),
            }),
          }),
        });

      db.select = selectMock;

      await optionalAuth(req, res, next);

      expect(req.user).toEqual(mockUser);
      expect(next).toHaveBeenCalled();
    });

    it('should call next() even if authentication fails', async () => {
      req.headers.authorization = 'Bearer invalid-token';

      await optionalAuth(req, res, next);

      expect(next).toHaveBeenCalled();
    });
  });
});
