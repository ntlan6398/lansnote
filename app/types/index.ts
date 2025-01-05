// User & Auth Types
export interface User {
  id: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

// Core Data Models
export interface Subject {
  id: number;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface List {
  id: number;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Term {
  id: string;
  term: string;
  type: string;
  definition: string;
  example: string;
  phonetic: string | null;
  audio: string | null;
  createdAt: string;
  lastReview: string;
  nextReview: string;
  interval: number;
  repetition: number;
  accountId: string;
  efactor: number;
  listId: number;
}
export interface Lesson {
  id: string;
  title: string;
  startDate: Date;
  reviewDate: Date;
  onTrack: number;
  subjectId: number;
  comments: string;
  content: string;
}

// Component Props Types
export interface LessonCardProps {
  title: string;
  count: number;
  lessons: {
    id: string;
    title: string;
    subject: string;
    reviewDate: string;
    onTrack: boolean;
  }[];
}

export interface LessonData {
  id: string;
  title: string;
  subject: string;
  reviewDate: string;
  onTrack: number;
}

export interface ClassifiedLessons {
  lastThirtyDays: LessonData[];
  yesterday: LessonData[];
  today: LessonData[];
  tomorrow: LessonData[];
  nextThirtyDays: LessonData[];
}
