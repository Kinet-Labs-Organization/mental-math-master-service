import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { AuthService } from '@/src/auth/auth.service';
import { VendorService } from '@/src/modules/vendor/vendor.service';
import { PrismaModule } from '@/src/database/prisma/prisma.module';
import { DatabaseTestSetup } from '../../helpers/database-test-setup';
import { TestHelper } from '../../helpers/test-helper';
import { PrismaService } from '@/src/database/prisma/prisma.service';
import { ForbiddenException } from '@nestjs/common';

// Import enums we created for the unit tests
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

describe('Auth Module - Integration Tests', () => {
  let authService: AuthService;
  let vendorService: VendorService;
  let prismaService: PrismaService;
  let module: TestingModule;

  beforeAll(async () => {
    const { prismaService: testPrismaService, module: testModule } =
      await DatabaseTestSetup.setupTestDatabase();

    const moduleBuilder = Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: '.env.test',
        }),
        PrismaModule,
        JwtModule.registerAsync({
          useFactory: () => ({
            secret: 'test-jwt-secret',
            signOptions: { expiresIn: '15m' },
          }),
        }),
      ],
      providers: [
        AuthService,
        VendorService,
        {
          provide: WINSTON_MODULE_NEST_PROVIDER,
          useValue: {
            info: jest.fn(),
            error: jest.fn(),
            warn: jest.fn(),
            debug: jest.fn(),
          },
        },
      ],
    });

    module = await moduleBuilder.compile();
    authService = module.get<AuthService>(AuthService);
    vendorService = module.get<VendorService>(VendorService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  beforeEach(async () => {
    await DatabaseTestSetup.resetDatabase();
  });

  afterAll(async () => {
    await DatabaseTestSetup.teardownTestDatabase();
    await module.close();
  });

  describe('signup with vendor', () => {
    it('should create and authenticate a new vendor', async () => {
      // Arrange
      const signupData = {
        email: TestHelper.generateTestEmail('vendor-signup'),
        name: 'Vendor Test User',
        password: 'testPassword123',
        companyName: 'Test Company',
        phone: '+1234567890',
      };

      // Act
      const result = await authService.signup(signupData);

      // Assert
      expect(result).toHaveProperty('access_token');
      expect(typeof result.access_token).toBe('string');
      expect(result.vendor).toBeDefined();
      expect(result.vendor.email).toBe(signupData.email);

      // Verify vendor was created in database
      const createdVendor = await vendorService.findByEmail(signupData.email);
      expect(createdVendor).toBeDefined();
      expect(createdVendor?.email).toBe(signupData.email);
      expect(createdVendor?.name).toBe(signupData.name);
      expect(createdVendor?.companyName).toBe(signupData.companyName);
      expect(createdVendor?.signUpMethod).toBe(SignUpMethod.EMAIL);
      expect(createdVendor?.role).toBe(Role.VENDOR);
    });

    it('should prevent duplicate email registration', async () => {
      // Arrange
      const email = TestHelper.generateTestEmail('duplicate-vendor');
      const signupData = {
        email,
        name: 'Test Vendor',
        password: 'testPassword123',
        companyName: 'Test Company',
        phone: '+1234567890',
      };

      // Create initial vendor
      await authService.signup(signupData);

      // Act & Assert - Try to create another vendor with same email
      await expect(authService.signup(signupData)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('signin with vendor', () => {
    it('should authenticate an existing vendor with correct credentials', async () => {
      // Arrange
      const email = TestHelper.generateTestEmail('vendor-signin');
      const password = 'testPassword123';
      
      // Create a vendor first
      const signupData = {
        email,
        name: 'Signin Test Vendor',
        password,
        companyName: 'Signin Test Company',
        phone: '+1234567890',
      };
      await authService.signup(signupData);

      // Act
      const result = await authService.signin({ email, password });

      // Assert
      expect(result).toHaveProperty('access_token');
      expect(result.vendor).toBeDefined();
      expect(result.vendor.email).toBe(email);
    });

    it('should throw when credentials are incorrect', async () => {
      // Arrange
      const email = TestHelper.generateTestEmail('vendor-wrong-password');
      const password = 'testPassword123';
      const wrongPassword = 'wrongPassword';
      
      // Create a vendor first
      const signupData = {
        email,
        name: 'Wrong Password Test Vendor',
        password,
        companyName: 'Wrong Password Test Company',
        phone: '+1234567890',
      };
      await authService.signup(signupData);

      // Act & Assert
      await expect(
        authService.signin({ email, password: wrongPassword })
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw when vendor does not exist', async () => {
      // Arrange
      const nonExistentEmail = TestHelper.generateTestEmail('non-existent-vendor');
      const password = 'testPassword123';

      // Act & Assert
      await expect(
        authService.signin({ email: nonExistentEmail, password })
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('Google authentication with vendor', () => {
    it('should create a new vendor with Google signup method', async () => {
      // Arrange
      const googleData = {
        email: TestHelper.generateTestEmail('google-vendor'),
        name: 'Google Vendor',
        companyName: 'Google Company',
      };

      // Mock the googleAuthAPI
      jest.spyOn(authService, 'googleAuthAPI').mockResolvedValue(googleData);

      // Act
      const result = await authService.googleSignup(googleData);

      // Assert
      expect(result).toHaveProperty('access_token');
      expect(result.vendor).toBeDefined();
      expect(result.vendor.email).toBe(googleData.email);

      // Verify vendor was created in database with GOOGLE signup method
      const createdVendor = await vendorService.findByEmail(googleData.email);
      expect(createdVendor).toBeDefined();
      expect(createdVendor?.email).toBe(googleData.email);
      expect(createdVendor?.signUpMethod).toBe(SignUpMethod.GOOGLE);
      expect(createdVendor?.role).toBe(Role.VENDOR);
    });

    it('should sign in an existing vendor with Google authentication', async () => {
      // Arrange
      const googleData = {
        email: TestHelper.generateTestEmail('google-signin-vendor'),
        name: 'Google Signin Vendor',
        companyName: 'Google Signin Company',
      };

      // Mock the googleAuthAPI
      jest.spyOn(authService, 'googleAuthAPI').mockResolvedValue(googleData);

      // First create the vendor via Google signup
      await authService.googleSignup(googleData);

      // Act - Try to signin with same Google account
      const result = await authService.googleSignin(googleData);

      // Assert
      expect(result).toHaveProperty('access_token');
      expect(result.vendor).toBeDefined();
      expect(result.vendor.email).toBe(googleData.email);
    });

    it('should throw when Google authentication fails', async () => {
      // Arrange
      const googleData = {
        email: TestHelper.generateTestEmail('failed-google-auth'),
      };

      // Mock the googleAuthAPI to return null (authentication failed)
      jest.spyOn(authService, 'googleAuthAPI').mockResolvedValue(null);

      // Act & Assert
      await expect(
        authService.googleSignin(googleData)
      ).rejects.toThrow(ForbiddenException);
    });
  });
});