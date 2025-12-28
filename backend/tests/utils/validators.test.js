const {
  registerSchema,
  loginSchema,
  verifyOtpSchema,
  onboardingSchema,
  inviteTeamMemberSchema,
  updateMemberRoleSchema,
  createProjectSchema,
  updateProjectSchema,
  validate,
} = require('../../src/utils/validators.js');

describe('Validators', () => {
  describe('registerSchema', () => {
    it('should validate correct registration data', () => {
      const validData = {
        email: 'test@example.com',
        password: 'Password123',
        name: 'Test User',
      };

      const result = registerSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid email', () => {
      const invalidData = {
        email: 'invalid-email',
        password: 'Password123',
        name: 'Test User',
      };

      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      expect(result.error.errors[0].message).toContain('Invalid email');
    });

    it('should reject short password', () => {
      const invalidData = {
        email: 'test@example.com',
        password: 'Pass1',
        name: 'Test User',
      };

      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      expect(result.error.errors[0].message).toContain('at least 8 characters');
    });

    it('should reject password without uppercase', () => {
      const invalidData = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      };

      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      expect(result.error.errors[0].message).toContain('uppercase letter');
    });

    it('should reject password without number', () => {
      const invalidData = {
        email: 'test@example.com',
        password: 'Password',
        name: 'Test User',
      };

      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      expect(result.error.errors[0].message).toContain('number');
    });

    it('should reject short name', () => {
      const invalidData = {
        email: 'test@example.com',
        password: 'Password123',
        name: 'A',
      };

      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      expect(result.error.errors[0].message).toContain('at least 2 characters');
    });
  });

  describe('loginSchema', () => {
    it('should validate correct login data', () => {
      const validData = {
        email: 'test@example.com',
        password: 'anypassword',
      };

      const result = loginSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid email', () => {
      const invalidData = {
        email: 'not-an-email',
        password: 'password',
      };

      const result = loginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject empty password', () => {
      const invalidData = {
        email: 'test@example.com',
        password: '',
      };

      const result = loginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('verifyOtpSchema', () => {
    it('should validate correct OTP data', () => {
      const validData = {
        email: 'test@example.com',
        code: '123456',
      };

      const result = verifyOtpSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject OTP with wrong length', () => {
      const invalidData = {
        email: 'test@example.com',
        code: '12345', // Only 5 digits
      };

      const result = verifyOtpSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      expect(result.error.errors[0].message).toContain('6 digits');
    });

    it('should reject invalid email', () => {
      const invalidData = {
        email: 'invalid',
        code: '123456',
      };

      const result = verifyOtpSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('onboardingSchema', () => {
    it('should validate personal account type', () => {
      const validData = {
        accountType: 'personal',
      };

      const result = onboardingSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should validate agency with organization data', () => {
      const validData = {
        accountType: 'agency',
        organization: {
          name: 'My Agency',
          industry: 'Design',
          teamSize: '6-20',
        },
      };

      const result = onboardingSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should validate with preferences', () => {
      const validData = {
        accountType: 'personal',
        preferences: {
          theme: 'dark',
          language: 'es',
          emailNotifications: true,
        },
      };

      const result = onboardingSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid account type', () => {
      const invalidData = {
        accountType: 'invalid-type',
      };

      const result = onboardingSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('inviteTeamMemberSchema', () => {
    it('should validate correct invitation data', () => {
      const validData = {
        email: 'teammate@example.com',
        role: 'editor',
        message: 'Join our team!',
      };

      const result = inviteTeamMemberSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should validate without optional message', () => {
      const validData = {
        email: 'teammate@example.com',
        role: 'viewer',
      };

      const result = inviteTeamMemberSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid role', () => {
      const invalidData = {
        email: 'teammate@example.com',
        role: 'superadmin',
      };

      const result = inviteTeamMemberSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject message longer than 500 characters', () => {
      const invalidData = {
        email: 'teammate@example.com',
        role: 'editor',
        message: 'a'.repeat(501),
      };

      const result = inviteTeamMemberSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('createProjectSchema', () => {
    it('should validate correct project data', () => {
      const validData = {
        name: 'My Project',
        description: 'A test project',
        template: 'landing',
      };

      const result = createProjectSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should validate without optional fields', () => {
      const validData = {
        name: 'My Project',
      };

      const result = createProjectSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject empty name', () => {
      const invalidData = {
        name: '',
      };

      const result = createProjectSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject name longer than 255 characters', () => {
      const invalidData = {
        name: 'a'.repeat(256),
      };

      const result = createProjectSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject invalid template', () => {
      const invalidData = {
        name: 'My Project',
        template: 'invalid-template',
      };

      const result = createProjectSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('updateProjectSchema', () => {
    it('should validate project updates', () => {
      const validData = {
        name: 'Updated Name',
        description: 'Updated description',
        isPublic: true,
      };

      const result = updateProjectSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should validate with HTML/CSS/JS content', () => {
      const validData = {
        html: '<div>Hello</div>',
        css: 'body { margin: 0; }',
        js: 'console.log("test");',
      };

      const result = updateProjectSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should validate empty object (all fields optional)', () => {
      const validData = {};

      const result = updateProjectSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });

  describe('validate middleware', () => {
    it('should call next() for valid data', () => {
      const req = {
        body: {
          email: 'test@example.com',
          password: 'password',
        },
      };
      const res = {};
      const next = jest.fn();

      const middleware = validate(loginSchema);
      middleware(req, res, next);

      expect(next).toHaveBeenCalledWith();
    });

    it('should return 400 for invalid data', () => {
      const req = {
        body: {
          email: 'invalid-email',
          password: '',
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      const middleware = validate(loginSchema);
      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Validation failed',
          details: expect.any(Array),
        })
      );
      expect(next).not.toHaveBeenCalled();
    });

    it('should include field names in error details', () => {
      const req = {
        body: {
          email: 'invalid',
          password: '',
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      const middleware = validate(loginSchema);
      middleware(req, res, next);

      const errorResponse = res.json.mock.calls[0][0];
      expect(errorResponse.details).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: expect.any(String),
            message: expect.any(String),
          }),
        ])
      );
    });
  });
});
