import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { format, parseISO, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, subDays, differenceInDays } from 'date-fns';
import useHabitStore from '@/store/habitStore';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Flame, Award, TrendingUp, Calendar } from 'lucide-react';

const ProgressInsights: React.FC = () => {
  const { habits, categories } = useHabitStore();
  const [period, setPeriod] = React.useState<'week' | 'month'>('week');
  
  // Calculate completion rate for the current week
  const today = new Date();
  const startOfCurrentWeek = startOfWeek(today, { weekStartsOn: 1 });
  const endOfCurrentWeek = endOfWeek(today, { weekStartsOn: 1 });
  
  const daysInWeek = eachDayOfInterval({
    start: startOfCurrentWeek,
    end: endOfCurrentWeek,
  });
  
  const weeklyData = daysInWeek.map(day => {
    const dateStr = format(day, 'yyyy-MM-dd');
    const totalHabits = habits.length;
    const completedHabits = habits.filter(habit => 
      habit.completedDates.some(d => isSameDay(parseISO(d), day))
    ).length;
    
    return {
      date: format(day, 'EEE'),
      completed: completedHabits,
      total: totalHabits,
      percentage: totalHabits > 0 ? Math.round((completedHabits / totalHabits) * 100) : 0,
    };
  });
  
  // Calculate monthly data (last 30 days)
  const monthlyData = Array.from({ length: 30 }, (_, i) => {
    const day = subDays(today, 29 - i);
    const dateStr = format(day, 'yyyy-MM-dd');
    const totalHabits = habits.filter(h => {
      const createdAt = parseISO(h.createdAt);
      return differenceInDays(day, createdAt) >= 0;
    }).length;
    
    const completedHabits = habits.filter(habit => 
      habit.completedDates.some(d => isSameDay(parseISO(d), day))
    ).length;
    
    return {
      date: format(day, 'MMM d'),
      completed: completedHabits,
      total: totalHabits,
      percentage: totalHabits > 0 ? Math.round((completedHabits / totalHabits) * 100) : 0,
    };
  });
  
  // Calculate overall stats
  const totalCompletions = habits.reduce((sum, habit) => sum + habit.completedDates.length, 0);
  const longestStreak = habits.reduce((max, habit) => Math.max(max, habit.longestStreak), 0);
  const currentStreaks = habits.reduce((sum, habit) => sum + (habit.streak > 0 ? 1 : 0), 0);
  const completionRate = habits.length > 0 
    ? Math.round((habits.filter(h => h.completedDates.some(d => isSameDay(parseISO(d), today))).length / habits.length) * 100)
    : 0;
  
  // Category breakdown
  const categoryData = categories.map(category => {
    const categoryHabits = habits.filter(h => h.categoryId === category.id);
    const completions = categoryHabits.reduce((sum, habit) => sum + habit.completedDates.length, 0);
    
    return {
      name: category.name,
      value: completions,
      color: category.color,
    };
  }).filter(cat => cat.value > 0);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4 text-blue-500" />
              Today's Completion
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completionRate}%</div>
            <Progress value={completionRate} className="h-2 mt-2" />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Flame className="h-4 w-4 text-orange-500" />
              Longest Streak
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{longestStreak} days</div>
            <p className="text-xs text-muted-foreground mt-1">
              {currentStreaks} habits with active streaks
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Award className="h-4 w-4 text-purple-500" />
              Total Completions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCompletions}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Across {habits.length} habits
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-500" />
              Top Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {categoryData.length > 0 
                ? categoryData.sort((a, b) => b.value - a.value)[0].name
                : "None"}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {categoryData.length > 0 
                ? `${categoryData.sort((a, b) => b.value - a.value)[0].value} completions`
                : "No data yet"}
            </p>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Completion Trends</CardTitle>
            <Tabs 
              value={period} 
              onValueChange={(v) => setPeriod(v as 'week' | 'month')}
              className="w-[180px]"
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="week">Week</TabsTrigger>
                <TabsTrigger value="month">Month</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={period === 'week' ? weeklyData : monthlyData}
                margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }}
                  interval={period === 'week' ? 0 : 'preserveStartEnd'}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  domain={[0, 100]}
                  tickFormatter={(value) => `${value}%`}
                />
                <Tooltip 
                  formatter={(value) => [`${value}%`, 'Completion Rate']}
                  labelFormatter={(label) => `Date: ${label}`}
                />
                <Bar 
                  dataKey="percentage" 
                  fill="#4f46e5" 
                  radius={[4, 4, 0, 0]}
                  name="Completion Rate"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProgressInsights;