import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { AuthService } from '@/src/auth/auth.service';
import { VendorService } from '@/src/modules/vendor/vendor.service';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import * as argon from 'argon2';

// Create our own enum values to match the schema
enum SignUpMethod {
  EMAIL = 'EMAIL',
  GOOGLE = 'GOOGLE',
  FACEBOOK = 'FACEBOOK',
  APPLE = 'APPLE'
}

enum Role {
  ADMIN = 'ADMIN',
  VENDOR = 'VENDOR', 
  MANAGER = 'MANAGER',
  STAFF = 'STAFF'
}

// Mock argon2
jest.mock('argon2');
const mockedArgon = argon as jest.Mocked<typeof argon>;

describe('AuthService - Unit Tests', () => {
  let service: AuthService;
  let vendorService: jest.Mocked<VendorService>;
  let jwtService: jest.Mocked<JwtService>;
  let configService: jest.Mocked<ConfigService>;

  beforeEach(async () => {
    const mockVendorService = {
      create: jest.fn(),
      findByEmail: jest.fn(),
    };

    const mockJwtService = {
      signAsync: jest.fn(),
    };

    const mockConfigService = {
      get: jest.fn().mockReturnValue('test-jwt-secret'),
    };

    const mockLogger = {
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: VendorService, useValue: mockVendorService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
        { provide: WINSTON_MODULE_NEST_PROVIDER, useValue: mockLogger },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    vendorService = module.get(VendorService);
    jwtService = module.get(JwtService);
    configService = module.get(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('signup', () => {
    it('should create a new vendor with email signup method', async () => {
      // Arrange
      const signupDto = {
        email: 'test@example.com',
        name: 'Test Vendor',
        password: 'password123',
        companyName: 'Test Company',
        phone: '+123456789',
      };

      const hashedPassword = 'hashedPassword123';
      const mockVendor = {
        id: 'vendor-id-123',
        email: signupDto.email,
        name: signupDto.name,
        password: hashedPassword,
        companyName: signupDto.companyName,
        companyId: 'company-id-123',
        phone: signupDto.phone,
        signUpMethod: SignUpMethod.EMAIL,
        role: Role.VENDOR,
        isActive: true,
        createdAt: new Date(),
        createdBy: 'system',
        lastUpdatedAt: new Date(),
        lastUpdatedBy: 'system',
      };

      const mockToken = 'mock.jwt.token';

      mockedArgon.hash.mockResolvedValue(hashedPassword);
      vendorService.create.mockResolvedValue(mockVendor);
      jwtService.signAsync.mockResolvedValue(mockToken);

      // Act
      const result = await service.signup(signupDto);

      // Assert
      expect(mockedArgon.hash).toHaveBeenCalledWith(signupDto.password);
      expect(vendorService.create).toHaveBeenCalledWith({
        email: signupDto.email,
        password: hashedPassword,
        name: signupDto.name,
        companyName: signupDto.companyName,
        phone: signupDto.phone,
        signUpMethod: SignUpMethod.EMAIL,
        role: Role.VENDOR,
      });

      expect(jwtService.signAsync).toHaveBeenCalledWith(
        {
          id: mockVendor.id,
          email: mockVendor.email,
          name: mockVendor.name,
          role: mockVendor.role,
          companyId: mockVendor.companyId,
        },
        {
          expiresIn: '59m',
          secret: 'test-jwt-secret',
        },
      );
      
      expect(result).toEqual({
        access_token: mockToken,
        vendor: {
          id: mockVendor.id,
          email: mockVendor.email,
          name: mockVendor.name,
          role: mockVendor.role,
          companyId: mockVendor.companyId,
        },
      });
    });

    it('should throw ForbiddenException when vendor creation fails', async () => {
      // Arrange
      const signupDto = {
        email: 'test@example.com',
        name: 'Test Vendor',
        password: 'password123',
        companyName: 'Test Company',
        phone: '+123456789',
      };

      mockedArgon.hash.mockResolvedValue('hashedPassword');
      // Instead of null, return undefined to avoid type errors
      vendorService.create.mockResolvedValue(undefined as any);

      // Act & Assert
      await expect(service.signup(signupDto)).rejects.toThrow(
        ForbiddenException,
      );
      await expect(service.signup(signupDto)).rejects.toThrow(
        'vendor creation failed',
      );
    });

    it('should throw ForbiddenException for duplicate email', async () => {
      // Arrange
      const signupDto = {
        email: 'existing@example.com',
        name: 'Test Vendor',
        password: 'password123',
        companyName: 'Test Company',
      };

      const prismaError = new PrismaClientKnownRequestError(
        'Unique constraint failed',
        {
          code: 'P2002',
          clientVersion: '5.0.0',
        },
      );

      mockedArgon.hash.mockResolvedValue('hashedPassword');
      vendorService.create.mockRejectedValue(prismaError);

      // Act & Assert
      await expect(service.signup(signupDto)).rejects.toThrow(
        'Credentials taken',
      );
    });
  });

  describe('signin', () => {
    it('should authenticate vendor with correct credentials', async () => {
      // Arrange
      const authDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      const mockVendor = {
        id: 'vendor-id-123',
        email: authDto.email,
        name: 'Test Vendor',
        password: 'hashedPassword123',
        companyName: 'Test Company',
        companyId: 'company-id-123',
        phone: '+123456789',
        signUpMethod: SignUpMethod.EMAIL,
        role: Role.VENDOR,
        isActive: true,
        createdAt: new Date(),
        createdBy: 'system',
        lastUpdatedAt: new Date(),
        lastUpdatedBy: 'system',
      };

      const mockToken = 'mock.jwt.token';

      vendorService.findByEmail.mockResolvedValue(mockVendor);
      mockedArgon.verify.mockResolvedValue(true);
      jwtService.signAsync.mockResolvedValue(mockToken);

      // Act
      const result = await service.signin(authDto);

      // Assert
      expect(vendorService.findByEmail).toHaveBeenCalledWith(authDto.email);
      expect(mockedArgon.verify).toHaveBeenCalledWith(mockVendor.password, authDto.password);
      expect(result).toHaveProperty('access_token', mockToken);
    });

    it('should throw ForbiddenException when vendor does not exist', async () => {
      // Arrange
      const authDto = {
        email: 'nonexistent@example.com',
        password: 'password123',
      };

      vendorService.findByEmail.mockResolvedValue(null);

      // Act & Assert
      await expect(service.signin(authDto)).rejects.toThrow(
        'Credentials incorrect',
      );
    });

    it('should throw ForbiddenException when signup method is not EMAIL', async () => {
      // Arrange
      const authDto = {
        email: 'google@example.com',
        password: 'password123',
      };

      const mockVendor = {
        id: 'vendor-id-123',
        email: authDto.email,
        name: 'Google Vendor',
        password: '',  // Changed from null to empty string
        companyName: 'Google Company',
        companyId: 'company-id-123',
        phone: '+123456789',
        signUpMethod: SignUpMethod.GOOGLE,
        role: Role.VENDOR,
        isActive: true,
        createdAt: new Date(),
        createdBy: 'system',
        lastUpdatedAt: new Date(),
        lastUpdatedBy: 'system',
      };

      vendorService.findByEmail.mockResolvedValue(mockVendor);

      // Act & Assert
      await expect(service.signin(authDto)).rejects.toThrow(
        'Credentials incorrect',
      );
    });

    it('should throw ForbiddenException when password does not match', async () => {
      // Arrange
      const authDto = {
        email: 'test@example.com',
        password: 'wrongPassword',
      };

      const mockVendor = {
        id: 'vendor-id-123',
        email: authDto.email,
        name: 'Test Vendor',
        password: 'hashedPassword123',
        companyName: 'Test Company',
        companyId: 'company-id-123',
        phone: '+123456789',
        signUpMethod: SignUpMethod.EMAIL,
        role: Role.VENDOR,
        isActive: true,
        createdAt: new Date(),
        createdBy: 'system',
        lastUpdatedAt: new Date(),
        lastUpdatedBy: 'system',
      };

      vendorService.findByEmail.mockResolvedValue(mockVendor);
      mockedArgon.verify.mockResolvedValue(false);

      // Act & Assert
      await expect(service.signin(authDto)).rejects.toThrow(
        'Credentials incorrect',
      );
    });
  });

  describe('googleSignup', () => {
    it('should create a new vendor with Google signup method', async () => {
      // Arrange
      const googleData = {
        email: 'google@example.com',
        name: 'Google User',
        companyName: 'Google Company',
      };

      const mockVendor = {
        id: 'vendor-id-123',
        email: googleData.email,
        name: googleData.name,
        password: '',
        companyName: googleData.companyName,
        companyId: 'company-id-123',
        phone: null,
        signUpMethod: SignUpMethod.GOOGLE,
        role: Role.VENDOR,
        isActive: true,
        createdAt: new Date(),
        createdBy: 'system',
        lastUpdatedAt: new Date(),
        lastUpdatedBy: 'system',
      };

      const mockToken = 'mock.jwt.token';

      // Mock the googleAuthAPI to return the Google data
      jest.spyOn(service, 'googleAuthAPI').mockResolvedValue(googleData);
      vendorService.create.mockResolvedValue(mockVendor);
      jwtService.signAsync.mockResolvedValue(mockToken);

      // Act
      const result = await service.googleSignup(googleData);

      // Assert
      expect(service.googleAuthAPI).toHaveBeenCalledWith(googleData);
      expect(vendorService.create).toHaveBeenCalledWith(
        expect.objectContaining({
          email: googleData.email,
          name: googleData.name,
          password: '',
          companyName: googleData.companyName,
          signUpMethod: SignUpMethod.GOOGLE,
          role: Role.VENDOR,
        })
      );
      expect(result).toHaveProperty('access_token', mockToken);
    });
  });

  describe('googleSignin', () => {
    it('should authenticate an existing vendor with Google account', async () => {
      // Arrange
      const googleData = {
        email: 'google@example.com',
      };

      const mockVendor = {
        id: 'vendor-id-123',
        email: googleData.email,
        name: 'Google User',
        password: '',
        companyName: 'Google Company',
        companyId: 'company-id-123',
        phone: null,
        signUpMethod: SignUpMethod.GOOGLE,
        role: Role.VENDOR,
        isActive: true,
        createdAt: new Date(),
        createdBy: 'system',
        lastUpdatedAt: new Date(),
        lastUpdatedBy: 'system',
      };

      const mockToken = 'mock.jwt.token';

      // Mock the googleAuthAPI to return the Google data
      jest.spyOn(service, 'googleAuthAPI').mockResolvedValue(googleData);
      vendorService.findByEmail.mockResolvedValue(mockVendor);
      jwtService.signAsync.mockResolvedValue(mockToken);

      // Act
      const result = await service.googleSignin(googleData);

      // Assert
      expect(service.googleAuthAPI).toHaveBeenCalledWith(googleData);
      expect(vendorService.findByEmail).toHaveBeenCalledWith(googleData.email);
      expect(result).toHaveProperty('access_token', mockToken);
    });

    it('should throw ForbiddenException when Google authentication fails', async () => {
      // Arrange
      const googleData = {
        email: 'google@example.com',
      };

      // Mock the googleAuthAPI to return null
      jest.spyOn(service, 'googleAuthAPI').mockResolvedValue(null);

      // Act & Assert
      await expect(service.googleSignin(googleData)).rejects.toThrow(
        'Google signin failed',
      );
    });

    it('should throw ForbiddenException when vendor with Google email does not exist', async () => {
      // Arrange
      const googleData = {
        email: 'nonexistent@example.com',
      };

      // Mock the googleAuthAPI to return the Google data
      jest.spyOn(service, 'googleAuthAPI').mockResolvedValue(googleData);
      vendorService.findByEmail.mockResolvedValue(null);

      // Act & Assert
      await expect(service.googleSignin(googleData)).rejects.toThrow(
        'Something went wrong. Please contact suppot team',
      );
    });
  });

  describe('signToken', () => {
    it('should generate a JWT token with vendor data', async () => {
      // Arrange
      const payload = {
        id: 'vendor-id-123',
        email: 'test@example.com',
        name: 'Test Vendor',
        role: Role.VENDOR,
        companyId: 'company-id-123',
      };

      const mockToken = 'mock.jwt.token';
      jwtService.signAsync.mockResolvedValue(mockToken);

      // Act
      const result = await service.signToken(payload);

      // Assert
      expect(jwtService.signAsync).toHaveBeenCalledWith(
        payload,
        {
          expiresIn: '59m',
          secret: 'test-jwt-secret',
        },
      );
      expect(result).toEqual({
        access_token: mockToken,
        vendor: payload,
      });
    });
  });
});
