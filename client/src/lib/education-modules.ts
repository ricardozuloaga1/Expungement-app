// Legal education mini-modules and achievement system

export interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface Module {
  id: string;
  title: string;
  description: string;
  duration: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  topics: string[];
  content: {
    introduction: string;
    sections: {
      title: string;
      content: string;
      keyPoints: string[];
    }[];
    summary: string;
  };
  quiz: Question[];
  badge: {
    name: string;
    description: string;
    icon: string;
    color: string;
  };
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  criteria: {
    type: 'modules_completed' | 'quiz_score' | 'streak' | 'time_spent';
    target: number;
  };
  unlocked: boolean;
  dateEarned?: Date;
}

export const educationModules: Module[] = [
  {
    id: 'mrta-basics',
    title: 'MRTA 2021: Marijuana Expungement Basics',
    description: 'Learn about automatic marijuana record expungement under New York\'s Marihuana Regulation and Taxation Act',
    duration: '8 minutes',
    difficulty: 'beginner',
    topics: ['MRTA 2021', 'Automatic Expungement', 'CPL § 160.50'],
    content: {
      introduction: 'The Marihuana Regulation and Taxation Act (MRTA) of 2021 revolutionized marijuana law in New York State, including provisions for automatic expungement of certain marijuana-related convictions.',
      sections: [
        {
          title: 'What is MRTA?',
          content: 'The Marihuana Regulation and Taxation Act became effective March 31, 2021. Beyond legalizing adult-use marijuana, it included criminal justice reforms to address past convictions.',
          keyPoints: [
            'Legalized adult-use marijuana for those 21 and older',
            'Created automatic expungement for qualifying convictions',
            'No petition or court appearance required for eligible cases',
            'Applies to convictions that occurred before March 31, 2021'
          ]
        },
        {
          title: 'Automatic Expungement Under CPL § 160.50(3)(k)',
          content: 'Criminal Procedure Law § 160.50(3)(k) mandates automatic expungement of qualifying marijuana possession convictions without requiring individual petitions.',
          keyPoints: [
            'Covers Penal Law §§ 221.05, 221.10, 221.15, 221.35, and 221.40',
            'Only applies to possession offenses (not sale or distribution)',
            'Conviction must have occurred before March 31, 2021',
            'Records are sealed and treated as if arrest/conviction never occurred'
          ]
        },
        {
          title: 'Verification Process',
          content: 'While expungement is automatic, individuals should verify their records have been properly processed and obtain documentation.',
          keyPoints: [
            'Contact court clerk where convicted for Certificate of Disposition',
            'Request Form OCA-394 showing expungement status',
            'Obtain updated RAP sheet from DCJS to confirm removal',
            'Keep documentation for employment and housing purposes'
          ]
        }
      ],
      summary: 'MRTA 2021 provides automatic expungement for qualifying marijuana possession convictions from before March 31, 2021. No petition is required, but verification through court records is recommended.'
    },
    quiz: [
      {
        id: 'mrta-q1',
        question: 'Which section of Criminal Procedure Law provides for automatic marijuana expungement under MRTA?',
        options: ['CPL § 160.57', 'CPL § 160.50(3)(k)', 'CPL § 160.59', 'CPL § 221.05'],
        correctAnswer: 1,
        explanation: 'CPL § 160.50(3)(k) specifically mandates automatic expungement of qualifying marijuana convictions under MRTA 2021.'
      },
      {
        id: 'mrta-q2',
        question: 'MRTA automatic expungement applies to convictions that occurred:',
        options: ['After March 31, 2021', 'Before March 31, 2021', 'Any time since 2019', 'Only in 2020'],
        correctAnswer: 1,
        explanation: 'MRTA automatic expungement only applies to marijuana possession convictions that occurred before the law took effect on March 31, 2021.'
      },
      {
        id: 'mrta-q3',
        question: 'Which types of marijuana offenses qualify for MRTA automatic expungement?',
        options: ['All marijuana offenses', 'Only possession offenses', 'Only sale offenses', 'Only felony offenses'],
        correctAnswer: 1,
        explanation: 'MRTA automatic expungement is limited to possession offenses under specific Penal Law sections. Sale and distribution offenses do not qualify.'
      }
    ],
    badge: {
      name: 'MRTA Scholar',
      description: 'Mastered the basics of marijuana expungement under MRTA 2021',
      icon: '🌿',
      color: 'bg-green-500'
    }
  },
  {
    id: 'clean-slate-overview',
    title: 'Clean Slate Act: Automatic Record Sealing',
    description: 'Understand New York\'s Clean Slate Act and automatic sealing of criminal convictions',
    duration: '12 minutes',
    difficulty: 'intermediate',
    topics: ['Clean Slate Act', 'CPL § 160.57', 'Automatic Sealing', 'Waiting Periods'],
    content: {
      introduction: 'New York\'s Clean Slate Act, effective November 16, 2024, automatically seals certain criminal convictions after specified waiting periods, helping millions of New Yorkers access employment and housing opportunities.',
      sections: [
        {
          title: 'Clean Slate Act Overview',
          content: 'The Clean Slate Act represents the most significant criminal justice reform in New York history, automatically sealing eligible convictions without requiring petitions or legal assistance.',
          keyPoints: [
            'Effective November 16, 2024',
            'Automatic sealing - no petition required',
            'Covers both misdemeanors and felonies',
            'Excludes certain serious offenses and sex crimes'
          ]
        },
        {
          title: 'Eligibility Requirements Under CPL § 160.57',
          content: 'The Clean Slate Act has specific timing and conviction requirements that determine eligibility for automatic sealing.',
          keyPoints: [
            'Misdemeanors: 3 years from sentence completion',
            'Felonies: 8 years from sentence completion',
            'Must have completed all supervision (probation/parole)',
            'Cannot have pending criminal charges',
            'Limited to individuals with single eligible convictions'
          ]
        },
        {
          title: 'Excluded Offenses',
          content: 'Certain serious offenses are permanently excluded from Clean Slate automatic sealing and require alternative relief options.',
          keyPoints: [
            'Sex offenses under Article 130 of Penal Law',
            'Class A felonies (most serious felonies)',
            'Certain violent felony offenses',
            'Multiple convictions may disqualify automatic sealing'
          ]
        },
        {
          title: 'Impact and Benefits',
          content: 'Clean Slate sealing removes significant barriers to employment, housing, and other opportunities while maintaining public safety considerations.',
          keyPoints: [
            'Sealed records not visible to most employers',
            'Background checks will not show sealed convictions',
            'Law enforcement retains access for specific purposes',
            'Licensing agencies may have limited access exceptions'
          ]
        }
      ],
      summary: 'The Clean Slate Act automatically seals eligible convictions after 3 years (misdemeanors) or 8 years (felonies), dramatically expanding access to second chances in New York.'
    },
    quiz: [
      {
        id: 'clean-slate-q1',
        question: 'How long must pass before a felony conviction becomes eligible for Clean Slate automatic sealing?',
        options: ['3 years', '5 years', '8 years', '10 years'],
        correctAnswer: 2,
        explanation: 'Felony convictions require 8 years from sentence completion to become eligible for automatic sealing under the Clean Slate Act.'
      },
      {
        id: 'clean-slate-q2',
        question: 'When did the Clean Slate Act become effective in New York?',
        options: ['January 1, 2024', 'March 31, 2024', 'November 16, 2024', 'December 31, 2024'],
        correctAnswer: 2,
        explanation: 'The Clean Slate Act became effective November 16, 2024, beginning the automatic sealing process for eligible convictions.'
      },
      {
        id: 'clean-slate-q3',
        question: 'Which of the following is excluded from Clean Slate automatic sealing?',
        options: ['Drug possession misdemeanors', 'Class A felonies', 'Traffic violations', 'Theft convictions'],
        correctAnswer: 1,
        explanation: 'Class A felonies are among the most serious offenses and are permanently excluded from Clean Slate automatic sealing.'
      }
    ],
    badge: {
      name: 'Clean Slate Expert',
      description: 'Comprehensive understanding of automatic record sealing laws',
      icon: '🧹',
      color: 'bg-blue-500'
    }
  },
  {
    id: 'petition-sealing-guide',
    title: 'Petition-Based Sealing Under CPL § 160.59',
    description: 'Master the petition process for discretionary record sealing in New York courts',
    duration: '15 minutes',
    difficulty: 'advanced',
    topics: ['CPL § 160.59', 'Court Petitions', 'Discretionary Relief', 'Legal Procedures'],
    content: {
      introduction: 'Criminal Procedure Law § 160.59 allows individuals to petition courts for discretionary record sealing. Unlike automatic relief, this requires court approval and careful legal strategy.',
      sections: [
        {
          title: 'Understanding CPL § 160.59',
          content: 'Petition-based sealing under CPL § 160.59 provides discretionary relief for individuals who meet specific criteria but require court approval.',
          keyPoints: [
            'Discretionary relief - court has final decision',
            'Requires formal motion and court appearance',
            'More flexible than automatic programs',
            'Considers public safety and rehabilitation factors'
          ]
        },
        {
          title: 'Eligibility Criteria',
          content: 'CPL § 160.59 has specific requirements that must be met before filing a petition for record sealing.',
          keyPoints: [
            'Maximum 2 criminal convictions in New York',
            'No more than 1 felony conviction among the 2',
            '10 years must pass since conviction or release',
            'No pending criminal charges anywhere',
            'Sentence and supervision must be completed'
          ]
        },
        {
          title: 'The Petition Process',
          content: 'Filing a successful petition requires careful preparation, documentation, and legal strategy to demonstrate rehabilitation and public safety considerations.',
          keyPoints: [
            'File Form CR-155 (Motion for Sealing) with Supreme Court',
            'Include supporting affidavit and documentation',
            'Serve notice on District Attorney',
            'Gather evidence of rehabilitation and community ties',
            'Prepare for potential court hearing'
          ]
        },
        {
          title: 'Factors Courts Consider',
          content: 'Judges exercise discretion based on statutory factors that balance individual rehabilitation with public safety concerns.',
          keyPoints: [
            'Nature and circumstances of the offense',
            'Criminal history and pattern of behavior',
            'Time elapsed since conviction',
            'Evidence of rehabilitation and personal growth',
            'Impact on public safety and confidence',
            'Character references and community support'
          ]
        }
      ],
      summary: 'CPL § 160.59 petition-based sealing offers discretionary relief for qualified individuals willing to navigate the court process with proper legal preparation and evidence of rehabilitation.'
    },
    quiz: [
      {
        id: 'petition-q1',
        question: 'What is the maximum number of felony convictions allowed for CPL § 160.59 eligibility?',
        options: ['0', '1', '2', '3'],
        correctAnswer: 1,
        explanation: 'CPL § 160.59 allows no more than 1 felony conviction among a maximum of 2 total convictions for petition-based sealing eligibility.'
      },
      {
        id: 'petition-q2',
        question: 'How long must pass before becoming eligible to file a petition under CPL § 160.59?',
        options: ['5 years', '8 years', '10 years', '15 years'],
        correctAnswer: 2,
        explanation: '10 years must pass from conviction or release from incarceration (whichever is later) before eligibility for petition-based sealing.'
      },
      {
        id: 'petition-q3',
        question: 'Petition-based sealing under CPL § 160.59 is:',
        options: ['Automatic if criteria are met', 'Discretionary with court approval', 'Only available for misdemeanors', 'Guaranteed for first-time offenders'],
        correctAnswer: 1,
        explanation: 'CPL § 160.59 provides discretionary relief, meaning the court has final authority to grant or deny the petition based on various factors.'
      }
    ],
    badge: {
      name: 'Petition Master',
      description: 'Expert knowledge of discretionary record sealing procedures',
      icon: '⚖️',
      color: 'bg-purple-500'
    }
  }
];

