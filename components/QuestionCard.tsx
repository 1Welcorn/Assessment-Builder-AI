import React, { useState, useEffect } from 'react';
import { Question, Alternative, QuestionType } from '../types';
import { SUBJECTS, DIFFICULTIES, AIIcon } from '../constants';
import * as geminiService from '../services/geminiService';
import Modal from './Modal';
import { Icons } from './Icons';

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
          <div key={alt.id} className={`flex items-start gap-3 p-2 rounded-md text-sm ${alt.isCorrect ? 'bg-green-50 text-green-900' : 'bg-slate-100 text-slate-700'}`}>
            <span className={`font-bold text-base ${alt.isCorrect ? 'text-green-600' : 'text-slate-400'}`}>{alt.isCorrect ? <Icons.CheckCircle /> : <Icons.Circle />}</span>
            <p>{alt.text}</p>
          </div>
        ));
      case QuestionType.TrueFalse:
        const correctAlt = q.alternatives.find(a => a.isCorrect);
        return <p className="text-sm bg-slate-100 p-2 rounded-md">Correct Answer: <span className="font-semibold">{correctAlt?.text}</span></p>
      case QuestionType.ShortAnswer:
        return <p className="text-sm bg-slate-100 p-2 rounded-md">Answer: <span className="font-semibold">{q.alternatives[0]?.text}</span></p>
      default:
        return null;
    }
  }

  const renderEditAlternatives = () => {
     switch(editedQuestion.type) {
      case QuestionType.MultipleChoice:
        return editedQuestion.alternatives.map((alt) => (
          <div key={alt.id} className="flex items-center gap-3 mb-2">
            <input type="radio" name={`correct-alt-${editedQuestion.id}`} checked={alt.isCorrect} onChange={() => handleCorrectAlternativeChange(alt.id)} className="h-4 w-4 text-primary-600 border-slate-300 focus:ring-primary-500"/>
            <input type="text" value={alt.text} onChange={(e) => handleAlternativeTextChange(alt.id, e.target.value)} className="w-full p-2 border rounded-lg" />
          </div>
        ));
      case QuestionType.TrueFalse:
        return editedQuestion.alternatives.map((alt) => (
          <div key={alt.id} className="flex items-center gap-3 mb-2">
            <input type="radio" name={`correct-alt-${editedQuestion.id}`} checked={alt.isCorrect} onChange={() => handleCorrectAlternativeChange(alt.id)} className="h-4 w-4 text-primary-600 border-slate-300 focus:ring-primary-500"/>
            <span className="p-2">{alt.text}</span>
          </div>
        ));
      case QuestionType.ShortAnswer:
          return (
             <div className="flex items-center gap-2 mb-2">
                <input type="text" value={editedQuestion.alternatives[0]?.text || ''} onChange={(e) => handleAlternativeTextChange(editedQuestion.alternatives[0]?.id, e.target.value)} className="w-full p-2 border rounded-lg" />
            </div>
          )
      default:
        return <p className="text-sm text-slate-500">Editing for this question type is not supported.</p>;
    }
  }
  
  const aiButtonClass = "flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-primary-700 bg-primary-100 rounded-lg hover:bg-primary-200 disabled:bg-slate-200 disabled:cursor-wait transition-colors";

  if (isEditing) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-lg border border-primary-500 space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Question Text</label>
          <textarea name="text" value={editedQuestion.text} onChange={handleInputChange} rows={4} className="w-full p-2 border rounded-lg" />
          <div className="flex gap-2 mt-2">
             <button onClick={handleSuggestPhrasing} disabled={isSuggestingPhrasing} className={aiButtonClass}>
                <AIIcon className="w-4 h-4" /> {isSuggestingPhrasing ? 'Working...' : 'Suggest Phrasing'}
             </button>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Subject</label>
                <select name="subject" value={editedQuestion.subject} onChange={handleInputChange} className="w-full p-2 border rounded-lg bg-white">
                    {SUBJECTS.map(s => <option key={s}>{s}</option>)}
                </select>
            </div>
             <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Difficulty</label>
                <select name="difficulty" value={editedQuestion.difficulty} onChange={handleInputChange} className="w-full p-2 border rounded-lg bg-white">
                    {DIFFICULTIES.map(d => <option key={d}>{d}</option>)}
                </select>
            </div>
        </div>
         <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Classification (BNCC, Descritores)</label>
            <div className="flex items-center gap-2">
                <input type="text" placeholder="BNCC Code" value={editedQuestion.bncc.join(', ')} onChange={e => setEditedQuestion(prev => ({...prev, bncc: e.target.value.split(',').map(s => s.trim())}))} className="w-full p-2 border rounded-lg" />
                <input type="text" placeholder="Descritor Code" value={editedQuestion.descritores.join(', ')} onChange={e => setEditedQuestion(prev => ({...prev, descritores: e.target.value.split(',').map(s => s.trim())}))} className="w-full p-2 border rounded-lg" />
                <button onClick={handleSuggestClassification} disabled={isClassifying} className={`${aiButtonClass} whitespace-nowrap`}>
                  <AIIcon className="w-4 h-4" /> {isClassifying ? '...' : 'Suggest'}
                </button>
            </div>
        </div>

        <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Alternatives</label>
            <div className="space-y-2">{renderEditAlternatives()}</div>
            {editedQuestion.type === QuestionType.MultipleChoice && (
                 <div className="flex gap-2 mt-2">
                    <button onClick={handleGenerateDistractors} disabled={isGeneratingDistractors} className={aiButtonClass}>
                        <AIIcon className="w-4 h-4" /> {isGeneratingDistractors ? 'Working...' : 'Generate Distractors'}
                    </button>
                </div>
            )}
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <button onClick={handleCancel} className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200">Cancel</button>
          <button onClick={handleSave} className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700">Save Changes</button>
        </div>
        
        <Modal isOpen={isPhrasingModalOpen} onClose={() => setIsPhrasingModalOpen(false)} title="Alternative Phrasing Suggestions">
            <div className="space-y-2">
                {phrasingSuggestions.map((s, i) => (
                    <button key={i} onClick={() => selectPhrasing(s)} className="w-full text-left p-3 bg-slate-100 hover:bg-primary-100 rounded-lg">
                        {s}
                    </button>
                ))}
            </div>
        </Modal>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border space-y-4">
      <div className="flex justify-between items-start">
        <p className="font-semibold text-slate-800 pr-4">{question.text}</p>
        <div className="flex gap-2 flex-shrink-0">
          <button onClick={() => setIsEditing(true)} className="p-1.5 text-slate-500 hover:text-primary-600 hover:bg-slate-100 rounded-md"><Icons.Edit className="w-4 h-4" /></button>
          <button onClick={() => onDelete(question.id)} className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-slate-100 rounded-md"><Icons.Delete className="w-4 h-4" /></button>
        </div>
      </div>
      {question.imageUrl && <img src={question.imageUrl} alt="Question visual aid" className="rounded-lg object-cover w-full h-40 mb-4" />}
      <div className="space-y-2">
        {renderAlternatives(question)}
      </div>
      <div className="flex flex-wrap gap-2 pt-4 border-t text-xs">
          <span className="px-2.5 py-1 bg-blue-100 text-blue-800 rounded-full font-semibold">{question.subject}</span>
          <span className="px-2.5 py-1 bg-purple-100 text-purple-800 rounded-full font-semibold">{question.difficulty}</span>
          {question.bncc.map(b => <span key={b} className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-full font-mono">{b}</span>)}
          {question.descritores.map(d => <span key={d} className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-full font-mono">{d}</span>)}
      </div>
    </div>
  );
};

export default QuestionCard;
