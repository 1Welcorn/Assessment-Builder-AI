import React, { useState, useRef } from 'react';
import { MOCK_QUESTIONS, SUBJECTS, DIFFICULTIES, AIIcon, GoogleDriveIcon } from '../constants';
import { Question, QuestionType } from '../types';
import QuestionCard from '../components/QuestionCard';
import Modal from '../components/Modal';
import * as geminiService from '../services/geminiService';

const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const result = reader.result as string;
            // Remove the data URL prefix
            const base64 = result.split(',')[1];
            resolve(base64);
        };
        reader.onerror = (error) => reject(error);
    });
};

const QuestionBankEditor: React.FC = () => {
    const [questions, setQuestions] = useState<Question[]>(MOCK_QUESTIONS);
    const [searchTerm, setSearchTerm] = useState('');
    const [isGeneratorModalOpen, setIsGeneratorModalOpen] = useState(false);
    const [generationTopic, setGenerationTopic] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [isImporting, setIsImporting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleUpdateQuestion = (updatedQuestion: Question) => {
        setQuestions(questions.map(q => q.id === updatedQuestion.id ? updatedQuestion : q));
    };

    const handleDeleteQuestion = (questionId: string) => {
        setQuestions(questions.filter(q => q.id !== questionId));
    };

    const handleAddNewQuestion = () => {
        const newQuestion: Question = {
            id: `q${Date.now()}`,
            text: 'New question text...',
            type: QuestionType.MultipleChoice,
            alternatives: [
                { id: 'a1', text: 'Correct Answer', isCorrect: true },
                { id: 'a2', text: 'Incorrect Answer 1', isCorrect: false },
                { id: 'a3', text: 'Incorrect Answer 2', isCorrect: false },
            ],
            subject: 'General',
            difficulty: 'Medium',
            bncc: [],
            descritores: [],
        };
        setQuestions([newQuestion, ...questions]);
    };

    const handleGenerateQuestion = async () => {
        if (!generationTopic.trim()) return;
        setIsGenerating(true);
        try {
            const newQuestion = await geminiService.generateQuestion(generationTopic);
            setQuestions([newQuestion, ...questions]);
            setIsGeneratorModalOpen(false);
            setGenerationTopic('');
        } catch (error) {
            console.error("Failed to generate question:", error);
            alert("There was an error generating the question. Please try again.");
        } finally {
            setIsGenerating(false);
        }
    };
    
    const handlePdfImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setIsImporting(true);
        try {
            const base64Pdf = await fileToBase64(file);
            const extractedQuestions = await geminiService.extractQuestionsFromPdf(base64Pdf);
            setQuestions(prev => [...extractedQuestions, ...prev]);
            alert(`${extractedQuestions.length} questions were successfully imported from the PDF.`);
        } catch (error) {
            console.error("Failed to import questions from PDF:", error);
            alert("There was an error importing questions from the PDF. Please check the console and try again.");
        } finally {
            setIsImporting(false);
             // Reset file input value to allow re-uploading the same file
            if(fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };


    const filteredQuestions = questions.filter(q => 
        q.text.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Question Bank Editor</h1>
                <div className="flex gap-2">
                    <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border rounded-md hover:bg-gray-50">
                        <GoogleDriveIcon /> Save to Google Drive
                    </button>
                    <button onClick={() => alert('Previewing Export...')} className="px-4 py-2 text-sm font-medium text-white bg-gray-700 rounded-md hover:bg-gray-800">
                        Preview Export
                    </button>
                </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm border mb-6">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <input
                        type="text"
                        placeholder="Search questions..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="md:col-span-2 w-full p-2 border rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                    <select className="p-2 border rounded-md bg-white">
                        <option>All Subjects</option>
                        {SUBJECTS.map(s => <option key={s}>{s}</option>)}
                    </select>
                    <select className="p-2 border rounded-md bg-white">
                        <option>All Difficulties</option>
                        {DIFFICULTIES.map(d => <option key={d}>{d}</option>)}
                    </select>
                    <button className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700">
                        Filter
                    </button>
                </div>
            </div>
            
            <div className="flex justify-end mb-6 gap-3">
                 <button 
                    onClick={handlePdfImportClick} 
                    disabled={isImporting}
                    className="flex items-center gap-2 px-5 py-2 font-semibold text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-100 shadow-sm disabled:bg-gray-200 disabled:cursor-wait"
                 >
                    {isImporting ? (
                         <svg className="animate-spin h-5 w-5 text-gray-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    ) : '📄'}
                    {isImporting ? 'Importing...' : 'Import from PDF'}
                 </button>
                 <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept=".pdf"
                    className="hidden"
                />
                 <button onClick={() => setIsGeneratorModalOpen(true)} className="flex items-center gap-2 px-5 py-2 font-semibold text-primary-700 bg-primary-100 rounded-md hover:bg-primary-200 shadow-sm">
                    <AIIcon /> Generate with AI
                </button>
                <button onClick={handleAddNewQuestion} className="px-5 py-2 font-semibold text-white bg-primary-600 rounded-md hover:bg-primary-700 shadow-sm">
                    Add New Question
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredQuestions.map(q => (
                    <QuestionCard 
                        key={q.id} 
                        question={q}
                        onUpdate={handleUpdateQuestion}
                        onDelete={handleDeleteQuestion}
                    />
                ))}
            </div>

            <Modal
                isOpen={isGeneratorModalOpen}
                onClose={() => setIsGeneratorModalOpen(false)}
                title="Generate Question with AI"
                footer={
                    <>
                        <button onClick={() => setIsGeneratorModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200">Cancel</button>
                        <button 
                            onClick={handleGenerateQuestion} 
                            disabled={isGenerating || !generationTopic.trim()}
                            className="ml-2 px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 disabled:bg-primary-300 disabled:cursor-not-allowed flex items-center"
                        >
                            {isGenerating && <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>}
                            {isGenerating ? 'Generating...' : 'Generate'}
                        </button>
                    </>
                }
            >
                <p className="text-gray-600 mb-4">Enter a topic or subject, and AI will create a new question for you.</p>
                <input
                    type="text"
                    value={generationTopic}
                    onChange={(e) => setGenerationTopic(e.target.value)}
                    placeholder="e.g., 'Solar System Planets' or 'French Revolution'"
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-primary-500"
                    autoFocus
                />
            </Modal>
        </div>
    );
};

export default QuestionBankEditor;