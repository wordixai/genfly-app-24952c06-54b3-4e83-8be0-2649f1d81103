import React from 'react';
import { format, parseISO, isSameDay } from 'date-fns';
import { Habit, HabitCategory } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Flame, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import useHabitStore from '@/store/habitStore';
import { 
  Heart, Briefcase, BookOpen, Smile, Dumbbell, 
  Music, Coffee, Code, Zap, Droplet
} from 'lucide-react';

const iconMap: Record<string, React.ReactNode> = {
  Heart: <Heart className="h-4 w-4" />,
  Briefcase: <Briefcase className="h-4 w-4" />,
  BookOpen: <BookOpen className="h-4 w-4" />,
  Smile: <Smile className="h-4 w-4" />,
  Dumbbell: <Dumbbell className="h-4 w-4" />,
  Music: <Music className="h-4 w-4" />,
  Coffee: <Coffee className="h-4 w-4" />,
  Code: <Code className="h-4 w-4" />,
  Zap: <Zap className="h-4 w-4" />,
  Droplet: <Droplet className="h-4 w-4" />,
};

interface HabitListProps {
  filter?: string;
}

const HabitList: React.FC<HabitListProps> = ({ filter }) => {
  const { habits, categories, selectedDate, toggleHabitCompletion, deleteHabit } = useHabitStore();

  const filteredHabits = filter 
    ? habits.filter(habit => habit.categoryId === filter)
    : habits;

  const getCategoryById = (id: string): HabitCategory | undefined => {
    return categories.find(cat => cat.id === id);
  };

  const isHabitCompletedOnDate = (habit: Habit, date: string): boolean => {
    return habit.completedDates.some(d => isSameDay(parseISO(d), parseISO(date)));
  };

  return (
    <div className="space-y-4">
      {filteredHabits.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            No habits found. Add a new habit to get started!
          </CardContent>
        </Card>
      ) : (
        filteredHabits.map(habit => {
          const category = getCategoryById(habit.categoryId);
          const isCompleted = isHabitCompletedOnDate(habit, selectedDate);
          
          return (
            <Card key={habit.id} className={cn(
              "transition-all duration-200",
              isCompleted ? "border-green-500 bg-green-50 dark:bg-green-950/20" : ""
            )}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Checkbox 
                      checked={isCompleted}
                      onCheckedChange={() => toggleHabitCompletion(habit.id, selectedDate)}
                      className={cn(
                        "h-5 w-5 rounded-full",
                        isCompleted ? "bg-green-500 text-white" : ""
                      )}
                    />
                    <div>
                      <h3 className="font-medium">{habit.name}</h3>
                      {habit.description && (
                        <p className="text-sm text-muted-foreground">{habit.description}</p>
                      )}
                      <div className="flex items-center gap-2 mt-1">
                        {category && (
                          <Badge 
                            variant="outline" 
                            className="flex items-center gap-1"
                            style={{ borderColor: category.color, color: category.color }}
                          >
                            {iconMap[category.icon]}
                            {category.name}
                          </Badge>
                        )}
                        {habit.streak > 0 && (
                          <Badge variant="secondary" className="flex items-center gap-1">
                            <Flame className="h-3 w-3 text-orange-500" />
                            {habit.streak} day streak
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => deleteHabit(habit.id)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })
      )}
    </div>
  );
};

export default HabitList;