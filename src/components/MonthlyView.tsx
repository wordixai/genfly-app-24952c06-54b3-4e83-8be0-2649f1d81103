import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, getDay } from 'date-fns';
import useHabitStore from '@/store/habitStore';
import { Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

const MonthlyView: React.FC = () => {
  const { habits, selectedDate } = useHabitStore();
  const parsedDate = parseISO(selectedDate);
  
  // Get all days in the current month
  const monthStart = startOfMonth(parsedDate);
  const monthEnd = endOfMonth(parsedDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  // Calculate the day of the week for the first day of the month (0 = Sunday, 1 = Monday, etc.)
  const firstDayOfMonth = getDay(monthStart);
  
  // Create an array of blank spaces for the days before the first day of the month
  const blanks = Array(firstDayOfMonth).fill(null);
  
  // Combine blanks and days to create the calendar grid
  const calendarDays = [...blanks, ...daysInMonth];
  
  // Get completion data for each day
  const completionData = daysInMonth.reduce((acc, day) => {
    const dateStr = format(day, 'yyyy-MM-dd');
    const totalHabits = habits.filter(h => {
      const createdAt = parseISO(h.createdAt);
      return createdAt <= day;
    }).length;
    
    const completedHabits = habits.filter(habit => 
      habit.completedDates.some(d => isSameDay(parseISO(d), day))
    ).length;
    
    acc[dateStr] = {
      total: totalHabits,
      completed: completedHabits,
      percentage: totalHabits > 0 ? (completedHabits / totalHabits) * 100 : 0,
    };
    
    return acc;
  }, {} as Record<string, { total: number; completed: number; percentage: number }>);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarIcon className="h-5 w-5" />
          {format(parsedDate, 'MMMM yyyy')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-1 text-center">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-xs font-medium py-1">
              {day}
            </div>
          ))}
          
          {calendarDays.map((day, index) => {
            if (!day) {
              return <div key={`blank-${index}`} className="h-12 rounded-md" />;
            }
            
            const dateStr = format(day, 'yyyy-MM-dd');
            const isToday = isSameDay(day, new Date());
            const isSelected = isSameDay(day, parsedDate);
            const data = completionData[dateStr];
            
            // Determine color based on completion percentage
            let bgColor = 'bg-transparent';
            let textColor = '';
            
            if (data && data.total > 0) {
              if (data.percentage === 100) {
                bgColor = 'bg-green-100 dark:bg-green-900/30';
                textColor = 'text-green-800 dark:text-green-300';
              } else if (data.percentage >= 50) {
                bgColor = 'bg-yellow-100 dark:bg-yellow-900/30';
                textColor = 'text-yellow-800 dark:text-yellow-300';
              } else if (data.percentage > 0) {
                bgColor = 'bg-orange-100 dark:bg-orange-900/30';
                textColor = 'text-orange-800 dark:text-orange-300';
              }
            }
            
            return (
              <div
                key={dateStr}
                className={cn(
                  "h-12 rounded-md flex flex-col items-center justify-center border",
                  isToday && "border-primary",
                  isSelected && "ring-2 ring-primary",
                  bgColor,
                  textColor
                )}
              >
                <span className="text-sm">{format(day, 'd')}</span>
                {data && data.total > 0 && (
                  <span className="text-xs">
                    {data.completed}/{data.total}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default MonthlyView;