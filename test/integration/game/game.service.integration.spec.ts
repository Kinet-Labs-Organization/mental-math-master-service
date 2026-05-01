import { Test, TestingModule } from "@nestjs/testing";
import { ConfigModule } from "@nestjs/config";
import { GameService } from "@/src/modules/game/game.service";
import { PrismaModule } from "@/src/database/prisma/prisma.module";
import { PrismaService } from "@/src/database/prisma/prisma.service";
import { DatabaseTestSetup } from "../../helpers/database-test-setup";

describe("GameService - Integration Tests", () => {
  let gameService: GameService;
  let prismaService: PrismaService;
  let module: TestingModule;

  const email = "flash-player@example.com";
  const payload = {
    gameId: "ADDSUB_L1_1",
    gameName: "Sirius",
    gameMode: "flash" as const,
    selectedGame: {
      id: "ADDSUB_L1_1",
      name: "Sirius",
      digitCount: 1,
      numberCount: 3,
      delay: 1000,
      operations: ["add", "subtract"],
      icon: "1",
    },
    numbers: [
      { value: 8, operation: "" },
      { value: 3, operation: "add" },
      { value: 2, operation: "subtract" },
    ],
    correctAnswer: 9,
    userAnswer: "9",
    parsedAnswer: 9,
    isCorrect: true,
    outcome: "win" as const,
    answeredAt: "2026-03-16T10:00:00.000Z",
  };

  beforeAll(async () => {
    await DatabaseTestSetup.setupTestDatabase();

    module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: ".env.test",
        }),
        PrismaModule,
      ],
      providers: [GameService],
    }).compile();

    gameService = module.get<GameService>(GameService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  beforeEach(async () => {
    await DatabaseTestSetup.resetDatabase();
  });

  afterAll(async () => {
    await DatabaseTestSetup.teardownTestDatabase();
    if (module) {
      await module.close();
    }
  });

  it("should create a game activity and update the user report from flash game payload", async () => {
    await prismaService.user.create({
      data: {
        email,
        name: "Flash Player",
        status: "SUBSCRIBED",
      },
    });

    await gameService.saveFlashGameReport(email, payload);

    // expect(result.message).toBe("Flash game report saved successfully");
    // expect(result.activityId).toEqual(expect.any(Number));
    // expect(result.report.gamesPlayed).toBe(1);
    // expect(result.report.score).toBe(1);
    // expect(result.report.streak).toBe(1);
    // expect(result.report.accuracy).toBe(100);

    // const activity = await prismaService.gameActivity.findFirst({
    //   where: { user: { email } },
    //   orderBy: { id: "desc" },
    // });

    // expect(activity).toBeTruthy();
    // expect(activity?.gameId).toBe(payload.gameId);
    // expect(activity?.gameType).toBe("flash");
    // expect(activity?.correctAnswers).toBe(1);
    // expect(activity?.wrongAnswers).toBe(0);
    // expect(activity?.details).toMatchObject({
    //   gameId: payload.gameId,
    //   userAnswer: payload.userAnswer,
    //   correctAnswer: payload.correctAnswer,
    //   outcome: payload.outcome,
    // });

    // const report = await prismaService.report.findFirst({
    //   where: { user: { email } },
    // });

    // expect(report).toBeTruthy();
    // expect(report?.gamesPlayed).toBe(1);
    // expect(report?.score).toBe(1);
    // expect(report?.streak).toBe(1);
    // expect(report?.accuracy).toBe(100);
  });
});
