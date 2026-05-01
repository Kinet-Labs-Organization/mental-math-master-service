import {
  IsIn,
  IsISO8601,
  IsNotEmpty,
  IsNumber,
  IsString,
} from "class-validator";

export interface IProgressReport {
  totalSessions: number;
  accuracyRate: number;
  currentStreak: number;
  achievements: string[];
  performanceTrend: number[];
  aiSuggestions: string[];
  recentActivities: IActivities[];
}

interface IActivities {
  gameName: string;
  gamePlayedAt: Date;
  gameType: string;
  totalQuestions?: number;
  correctAnswers?: number;
  correctness?: boolean;
}

export class FlashGameReportPayloadDto {
  @IsString()
  @IsNotEmpty()
  gameId: string;

  @IsString()
  @IsNotEmpty()
  gameName: string;

  @IsIn(["flash", "regular"])
  gameMode: "flash" | "regular";

  @IsNumber()
  correctAnswerGiven: number;

  @IsNumber()
  wrongAnswerGiven: number;

  @IsISO8601()
  answeredAt: string;
}
