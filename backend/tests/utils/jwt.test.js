const { generateToken, verifyToken, decodeToken } = require('../../src/utils/jwt.js');

describe('JWT Utils', () => {
  const testPayload = {
    userId: 'test-user-123',
    email: 'test@example.com',
    organizationId: 'org-456',
  };

  describe('generateToken', () => {
    it('should generate a valid JWT token', () => {
      const token = generateToken(testPayload);

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // JWT has 3 parts
    });

    it('should include payload data in token', () => {
      const token = generateToken(testPayload);
      const decoded = decodeToken(token);

      expect(decoded.userId).toBe(testPayload.userId);
      expect(decoded.email).toBe(testPayload.email);
      expect(decoded.organizationId).toBe(testPayload.organizationId);
    });

    it('should include expiration time', () => {
      const token = generateToken(testPayload);
      const decoded = decodeToken(token);

      expect(decoded.exp).toBeDefined();
      expect(decoded.iat).toBeDefined();
      expect(decoded.exp).toBeGreaterThan(decoded.iat);
    });

    it('should generate different tokens for same payload', () => {
      const token1 = generateToken(testPayload);
      const token2 = generateToken(testPayload);

      // Tokens will be different due to different iat (issued at) timestamps
      expect(token1).not.toBe(token2);
    });

    it('should handle empty payload', () => {
      const token = generateToken({});
      const decoded = decodeToken(token);

      expect(decoded).toBeDefined();
      expect(decoded.exp).toBeDefined();
    });
  });

  describe('verifyToken', () => {
    it('should verify a valid token', () => {
      const token = generateToken(testPayload);
      const verified = verifyToken(token);

      expect(verified).toBeDefined();
      expect(verified.userId).toBe(testPayload.userId);
      expect(verified.email).toBe(testPayload.email);
    });

    it('should throw error for invalid token', () => {
      const invalidToken = 'invalid.token.here';

      expect(() => verifyToken(invalidToken)).toThrow('Invalid or expired token');
    });

    it('should throw error for malformed token', () => {
      const malformedToken = 'not-a-jwt-token';

      expect(() => verifyToken(malformedToken)).toThrow('Invalid or expired token');
    });

    it('should throw error for empty token', () => {
      expect(() => verifyToken('')).toThrow('Invalid or expired token');
    });

    it('should throw error for null token', () => {
      expect(() => verifyToken(null)).toThrow('Invalid or expired token');
    });

    it('should throw error for token with wrong signature', () => {
      // Generate token with different secret
      const jwt = require('jsonwebtoken');
      const tokenWithWrongSecret = jwt.sign(testPayload, 'wrong-secret', {
        expiresIn: '1h',
      });

      expect(() => verifyToken(tokenWithWrongSecret)).toThrow('Invalid or expired token');
    });
  });

  describe('decodeToken', () => {
    it('should decode token without verification', () => {
      const token = generateToken(testPayload);
      const decoded = decodeToken(token);

      expect(decoded).toBeDefined();
      expect(decoded.userId).toBe(testPayload.userId);
      expect(decoded.email).toBe(testPayload.email);
    });

    it('should decode expired token', () => {
      const jwt = require('jsonwebtoken');
      const { JWT_CONFIG } = require('../../src/config/constants.js');
      
      // Create token that expired 1 hour ago
      const expiredToken = jwt.sign(testPayload, JWT_CONFIG.secret, {
        expiresIn: '-1h',
      });

      const decoded = decodeToken(expiredToken);

      expect(decoded).toBeDefined();
      expect(decoded.userId).toBe(testPayload.userId);
    });

    it('should return null for invalid token', () => {
      const decoded = decodeToken('invalid-token');

      expect(decoded).toBeNull();
    });

    it('should decode token with additional claims', () => {
      const payloadWithClaims = {
        ...testPayload,
        role: 'admin',
        permissions: ['read', 'write'],
      };

      const token = generateToken(payloadWithClaims);
      const decoded = decodeToken(token);

      expect(decoded.role).toBe('admin');
      expect(decoded.permissions).toEqual(['read', 'write']);
    });
  });

  describe('Token Lifecycle', () => {
    it('should create, verify, and decode token successfully', () => {
      // Generate
      const token = generateToken(testPayload);
      expect(token).toBeDefined();

      // Verify
      const verified = verifyToken(token);
      expect(verified.userId).toBe(testPayload.userId);

      // Decode
      const decoded = decodeToken(token);
      expect(decoded.userId).toBe(testPayload.userId);
    });
  });
});