export const achievements: Achievement[] = [
  {
    id: 'first-module',
    name: 'Legal Learner',
    description: 'Complete your first legal education module',
    icon: '📚',
    color: 'bg-blue-400',
    criteria: { type: 'modules_completed', target: 1 },
    unlocked: false
  },
  {
    id: 'quiz-master',
    name: 'Quiz Champion',
    description: 'Score 100% on any module quiz',
    icon: '🏆',
    color: 'bg-yellow-500',
    criteria: { type: 'quiz_score', target: 100 },
    unlocked: false
  },
  {
    id: 'knowledge-seeker',
    name: 'Knowledge Seeker',
    description: 'Complete 3 education modules',
    icon: '🎓',
    color: 'bg-green-500',
    criteria: { type: 'modules_completed', target: 3 },
    unlocked: false
  },
  {
    id: 'law-scholar',
    name: 'Law Scholar',
    description: 'Complete all available education modules',
    icon: '👨‍⚖️',
    color: 'bg-indigo-600',
    criteria: { type: 'modules_completed', target: educationModules.length },
    unlocked: false
  },
  {
    id: 'streak-warrior',
    name: 'Consistency Champion',
    description: 'Study for 7 consecutive days',
    icon: '🔥',
    color: 'bg-red-500',
    criteria: { type: 'streak', target: 7 },
    unlocked: false
  },
  {
    id: 'time-scholar',
    name: 'Dedicated Student',
    description: 'Spend 60 minutes total in education modules',
    icon: '⏰',
    color: 'bg-orange-500',
    criteria: { type: 'time_spent', target: 60 },
    unlocked: false
  }
];

