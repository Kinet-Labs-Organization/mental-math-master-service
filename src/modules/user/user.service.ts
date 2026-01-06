import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from "@nestjs/common";
import { Prisma, User } from "@prisma/client";
import { PrismaService } from "../../database/prisma/prisma.service";
import {
  USERS,
  REPORT,
  PRACTICE_GAMES,
  TOURNAMENT_GAMES,
  FLASH_GAMES,
  MOCK_API_DELAY,
} from "@/src/utils/mock";
import { UserSignupDTO } from "@/src/auth/dto";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import * as games from "@/src/utils/gameConfig";

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async findUserByEmail(email: string): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });
    if (!user) {
      throw new NotFoundException(`No user found for email: ${email}`);
    }
    return user;
  }

  async createUser(data: Prisma.UserCreateInput): Promise<User> {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: data.email },
    });
    if (existingUser) {
      throw new UnprocessableEntityException("Email already exists");
    }
    return this.prisma.user.create({ data });
  }

  ////

  generateCreativeUsername(): string {
    const colors = [
      "Red",
      "Blue",
      "Green",
      "Golden",
      "Silver",
      "Dark",
      "Bright",
    ];
    const animals = [
      "Panda",
      "Koala",
      "Penguin",
      "Dolphin",
      "Owl",
      "Cat",
      "Dog",
    ];
    const color = colors[Math.floor(Math.random() * colors.length)];
    const animal = animals[Math.floor(Math.random() * animals.length)];
    return `${color} ${animal}`;
  }

  async userSync(signupDto: any) {
    try {
      const createUserInput: Prisma.UserCreateInput = {
        email: signupDto.email,
        name: signupDto.name || this.generateCreativeUsername(),
        status: "UNSUBSCRIBED",
      };
      const user = await this.createUser(createUserInput);
      if (!user) {
        throw new ForbiddenException("User creation failed");
      }
      return { message: "User synchronized successfully" };
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === "P2002") {
          throw new ForbiddenException("Credentials taken");
        }
      }
      throw error;
    }
  }

  async progressReports() {
    const response = await new Promise((resolve) =>
      setTimeout(() => resolve(REPORT), MOCK_API_DELAY),
    );
    return response;
  }

  async practiceGames() {
    const response = await new Promise((resolve) =>
      setTimeout(() => resolve(PRACTICE_GAMES), MOCK_API_DELAY),
    );
    return response;
  }

  async gameLevels(gameLevel: string) {
    const gameLevelData = games[gameLevel];
    const response = await new Promise((resolve) =>
      setTimeout(() => resolve(gameLevelData), MOCK_API_DELAY),
    );
    return response;
  }

  async fetchGame(id: string) {
    const gameTypeLevel = id.substring(0, id.lastIndexOf("_"));
    const gameId = parseInt(id.substring(id.lastIndexOf("_")+1));
    const selctedGameConfig = games[gameTypeLevel][gameId-1];
    const gameData = this.flashGame(selctedGameConfig);
    const response = await new Promise((resolve) =>
      setTimeout(() => resolve(gameData), MOCK_API_DELAY),
    );
    return response;
  }

  flashGame(game: any) {
    const min = Math.pow(10, game.digitCount - 1);
    const max = Math.pow(10, game.digitCount) - 1;
    const newNumbers: any[] = [];
    for (let i = 0; i < game.numberCount; i++) {
      const value = Math.floor(Math.random() * (max - min + 1)) + min;
      const operation =
        game.operations[Math.floor(Math.random() * game.operations.length)];
      newNumbers.push({ value, operation });
    }
    return newNumbers;
  }
}
