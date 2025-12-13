import { PERMISSIONS } from '../config/constants.js';

// Require specific role
export function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !req.membership) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const userRole = req.membership.role;

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        error: 'Insufficient permissions',
        required: allowedRoles,
        current: userRole,
      });
    }

    next();
  };
}

// Check specific permission
export function requirePermission(resource, action) {
  return (req, res, next) => {
    if (!req.user || !req.membership) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const userRole = req.membership.role;
    const rolePermissions = PERMISSIONS[userRole];

    if (!rolePermissions || !rolePermissions[resource]) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    if (!rolePermissions[resource].includes(action)) {
      return res.status(403).json({
        error: 'Insufficient permissions',
        required: `${resource}:${action}`,
        role: userRole,
      });
    }

    next();
  };
}

// Check if user can perform action on resource
export function canPerform(role, resource, action) {
  const rolePermissions = PERMISSIONS[role];
  if (!rolePermissions || !rolePermissions[resource]) {
    return false;
  }
  return rolePermissions[resource].includes(action);
}

export default {
  requireRole,
  requirePermission,
  canPerform,
};
