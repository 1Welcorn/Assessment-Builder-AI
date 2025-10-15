import React, { useState, useRef } from 'react';
import { MOCK_QUESTIONS, SUBJECTS, DIFFICULTIES, AIIcon, GoogleDriveIcon } from '../constants';
import { Question, QuestionType } from '../types';
import QuestionCard from '../components/QuestionCard';
import Modal from '../components/Modal';
import * as geminiService from '../services/geminiService';
import { Icons } from '../components/Icons';

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
            <div className="bg-white p-4 rounded-lg shadow-sm border mb-6">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <div className="md:col-span-2 relative">
                         <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                             <Icons.Search className="h-4 w-4 text-slate-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search questions by text..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full p-2 pl-9 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        />
                    </div>
                    <select className="p-2 border rounded-lg bg-white w-full">
                        <option>All Subjects</option>
                        {SUBJECTS.map(s => <option key={s}>{s}</option>)}
                    </select>
                    <select className="p-2 border rounded-lg bg-white w-full">
                        <option>All Difficulties</option>
                        {DIFFICULTIES.map(d => <option key={d}>{d}</option>)}
                    </select>
                    <button className="px-4 py-2 text-sm font-semibold text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors">
                        Apply Filters
                    </button>
                </div>
            </div>
            
            <div className="flex justify-end mb-6 gap-3">
                 <button 
                    onClick={handlePdfImportClick} 
                    disabled={isImporting}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 shadow-sm disabled:bg-slate-100 disabled:cursor-wait transition-colors"
                 >
                    {isImporting ? <Icons.Spinner /> : <Icons.PDF className="w-4 h-4" />}
                    {isImporting ? 'Importing...' : 'Import from PDF'}
                 </button>
                 <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept=".pdf"
                    className="hidden"
                />
                 <button onClick={() => setIsGeneratorModalOpen(true)} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-primary-700 bg-primary-100 rounded-lg hover:bg-primary-200 shadow-sm transition-colors">
                    <AIIcon className="w-4 h-4" /> Generate with AI
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredQuestions.length > 0 ? filteredQuestions.map(q => (
                    <QuestionCard 
                        key={q.id} 
                        question={q}
                        onUpdate={handleUpdateQuestion}
                        onDelete={handleDeleteQuestion}
                    />
                )) : (
                    <div className="lg:col-span-2 text-center py-16 px-6 bg-white rounded-lg border shadow-sm">
                        <h3 className="text-lg font-semibold text-slate-800">No Questions Found</h3>
                        <p className="text-slate-500 mt-2">Your search did not match any questions. Try a different search term or clear the filters.</p>
                    </div>
                )}
            </div>

            <Modal
                isOpen={isGeneratorModalOpen}
                onClose={() => setIsGeneratorModalOpen(false)}
                title="Generate Question with AI"
                footer={
                    <>
                        <button onClick={() => setIsGeneratorModalOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors">Cancel</button>
                        <button 
                            onClick={handleGenerateQuestion} 
                            disabled={isGenerating || !generationTopic.trim()}
                            className="ml-2 px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:bg-primary-300 disabled:cursor-not-allowed flex items-center transition-colors"
                        >
                            {isGenerating && <Icons.Spinner />}
                            {isGenerating ? 'Generating...' : 'Generate Question'}
                        </button>
                    </>
                }
            >
                <p className="text-slate-600 mb-4">Enter a topic or subject, and AI will create a new question for you.</p>
                <input
                    type="text"
                    value={generationTopic}
                    onChange={(e) => setGenerationTopic(e.target.value)}
                    placeholder="e.g., 'Solar System Planets' or 'French Revolution'"
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                    autoFocus
                />
            </Modal>
        </div>
    );
};

export default QuestionBankEditor;