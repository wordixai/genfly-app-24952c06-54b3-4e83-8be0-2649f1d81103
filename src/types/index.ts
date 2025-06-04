export type HabitCategory = {
  id: string;
  name: string;
  color: string;
  icon: string;
};

export type Habit = {
  id: string;
  name: string;
  description?: string;
  categoryId: string;
  createdAt: string;
  completedDates: string[]; // ISO date strings
  streak: number;
  longestStreak: number;
  target: number; // days per week
};

export type Badge = {
  id: string;
  name: string;
  description: string;
  icon: string;
  earned: boolean;
  earnedAt?: string;
  criteria: {
    type: 'streak' | 'completion' | 'category';
    value: number;
    categoryId?: string;
  };
};

export type AppState = {
  habits: Habit[];
  categories: HabitCategory[];
  badges: Badge[];
  selectedDate: string; // ISO date string
};