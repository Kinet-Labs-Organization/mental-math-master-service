import {
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from "@nestjs/common";
import { Prisma, User } from "@prisma/client";
import { PrismaService } from "../../database/prisma/prisma.service";
import { USERS, REPORT, PRACTICE_GAMES, TOURNAMENT_GAMES, FLASH_GAMES, MOCK_API_DELAY} from "@/src/utils/mock";

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

  // async login({ email, password }: { email: string; password: string }) {
  //   const user = USERS.find(
  //     (user) => user.email === email && user.password === password,
  //   );
  //   if (!user) {
  //     throw new Error('Invalid credentials');
  //   }
  //   await new Promise((resolve) =>
  //     setTimeout(() => resolve(1), MOCK_API_DELAY),
  //   );
  //   return this.authService.login(user);
  // }

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

  async tournamentGames() {
    const response = await new Promise((resolve) =>
      setTimeout(() => resolve(TOURNAMENT_GAMES), MOCK_API_DELAY),
    );
    return response;
  }

  async flashGame(id: string) {
    const game: any = FLASH_GAMES.find((game) => game.id === id);

    const min = Math.pow(10, game.digitCount - 1);
    const max = Math.pow(10, game.digitCount) - 1;
    const newNumbers: any[] = [];

    for (let i = 0; i < game.numberCount; i++) {
      const value = Math.floor(Math.random() * (max - min + 1)) + min;
      const operation =
        game.operations[Math.floor(Math.random() * game.operations.length)];
      newNumbers.push({ value, operation });
    }

    const response = await new Promise((resolve) =>
      setTimeout(() => resolve(newNumbers), MOCK_API_DELAY),
    );
    return response;
  }
}
