
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface ResumeData {
  name: string;
  email: string;
  phone: string;
  location: string;
  skills: string[];
  experience: {
    title: string;
    company: string;
    duration: string;
    description: string;
  }[];
  education: {
    degree: string;
    institution: string;
    year: string;
  }[];
}

export interface ATSAnalysis {
  score: number;
  formattingScore: number;
  strengths: string[];
  improvements: string[];
  keywordGaps: string[];
  overallFeedback: string;
  ats_score?: number;
  missing_keywords?: string[];
  skill_gap_analysis?: string;
  section_improvements?: { section: string; suggestion: string }[];
  better_wording?: { original: string; improved: string }[];
  action_verbs?: string[];
  projects_to_add?: string[];
  job_opportunities_query?: string;
  improvedRaw?: string;
}

export interface CareerMatch {
  score: number;
  strengths: string[];
  gaps: string[];
  recommendations: string[];
}

export interface LearningPlan {
  title: string;
  weeks: {
    week: number;
    topic: string;
    tasks: string[];
    resources: {
      title: string;
      url: string;
      platform: string;
    }[];
  }[];
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface ProjectAnalysis {
  projectName: string;
  technicalComplexity: number;
  qualityScore: number;
  detectedSkills: string[];
  architecturalCritique: string;
  suggestions: string[];
}

export interface PersonalityAnalysis {
  summary: string[];
  strengths: string[];
  development: string[];
  careers: string[];
  steps: string[];
  confidence: number;
}

export interface ScrapedJob {
  title: string;
  company: string;
  location: string;
  salary: string;
  description: string;
  applyUrl: string;
}

export interface MarketTrend {
  title: string;
  summary: string;
  impact: 'positive' | 'neutral' | 'negative';
  category: string;
}

export interface MarketAnalysis {
  overallSentiment: string;
  sentimentScore: number;
  trends: MarketTrend[];
  sources: { title: string; url: string }[];
}