export interface UserProgress {
  userId: string;
  completedModules: string[];
  moduleScores: Record<string, number>;
  achievements: string[];
  totalTimeSpent: number;
  lastStudyDate: Date | null;
  currentStreak: number;
  createdAt: Date;
  updatedAt: Date;
}

export function calculateModuleScore(answers: Record<string, number>, module: Module): number {
  const totalQuestions = module.quiz.length;
  let correctAnswers = 0;
  
  module.quiz.forEach(question => {
    if (answers[question.id] === question.correctAnswer) {
      correctAnswers++;
    }
  });
  
  return Math.round((correctAnswers / totalQuestions) * 100);
}

export function checkAchievements(userProgress: UserProgress): string[] {
  const newAchievements: string[] = [];
  
  achievements.forEach(achievement => {
    if (userProgress.achievements.includes(achievement.id)) return;
    
    let isEarned = false;
    
    switch (achievement.criteria.type) {
      case 'modules_completed':
        isEarned = userProgress.completedModules.length >= achievement.criteria.target;
        break;
      case 'quiz_score':
        isEarned = Object.values(userProgress.moduleScores).some(score => score >= achievement.criteria.target);
        break;
      case 'streak':
        isEarned = userProgress.currentStreak >= achievement.criteria.target;
        break;
      case 'time_spent':
        isEarned = userProgress.totalTimeSpent >= achievement.criteria.target;
        break;
    }
    
    if (isEarned) {
      newAchievements.push(achievement.id);
    }
  });
  
  return newAchievements;
}