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
