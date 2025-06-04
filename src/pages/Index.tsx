import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  LayoutDashboard, 
  Calendar, 
  BarChart, 
  Trophy,
  Menu
} from 'lucide-react';
import HabitList from '@/components/HabitList';
import AddHabitDialog from '@/components/AddHabitDialog';
import DateSelector from '@/components/DateSelector';
import CategoryFilter from '@/components/CategoryFilter';
import ProgressInsights from '@/components/ProgressInsights';
import BadgeCollection from '@/components/BadgeCollection';
import MonthlyView from '@/components/MonthlyView';
import useHabitStore from '@/store/habitStore';

const Index = () => {
  const [activeTab, setActiveTab] = React.useState('dashboard');
  const [selectedCategory, setSelectedCategory] = React.useState<string | null>(null);
  const { checkBadges } = useHabitStore();
  
  // Check for badges when the app loads
  React.useEffect(() => {
    checkBadges();
  }, [checkBadges]);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b sticky top-0 bg-background z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold">Habit Tracker</h1>
          </div>
          <AddHabitDialog />
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <div className="flex justify-between items-center">
            <TabsList>
              <TabsTrigger value="dashboard" className="flex items-center gap-2">
                <LayoutDashboard className="h-4 w-4" />
                <span className="hidden sm:inline">Dashboard</span>
              </TabsTrigger>
              <TabsTrigger value="monthly" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span className="hidden sm:inline">Monthly</span>
              </TabsTrigger>
              <TabsTrigger value="insights" className="flex items-center gap-2">
                <BarChart className="h-4 w-4" />
                <span className="hidden sm:inline">Insights</span>
              </TabsTrigger>
              <TabsTrigger value="badges" className="flex items-center gap-2">
                <Trophy className="h-4 w-4" />
                <span className="hidden sm:inline">Badges</span>
              </TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="dashboard" className="space-y-4">
            <DateSelector />
            <Separator />
            <CategoryFilter 
              selectedCategory={selectedCategory} 
              onSelectCategory={setSelectedCategory} 
            />
            <HabitList filter={selectedCategory || undefined} />
          </TabsContent>
          
          <TabsContent value="monthly">
            <div className="space-y-4">
              <MonthlyView />
              <Separator />
              <HabitList />
            </div>
          </TabsContent>
          
          <TabsContent value="insights">
            <ProgressInsights />
          </TabsContent>
          
          <TabsContent value="badges">
            <BadgeCollection />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Index;