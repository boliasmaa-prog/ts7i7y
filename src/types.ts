export interface QuestionGrade {
  question_number: number;
  title: string;
  correct_answer: string;
  student_answer: string;
  points_earned: number;
  points_possible: number;
  reasoning: string;
  error_type?: "none" | "simple" | "fractional" | "major" | "empty" | string;
}

export interface GradingResult {
  score: number;
  total: number;
  questions: QuestionGrade[];
  feedback?: string;
  detected_student_name?: string;
  graded_at: string;
}

export interface Student {
  id: string;
  name: string;
  result?: GradingResult;
  updated_at?: string;
}

export interface ClassRoom {
  id: string;
  name: string;
  subject?: string;
  academic_year?: string;
  students: Student[];
  created_at: string;
}

export interface RubricTemplate {
  id: string;
  title: string;
  subject?: string;
  images: string[]; // Base64 data URLs stored safely in IndexedDB
  created_at: string;
}

export type AppLanguage = "ar" | "fr" | "en";

export interface UserProfile {
  name: string;
  email?: string;
  password?: string;
  title: "أستاذ" | "أستاذة";
  gender: "male" | "female";
  schoolName?: string;
  subject?: string;
  avatar?: string;
  language?: AppLanguage;
  isRegistered?: boolean;
  createdAt?: string;
}

export interface TeacherDoc {
  id: string;
  title: string;
  type: "pdf" | "image";
  subject?: string;
  className?: string;
  term?: string;
  fileName?: string;
  fileSize?: string;
  dataUrl: string;
  created_at: string;
}

export interface TeacherNote {
  id: string;
  classId?: string;
  title: string;
  content: string;
  updated_at: string;
}

export type ActiveTab = "grading" | "classes" | "reports" | "rubrics" | "settings";

