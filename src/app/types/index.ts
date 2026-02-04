// Core Type Definitions for XCyber Insurance Platform

export type Role = 'admin' | 'agent' | 'user';

export type QuestionType = 
  | 'text' 
  | 'textarea' 
  | 'number' 
  | 'date' 
  | 'email' 
  | 'phone' 
  | 'mcq' 
  | 'checkbox' 
  | 'dropdown';

export interface InsuranceProvider {
  id: string;
  name: string;
  logoUrl: string;
  createdAt: string;
}

export interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  phone: string;
  role: Role;
  insuranceProviderId?: string; // Only for agents
  createdAt: string;
}

export interface Section {
  id: string;
  insuranceProviderId: string;
  title: string;
  order: number;
  createdAt: string;
}

export interface Question {
  id: string;
  sectionId: string;
  questionText: string;
  questionType: QuestionType;
  options?: string[]; // For MCQ, Checkbox, Dropdown
  required: boolean;
  order: number;
  createdAt: string;
}

export interface Response {
  id: string;
  userId: string;
  insuranceProviderId: string;
  sectionId: string;
  questionId: string;
  answer: string | string[]; // Array for checkbox
  isSubmitted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, name: string, phone: string, role: Role, insuranceProviderId?: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

export interface QuestionWithSection extends Question {
  section: Section;
}

export interface ResponseWithDetails extends Response {
  question: Question;
  user: User;
}

export interface ProviderStats {
  providerId: string;
  providerName: string;
  totalUsers: number;
  draftCount: number;
  submittedCount: number;
  completionPercentage: number;
}
