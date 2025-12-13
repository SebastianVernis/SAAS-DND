import express from 'express';
import { validate } from '../utils/validators.js';
import { createProjectSchema, updateProjectSchema } from '../utils/validators.js';
import { requireAuth } from '../middleware/auth.js';
import { requirePermission } from '../middleware/permissions.js';
import {
  getProjects,
  createProject,
  getProject,
  updateProject,
  deleteProject,
  duplicateProject,
} from '../controllers/projectsController.js';

const router = express.Router();

// All project routes require authentication
router.use(requireAuth);

// Get all projects (any role)
router.get('/', getProjects);

// Create project (admins and editors)
router.post('/', requirePermission('projects', 'create'), validate(createProjectSchema), createProject);

// Get single project (any role)
router.get('/:projectId', getProject);

// Update project (admins and editors)
router.put('/:projectId', requirePermission('projects', 'update'), validate(updateProjectSchema), updateProject);

// Delete project (admins and editors)
router.delete('/:projectId', requirePermission('projects', 'delete'), deleteProject);

// Duplicate project (admins and editors)
router.post('/:projectId/duplicate', requirePermission('projects', 'create'), duplicateProject);

export default router;
