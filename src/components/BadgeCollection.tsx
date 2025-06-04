import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge as BadgeComponent } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { format, parseISO } from 'date-fns';
import useHabitStore from '@/store/habitStore';
import { 
  Award, Flame, CheckCircle, Heart, Briefcase, 
  BookOpen, Smile, Dumbbell, Trophy, Star
} from 'lucide-react';
import { cn } from '@/lib/utils';

const iconMap: Record<string, React.ReactNode> = {
  Award: <Award className="h-6 w-6" />,
  Flame: <Flame className="h-6 w-6" />,
  CheckCircle: <CheckCircle className="h-6 w-6" />,
  Heart: <Heart className="h-6 w-6" />,
  Briefcase: <Briefcase className="h-6 w-6" />,
  BookOpen: <BookOpen className="h-6 w-6" />,
  Smile: <Smile className="h-6 w-6" />,
  Dumbbell: <Dumbbell className="h-6 w-6" />,
  Trophy: <Trophy className="h-6 w-6" />,
  Star: <Star className="h-6 w-6" />,
};

const BadgeCollection: React.FC = () => {
  const { badges } = useHabitStore();
  
  const earnedBadges = badges.filter(badge => badge.earned);
  const unearnedBadges = badges.filter(badge => !badge.earned);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          Achievement Badges
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {earnedBadges.length > 0 && (
            <div>
              <h3 className="text-sm font-medium mb-3">Earned Badges</h3>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
                <TooltipProvider>
                  {earnedBadges.map(badge => (
                    <Tooltip key={badge.id}>
                      <TooltipTrigger asChild>
                        <div className="flex flex-col items-center">
                          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-2">
                            {iconMap[badge.icon] || <Award className="h-6 w-6" />}
                          </div>
                          <span className="text-xs text-center font-medium">{badge.name}</span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <div className="space-y-1">
                          <p className="font-medium">{badge.name}</p>
                          <p className="text-xs">{badge.description}</p>
                          {badge.earnedAt && (
                            <p className="text-xs text-muted-foreground">
                              Earned on {format(parseISO(badge.earnedAt), 'MMM d, yyyy')}
                            </p>
                          )}
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  ))}
                </TooltipProvider>
              </div>
            </div>
          )}
          
          {unearnedBadges.length > 0 && (
            <div>
              <h3 className="text-sm font-medium mb-3">Badges to Earn</h3>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
                <TooltipProvider>
                  {unearnedBadges.map(badge => (
                    <Tooltip key={badge.id}>
                      <TooltipTrigger asChild>
                        <div className="flex flex-col items-center">
                          <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center text-muted-foreground mb-2 grayscale">
                            {iconMap[badge.icon] || <Award className="h-6 w-6" />}
                          </div>
                          <span className="text-xs text-center font-medium text-muted-foreground">{badge.name}</span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <div className="space-y-1">
                          <p className="font-medium">{badge.name}</p>
                          <p className="text-xs">{badge.description}</p>
                          <p className="text-xs text-muted-foreground">
                            {badge.criteria.type === 'streak' && `Maintain a ${badge.criteria.value} day streak`}
                            {badge.criteria.type === 'completion' && `Complete ${badge.criteria.value} habits`}
                            {badge.criteria.type === 'category' && `Complete ${badge.criteria.value} habits in a category`}
                          </p>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  ))}
                </TooltipProvider>
              </div>
            </div>
          )}
          
          {earnedBadges.length === 0 && unearnedBadges.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No badges available yet.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default BadgeCollection;