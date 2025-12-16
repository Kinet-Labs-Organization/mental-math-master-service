import { Test, TestingModule } from "@nestjs/testing";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { Vendor } from "@prisma/client";

// Define Role enum to match schema.prisma
enum Role {
  ADMIN = "ADMIN",
  VENDOR = "VENDOR",
  MANAGER = "MANAGER",
  STAFF = "STAFF",
}

// Define SignUpMethod enum to match schema.prisma
enum SignUpMethod {
  EMAIL = "EMAIL",
  GOOGLE = "GOOGLE",
  FACEBOOK = "FACEBOOK",
  APPLE = "APPLE",
}

export class TestHelper {
  /**
   * Create a test vendor object
   */
  static createTestVendor(overrides: Partial<Vendor> = {}): Vendor {
    return {
      id: "test-vendor-id",
      email: "test@example.com",
      password: "hashedPassword",
      name: "Test Vendor",
      companyName: "Test Company",
      companyId: "test-company-id",
      phone: "+1234567890",
      signUpMethod: SignUpMethod.EMAIL,
      role: Role.VENDOR,
      isActive: true,
      createdAt: new Date(),
      createdBy: "system",
      lastUpdatedAt: new Date(),
      lastUpdatedBy: "system",
      ...overrides,
    };
  }

  /**
   * Create multiple test vendors with different roles
   */
  static createTestVendors(): Vendor[] {
    return [
      this.createTestVendor({
        id: "vendor-user-id",
        email: "vendor@example.com",
        role: Role.VENDOR,
      }),
      this.createTestVendor({
        id: "admin-user-id",
        email: "admin@example.com",
        role: Role.ADMIN,
      }),
      this.createTestVendor({
        id: "manager-user-id",
        email: "manager@example.com",
        role: Role.MANAGER,
      }),
    ];
  }

  /**
   * Create a JWT token for testing
   */
  static createTestToken(vendor: Vendor, jwtService: JwtService): string {
    const payload = {
      id: vendor.id,
      email: vendor.email,
      name: vendor.name,
      role: vendor.role,
      companyId: vendor.companyId,
    };
    return jwtService.sign(payload);
  }

  /**
   * Create test module with common providers
   */
  static async createTestModule(
    providers: any[],
    imports: any[] = [],
  ): Promise<TestingModule> {
    return Test.createTestingModule({
      imports,
      providers: [
        ...providers,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              const config: Record<string, any> = {
                JWT_SECRET: "test-jwt-secret",
                JWT_EXPIRE: "15m",
                DATABASE_URL: "postgresql://test",
              };
              return config[key];
            }),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(() => "test.jwt.token"),
            verify: jest.fn(() => ({
              id: "test-id",
              email: "test@example.com",
            })),
          },
        },
      ],
    }).compile();
  }

  /**
   * Mock Prisma client for unit tests
   */
  static createMockPrismaService() {
    return {
      vendor: {
        create: jest.fn(),
        findUnique: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        count: jest.fn(),
        findFirst: jest.fn(),
      },
      user: {
        create: jest.fn(),
        findUnique: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        count: jest.fn(),
      },
      product: {
        create: jest.fn(),
        findUnique: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        count: jest.fn(),
      },
      order: {
        create: jest.fn(),
        findUnique: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        count: jest.fn(),
      },
      orderItem: {
        create: jest.fn(),
        findMany: jest.fn(),
        delete: jest.fn(),
        count: jest.fn(),
      },
      $transaction: jest.fn(),
    };
  }

  /**
   * Clean up test data
   */
  static async cleanupTestData(prismaService: any) {
    // Delete in correct order to avoid foreign key constraints
    await prismaService.orderItem.deleteMany();
    await prismaService.order.deleteMany();
    await prismaService.product.deleteMany();
    await prismaService.user.deleteMany();
    await prismaService.vendor.deleteMany();
  }

  /**
   * Create test request headers with authentication
   */
  static createAuthHeaders(token: string) {
    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
  }

  /**
   * Generate test email
   */
  static generateTestEmail(prefix = "test"): string {
    return `${prefix}-${Date.now()}@example.com`;
  }

  /**
   * Wait for a specified time (useful for async operations)
   */
  static wait(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
