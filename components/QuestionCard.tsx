
import React, { useState, useEffect } from 'react';
import { Question, Alternative, QuestionType } from '../types';
import { SUBJECTS, DIFFICULTIES, AIIcon } from '../constants';
import * as geminiService from '../services/geminiService';
import Modal from './Modal';

interface QuestionCardProps {
  question: Question;
  onUpdate: (question: Question) => void;
  onDelete: (questionId: string) => void;
}

const QuestionCard: React.FC<QuestionCardProps> = ({ question, onUpdate, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedQuestion, setEditedQuestion] = useState<Question>(question);

  // AI feature states
  const [isClassifying, setIsClassifying] = useState(false);
  const [isSuggestingPhrasing, setIsSuggestingPhrasing] = useState(false);
  const [phrasingSuggestions, setPhrasingSuggestions] = useState<string[]>([]);
  const [isPhrasingModalOpen, setIsPhrasingModalOpen] = useState(false);
  const [isGeneratingDistractors, setIsGeneratingDistractors] = useState(false);

  useEffect(() => {
    setEditedQuestion(question);
  }, [question]);

  const handleSave = () => {
    onUpdate(editedQuestion);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedQuestion(question);
    setIsEditing(false);
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditedQuestion(prev => ({ ...prev, [name]: value }));
  };

  const handleAlternativeTextChange = (id: string, text: string) => {
    setEditedQuestion(prev => ({
      ...prev,
      alternatives: prev.alternatives.map(alt => alt.id === id ? { ...alt, text } : alt)
    }));
  };

  const handleCorrectAlternativeChange = (id: string) => {
    if (editedQuestion.type === QuestionType.MultipleChoice || editedQuestion.type === QuestionType.TrueFalse) {
      setEditedQuestion(prev => ({
        ...prev,
        alternatives: prev.alternatives.map(alt => ({ ...alt, isCorrect: alt.id === id }))
      }));
    }
  };

  // AI feature handlers
  const handleSuggestClassification = async () => {
    setIsClassifying(true);
    try {
      const result = await geminiService.suggestClassification(editedQuestion.text);
      setEditedQuestion(prev => ({
        ...prev,
        bncc: [result.bncc],
        descritores: [result.descritor],
        difficulty: result.difficulty,
      }));
    } catch (error) {
      console.error(error);
      alert('Failed to get AI classification.');
    } finally {
      setIsClassifying(false);
    }
  };

  const handleSuggestPhrasing = async () => {
    setIsSuggestingPhrasing(true);
    try {
      const suggestions = await geminiService.suggestAlternativePhrasing(editedQuestion.text);
      setPhrasingSuggestions(suggestions);
      setIsPhrasingModalOpen(true);
    } catch (error) {
      console.error(error);
      alert('Failed to get AI phrasing suggestions.');
    } finally {
      setIsSuggestingPhrasing(false);
    }
  };
  
  const selectPhrasing = (text: string) => {
      setEditedQuestion(prev => ({...prev, text}));
      setIsPhrasingModalOpen(false);
  }

  const handleGenerateDistractors = async () => {
    setIsGeneratingDistractors(true);
    try {
      const distractors = await geminiService.generateDistractors(editedQuestion);
      const correctAnswer = editedQuestion.alternatives.find(a => a.isCorrect);
      if (correctAnswer) {
          const newAlternatives: Alternative[] = [
              correctAnswer,
              ...distractors.map((distractor, i) => ({
                  id: `d-${Date.now()}-${i}`,
                  text: distractor,
                  isCorrect: false
              }))
          ];
          setEditedQuestion(prev => ({...prev, alternatives: newAlternatives}));
      }
    } catch (error) {
      console.error(error);
      alert('Failed to generate AI distractors.');
    } finally {
      setIsGeneratingDistractors(false);
    }
  };

  const renderAlternatives = (q: Question) => {
    switch(q.type) {
      case QuestionType.MultipleChoice:
        return q.alternatives.map(alt => (
          <div key={alt.id} className={`flex items-center p-2 rounded ${alt.isCorrect ? 'bg-green-100' : 'bg-gray-100'}`}>
            <span className="font-bold mr-2">{alt.isCorrect ? '✔' : '✖'}</span>
            <p className="text-sm">{alt.text}</p>
          </div>
        ));
      case QuestionType.TrueFalse:
        const correctAlt = q.alternatives.find(a => a.isCorrect);
        return <p className="text-sm bg-gray-100 p-2 rounded">Correct Answer: <span className="font-semibold">{correctAlt?.text}</span></p>
      case QuestionType.ShortAnswer:
        return <p className="text-sm bg-gray-100 p-2 rounded">Answer: <span className="font-semibold">{q.alternatives[0]?.text}</span></p>
      default:
        return null;
    }
  }

  const renderEditAlternatives = () => {
     switch(editedQuestion.type) {
      case QuestionType.MultipleChoice:
        return editedQuestion.alternatives.map((alt) => (
          <div key={alt.id} className="flex items-center gap-2 mb-2">
            <input type="radio" name={`correct-alt-${editedQuestion.id}`} checked={alt.isCorrect} onChange={() => handleCorrectAlternativeChange(alt.id)} className="form-radio h-4 w-4 text-primary-600"/>
            <input type="text" value={alt.text} onChange={(e) => handleAlternativeTextChange(alt.id, e.target.value)} className="w-full p-2 border rounded-md" />
          </div>
        ));
      case QuestionType.TrueFalse:
        return editedQuestion.alternatives.map((alt) => (
          <div key={alt.id} className="flex items-center gap-2 mb-2">
            <input type="radio" name={`correct-alt-${editedQuestion.id}`} checked={alt.isCorrect} onChange={() => handleCorrectAlternativeChange(alt.id)} className="form-radio h-4 w-4 text-primary-600"/>
            <span className="p-2">{alt.text}</span>
          </div>
        ));
      case QuestionType.ShortAnswer:
          return (
             <div className="flex items-center gap-2 mb-2">
                <input type="text" value={editedQuestion.alternatives[0]?.text || ''} onChange={(e) => handleAlternativeTextChange(editedQuestion.alternatives[0]?.id, e.target.value)} className="w-full p-2 border rounded-md" />
            </div>
          )
      default:
        return <p className="text-sm text-gray-500">Editing for this question type is not supported.</p>;
    }
  }
  
  const aiButtonClass = "flex items-center gap-2 px-3 py-1 text-xs font-semibold text-primary-700 bg-primary-100 rounded-md hover:bg-primary-200 disabled:bg-gray-200 disabled:cursor-wait";

  if (isEditing) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-lg border border-primary-500 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Question Text</label>
          <textarea name="text" value={editedQuestion.text} onChange={handleInputChange} rows={4} className="w-full p-2 border rounded-md" />
          <div className="flex gap-2 mt-2">
             <button onClick={handleSuggestPhrasing} disabled={isSuggestingPhrasing} className={aiButtonClass}>
                <AIIcon /> {isSuggestingPhrasing ? 'Working...' : 'Suggest Phrasing'}
             </button>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                <select name="subject" value={editedQuestion.subject} onChange={handleInputChange} className="w-full p-2 border rounded-md bg-white">
                    {SUBJECTS.map(s => <option key={s}>{s}</option>)}
                </select>
            </div>
             <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
                <select name="difficulty" value={editedQuestion.difficulty} onChange={handleInputChange} className="w-full p-2 border rounded-md bg-white">
                    {DIFFICULTIES.map(d => <option key={d}>{d}</option>)}
                </select>
            </div>
        </div>
         <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Classification (BNCC, Descritores)</label>
            <div className="flex items-center gap-2">
                <input type="text" placeholder="BNCC Code" value={editedQuestion.bncc.join(', ')} onChange={e => setEditedQuestion(prev => ({...prev, bncc: e.target.value.split(',').map(s => s.trim())}))} className="w-full p-2 border rounded-md" />
                <input type="text" placeholder="Descritor Code" value={editedQuestion.descritores.join(', ')} onChange={e => setEditedQuestion(prev => ({...prev, descritores: e.target.value.split(',').map(s => s.trim())}))} className="w-full p-2 border rounded-md" />
                <button onClick={handleSuggestClassification} disabled={isClassifying} className={`${aiButtonClass} whitespace-nowrap`}>
                  <AIIcon /> {isClassifying ? '...' : 'Suggest'}
                </button>
            </div>
        </div>

        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Alternatives</label>
            <div className="space-y-2">{renderEditAlternatives()}</div>
            {editedQuestion.type === QuestionType.MultipleChoice && (
                 <div className="flex gap-2 mt-2">
                    <button onClick={handleGenerateDistractors} disabled={isGeneratingDistractors} className={aiButtonClass}>
                        <AIIcon /> {isGeneratingDistractors ? 'Working...' : 'Generate Distractors'}
                    </button>
                </div>
            )}
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <button onClick={handleCancel} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200">Cancel</button>
          <button onClick={handleSave} className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700">Save Changes</button>
        </div>
        
        <Modal isOpen={isPhrasingModalOpen} onClose={() => setIsPhrasingModalOpen(false)} title="Alternative Phrasing Suggestions">
            <div className="space-y-2">
                {phrasingSuggestions.map((s, i) => (
                    <button key={i} onClick={() => selectPhrasing(s)} className="w-full text-left p-3 bg-gray-100 hover:bg-primary-100 rounded-md">
                        {s}
                    </button>
                ))}
            </div>
        </Modal>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border space-y-4">
      {question.imageUrl && <img src={question.imageUrl} alt="Question visual aid" className="rounded-md object-cover w-full h-40 mb-4" />}
      <p className="font-semibold text-gray-800">{question.text}</p>
      <div className="space-y-2">
        {renderAlternatives(question)}
      </div>
      <div className="flex flex-wrap gap-2 pt-4 border-t text-xs">
          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full font-medium">{question.subject}</span>
          <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full font-medium">{question.difficulty}</span>
          {question.bncc.map(b => <span key={b} className="px-2 py-1 bg-gray-200 text-gray-700 rounded-full font-mono">{b}</span>)}
          {question.descritores.map(d => <span key={d} className="px-2 py-1 bg-gray-200 text-gray-700 rounded-full font-mono">{d}</span>)}
      </div>
      <div className="flex justify-end gap-2">
        <button onClick={() => setIsEditing(true)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200">Edit</button>
        <button onClick={() => onDelete(question.id)} className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700">Delete</button>
      </div>
    </div>
  );
};

export default QuestionCard;
