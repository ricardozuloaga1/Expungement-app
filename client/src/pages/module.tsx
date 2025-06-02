import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useRoute } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { ArrowLeft, ArrowRight, BookOpen, Trophy, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { Link } from "wouter";
import { educationModules, calculateModuleScore, checkAchievements, type Module, type UserProgress } from "@/lib/education-modules";

export default function ModulePage() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [, params] = useRoute("/education/module/:id");
  const moduleId = params?.id;

  const [module, setModule] = useState<Module | null>(null);
  const [currentSection, setCurrentSection] = useState(0);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [quizScore, setQuizScore] = useState<number | null>(null);
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);
  const [timeSpent, setTimeSpent] = useState(0);
  const [startTime] = useState(Date.now());

  useEffect(() => {
    if (moduleId) {
      const foundModule = educationModules.find(m => m.id === moduleId);
      setModule(foundModule || null);
    }
  }, [moduleId]);

  useEffect(() => {
    if (isAuthenticated) {
      loadUserProgress();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeSpent(Math.floor((Date.now() - startTime) / 1000 / 60));
    }, 60000);

    return () => clearInterval(interval);
  }, [startTime]);

  const loadUserProgress = async () => {
    try {
      const response = await fetch('/api/education/progress');
      if (response.ok) {
        const progress = await response.json();
        setUserProgress(progress);
      }
    } catch (error) {
      console.error('Failed to load progress:', error);
    }
  };

  const saveProgress = async (moduleCompleted: boolean, score?: number) => {
    if (!module || !user) return;

    try {
      const response = await fetch('/api/education/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          moduleId: module.id,
          completed: moduleCompleted,
          score: score,
          timeSpent: timeSpent
        })
      });

      if (response.ok) {
        const updatedProgress = await response.json();
        setUserProgress(updatedProgress);
        
        // Check for new achievements
        const newAchievements = checkAchievements(updatedProgress);
        if (newAchievements.length > 0) {
          newAchievements.forEach(achievementId => {
            const achievement = require('@/lib/education-modules').achievements.find((a: any) => a.id === achievementId);
            if (achievement) {
              toast({
                title: "Achievement Unlocked!",
                description: `🏆 ${achievement.name}: ${achievement.description}`,
              });
            }
          });
        }
      }
    } catch (error) {
      console.error('Failed to save progress:', error);
    }
  };

  const handleQuizSubmit = () => {
    if (!module) return;

    const score = calculateModuleScore(quizAnswers, module);
    setQuizScore(score);
    setQuizCompleted(true);
    
    // Save progress
    saveProgress(true, score);

    if (score === 100) {
      toast({
        title: "Perfect Score!",
        description: "Congratulations! You've mastered this module.",
      });
    } else if (score >= 80) {
      toast({
        title: "Well Done!",
        description: `You scored ${score}%. Great understanding of the material.`,
      });
    } else {
      toast({
        title: "Keep Learning",
        description: `You scored ${score}%. Review the material and try again to improve your understanding.`,
        variant: "destructive",
      });
    }
  };

  const getTotalSections = () => {
    if (!module) return 0;
    return module.content.sections.length + 1; // +1 for introduction
  };

  const getProgressPercentage = () => {
    const total = getTotalSections() + (showQuiz ? 1 : 0);
    const current = showQuiz ? getTotalSections() : currentSection + 1;
    return Math.round((current / total) * 100);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background-light flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardHeader className="text-center">
            <BookOpen className="w-12 h-12 mx-auto mb-4 text-primary" />
            <CardTitle>Access Required</CardTitle>
            <CardDescription>Sign in to access this learning module</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button asChild className="w-full">
              <Link href="/api/login">Sign In</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!module) {
    return (
      <div className="min-h-screen bg-background-light flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="text-center py-8">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
            <h2 className="text-xl font-bold mb-2">Module Not Found</h2>
            <p className="text-neutral-medium mb-4">The requested learning module could not be found.</p>
            <Button asChild>
              <Link href="/education">Back to Education</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isCompleted = userProgress?.completedModules.includes(module.id);

  return (
    <div className="min-h-screen bg-background-light">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" asChild>
              <Link href="/education">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Education
              </Link>
            </Button>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-neutral-medium">
                <Clock className="w-4 h-4" />
                {timeSpent}m studying
              </div>
              {isCompleted && (
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Completed
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Module Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">{module.badge.icon}</span>
            <Badge className={`${module.difficulty === 'beginner' ? 'bg-green-100 text-green-800' : 
              module.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-800' : 
              'bg-red-100 text-red-800'}`}>
              {module.difficulty}
            </Badge>
            <span className="text-sm text-neutral-medium">{module.duration}</span>
          </div>
          <h1 className="text-3xl font-bold text-neutral-dark mb-2">{module.title}</h1>
          <p className="text-lg text-neutral-medium">{module.description}</p>
          
          {/* Progress Bar */}
          <div className="mt-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Progress</span>
              <span className="text-sm text-neutral-medium">{getProgressPercentage()}%</span>
            </div>
            <Progress value={getProgressPercentage()} className="h-2" />
          </div>
        </div>

        {/* Content */}
        <Card className="mb-6">
          <CardContent className="p-8">
            {!showQuiz ? (
              // Learning Content
              <div>
                {currentSection === 0 ? (
                  // Introduction
                  <div>
                    <h2 className="text-2xl font-bold mb-4">Introduction</h2>
                    <div className="prose max-w-none">
                      <p className="text-lg leading-relaxed">{module.content.introduction}</p>
                    </div>
                  </div>
                ) : (
                  // Section Content
                  <div>
                    <h2 className="text-2xl font-bold mb-4">
                      {module.content.sections[currentSection - 1].title}
                    </h2>
                    <div className="prose max-w-none mb-6">
                      <p className="text-lg leading-relaxed mb-6">
                        {module.content.sections[currentSection - 1].content}
                      </p>
                      
                      <h3 className="text-lg font-semibold mb-3">Key Points:</h3>
                      <ul className="space-y-2">
                        {module.content.sections[currentSection - 1].keyPoints.map((point, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                            <span>{point}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              // Quiz
              <div>
                <h2 className="text-2xl font-bold mb-4">Knowledge Check</h2>
                {!quizCompleted ? (
                  <div className="space-y-6">
                    <p className="text-neutral-medium">
                      Test your understanding of this module. You need to answer all questions to complete the quiz.
                    </p>
                    
                    {module.quiz.map((question, qIndex) => (
                      <Card key={question.id} className="p-4">
                        <h3 className="font-semibold mb-4">
                          {qIndex + 1}. {question.question}
                        </h3>
                        <RadioGroup
                          value={quizAnswers[question.id]?.toString()}
                          onValueChange={(value) => setQuizAnswers(prev => ({
                            ...prev,
                            [question.id]: parseInt(value)
                          }))}
                        >
                          {question.options.map((option, oIndex) => (
                            <div key={oIndex} className="flex items-center space-x-2">
                              <RadioGroupItem value={oIndex.toString()} id={`${question.id}-${oIndex}`} />
                              <Label htmlFor={`${question.id}-${oIndex}`} className="flex-1 cursor-pointer">
                                {option}
                              </Label>
                            </div>
                          ))}
                        </RadioGroup>
                      </Card>
                    ))}
                  </div>
                ) : (
                  // Quiz Results
                  <div className="text-center">
                    <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
                      quizScore === 100 ? 'bg-green-100' : quizScore! >= 80 ? 'bg-blue-100' : 'bg-orange-100'
                    }`}>
                      <Trophy className={`w-8 h-8 ${
                        quizScore === 100 ? 'text-green-600' : quizScore! >= 80 ? 'text-blue-600' : 'text-orange-600'
                      }`} />
                    </div>
                    <h3 className="text-2xl font-bold mb-2">Quiz Complete!</h3>
                    <p className="text-lg mb-4">Your Score: {quizScore}%</p>
                    <p className="text-neutral-medium mb-6">
                      {quizScore === 100 ? "Perfect! You've mastered this material." :
                       quizScore! >= 80 ? "Excellent understanding!" :
                       "Good effort! Consider reviewing the material to strengthen your knowledge."}
                    </p>
                    
                    {/* Show correct answers for review */}
                    <div className="text-left space-y-4 mt-8">
                      <h4 className="font-semibold">Review:</h4>
                      {module.quiz.map((question, index) => {
                        const userAnswer = quizAnswers[question.id];
                        const isCorrect = userAnswer === question.correctAnswer;
                        
                        return (
                          <Card key={question.id} className={`p-4 ${isCorrect ? 'bg-green-50' : 'bg-red-50'}`}>
                            <div className="flex items-start gap-2 mb-2">
                              {isCorrect ? 
                                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" /> :
                                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                              }
                              <div className="flex-1">
                                <p className="font-medium">{index + 1}. {question.question}</p>
                                <p className="text-sm text-neutral-medium mt-1">
                                  <span className="font-medium">Correct answer:</span> {question.options[question.correctAnswer]}
                                </p>
                                <p className="text-sm mt-2">{question.explanation}</p>
                              </div>
                            </div>
                          </Card>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <Button
            variant="outline"
            onClick={() => {
              if (showQuiz) {
                setShowQuiz(false);
                setCurrentSection(getTotalSections() - 1);
              } else if (currentSection > 0) {
                setCurrentSection(currentSection - 1);
              }
            }}
            disabled={currentSection === 0 && !showQuiz}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>

          <div className="text-sm text-neutral-medium">
            {showQuiz ? 'Quiz' : `Section ${currentSection + 1} of ${getTotalSections()}`}
          </div>

          {!showQuiz ? (
            <Button
              onClick={() => {
                if (currentSection < getTotalSections() - 1) {
                  setCurrentSection(currentSection + 1);
                } else {
                  setShowQuiz(true);
                }
              }}
            >
              {currentSection < getTotalSections() - 1 ? 'Next' : 'Take Quiz'}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : !quizCompleted ? (
            <Button
              onClick={handleQuizSubmit}
              disabled={Object.keys(quizAnswers).length < module.quiz.length}
            >
              Submit Quiz
              <Trophy className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button asChild>
              <Link href="/education">
                Complete Module
                <CheckCircle className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}