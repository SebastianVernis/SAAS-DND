const { generateOtp, createOtp, verifyOtp, hasValidOtp, cleanExpiredOtps } = require('../../src/services/otpService.js');
const { db } = require('../../src/db/client.js');
const { otpCodes } = require('../../src/db/schema.js');
const { eq } = require('drizzle-orm');

// Mock database
jest.mock('../../src/db/client.js', () => ({
  db: {
    insert: jest.fn(),
    select: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
}));

describe('OTP Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('generateOtp', () => {
    it('should generate a 6-digit OTP', () => {
      const otp = generateOtp();
      
      expect(otp).toHaveLength(6);
      expect(otp).toMatch(/^\d{6}$/);
    });

    it('should generate different OTPs on multiple calls', () => {
      const otp1 = generateOtp();
      const otp2 = generateOtp();
      const otp3 = generateOtp();
      
      // At least one should be different (extremely unlikely all 3 are same)
      const allSame = otp1 === otp2 && otp2 === otp3;
      expect(allSame).toBe(false);
    });

    it('should only contain numeric digits', () => {
      const otp = generateOtp();
      
      for (const char of otp) {
        expect(parseInt(char)).toBeGreaterThanOrEqual(0);
        expect(parseInt(char)).toBeLessThanOrEqual(9);
      }
    });
  });

  describe('createOtp', () => {
    it('should create OTP for user and delete old ones', async () => {
      const userId = 'test-user-id';
      const mockOtp = {
        id: 'otp-id',
        userId,
        code: '123456',
        expiresAt: new Date(),
        verified: false,
      };

      // Mock delete old OTPs
      const deleteMock = jest.fn().mockReturnValue({
        where: jest.fn().mockResolvedValue(undefined),
      });
      db.delete = deleteMock;

      // Mock insert new OTP
      const insertMock = jest.fn().mockReturnValue({
        values: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([mockOtp]),
        }),
      });
      db.insert = insertMock;

      const result = await createOtp(userId);

      expect(deleteMock).toHaveBeenCalledWith(otpCodes);
      expect(insertMock).toHaveBeenCalledWith(otpCodes);
      expect(result).toEqual(mockOtp);
      expect(result.code).toHaveLength(6);
    });

    it('should set expiration time correctly', async () => {
      const userId = 'test-user-id';
      const now = Date.now();
      
      const deleteMock = jest.fn().mockReturnValue({
        where: jest.fn().mockResolvedValue(undefined),
      });
      db.delete = deleteMock;

      let capturedValues;
      const insertMock = jest.fn().mockReturnValue({
        values: jest.fn().mockImplementation((vals) => {
          capturedValues = vals;
          return {
            returning: jest.fn().mockResolvedValue([{ ...vals, id: 'otp-id' }]),
          };
        }),
      });
      db.insert = insertMock;

      await createOtp(userId);

      expect(capturedValues.expiresAt.getTime()).toBeGreaterThan(now);
      expect(capturedValues.expiresAt.getTime()).toBeLessThan(now + 11 * 60 * 1000); // Within 11 minutes
    });
  });

  describe('verifyOtp', () => {
    it('should verify valid OTP successfully', async () => {
      const userId = 'test-user-id';
      const code = '123456';
      const mockOtp = {
        id: 'otp-id',
        userId,
        code,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes from now
        verified: false,
      };

      // Mock select
      const selectMock = jest.fn().mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue([mockOtp]),
          }),
        }),
      });
      db.select = selectMock;

      // Mock update
      const updateMock = jest.fn().mockReturnValue({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue(undefined),
        }),
      });
      db.update = updateMock;

      const result = await verifyOtp(userId, code);

      expect(result.valid).toBe(true);
      expect(result.otp).toEqual(mockOtp);
      expect(updateMock).toHaveBeenCalledWith(otpCodes);
    });

    it('should reject invalid OTP code', async () => {
      const userId = 'test-user-id';
      const code = '999999';

      // Mock select - no OTP found
      const selectMock = jest.fn().mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue([]), // Empty array
          }),
        }),
      });
      db.select = selectMock;

      const result = await verifyOtp(userId, code);

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Invalid or expired OTP');
    });

    it('should reject expired OTP', async () => {
      const userId = 'test-user-id';
      const code = '123456';

      // Mock select - OTP expired
      const selectMock = jest.fn().mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue([]), // Expired OTP filtered out by query
          }),
        }),
      });
      db.select = selectMock;

      const result = await verifyOtp(userId, code);

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Invalid or expired OTP');
    });

    it('should reject already verified OTP', async () => {
      const userId = 'test-user-id';
      const code = '123456';

      // Mock select - already verified OTP filtered out
      const selectMock = jest.fn().mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue([]),
          }),
        }),
      });
      db.select = selectMock;

      const result = await verifyOtp(userId, code);

      expect(result.valid).toBe(false);
    });
  });

  describe('hasValidOtp', () => {
    it('should return true when valid OTP exists', async () => {
      const userId = 'test-user-id';
      const mockOtp = {
        id: 'otp-id',
        userId,
        code: '123456',
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
        verified: false,
      };

      const selectMock = jest.fn().mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue([mockOtp]),
          }),
        }),
      });
      db.select = selectMock;

      const result = await hasValidOtp(userId);

      expect(result).toBe(true);
    });

    it('should return false when no valid OTP exists', async () => {
      const userId = 'test-user-id';

      const selectMock = jest.fn().mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue([]),
          }),
        }),
      });
      db.select = selectMock;

      const result = await hasValidOtp(userId);

      expect(result).toBe(false);
    });
  });

  describe('cleanExpiredOtps', () => {
    it('should delete expired OTPs', async () => {
      const deleteMock = jest.fn().mockReturnValue({
        where: jest.fn().mockResolvedValue({ rowCount: 5 }),
      });
      db.delete = deleteMock;

      const result = await cleanExpiredOtps();

      expect(deleteMock).toHaveBeenCalledWith(otpCodes);
      expect(result.rowCount).toBe(5);
    });

    it('should handle case when no expired OTPs exist', async () => {
      const deleteMock = jest.fn().mockReturnValue({
        where: jest.fn().mockResolvedValue({ rowCount: 0 }),
      });
      db.delete = deleteMock;

      const result = await cleanExpiredOtps();

      expect(result.rowCount).toBe(0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle database errors gracefully in createOtp', async () => {
      const userId = 'test-user-id';

      const deleteMock = jest.fn().mockReturnValue({
        where: jest.fn().mockRejectedValue(new Error('Database error')),
      });
      db.delete = deleteMock;

      await expect(createOtp(userId)).rejects.toThrow('Database error');
    });

    it('should handle database errors gracefully in verifyOtp', async () => {
      const userId = 'test-user-id';
      const code = '123456';

      const selectMock = jest.fn().mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            limit: jest.fn().mockRejectedValue(new Error('Database error')),
          }),
        }),
      });
      db.select = selectMock;

      await expect(verifyOtp(userId, code)).rejects.toThrow('Database error');
    });
  });
});
