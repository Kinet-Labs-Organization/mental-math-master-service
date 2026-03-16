import { Test, TestingModule } from "@nestjs/testing";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { PrismaService } from "@/src/database/prisma/prisma.service";
import { PrismaModule } from "@/src/database/prisma/prisma.module";
import { resolve } from "path";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

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
    const envFilePath = resolve(process.cwd(), ".env.test");

    const module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath,
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
    const configService = module.get<ConfigService>(ConfigService);

    try {
      await prismaService.$connect();
    } catch (error) {
      const databaseUrl = configService.get<string>("DATABASE_URL");
      throw new Error(
        [
          `Failed to connect to the test database from ${envFilePath}.`,
          `DATABASE_URL: ${databaseUrl}`,
          "Make sure the test DB is running and migrated first:",
          "1. docker compose -f docker-compose.test.yml up -d test-db-mmm",
          "2. dotenv -e .env.test -- prisma migrate deploy",
          `Original error: ${(error as Error).message}`,
        ].join("\n"),
      );
    }

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

    try {
      // Delete child records first, then parents.
      // await this.prismaService.notifications.deleteMany();
      await this.prismaService.gameActivity.deleteMany();
      await this.prismaService.report.deleteMany();
      await this.prismaService.user.deleteMany();
    } catch (error) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === "P2021"
      ) {
        throw new Error(
          [
            "The test database schema is not ready.",
            "Required tables like GameActivity do not exist yet.",
            "Run these commands first:",
            "1. npm run start:db:test",
            "2. npm run test:integration:game",
          ].join("\n"),
        );
      }
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
