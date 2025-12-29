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

    // Optimized: Single query with LEFT JOIN to get project + components
    // This eliminates N+1 query pattern (2 queries → 1 query)
    const result = await db
      .select({
        // Project fields
        projectId: projects.id,
        projectName: projects.name,
        projectDescription: projects.description,
        projectHtml: projects.html,
        projectCss: projects.css,
        projectJs: projects.js,
        projectThumbnail: projects.thumbnail,
        projectIsPublic: projects.isPublic,
        projectCreatedBy: projects.createdBy,
        projectCreatedAt: projects.createdAt,
        projectUpdatedAt: projects.updatedAt,
        projectOrganizationId: projects.organizationId,
        // Component fields (will be null if no components)
        componentId: components.id,
        componentName: components.name,
        componentType: components.type,
        componentHtml: components.html,
        componentCss: components.css,
        componentProps: components.props,
        componentPosition: components.position,
        componentCreatedAt: components.createdAt,
        componentUpdatedAt: components.updatedAt,
      })
      .from(projects)
      .leftJoin(components, eq(components.projectId, projects.id))
      .where(and(eq(projects.id, projectId), eq(projects.organizationId, organizationId)));

    if (!result || result.length === 0) {
      return res.status(404).json({
        error: 'Project not found',
      });
    }

    // Reconstruct project object from first row
    const firstRow = result[0];
    const project = {
      id: firstRow.projectId,
      organizationId: firstRow.projectOrganizationId,
      name: firstRow.projectName,
      description: firstRow.projectDescription,
      html: firstRow.projectHtml,
      css: firstRow.projectCss,
      js: firstRow.projectJs,
      thumbnail: firstRow.projectThumbnail,
      isPublic: firstRow.projectIsPublic,
      createdBy: firstRow.projectCreatedBy,
      createdAt: firstRow.projectCreatedAt,
      updatedAt: firstRow.projectUpdatedAt,
    };

    // Reconstruct components array (filter out null components from LEFT JOIN)
    const projectComponents = result
      .filter((row) => row.componentId !== null)
      .map((row) => ({
        id: row.componentId,
        projectId: firstRow.projectId,
        name: row.componentName,
        type: row.componentType,
        html: row.componentHtml,
        css: row.componentCss,
        props: row.componentProps,
        position: row.componentPosition,
        createdAt: row.componentCreatedAt,
        updatedAt: row.componentUpdatedAt,
      }));

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

    // Optimized: Get original project with components in single query
    const originalData = await db
      .select({
        projectId: projects.id,
        projectName: projects.name,
        projectDescription: projects.description,
        projectHtml: projects.html,
        projectCss: projects.css,
        projectJs: projects.js,
        componentId: components.id,
        componentName: components.name,
        componentType: components.type,
        componentHtml: components.html,
        componentCss: components.css,
        componentProps: components.props,
        componentPosition: components.position,
      })
      .from(projects)
      .leftJoin(components, eq(components.projectId, projects.id))
      .where(and(eq(projects.id, projectId), eq(projects.organizationId, organizationId)));

    if (!originalData || originalData.length === 0) {
      return res.status(404).json({
        error: 'Project not found',
      });
    }

    const original = originalData[0];

    // Create duplicate
    const [duplicate] = await db
      .insert(projects)
      .values({
        organizationId,
        name: `${original.projectName} (Copy)`,
        description: original.projectDescription,
        html: original.projectHtml,
        css: original.projectCss,
        js: original.projectJs,
        isPublic: false, // Duplicates are private by default
        createdBy: userId,
      })
      .returning();

    // Duplicate components (already fetched in the JOIN)
    const originalComponents = originalData
      .filter((row) => row.componentId !== null)
      .map((row) => ({
        projectId: duplicate.id,
        name: row.componentName,
        type: row.componentType,
        html: row.componentHtml,
        css: row.componentCss,
        props: row.componentProps,
        position: row.componentPosition,
      }));

    if (originalComponents.length > 0) {
      await db.insert(components).values(originalComponents);
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
