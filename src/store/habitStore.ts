import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { format, addDays, isSameDay, parseISO, isToday, subDays } from 'date-fns';
import { AppState, Habit, HabitCategory, Badge } from '@/types';

// Default categories
const defaultCategories: HabitCategory[] = [
  { id: 'health', name: 'Health', color: '#4CAF50', icon: 'Heart' },
  { id: 'productivity', name: 'Productivity', color: '#2196F3', icon: 'Briefcase' },
  { id: 'learning', name: 'Learning', color: '#9C27B0', icon: 'BookOpen' },
  { id: 'mindfulness', name: 'Mindfulness', color: '#FF9800', icon: 'Smile' },
  { id: 'fitness', name: 'Fitness', color: '#F44336', icon: 'Dumbbell' },
];

// Default badges
const defaultBadges: Badge[] = [
  {
    id: 'streak-7',
    name: '7 Day Streak',
    description: 'Maintain a habit for 7 days in a row',
    icon: 'Flame',
    earned: false,
    criteria: { type: 'streak', value: 7 }
  },
  {
    id: 'streak-30',
    name: '30 Day Streak',
    description: 'Maintain a habit for 30 days in a row',
    icon: 'Award',
    earned: false,
    criteria: { type: 'streak', value: 30 }
  },
  {
    id: 'completion-50',
    name: '50 Completions',
    description: 'Complete any habits 50 times',
    icon: 'CheckCircle',
    earned: false,
    criteria: { type: 'completion', value: 50 }
  },
  {
    id: 'health-master',
    name: 'Health Master',
    description: 'Complete 20 health habits',
    icon: 'Heart',
    earned: false,
    criteria: { type: 'category', value: 20, categoryId: 'health' }
  },
  {
    id: 'productivity-master',
    name: 'Productivity Master',
    description: 'Complete 20 productivity habits',
    icon: 'Briefcase',
    earned: false,
    criteria: { type: 'category', value: 20, categoryId: 'productivity' }
  }
];

const useHabitStore = create<AppState & {
  addHabit: (habit: Omit<Habit, 'id' | 'createdAt' | 'completedDates' | 'streak' | 'longestStreak'>) => void;
  toggleHabitCompletion: (habitId: string, date: string) => void;
  deleteHabit: (habitId: string) => void;
  addCategory: (category: Omit<HabitCategory, 'id'>) => void;
  deleteCategory: (categoryId: string) => void;
  setSelectedDate: (date: string) => void;
  checkBadges: () => void;
}>(persist(
  (set, get) => ({
    habits: [],
    categories: defaultCategories,
    badges: defaultBadges,
    selectedDate: format(new Date(), 'yyyy-MM-dd'),

    addHabit: (habitData) => {
      const newHabit: Habit = {
        id: uuidv4(),
        name: habitData.name,
        description: habitData.description || '',
        categoryId: habitData.categoryId,
        createdAt: new Date().toISOString(),
        completedDates: [],
        streak: 0,
        longestStreak: 0,
        target: habitData.target || 7,
      };

      set((state) => ({
        habits: [...state.habits, newHabit]
      }));
    },

    toggleHabitCompletion: (habitId, date) => {
      set((state) => {
        const habits = [...state.habits];
        const habitIndex = habits.findIndex(h => h.id === habitId);
        
        if (habitIndex === -1) return state;
        
        const habit = { ...habits[habitIndex] };
        const dateExists = habit.completedDates.some(d => 
          isSameDay(parseISO(d), parseISO(date))
        );
        
        if (dateExists) {
          // Remove the date
          habit.completedDates = habit.completedDates.filter(d => 
            !isSameDay(parseISO(d), parseISO(date))
          );
        } else {
          // Add the date
          habit.completedDates = [...habit.completedDates, date];
        }
        
        // Calculate streak
        const sortedDates = [...habit.completedDates]
          .map(d => parseISO(d))
          .sort((a, b) => a.getTime() - b.getTime());
        
        let currentStreak = 0;
        
        // Check if completed today
        if (sortedDates.length > 0 && isToday(sortedDates[sortedDates.length - 1])) {
          currentStreak = 1;
          let checkDate = subDays(new Date(), 1);
          
          // Count backwards from yesterday
          for (let i = sortedDates.length - 2; i >= 0; i--) {
            if (isSameDay(sortedDates[i], checkDate)) {
              currentStreak++;
              checkDate = subDays(checkDate, 1);
            } else {
              break;
            }
          }
        }
        
        habit.streak = currentStreak;
        habit.longestStreak = Math.max(habit.longestStreak, currentStreak);
        
        habits[habitIndex] = habit;
        
        return { habits };
      });
      
      // Check for badges after toggling completion
      get().checkBadges();
    },

    deleteHabit: (habitId) => {
      set((state) => ({
        habits: state.habits.filter(h => h.id !== habitId)
      }));
    },

    addCategory: (categoryData) => {
      const newCategory: HabitCategory = {
        id: uuidv4(),
        name: categoryData.name,
        color: categoryData.color,
        icon: categoryData.icon,
      };

      set((state) => ({
        categories: [...state.categories, newCategory]
      }));
    },

    deleteCategory: (categoryId) => {
      set((state) => ({
        categories: state.categories.filter(c => c.id !== categoryId)
      }));
    },

    setSelectedDate: (date) => {
      set({ selectedDate: date });
    },

    checkBadges: () => {
      set((state) => {
        const badges = [...state.badges];
        const habits = state.habits;
        const now = new Date().toISOString();
        
        // Check streak badges
        const streakBadges = badges.filter(b => b.criteria.type === 'streak' && !b.earned);
        streakBadges.forEach(badge => {
          const habitWithStreak = habits.some(h => h.streak >= badge.criteria.value);
          if (habitWithStreak) {
            const badgeIndex = badges.findIndex(b => b.id === badge.id);
            badges[badgeIndex] = { ...badge, earned: true, earnedAt: now };
          }
        });
        
        // Check completion badges
        const completionBadges = badges.filter(b => b.criteria.type === 'completion' && !b.earned);
        completionBadges.forEach(badge => {
          const totalCompletions = habits.reduce((sum, habit) => sum + habit.completedDates.length, 0);
          if (totalCompletions >= badge.criteria.value) {
            const badgeIndex = badges.findIndex(b => b.id === badge.id);
            badges[badgeIndex] = { ...badge, earned: true, earnedAt: now };
          }
        });
        
        // Check category badges
        const categoryBadges = badges.filter(b => b.criteria.type === 'category' && !b.earned);
        categoryBadges.forEach(badge => {
          const categoryId = badge.criteria.categoryId;
          if (!categoryId) return;
          
          const categoryCompletions = habits
            .filter(h => h.categoryId === categoryId)
            .reduce((sum, habit) => sum + habit.completedDates.length, 0);
            
          if (categoryCompletions >= badge.criteria.value) {
            const badgeIndex = badges.findIndex(b => b.id === badge.id);
            badges[badgeIndex] = { ...badge, earned: true, earnedAt: now };
          }
        });
        
        return { badges };
      });
    }
  }),
  {
    name: 'habit-tracker-storage',
  }
));

export default useHabitStore;