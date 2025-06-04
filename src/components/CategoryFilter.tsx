import React from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
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

interface CategoryFilterProps {
  selectedCategory: string | null;
  onSelectCategory: (categoryId: string | null) => void;
}

const CategoryFilter: React.FC<CategoryFilterProps> = ({ 
  selectedCategory, 
  onSelectCategory 
}) => {
  const { categories } = useHabitStore();

  return (
    <Tabs 
      defaultValue={selectedCategory || 'all'} 
      className="w-full"
      onValueChange={(value) => onSelectCategory(value === 'all' ? null : value)}
    >
      <TabsList className="w-full flex overflow-x-auto">
        <TabsTrigger value="all" className="flex-1">
          All
        </TabsTrigger>
        {categories.map(category => (
          <TabsTrigger 
            key={category.id} 
            value={category.id}
            className="flex-1 flex items-center gap-1"
            style={{ color: selectedCategory === category.id ? category.color : undefined }}
          >
            {iconMap[category.icon]}
            {category.name}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
};

export default CategoryFilter;