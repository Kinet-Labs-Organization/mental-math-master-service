import { Type } from "class-transformer";
import {
  ArrayMinSize,
  IsBoolean,
  IsArray,
  IsIn,
  IsInt,
  IsISO8601,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from "class-validator";

interface IProgressReport {
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

export class FlashGameSelectedGameDto {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsInt()
  digitCount: number;

  @IsInt()
  numberCount: number;

  @IsOptional()
  @IsInt()
  delay: number | null;

  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  operations: string[];

  @IsOptional()
  @IsString()
  icon: string | null;
}

export class FlashGameNumberItemDto {
  @IsNumber()
  value: number;

  @IsString()
  operation: string;
}

export class FlashGameReportPayloadDto {
  @IsString()
  @IsNotEmpty()
  gameId: string;

  @IsString()
  @IsNotEmpty()
  gameName: string;

  @IsIn(["flash"])
  gameMode: "flash";

  @IsNumber()
  correctAnswerGiven: number;

  @IsNumber()
  wrongAnswerGiven: number;

  @IsISO8601()
  answeredAt: string;
}
