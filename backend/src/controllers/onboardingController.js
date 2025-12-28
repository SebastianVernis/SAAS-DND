import { db } from '../db/client.js';
import { organizations, userPreferences, projects } from '../db/schema.js';
import { eq } from 'drizzle-orm';
import { PROJECT_TEMPLATES } from '../config/constants.js';

// Complete onboarding
export async function completeOnboarding(req, res, next) {
  try {
    const { accountType, organization: orgData, preferences } = req.body;
    const userId = req.user.id;
    const organizationId = req.organization.id;

    // Update organization if data provided
    if (orgData && accountType !== 'personal') {
      await db
        .update(organizations)
        .set({
          name: orgData.name || req.organization.name,
          type: accountType,
          industry: orgData.industry,
          teamSize: orgData.teamSize,
          updatedAt: new Date(),
        })
        .where(eq(organizations.id, organizationId));
    }

    // Update user preferences
    const preferencesToUpdate = {
      theme: preferences?.theme || 'dark',
      language: preferences?.language || 'es',
      emailNotifications: preferences?.emailNotifications ?? true,
      onboardingCompleted: true,
      updatedAt: new Date(),
    };

    await db
      .update(userPreferences)
      .set(preferencesToUpdate)
      .where(eq(userPreferences.userId, userId));

    // Create welcome project
    const template = PROJECT_TEMPLATES.blank;
    const [welcomeProject] = await db
      .insert(projects)
      .values({
        organizationId,
        name: 'Welcome to DragNDrop',
        description: 'Your first project - start editing!',
        html: template.html,
        css: template.css,
        js: template.js,
        createdBy: userId,
      })
      .returning();

    // Get updated organization
    const [updatedOrg] = await db
      .select()
      .from(organizations)
      .where(eq(organizations.id, organizationId))
      .limit(1);

    // Get updated preferences
    const [updatedPreferences] = await db
      .select()
      .from(userPreferences)
      .where(eq(userPreferences.userId, userId))
      .limit(1);

    console.log(`✅ Onboarding completed for user: ${req.user.email}`);

    res.json({
      message: 'Onboarding completed successfully',
      organization: {
        id: updatedOrg.id,
        name: updatedOrg.name,
        type: updatedOrg.type,
        industry: updatedOrg.industry,
        teamSize: updatedOrg.teamSize,
      },
      preferences: updatedPreferences,
      welcomeProject: {
        id: welcomeProject.id,
        name: welcomeProject.name,
      },
    });
  } catch (error) {
    next(error);
  }
}

// Get onboarding status
export async function getOnboardingStatus(req, res, next) {
  try {
    const userId = req.user.id;

    const [preferences] = await db
      .select()
      .from(userPreferences)
      .where(eq(userPreferences.userId, userId))
      .limit(1);

    res.json({
      completed: preferences?.onboardingCompleted || false,
      preferences: preferences || null,
    });
  } catch (error) {
    next(error);
  }
}

export default {
  completeOnboarding,
  getOnboardingStatus,
};
