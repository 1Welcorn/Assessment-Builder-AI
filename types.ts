
export enum QuestionType {
  MultipleChoice = 'Multiple Choice',
  TrueFalse = 'True/False',
  ShortAnswer = 'Short Answer',
}

export interface Alternative {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface Question {
  id: string;
  text: string;
  type: QuestionType;
  alternatives: Alternative[];
  imageUrl?: string;
  subject: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  bncc: string[];
  descritores: string[];
}

export interface Assessment {
  id: string;
  title: string;
  createdAt: string;
  lastModified: string;
  status: 'Draft' | 'Published' | 'Archived';
  questionIds: string[];
  subject: string;
}

export interface AnswerTemplate {
  id: string;
  name: string;
  questionType: QuestionType;
  description: string;
  createdAt: string;
}

export interface BNCC {
    id: string;
    code: string;
    description: string;
    level: 'General' | 'Specific' | 'Objective';
    parentId?: string;
}

export interface Descritor {
    id: string;
    code: string;
    description: string;
    bnccId: string;
}
