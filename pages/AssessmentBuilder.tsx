
import React, { useState } from 'react';
import { MOCK_QUESTIONS, GoogleDriveIcon } from '../constants';
import { Question, QuestionType } from '../types';

const AssessmentBuilder: React.FC = () => {
    const [selectedQuestions, setSelectedQuestions] = useState<Question[]>([]);
    const [assessmentTitle, setAssessmentTitle] = useState("New Assessment");

    const toggleQuestionSelection = (question: Question) => {
        setSelectedQuestions(prev => 
            prev.find(q => q.id === question.id)
                ? prev.filter(q => q.id !== question.id)
                : [...prev, question]
        );
    };

    return (
        <div className="flex h-[calc(100vh-4rem)]">
            {/* Left Panel: Question Bank */}
            <div className="w-1/3 border-r overflow-y-auto p-4 bg-white">
                <h2 className="text-xl font-bold mb-4">Select Questions</h2>
                <input type="text" placeholder="Search question bank..." className="w-full p-2 border rounded-md mb-4"/>
                <div className="space-y-3">
                    {MOCK_QUESTIONS.map(q => (
                        <div key={q.id} className="p-3 border rounded-md flex items-start gap-3 hover:bg-gray-50 cursor-pointer" onClick={() => toggleQuestionSelection(q)}>
                            <input
                                type="checkbox"
                                className="mt-1 h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                                checked={selectedQuestions.some(sq => sq.id === q.id)}
                                readOnly
                            />
                            <div>
                                <p className="font-medium text-sm">{q.text}</p>
                                <span className="text-xs text-gray-500">{q.subject} - {q.difficulty}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Middle Panel: Builder & Settings */}
            <div className="w-1/3 overflow-y-auto p-6">
                 <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-800">Assessment Builder</h1>
                    <div className="flex gap-2">
                        <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border rounded-md hover:bg-gray-50">
                            <GoogleDriveIcon /> Save
                        </button>
                    </div>
                </div>

                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Assessment Title</label>
                        <input type="text" value={assessmentTitle} onChange={e => setAssessmentTitle(e.target.value)} className="w-full p-2 border rounded-md"/>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Logo</label>
                        <input type="file" className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"/>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Layout Optimization</label>
                        <div className="flex items-center gap-2">
                            <input type="number" defaultValue="2" className="w-20 p-2 border rounded-md"/>
                            <span className="text-sm">pages</span>
                            <button className="px-3 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700">Suggest Layout</button>
                        </div>
                    </div>
                    <div>
                         <h3 className="text-lg font-semibold mb-2">Selected Questions ({selectedQuestions.length})</h3>
                         <div className="space-y-2 max-h-96 overflow-y-auto p-2 border rounded-md">
                            {selectedQuestions.length > 0 ? selectedQuestions.map((q, index) => (
                                <div key={q.id} className="p-2 bg-gray-100 rounded-md text-sm">{index + 1}. {q.text}</div>
                            )) : <p className="text-gray-500 text-sm p-4 text-center">Select questions from the left panel.</p>}
                         </div>
                    </div>
                </div>
            </div>

            {/* Right Panel: Real-time Preview */}
            <div className="w-1/3 bg-gray-200 p-6 overflow-y-auto">
                <h2 className="text-xl font-bold mb-4">Real-time Preview</h2>
                <div className="bg-white p-8 rounded-md shadow-lg aspect-[8.5/11]">
                    <div className="flex justify-between items-start border-b pb-4 mb-4">
                        <div>
                            <h1 className="text-2xl font-bold">{assessmentTitle}</h1>
                            <p className="text-sm text-gray-600">Subject: Various</p>
                        </div>
                        <div className="w-20 h-10 bg-gray-300 flex items-center justify-center text-xs text-gray-500">Logo</div>
                    </div>
                    <div className="space-y-6">
                        {selectedQuestions.map((q, index) => (
                            <div key={q.id}>
                                <p className="font-semibold">{index + 1}. {q.text}</p>
                                <div className="mt-2 space-y-1">
                                    {q.type === QuestionType.MultipleChoice && q.alternatives.map(alt => <div key={alt.id} className="flex items-center gap-2 ml-4 text-sm"> A) {alt.text}</div>)}
                                     {q.type === QuestionType.TrueFalse && <div className="ml-4 text-sm"> ( ) True ( ) False </div>}
                                     {q.type === QuestionType.ShortAnswer && <div className="mt-2 border-b-2 border-dotted h-6 w-full"></div>}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AssessmentBuilder;