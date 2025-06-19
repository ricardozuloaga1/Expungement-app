import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BookOpen, Clock, Trophy, Star, CheckCircle, Lock } from "lucide-react";
import { Link } from "wouter";
import { educationModules, achievements, type UserProgress } from "@/lib/education-modules";
import type { User } from "@shared/schema";

export default function Education() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated) {
      loadUserProgress();
    }
  }, [isAuthenticated]);

  const loadUserProgress = async () => {
    try {
      const response = await fetch('/api/education/progress');
      if (response.ok) {
        const progress = await response.json();
        setUserProgress(progress);
      } else {
        // Initialize new user progress
        setUserProgress({
          userId: (user as User)?.id || '',
          completedModules: [],
          moduleScores: {},
          achievements: [],
          totalTimeSpent: 0,
          lastStudyDate: null,
          currentStreak: 0,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }
    } catch (error) {
      console.error('Failed to load progress:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCompletionPercentage = () => {
    if (!userProgress) return 0;
    return Math.round((userProgress.completedModules.length / educationModules.length) * 100);
  };

  const getUnlockedAchievements = () => {
    if (!userProgress) return [];
    return achievements.filter(achievement => 
      userProgress.achievements.includes(achievement.id)
    );
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background-light flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardHeader className="text-center">
            <BookOpen className="w-12 h-12 mx-auto mb-4 text-primary" />
            <CardTitle>Legal Education Center</CardTitle>
            <CardDescription>
              Sign in to access interactive legal education modules and earn achievement badges
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button asChild className="w-full">
              <Link href="/api/login">Sign In to Continue</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background-light flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-neutral-medium">Loading your progress...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-light">
      {/* Header */}
      <div className="bg-primary text-white py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <BookOpen className="w-16 h-16 mx-auto mb-4" />
            <h1 className="text-4xl font-bold mb-4">Legal Education Center</h1>
            <p className="text-xl text-primary-light">
              Master New York record relief laws through interactive modules
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Progress Overview */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Modules Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {userProgress?.completedModules.length || 0}/{educationModules.length}
              </div>
              <Progress value={getCompletionPercentage()} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Achievements Earned</CardTitle>
              <Trophy className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {userProgress?.achievements.length || 0}/{achievements.length}
              </div>
              <div className="flex gap-1 mt-2">
                {getUnlockedAchievements().slice(0, 4).map(achievement => (
                  <span key={achievement.id} className="text-lg" title={achievement.name}>
                    {achievement.icon}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Study Streak</CardTitle>
              <Star className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userProgress?.currentStreak || 0} days</div>
              <p className="text-xs text-neutral-medium mt-2">
                Total time: {Math.round((userProgress?.totalTimeSpent || 0) / 60)}h {(userProgress?.totalTimeSpent || 0) % 60}m
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Education Modules */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-neutral-dark mb-6">Learning Modules</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {educationModules.map((module, index) => {
              const isCompleted = userProgress?.completedModules.includes(module.id);
              const score = userProgress?.moduleScores[module.id];
              const isLocked = index > 0 && !userProgress?.completedModules.includes(educationModules[index - 1].id);

              return (
                <Card key={module.id} className={`hover:shadow-lg transition-shadow ${isLocked ? 'opacity-60' : ''}`}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg mb-2">{module.title}</CardTitle>
                        <CardDescription className="text-sm">{module.description}</CardDescription>
                      </div>
                      {isCompleted && <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 ml-2" />}
                      {isLocked && <Lock className="h-5 w-5 text-gray-400 flex-shrink-0 ml-2" />}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm text-neutral-medium">
                        <Clock className="h-4 w-4" />
                        {module.duration}
                      </div>
                      
                      <Badge className={getDifficultyColor(module.difficulty)} variant="secondary">
                        {module.difficulty}
                      </Badge>

                      {isCompleted && score !== undefined && (
                        <div className="text-sm">
                          <span className="font-medium">Score: {score}%</span>
                          {score === 100 && <span className="ml-2">🏆</span>}
                        </div>
                      )}

                      <div className="flex flex-wrap gap-1">
                        {module.topics.slice(0, 3).map(topic => (
                          <Badge key={topic} variant="outline" className="text-xs">
                            {topic}
                          </Badge>
                        ))}
                      </div>

                      <Button 
                        asChild 
                        className="w-full" 
                        disabled={isLocked}
                        variant={isCompleted ? "outline" : "default"}
                      >
                        <Link href={`/education/module/${module.id}`}>
                          {isCompleted ? 'Review Module' : 'Start Learning'}
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Achievements */}
        <div>
          <h2 className="text-2xl font-bold text-neutral-dark mb-6">Achievements</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {achievements.map(achievement => {
              const isUnlocked = userProgress?.achievements.includes(achievement.id);
              
              return (
                <Card key={achievement.id} className={`${isUnlocked ? achievement.color : 'bg-gray-100'} ${isUnlocked ? 'text-white' : 'text-gray-500'}`}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{achievement.icon}</div>
                      <div className="flex-1">
                        <h3 className="font-semibold">{achievement.name}</h3>
                        <p className="text-sm opacity-90">{achievement.description}</p>
                      </div>
                      {isUnlocked && <CheckCircle className="h-5 w-5" />}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}