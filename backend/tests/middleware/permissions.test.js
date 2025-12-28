const { requireRole, requirePermission, canPerform } = require('../../src/middleware/permissions.js');

// Mock constants
jest.mock('../../src/config/constants.js', () => ({
  PERMISSIONS: {
    admin: {
      projects: ['create', 'read', 'update', 'delete'],
      team: ['invite', 'remove', 'update_role'],
      settings: ['update'],
    },
    editor: {
      projects: ['create', 'read', 'update'],
      team: ['read'],
    },
    viewer: {
      projects: ['read'],
      team: ['read'],
    },
  },
}));

describe('Permissions Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      user: null,
      membership: null,
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  describe('requireRole', () => {
    it('should allow user with correct role', () => {
      req.user = { id: 'user-123' };
      req.membership = { role: 'admin' };

      const middleware = requireRole('admin', 'editor');
      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should allow user with any of the allowed roles', () => {
      req.user = { id: 'user-123' };
      req.membership = { role: 'editor' };

      const middleware = requireRole('admin', 'editor');
      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should reject user without required role', () => {
      req.user = { id: 'user-123' };
      req.membership = { role: 'viewer' };

      const middleware = requireRole('admin', 'editor');
      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Insufficient permissions',
        required: ['admin', 'editor'],
        current: 'viewer',
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 401 when user not authenticated', () => {
      const middleware = requireRole('admin');
      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Authentication required' });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 401 when membership missing', () => {
      req.user = { id: 'user-123' };
      // membership is null

      const middleware = requireRole('admin');
      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Authentication required' });
    });

    it('should work with single role', () => {
      req.user = { id: 'user-123' };
      req.membership = { role: 'admin' };

      const middleware = requireRole('admin');
      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
    });
  });

  describe('requirePermission', () => {
    it('should allow user with correct permission', () => {
      req.user = { id: 'user-123' };
      req.membership = { role: 'admin' };

      const middleware = requirePermission('projects', 'delete');
      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should allow editor to create projects', () => {
      req.user = { id: 'user-123' };
      req.membership = { role: 'editor' };

      const middleware = requirePermission('projects', 'create');
      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should reject editor from deleting projects', () => {
      req.user = { id: 'user-123' };
      req.membership = { role: 'editor' };

      const middleware = requirePermission('projects', 'delete');
      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Insufficient permissions',
        required: 'projects:delete',
        role: 'editor',
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should reject viewer from creating projects', () => {
      req.user = { id: 'user-123' };
      req.membership = { role: 'viewer' };

      const middleware = requirePermission('projects', 'create');
      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(next).not.toHaveBeenCalled();
    });

    it('should allow viewer to read projects', () => {
      req.user = { id: 'user-123' };
      req.membership = { role: 'viewer' };

      const middleware = requirePermission('projects', 'read');
      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should return 401 when not authenticated', () => {
      const middleware = requirePermission('projects', 'read');
      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Authentication required' });
    });

    it('should reject access to non-existent resource', () => {
      req.user = { id: 'user-123' };
      req.membership = { role: 'admin' };

      const middleware = requirePermission('non-existent', 'read');
      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('canPerform', () => {
    it('should return true for admin deleting projects', () => {
      const result = canPerform('admin', 'projects', 'delete');
      expect(result).toBe(true);
    });

    it('should return false for editor deleting projects', () => {
      const result = canPerform('editor', 'projects', 'delete');
      expect(result).toBe(false);
    });

    it('should return true for viewer reading projects', () => {
      const result = canPerform('viewer', 'projects', 'read');
      expect(result).toBe(true);
    });

    it('should return false for viewer creating projects', () => {
      const result = canPerform('viewer', 'projects', 'create');
      expect(result).toBe(false);
    });

    it('should return false for non-existent role', () => {
      const result = canPerform('superadmin', 'projects', 'read');
      expect(result).toBe(false);
    });

    it('should return false for non-existent resource', () => {
      const result = canPerform('admin', 'non-existent', 'read');
      expect(result).toBe(false);
    });

    it('should return false for non-existent action', () => {
      const result = canPerform('admin', 'projects', 'non-existent-action');
      expect(result).toBe(false);
    });

    it('should handle all role/resource combinations correctly', () => {
      // Admin permissions
      expect(canPerform('admin', 'projects', 'create')).toBe(true);
      expect(canPerform('admin', 'projects', 'read')).toBe(true);
      expect(canPerform('admin', 'projects', 'update')).toBe(true);
      expect(canPerform('admin', 'projects', 'delete')).toBe(true);
      expect(canPerform('admin', 'team', 'invite')).toBe(true);

      // Editor permissions
      expect(canPerform('editor', 'projects', 'create')).toBe(true);
      expect(canPerform('editor', 'projects', 'read')).toBe(true);
      expect(canPerform('editor', 'projects', 'update')).toBe(true);
      expect(canPerform('editor', 'projects', 'delete')).toBe(false);
      expect(canPerform('editor', 'team', 'invite')).toBe(false);

      // Viewer permissions
      expect(canPerform('viewer', 'projects', 'create')).toBe(false);
      expect(canPerform('viewer', 'projects', 'read')).toBe(true);
      expect(canPerform('viewer', 'projects', 'update')).toBe(false);
      expect(canPerform('viewer', 'projects', 'delete')).toBe(false);
      expect(canPerform('viewer', 'team', 'invite')).toBe(false);
    });
  });
});
