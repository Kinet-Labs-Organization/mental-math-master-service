import { Injectable } from "@nestjs/common";

interface ActivityForRules {
  gameId: string;
  gameType: string;
  correctAnswers: number;
  wrongAnswers: number;
  createdAt: Date;
}

interface RuleEngineContext {
  activities: ActivityForRules[];
  report: {
    totalSessions: number;
    accuracyRate: number;
    currentStreak: number;
    score: number;
  };
}

@Injectable()
export class RuleEngineService {
  generateSuggestions(context: RuleEngineContext): string[] {
    const { activities, report } = context;
    const suggestions: string[] = [];

    if (activities.length === 0) {
      return [
        "Start with 3 quick flash rounds today to build momentum.",
        "Try ADDSUB L1 first and focus on clean accuracy before speed.",
      ];
    }

    const overallAccuracy = this.calculateAccuracy(activities);

    if (overallAccuracy < 60) {
      suggestions.push(
        "Focus on ADDSUB L1-L2 and slow down to improve accuracy first.",
      );
    } else if (overallAccuracy < 75) {
      suggestions.push(
        "You are improving, now aim for 80%+ by reviewing mistakes after each game.",
      );
    }

    const recent7 = activities.slice(0, 7);
    const previous7 = activities.slice(7, 14);
    if (recent7.length >= 3 && previous7.length >= 3) {
      const recentAccuracy = this.calculateAccuracy(recent7);
      const previousAccuracy = this.calculateAccuracy(previous7);
      if (recentAccuracy + 5 < previousAccuracy) {
        suggestions.push(
          "Your recent accuracy dipped. Try shorter sessions with a warm-up round.",
        );
      }
    }

    const flashActivities = activities.filter((a) => a.gameType === "flash");
    const regularActivities = activities.filter(
      (a) => a.gameType === "regular",
    );
    const flashAccuracy = this.calculateAccuracy(flashActivities);
    const regularAccuracy = this.calculateAccuracy(regularActivities);

    if (flashActivities.length > 0 && regularActivities.length > 0) {
      if (flashAccuracy + 10 < regularAccuracy) {
        suggestions.push(
          "Practice flash mode more to improve speed under pressure.",
        );
      } else if (regularAccuracy + 10 < flashAccuracy) {
        suggestions.push(
          "Practice regular mode to strengthen multi-step consistency.",
        );
      }
    }

    const weakestOperation = this.findWeakestOperation(activities);
    if (weakestOperation) {
      suggestions.push(
        `Practice ${weakestOperation} more in your next session.`,
      );
    }

    if (report.currentStreak <= 1 && report.totalSessions >= 10) {
      suggestions.push(
        "Build streaks by starting with 2 easy rounds before attempting harder levels.",
      );
    }

    if (overallAccuracy >= 90 && report.totalSessions >= 20) {
      suggestions.push(
        "Great form. Try timed challenges to push speed while keeping accuracy high.",
      );
    }

    if (report.totalSessions < 10) {
      suggestions.push(
        "Play at least 2 short sessions daily this week to build consistency.",
      );
    }

    return Array.from(new Set(suggestions)).slice(0, 3);
  }

  private calculateAccuracy(activities: ActivityForRules[]): number {
    if (activities.length === 0) {
      return 0;
    }

    const totals = activities.reduce(
      (acc, activity) => {
        acc.correct += activity.correctAnswers;
        acc.wrong += activity.wrongAnswers;
        return acc;
      },
      { correct: 0, wrong: 0 },
    );

    const attempts = totals.correct + totals.wrong;
    if (attempts === 0) {
      return 0;
    }
    return (totals.correct / attempts) * 100;
  }

  private findWeakestOperation(activities: ActivityForRules[]): string | null {
    const operationStats: Record<string, { correct: number; wrong: number }> = {
      ADDSUB: { correct: 0, wrong: 0 },
      MUL: { correct: 0, wrong: 0 },
      DIV: { correct: 0, wrong: 0 },
    };

    for (const activity of activities) {
      const [operation] = activity.gameId.split("_");
      if (!operationStats[operation]) {
        continue;
      }
      operationStats[operation].correct += activity.correctAnswers;
      operationStats[operation].wrong += activity.wrongAnswers;
    }

    let weakestKey: string | null = null;
    let weakestAccuracy = Number.POSITIVE_INFINITY;

    for (const [operation, stats] of Object.entries(operationStats)) {
      const attempts = stats.correct + stats.wrong;
      if (attempts === 0) {
        continue;
      }
      const accuracy = (stats.correct / attempts) * 100;
      if (accuracy < weakestAccuracy) {
        weakestAccuracy = accuracy;
        weakestKey = operation;
      }
    }

    if (weakestKey === "ADDSUB") {
      return "addition and subtraction";
    }
    if (weakestKey === "MUL") {
      return "multiplication";
    }
    if (weakestKey === "DIV") {
      return "division";
    }
    return null;
  }
}
