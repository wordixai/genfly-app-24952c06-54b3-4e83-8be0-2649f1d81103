import React from 'react';
import { format, addDays, subDays, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, parseISO } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import useHabitStore from '@/store/habitStore';
import { cn } from '@/lib/utils';

const DateSelector: React.FC = () => {
  const { selectedDate, setSelectedDate, habits } = useHabitStore();
  const parsedDate = parseISO(selectedDate);
  
  const handlePrevDay = () => {
    setSelectedDate(format(subDays(parsedDate, 1), 'yyyy-MM-dd'));
  };
  
  const handleNextDay = () => {
    setSelectedDate(format(addDays(parsedDate, 1), 'yyyy-MM-dd'));
  };
  
  const handleToday = () => {
    setSelectedDate(format(new Date(), 'yyyy-MM-dd'));
  };
  
  const handleSelectDate = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(format(date, 'yyyy-MM-dd'));
    }
  };
  
  // Get dates with completed habits for the calendar
  const datesWithHabits = React.useMemo(() => {
    const allDates = new Set<string>();
    habits.forEach(habit => {
      habit.completedDates.forEach(date => {
        allDates.add(format(parseISO(date), 'yyyy-MM-dd'));
      });
    });
    return Array.from(allDates).map(date => parseISO(date));
  }, [habits]);

  return (
    <div className="flex flex-col space-y-4">
      <div className="flex items-center justify-between">
        <Button variant="outline" size="icon" onClick={handlePrevDay}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="min-w-[200px]">
              <CalendarIcon className="mr-2 h-4 w-4" />
              {format(parsedDate, 'MMMM d, yyyy')}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="center">
            <Calendar
              mode="single"
              selected={parsedDate}
              onSelect={handleSelectDate}
              modifiers={{
                hasHabit: datesWithHabits,
              }}
              modifiersClassNames={{
                hasHabit: "bg-green-100 text-green-800 font-medium",
              }}
              className="rounded-md border"
            />
          </PopoverContent>
        </Popover>
        
        <Button variant="outline" size="icon" onClick={handleNextDay}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      
      <Button variant="secondary" onClick={handleToday}>
        Today
      </Button>
      
      <div className="flex justify-center">
        <div className="grid grid-cols-7 gap-1">
          {eachDayOfInterval({
            start: subDays(parsedDate, 3),
            end: addDays(parsedDate, 3),
          }).map((date) => {
            const isSelected = isSameDay(date, parsedDate);
            const hasCompletedHabits = datesWithHabits.some(d => isSameDay(d, date));
            
            return (
              <Button
                key={date.toISOString()}
                variant="ghost"
                className={cn(
                  "flex flex-col h-16 w-12 p-1 rounded-md",
                  isSelected && "bg-primary text-primary-foreground",
                  hasCompletedHabits && !isSelected && "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                )}
                onClick={() => handleSelectDate(date)}
              >
                <span className="text-xs">{format(date, 'EEE')}</span>
                <span className="text-lg font-bold">{format(date, 'd')}</span>
              </Button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default DateSelector;