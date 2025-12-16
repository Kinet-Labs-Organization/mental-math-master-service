import { Test, TestingModule } from "@nestjs/testing";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { PrismaService } from "@/src/database/prisma/prisma.service";
import { PrismaModule } from "@/src/database/prisma/prisma.module";

export class DatabaseTestSetup {
  private static prismaService: PrismaService;
  private static module: TestingModule;

  /**
   * Setup test database and dependencies
   */
  static async setupTestDatabase(): Promise<{
    prismaService: PrismaService;
    module: TestingModule;
  }> {
    const module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: ".env.test",
        }),
        PrismaModule,
        JwtModule.registerAsync({
          useFactory: (config: ConfigService) => ({
            secret: config.get("JWT_SECRET"),
            signOptions: {
              expiresIn: config.get("JWT_EXPIRE"),
            },
          }),
          inject: [ConfigService],
        }),
      ],
    }).compile();

    const prismaService = module.get<PrismaService>(PrismaService);

    // Wait for database connection
    await prismaService.$connect();

    this.prismaService = prismaService;
    this.module = module;

    return { prismaService, module };
  }

  /**
   * Clean all test data from database
   */
  static async cleanDatabase(): Promise<void> {
    if (!this.prismaService) {
      throw new Error(
        "Database not initialized. Call setupTestDatabase first.",
      );
    }

    // Delete in correct order to avoid foreign key constraints
    // Order matters - delete child records first, then parents
    try {
      // First, delete OrderItem (depends on Order and Product)
      await this.prismaService.orderItem.deleteMany();

      // Delete Order (depends on User and Vendor)
      await this.prismaService.order.deleteMany();

      // Delete Product (depends on Vendor)
      await this.prismaService.product.deleteMany();

      // Delete User (depends on Vendor)
      await this.prismaService.user.deleteMany();

      // Finally, delete Vendor (root entity)
      await this.prismaService.vendor.deleteMany();
    } catch (error) {
      console.error("Error cleaning test database:", error);
      throw error;
    }
  }

  /**
   * Teardown test database and close connections
   */
  static async teardownTestDatabase(): Promise<void> {
    if (this.prismaService) {
      await this.cleanDatabase();
      await this.prismaService.$disconnect();
    }

    if (this.module) {
      await this.module.close();
    }
  }

  /**
   * Reset database to clean state
   */
  static async resetDatabase(): Promise<void> {
    await this.cleanDatabase();
  }

  /**
   * Get the prisma service instance
   */
  static getPrismaService(): PrismaService {
    if (!this.prismaService) {
      throw new Error(
        "Database not initialized. Call setupTestDatabase first.",
      );
    }
    return this.prismaService;
  }

  /**
   * Get the test module instance
   */
  static getModule(): TestingModule {
    if (!this.module) {
      throw new Error("Module not initialized. Call setupTestDatabase first.");
    }
    return this.module;
  }
}
