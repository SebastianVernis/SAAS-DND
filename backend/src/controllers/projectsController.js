import { logger } from '../utils/logger.js';
import { db } from '../db/client.js';
import { projects, components } from '../db/schema.js';
import { eq, and, desc } from 'drizzle-orm';
import { PLAN_LIMITS, PROJECT_TEMPLATES } from '../config/constants.js';

// Get all projects
export async function getProjects(req, res, next) {
  try {
    const organizationId = req.organization.id;
    const { page = 1, limit = 20, search } = req.query;

    const offset = (page - 1) * limit;

    // Build query
    let query = db
      .select()
      .from(projects)
      .where(eq(projects.organizationId, organizationId))
      .orderBy(desc(projects.updatedAt))
      .limit(parseInt(limit))
      .offset(offset);

    const allProjects = await query;

    // Filter by search if provided
    const filteredProjects = search
      ? allProjects.filter(
          (p) =>
            p.name.toLowerCase().includes(search.toLowerCase()) ||
            p.description?.toLowerCase().includes(search.toLowerCase())
        )
      : allProjects;

    res.json({
      projects: filteredProjects,
      total: filteredProjects.length,
      page: parseInt(page),
      limit: parseInt(limit),
    });
  } catch (error) {
    next(error);
  }
}

// Create project
export async function createProject(req, res, next) {
  try {
    const { name, description, template = 'blank' } = req.body;
    const organizationId = req.organization.id;
    const userId = req.user.id;

    // Check plan limits
    const existingProjects = await db
      .select()
      .from(projects)
      .where(eq(projects.organizationId, organizationId));

    const planLimits = PLAN_LIMITS[req.subscription.plan];

    if (planLimits.projects !== -1 && existingProjects.length >= planLimits.projects) {
      return res.status(403).json({
        error: 'Project limit reached for your plan',
        limit: planLimits.projects,
        current: existingProjects.length,
        upgrade: true,
      });
    }

    // Get template
    const templateData = PROJECT_TEMPLATES[template] || PROJECT_TEMPLATES.blank;

    // Create project
    const [newProject] = await db
      .insert(projects)
      .values({
        organizationId,
        name,
        description: description || null,
        html: templateData.html,
        css: templateData.css,
        js: templateData.js,
        createdBy: userId,
      })
      .returning();

    logger.info(`✅ Project created: ${name} (${newProject.id})`);

    res.status(201).json({
      message: 'Project created successfully',
      project: newProject,
    });
  } catch (error) {
    next(error);
  }
}

// Get single project
export async function getProject(req, res, next) {
  try {
    const { projectId } = req.params;
    const organizationId = req.organization.id;

    // Get project
    const [project] = await db
      .select()
      .from(projects)
      .where(and(eq(projects.id, projectId), eq(projects.organizationId, organizationId)))
      .limit(1);

    if (!project) {
      return res.status(404).json({
        error: 'Project not found',
      });
    }

    // Get components
    const projectComponents = await db
      .select()
      .from(components)
      .where(eq(components.projectId, projectId));

    res.json({
      project,
      components: projectComponents,
    });
  } catch (error) {
    next(error);
  }
}

// Update project
export async function updateProject(req, res, next) {
  try {
    const { projectId } = req.params;
    const { name, description, html, css, js, isPublic } = req.body;
    const organizationId = req.organization.id;

    // Check if project exists and belongs to organization
    const [existingProject] = await db
      .select()
      .from(projects)
      .where(and(eq(projects.id, projectId), eq(projects.organizationId, organizationId)))
      .limit(1);

    if (!existingProject) {
      return res.status(404).json({
        error: 'Project not found',
      });
    }

    // Check permissions (editors and admins can edit)
    const canEdit = ['admin', 'editor'].includes(req.membership.role);
    if (!canEdit) {
      return res.status(403).json({
        error: 'You do not have permission to edit projects',
      });
    }

    // Build update object
    const updates = {
      updatedAt: new Date(),
    };

    if (name !== undefined) updates.name = name;
    if (description !== undefined) updates.description = description;
    if (html !== undefined) updates.html = html;
    if (css !== undefined) updates.css = css;
    if (js !== undefined) updates.js = js;
    if (isPublic !== undefined) updates.isPublic = isPublic;

    // Update project
    const [updated] = await db
      .update(projects)
      .set(updates)
      .where(eq(projects.id, projectId))
      .returning();

    logger.info(`✅ Project updated: ${projectId}`);

    res.json({
      message: 'Project updated successfully',
      project: updated,
    });
  } catch (error) {
    next(error);
  }
}

// Delete project
export async function deleteProject(req, res, next) {
  try {
    const { projectId } = req.params;
    const organizationId = req.organization.id;

    // Check if project exists and belongs to organization
    const [existingProject] = await db
      .select()
      .from(projects)
      .where(and(eq(projects.id, projectId), eq(projects.organizationId, organizationId)))
      .limit(1);

    if (!existingProject) {
      return res.status(404).json({
        error: 'Project not found',
      });
    }

    // Check permissions (only admins and editors can delete)
    const canDelete = ['admin', 'editor'].includes(req.membership.role);
    if (!canDelete) {
      return res.status(403).json({
        error: 'You do not have permission to delete projects',
      });
    }

    // Delete project (components will be deleted via CASCADE)
    await db.delete(projects).where(eq(projects.id, projectId));

    logger.info(`✅ Project deleted: ${projectId}`);

    res.json({
      message: 'Project deleted successfully',
    });
  } catch (error) {
    next(error);
  }
}

// Duplicate project
export async function duplicateProject(req, res, next) {
  try {
    const { projectId } = req.params;
    const organizationId = req.organization.id;
    const userId = req.user.id;

    // Check plan limits
    const existingProjects = await db
      .select()
      .from(projects)
      .where(eq(projects.organizationId, organizationId));

    const planLimits = PLAN_LIMITS[req.subscription.plan];

    if (planLimits.projects !== -1 && existingProjects.length >= planLimits.projects) {
      return res.status(403).json({
        error: 'Project limit reached for your plan',
        limit: planLimits.projects,
        current: existingProjects.length,
        upgrade: true,
      });
    }

    // Get original project
    const [original] = await db
      .select()
      .from(projects)
      .where(and(eq(projects.id, projectId), eq(projects.organizationId, organizationId)))
      .limit(1);

    if (!original) {
      return res.status(404).json({
        error: 'Project not found',
      });
    }

    // Create duplicate
    const [duplicate] = await db
      .insert(projects)
      .values({
        organizationId,
        name: `${original.name} (Copy)`,
        description: original.description,
        html: original.html,
        css: original.css,
        js: original.js,
        isPublic: false, // Duplicates are private by default
        createdBy: userId,
      })
      .returning();

    // Get and duplicate components
    const originalComponents = await db
      .select()
      .from(components)
      .where(eq(components.projectId, projectId));

    if (originalComponents.length > 0) {
      await db.insert(components).values(
        originalComponents.map((comp) => ({
          projectId: duplicate.id,
          name: comp.name,
          type: comp.type,
          html: comp.html,
          css: comp.css,
          props: comp.props,
          position: comp.position,
        }))
      );
    }

    logger.info(`✅ Project duplicated: ${projectId} → ${duplicate.id}`);

    res.status(201).json({
      message: 'Project duplicated successfully',
      project: duplicate,
    });
  } catch (error) {
    next(error);
  }
}

export default {
  getProjects,
  createProject,
  getProject,
  updateProject,
  deleteProject,
  duplicateProject,
};
