import { db } from '../db/client.js';
import { users, organizations, organizationMembers, subscriptions, userPreferences } from '../db/schema.js';
import { eq } from 'drizzle-orm';
import { hashPassword, comparePassword } from '../utils/bcrypt.js';
import { generateToken } from '../utils/jwt.js';
import { createOtp, verifyOtp } from '../services/otpService.js';
import { sendOtpEmail, sendWelcomeEmail } from '../services/emailService.js';

// Register new user
export async function register(req, res, next) {
  try {
    const { email, password, name } = req.body;

    // Check if user already exists
    const [existingUser] = await db.select().from(users).where(eq(users.email, email)).limit(1);

    if (existingUser) {
      // If user exists but not verified, resend OTP
      if (!existingUser.emailVerified) {
        const otp = await createOtp(existingUser.id);
        await sendOtpEmail({
          to: email,
          name: name || 'User',
          code: otp.code,
        });

        return res.status(200).json({
          message: 'User already exists. New OTP sent to email.',
          userId: existingUser.id,
        });
      }

      return res.status(409).json({
        error: 'User already exists with this email',
      });
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    const [newUser] = await db
      .insert(users)
      .values({
        email,
        passwordHash,
        name,
        emailVerified: false,
      })
      .returning();

    // Create OTP
    const otp = await createOtp(newUser.id);

    // Send OTP email
    const emailResult = await sendOtpEmail({
      to: email,
      name: name || 'User',
      code: otp.code,
    });

    if (!emailResult.success) {
      console.error('Failed to send OTP email:', emailResult.error);
    }

    console.log(`✅ User registered: ${email} (OTP: ${otp.code})`);

    res.status(201).json({
      message: 'User registered successfully. OTP sent to email.',
      userId: newUser.id,
      // In development, include OTP in response for testing
      ...(process.env.NODE_ENV === 'development' && { otp: otp.code }),
    });
  } catch (error) {
    next(error);
  }
}

// Verify OTP
export async function verifyOtpHandler(req, res, next) {
  try {
    const { email, code } = req.body;

    // Find user
    const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);

    if (!user) {
      return res.status(404).json({
        error: 'User not found',
      });
    }

    // Verify OTP
    const result = await verifyOtp(user.id, code);

    if (!result.valid) {
      return res.status(400).json({
        error: result.error || 'Invalid OTP',
      });
    }

    // Mark email as verified
    await db.update(users).set({ emailVerified: true }).where(eq(users.id, user.id));

    // Create default organization (personal account)
    const [organization] = await db
      .insert(organizations)
      .values({
        name: `${user.name || 'User'}'s Workspace`,
        slug: `${user.id.split('-')[0]}-workspace`,
        type: 'personal',
      })
      .returning();

    // Add user as admin member
    await db.insert(organizationMembers).values({
      organizationId: organization.id,
      userId: user.id,
      role: 'admin',
      status: 'active',
    });

    // Create free subscription
    await db.insert(subscriptions).values({
      organizationId: organization.id,
      plan: 'free',
      status: 'active',
    });

    // Create user preferences
    await db.insert(userPreferences).values({
      userId: user.id,
      theme: 'dark',
      language: 'es',
      emailNotifications: true,
      onboardingCompleted: false,
    });

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      organizationId: organization.id,
    });

    // Send welcome email
    await sendWelcomeEmail({
      to: user.email,
      name: user.name || 'User',
      dashboardLink: `${process.env.FRONTEND_URL}/dashboard`,
    });

    console.log(`✅ User verified: ${email}`);

    res.json({
      message: 'Email verified successfully',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        emailVerified: true,
      },
      organization: {
        id: organization.id,
        name: organization.name,
      },
    });
  } catch (error) {
    next(error);
  }
}

// Resend OTP
export async function resendOtp(req, res, next) {
  try {
    const { email } = req.body;

    // Find user
    const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);

    if (!user) {
      return res.status(404).json({
        error: 'User not found',
      });
    }

    if (user.emailVerified) {
      return res.status(400).json({
        error: 'Email already verified',
      });
    }

    // Create new OTP
    const otp = await createOtp(user.id);

    // Send OTP email
    await sendOtpEmail({
      to: email,
      name: user.name || 'User',
      code: otp.code,
    });

    console.log(`📧 OTP resent to: ${email} (${otp.code})`);

    res.json({
      message: 'OTP resent successfully',
      ...(process.env.NODE_ENV === 'development' && { otp: otp.code }),
    });
  } catch (error) {
    next(error);
  }
}

// Login
export async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    // Find user
    const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);

    if (!user) {
      return res.status(401).json({
        error: 'Invalid credentials',
      });
    }

    // Check if email is verified
    if (!user.emailVerified) {
      return res.status(403).json({
        error: 'Email not verified. Please verify your email first.',
        needsVerification: true,
      });
    }

    // Verify password
    const validPassword = await comparePassword(password, user.passwordHash);

    if (!validPassword) {
      return res.status(401).json({
        error: 'Invalid credentials',
      });
    }

    // Get organization
    const [membership] = await db
      .select()
      .from(organizationMembers)
      .where(eq(organizationMembers.userId, user.id))
      .limit(1);

    if (!membership) {
      return res.status(500).json({
        error: 'User organization not found',
      });
    }

    // Generate token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      organizationId: membership.organizationId,
    });

    console.log(`✅ User logged in: ${email}`);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.image,
      },
    });
  } catch (error) {
    next(error);
  }
}

// Get current session
export async function getSession(req, res, next) {
  try {
    // User is already attached by requireAuth middleware
    const user = req.user;
    const organization = req.organization;
    const subscription = req.subscription;
    const membership = req.membership;

    // Get preferences
    const [preferences] = await db
      .select()
      .from(userPreferences)
      .where(eq(userPreferences.userId, user.id))
      .limit(1);

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.image,
        emailVerified: user.emailVerified,
      },
      organization: organization
        ? {
            id: organization.id,
            name: organization.name,
            slug: organization.slug,
            type: organization.type,
          }
        : null,
      subscription: subscription
        ? {
            plan: subscription.plan,
            status: subscription.status,
          }
        : null,
      membership: membership
        ? {
            role: membership.role,
            status: membership.status,
          }
        : null,
      preferences: preferences || null,
    });
  } catch (error) {
    next(error);
  }
}

// Logout (client-side only for JWT, but we can log it)
export async function logout(req, res, next) {
  try {
    console.log(`👋 User logged out: ${req.user.email}`);

    res.json({
      message: 'Logged out successfully',
    });
  } catch (error) {
    next(error);
  }
}

export default {
  register,
  verifyOtpHandler,
  resendOtp,
  login,
  getSession,
  logout,
};
