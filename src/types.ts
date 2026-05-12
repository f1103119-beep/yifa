export type MealCategory = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export interface Meal {
  id: string;
  category: MealCategory;
  content: string;
  timestamp: string;
}

export interface DailyLog {
  date: string; // ISO date string (YYYY-MM-DD)
  meals: Meal[];
  waterIntake: number; // in ml or glasses, let's use ml
}

export interface AnalysisResult {
  rating: number; // 1-10
  feedback: string;
  suggestions: string[];
  lastAnalyzed: string; // timestamp
}
