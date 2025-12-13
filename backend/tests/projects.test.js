import request from 'supertest';
import app from '../src/server.js';
import {
  cleanDatabase,
  createTestUser,
  generateTestToken,
  createTestProject,
} from './helpers/testDb.js';
import { db } from '../src/db/client.js';
import { projects, components, organizationMembers } from '../src/db/schema.js';
import { eq, and } from 'drizzle-orm';

describe('Projects API', () => {
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
      plan: 'pro', // Pro plan for unlimited projects
    });
    adminToken = await generateTestToken(adminUser.user, adminUser.organization.id);
    organization = adminUser.organization;

    // Create editor user
    editorUser = await createTestUser({
      email: 'editor@example.com',
      name: 'Editor User',
      role: 'editor',
    });
    await db.insert(organizationMembers).values({
      organizationId: organization.id,
      userId: editorUser.user.id,
      role: 'editor',
      status: 'active',
    });
    editorToken = await generateTestToken(editorUser.user, organization.id);

    // Create viewer user
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

  describe('GET /api/projects', () => {
    it('should return all projects for organization', async () => {
      // Create some test projects
      await createTestProject({
        organizationId: organization.id,
        userId: adminUser.user.id,
        name: 'Project 1',
      });
      await createTestProject({
        organizationId: organization.id,
        userId: adminUser.user.id,
        name: 'Project 2',
      });

      const response = await request(app)
        .get('/api/projects')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('projects');
      expect(response.body).toHaveProperty('total');
      expect(response.body).toHaveProperty('page');
      expect(response.body).toHaveProperty('limit');
      expect(response.body.projects).toBeInstanceOf(Array);
      expect(response.body.total).toBeGreaterThanOrEqual(2);
    });

    it('should support pagination', async () => {
      // Create multiple projects
      for (let i = 0; i < 5; i++) {
        await createTestProject({
          organizationId: organization.id,
          userId: adminUser.user.id,
          name: `Project ${i + 1}`,
        });
      }

      const response = await request(app)
        .get('/api/projects?page=1&limit=2')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.projects.length).toBeLessThanOrEqual(2);
      expect(response.body.page).toBe(1);
      expect(response.body.limit).toBe(2);
    });

    it('should support search', async () => {
      await createTestProject({
        organizationId: organization.id,
        userId: adminUser.user.id,
        name: 'Landing Page',
      });
      await createTestProject({
        organizationId: organization.id,
        userId: adminUser.user.id,
        name: 'Dashboard',
      });

      const response = await request(app)
        .get('/api/projects?search=landing')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.projects.length).toBeGreaterThanOrEqual(1);
      expect(response.body.projects[0].name).toContain('Landing');
    });

    it('should allow all roles to view projects', async () => {
      await createTestProject({
        organizationId: organization.id,
        userId: adminUser.user.id,
      });

      // Admin
      await request(app)
        .get('/api/projects')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      // Editor
      await request(app)
        .get('/api/projects')
        .set('Authorization', `Bearer ${editorToken}`)
        .expect(200);

      // Viewer
      await request(app)
        .get('/api/projects')
        .set('Authorization', `Bearer ${viewerToken}`)
        .expect(200);
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .get('/api/projects')
        .expect(401);

      expect(response.body.error).toContain('No token provided');
    });
  });

  describe('POST /api/projects', () => {
    it('should create project with blank template', async () => {
      const projectData = {
        name: 'New Project',
        description: 'Test project description',
        template: 'blank',
      };

      const response = await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(projectData)
        .expect(201);

      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('project');
      expect(response.body.message).toContain('created successfully');
      expect(response.body.project.name).toBe(projectData.name);
      expect(response.body.project.description).toBe(projectData.description);

      // Verify in database
      const [project] = await db
        .select()
        .from(projects)
        .where(eq(projects.id, response.body.project.id))
        .limit(1);

      expect(project).toBeDefined();
      expect(project.html).toBeDefined();
      expect(project.css).toBeDefined();
    });

    it('should create project with landing template', async () => {
      const projectData = {
        name: 'Landing Page',
        template: 'landing',
      };

      const response = await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(projectData)
        .expect(201);

      expect(response.body.project.name).toBe(projectData.name);
    });

    it('should allow editor to create project', async () => {
      const projectData = {
        name: 'Editor Project',
        template: 'blank',
      };

      const response = await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${editorToken}`)
        .send(projectData)
        .expect(201);

      expect(response.body.project.name).toBe(projectData.name);
    });

    it('should reject project creation from viewer', async () => {
      const projectData = {
        name: 'Viewer Project',
        template: 'blank',
      };

      const response = await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${viewerToken}`)
        .send(projectData)
        .expect(403);

      expect(response.body.error).toContain('Insufficient permissions');
    });

    it('should enforce project limit for free plan', async () => {
      // Create free plan user
      const freeUser = await createTestUser({
        email: 'free@example.com',
        plan: 'free', // Free plan: 5 projects max
      });
      const freeToken = await generateTestToken(freeUser.user, freeUser.organization.id);

      // Create 5 projects (at limit)
      for (let i = 0; i < 5; i++) {
        await createTestProject({
          organizationId: freeUser.organization.id,
          userId: freeUser.user.id,
          name: `Project ${i + 1}`,
        });
      }

      // Try to create 6th project
      const response = await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${freeToken}`)
        .send({ name: 'Project 6', template: 'blank' })
        .expect(403);

      expect(response.body.error).toContain('Project limit reached');
      expect(response.body.upgrade).toBe(true);
      expect(response.body.limit).toBe(5);
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({}) // Missing name
        .expect(400);

      expect(response.body.error).toBe('Validation failed');
    });

    it('should validate name length', async () => {
      const response = await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: '', template: 'blank' })
        .expect(400);

      expect(response.body.error).toBe('Validation failed');
    });
  });

  describe('GET /api/projects/:projectId', () => {
    it('should return project with components', async () => {
      const project = await createTestProject({
        organizationId: organization.id,
        userId: adminUser.user.id,
      });

      const response = await request(app)
        .get(`/api/projects/${project.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('project');
      expect(response.body).toHaveProperty('components');
      expect(response.body.project.id).toBe(project.id);
      expect(response.body.components).toBeInstanceOf(Array);
    });

    it('should allow all roles to view project', async () => {
      const project = await createTestProject({
        organizationId: organization.id,
        userId: adminUser.user.id,
      });

      // Viewer can view
      const response = await request(app)
        .get(`/api/projects/${project.id}`)
        .set('Authorization', `Bearer ${viewerToken}`)
        .expect(200);

      expect(response.body.project.id).toBe(project.id);
    });

    it('should return 404 for non-existent project', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';

      const response = await request(app)
        .get(`/api/projects/${fakeId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);

      expect(response.body.error).toContain('not found');
    });

    it('should not allow access to other organization projects', async () => {
      // Create another organization
      const otherUser = await createTestUser({ email: 'other@example.com' });
      const otherProject = await createTestProject({
        organizationId: otherUser.organization.id,
        userId: otherUser.user.id,
      });

      // Try to access with admin token from different org
      const response = await request(app)
        .get(`/api/projects/${otherProject.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);

      expect(response.body.error).toContain('not found');
    });
  });

  describe('PUT /api/projects/:projectId', () => {
    it('should update project name', async () => {
      const project = await createTestProject({
        organizationId: organization.id,
        userId: adminUser.user.id,
        name: 'Old Name',
      });

      const response = await request(app)
        .put(`/api/projects/${project.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'New Name' })
        .expect(200);

      expect(response.body.message).toContain('updated successfully');
      expect(response.body.project.name).toBe('New Name');

      // Verify in database
      const [updated] = await db
        .select()
        .from(projects)
        .where(eq(projects.id, project.id))
        .limit(1);

      expect(updated.name).toBe('New Name');
    });

    it('should update project HTML/CSS/JS', async () => {
      const project = await createTestProject({
        organizationId: organization.id,
        userId: adminUser.user.id,
      });

      const updates = {
        html: '<html><body>Updated</body></html>',
        css: 'body { color: red; }',
        js: 'console.log("updated");',
      };

      const response = await request(app)
        .put(`/api/projects/${project.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updates)
        .expect(200);

      expect(response.body.project.html).toBe(updates.html);
      expect(response.body.project.css).toBe(updates.css);
      expect(response.body.project.js).toBe(updates.js);
    });

    it('should allow editor to update project', async () => {
      const project = await createTestProject({
        organizationId: organization.id,
        userId: adminUser.user.id,
      });

      const response = await request(app)
        .put(`/api/projects/${project.id}`)
        .set('Authorization', `Bearer ${editorToken}`)
        .send({ name: 'Updated by Editor' })
        .expect(200);

      expect(response.body.project.name).toBe('Updated by Editor');
    });

    it('should reject update from viewer', async () => {
      const project = await createTestProject({
        organizationId: organization.id,
        userId: adminUser.user.id,
      });

      const response = await request(app)
        .put(`/api/projects/${project.id}`)
        .set('Authorization', `Bearer ${viewerToken}`)
        .send({ name: 'Viewer Update' })
        .expect(403);

      expect(response.body.error).toContain('do not have permission');
    });

    it('should return 404 for non-existent project', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';

      const response = await request(app)
        .put(`/api/projects/${fakeId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Update' })
        .expect(404);

      expect(response.body.error).toContain('not found');
    });
  });

  describe('DELETE /api/projects/:projectId', () => {
    it('should delete project', async () => {
      const project = await createTestProject({
        organizationId: organization.id,
        userId: adminUser.user.id,
      });

      const response = await request(app)
        .delete(`/api/projects/${project.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.message).toContain('deleted successfully');

      // Verify project was deleted
      const [deleted] = await db
        .select()
        .from(projects)
        .where(eq(projects.id, project.id))
        .limit(1);

      expect(deleted).toBeUndefined();
    });

    it('should allow editor to delete project', async () => {
      const project = await createTestProject({
        organizationId: organization.id,
        userId: adminUser.user.id,
      });

      const response = await request(app)
        .delete(`/api/projects/${project.id}`)
        .set('Authorization', `Bearer ${editorToken}`)
        .expect(200);

      expect(response.body.message).toContain('deleted successfully');
    });

    it('should reject deletion from viewer', async () => {
      const project = await createTestProject({
        organizationId: organization.id,
        userId: adminUser.user.id,
      });

      const response = await request(app)
        .delete(`/api/projects/${project.id}`)
        .set('Authorization', `Bearer ${viewerToken}`)
        .expect(403);

      expect(response.body.error).toContain('do not have permission');
    });

    it('should cascade delete components', async () => {
      const project = await createTestProject({
        organizationId: organization.id,
        userId: adminUser.user.id,
      });

      // Create component
      await db.insert(components).values({
        projectId: project.id,
        name: 'Test Component',
        type: 'button',
        html: '<button>Click</button>',
      });

      // Delete project
      await request(app)
        .delete(`/api/projects/${project.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      // Verify components were deleted
      const projectComponents = await db
        .select()
        .from(components)
        .where(eq(components.projectId, project.id));

      expect(projectComponents.length).toBe(0);
    });
  });

  describe('POST /api/projects/:projectId/duplicate', () => {
    it('should duplicate project successfully', async () => {
      const original = await createTestProject({
        organizationId: organization.id,
        userId: adminUser.user.id,
        name: 'Original Project',
        description: 'Original description',
      });

      const response = await request(app)
        .post(`/api/projects/${original.id}/duplicate`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(201);

      expect(response.body.message).toContain('duplicated successfully');
      expect(response.body.project.name).toBe('Original Project (Copy)');
      expect(response.body.project.description).toBe('Original description');
      expect(response.body.project.id).not.toBe(original.id);

      // Verify duplicate exists in database
      const [duplicate] = await db
        .select()
        .from(projects)
        .where(eq(projects.id, response.body.project.id))
        .limit(1);

      expect(duplicate).toBeDefined();
      expect(duplicate.html).toBe(original.html);
      expect(duplicate.css).toBe(original.css);
      expect(duplicate.js).toBe(original.js);
    });

    it('should duplicate project with components', async () => {
      const original = await createTestProject({
        organizationId: organization.id,
        userId: adminUser.user.id,
      });

      // Create components
      await db.insert(components).values([
        {
          projectId: original.id,
          name: 'Component 1',
          type: 'button',
          html: '<button>1</button>',
        },
        {
          projectId: original.id,
          name: 'Component 2',
          type: 'div',
          html: '<div>2</div>',
        },
      ]);

      const response = await request(app)
        .post(`/api/projects/${original.id}/duplicate`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(201);

      // Verify components were duplicated
      const duplicatedComponents = await db
        .select()
        .from(components)
        .where(eq(components.projectId, response.body.project.id));

      expect(duplicatedComponents.length).toBe(2);
      expect(duplicatedComponents[0].name).toBe('Component 1');
      expect(duplicatedComponents[1].name).toBe('Component 2');
    });

    it('should enforce project limit when duplicating', async () => {
      // Create free plan user
      const freeUser = await createTestUser({
        email: 'free@example.com',
        plan: 'free',
      });
      const freeToken = await generateTestToken(freeUser.user, freeUser.organization.id);

      // Create 5 projects (at limit)
      const projects = [];
      for (let i = 0; i < 5; i++) {
        const project = await createTestProject({
          organizationId: freeUser.organization.id,
          userId: freeUser.user.id,
          name: `Project ${i + 1}`,
        });
        projects.push(project);
      }

      // Try to duplicate (would exceed limit)
      const response = await request(app)
        .post(`/api/projects/${projects[0].id}/duplicate`)
        .set('Authorization', `Bearer ${freeToken}`)
        .expect(403);

      expect(response.body.error).toContain('Project limit reached');
      expect(response.body.upgrade).toBe(true);
    });

    it('should set duplicate as private by default', async () => {
      const original = await createTestProject({
        organizationId: organization.id,
        userId: adminUser.user.id,
      });

      // Set original as public
      await db
        .update(projects)
        .set({ isPublic: true })
        .where(eq(projects.id, original.id));

      const response = await request(app)
        .post(`/api/projects/${original.id}/duplicate`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(201);

      expect(response.body.project.isPublic).toBe(false);
    });

    it('should allow editor to duplicate', async () => {
      const project = await createTestProject({
        organizationId: organization.id,
        userId: adminUser.user.id,
      });

      const response = await request(app)
        .post(`/api/projects/${project.id}/duplicate`)
        .set('Authorization', `Bearer ${editorToken}`)
        .expect(201);

      expect(response.body.message).toContain('duplicated successfully');
    });

    it('should reject duplication from viewer', async () => {
      const project = await createTestProject({
        organizationId: organization.id,
        userId: adminUser.user.id,
      });

      const response = await request(app)
        .post(`/api/projects/${project.id}/duplicate`)
        .set('Authorization', `Bearer ${viewerToken}`)
        .expect(403);

      expect(response.body.error).toContain('Insufficient permissions');
    });
  });
});
