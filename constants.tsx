
import React from 'react';
import { Question, QuestionType, Assessment, AnswerTemplate, BNCC, Descritor } from './types';

export const MOCK_QUESTIONS: Question[] = [
  {
    id: 'q1',
    text: 'What is the capital of France?',
    type: QuestionType.MultipleChoice,
    alternatives: [
      { id: 'a1', text: 'Berlin', isCorrect: false },
      { id: 'a2', text: 'Madrid', isCorrect: false },
      { id: 'a3', text: 'Paris', isCorrect: true },
      { id: 'a4', text: 'Rome', isCorrect: false },
    ],
    subject: 'Geography',
    difficulty: 'Easy',
    bncc: ['EF06GE01'],
    descritores: ['D01'],
    imageUrl: 'https://picsum.photos/400/200'
  },
  {
    id: 'q2',
    text: 'The chemical symbol for water is H2O.',
    type: QuestionType.TrueFalse,
    alternatives: [
      { id: 'b1', text: 'True', isCorrect: true },
      { id: 'b2', text: 'False', isCorrect: false },
    ],
    subject: 'Chemistry',
    difficulty: 'Easy',
    bncc: ['EF09CI01'],
    descritores: ['D05'],
  },
  {
    id: 'q3',
    text: 'Who wrote "To Kill a Mockingbird"?',
    type: QuestionType.ShortAnswer,
    alternatives: [{ id: 'c1', text: 'Harper Lee', isCorrect: true }],
    subject: 'Literature',
    difficulty: 'Medium',
    bncc: ['EM13LGG101'],
    descritores: ['D12'],
  },
];

export const MOCK_ASSESSMENTS: Assessment[] = [
    { id: 'as1', title: 'Midterm Geography Exam', createdAt: '2023-10-15', lastModified: '2023-10-20', status: 'Published', questionIds: ['q1'], subject: 'Geography' },
    { id: 'as2', title: 'Basic Chemistry Quiz', createdAt: '2023-11-01', lastModified: '2023-11-02', status: 'Draft', questionIds: ['q2'], subject: 'Chemistry' },
    { id: 'as3', title: 'American Literature Pop Quiz', createdAt: '2023-09-25', lastModified: '2023-09-25', status: 'Archived', questionIds: ['q3'], subject: 'Literature' },
];

export const MOCK_TEMPLATES: AnswerTemplate[] = [
    { id: 't1', name: 'Standard MC with 4 Options', questionType: QuestionType.MultipleChoice, description: 'A standard multiple choice template with 1 correct and 3 incorrect answers.', createdAt: '2023-08-01' },
    { id: 't2', name: 'Simple True/False', questionType: QuestionType.TrueFalse, description: 'A basic True/False answer structure.', createdAt: '2023-08-02' },
];

export const MOCK_BNCC: BNCC[] = [
    {id: 'bncc1', code: 'EF06GE01', description: 'Descrever elementos e processos da paisagem natural e antrópica.', level: 'Objective'},
    {id: 'bncc2', code: 'EF09CI01', description: 'Investigar a composição da matéria e as transformações químicas.', level: 'Objective'},
    {id: 'bncc3', code: 'EM13LGG101', description: 'Compreender e analisar processos de produção e circulação de discursos.', level: 'Objective'},
];

export const MOCK_DESCRITORES: Descritor[] = [
    {id: 'd1', code: 'D01', description: 'Localizar informações explícitas em um texto.', bnccId: 'bncc1'},
    {id: 'd2', code: 'D05', description: 'Identificar a estrutura básica de um texto argumentativo.', bnccId: 'bncc2'},
    {id: 'd3', code: 'D12', description: 'Identificar a finalidade de textos de diferentes gêneros.', bnccId: 'bncc3'},
];


export const AIIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${className}`} viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
    </svg>
);

export const GoogleDriveIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${className}`} viewBox="0 0 512 512">
        <path fill="#4285f4" d="M330 128l-65 112H134l65-112z"/>
        <path fill="#34a853" d="M132 384l66-112h133l-66 112z"/>
        <path fill="#fbbc04" d="M54 219l-1 1 133 229 66-114-132-229 -65 113h-1z"/>
    </svg>
);

export const SUBJECTS = ['Geography', 'Chemistry', 'Literature', 'Math', 'History', 'Physics'];
export const DIFFICULTIES = ['Easy', 'Medium', 'Hard'];
