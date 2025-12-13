import express from 'express';
import { validate } from '../utils/validators.js';
import { onboardingSchema } from '../utils/validators.js';
import { requireAuth } from '../middleware/auth.js';
import { completeOnboarding, getOnboardingStatus } from '../controllers/onboardingController.js';

const router = express.Router();

// All onboarding routes require authentication
router.use(requireAuth);

router.post('/complete', validate(onboardingSchema), completeOnboarding);
router.get('/status', getOnboardingStatus);

export default router;
