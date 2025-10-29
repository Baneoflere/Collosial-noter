import React, { useState, useRef, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import Header from '../components/Header';
import { SparklesIcon } from '../components/Icons';
import { getWritingAssistance, generateSummaryAndActionPoints } from '../services/aiService';
import { Note } from '../types';
import { WritingAssistanceAction } from '../services/aiService';

const ManualNoteScreen: React.FC = () => {
    const { state, dispatch } = useAppContext();
    const { initialManualNote } = state;
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [isAiMenuOpen, setIsAiMenuOpen] = useState(false);
    const [isAiLoading, setIsAiLoading] = useState(false);

    const contentRef = useRef<HTMLTextAreaElement>(null);
    
    useEffect(() => {
        if (initialManualNote) {
            setTitle(initialManualNote.title);
            setContent(initialManualNote.content);
            // Clear the initial note from context so it's not used again on re-render
            dispatch({ type: 'SET_INITIAL_MANUAL_NOTE', payload: null });
        }
    }, [initialManualNote, dispatch]);

    const handleSaveNote = async () => {
        const finalContent = content.trim();
        if (!finalContent) {
            alert("Note content cannot be empty.");
            return;
        }

        dispatch({ type: 'SET_LOADING', payload: 'Analyzing and saving note...' });
        
        const { summary, actionPoints } = await generateSummaryAndActionPoints(finalContent);
        
        const newNote: Note = {
            id: Date.now().toString(),
            title: title.trim() || summary.split(' ').slice(0, 5).join(' ') || 'Manual Note',
            createdAt: new Date().toISOString(),
            summary: summary,
            transcript: finalContent,
            actionPoints: actionPoints.map((ap, index) => ({ ...ap, id: `${index}-${Math.random()}`, completed: false })),
            chatHistory: [],
            color: 'yellow',
        };
        
        dispatch({ type: 'ADD_NOTE', payload: newNote });
        dispatch({ type: 'SET_SELECTED_NOTE_ID', payload: newNote.id });
        dispatch({ type: 'SET_LOADING', payload: null });
        dispatch({ type: 'SET_SCREEN', payload: 'note-detail' });
    };

    const handleAiAssist = async (action: WritingAssistanceAction) => {
        setIsAiMenuOpen(false);
        const textarea = contentRef.current;
        if (!textarea) return;

        const { selectionStart, selectionEnd } = textarea;
        const selectedText = content.substring(selectionStart, selectionEnd);
        const textToProcess = selectedText || content;

        if (!textToProcess.trim()) return;

        setIsAiLoading(true);
        const result = await getWritingAssistance(textToProcess, action);
        setIsAiLoading(false);

        if (selectedText) {
            const newContent = content.substring(0, selectionStart) + result + content.substring(selectionEnd);
            setContent(newContent);
        } else {
            setContent(result);
        }
    };
    
    const AiMenu = () => (
        <div className="absolute bottom-14 right-0 bg-white rounded-lg shadow-2xl border border-gray-200 z-10 w-48 overflow-hidden animate-fade-in-fast">
            <button onClick={() => handleAiAssist('correct')} className="w-full text-left px-4 py-2 hover:bg-gray-100 text-gray-700 transition-colors">Fix Spelling & Grammar</button>
            <button onClick={() => handleAiAssist('complete')} className="w-full text-left px-4 py-2 hover:bg-gray-100 text-gray-700 transition-colors">Complete Sentence</button>
            <button onClick={() => handleAiAssist('shorter')} className="w-full text-left px-4 py-2 hover:bg-gray-100 text-gray-700 transition-colors">Make Shorter</button>
            <button onClick={() => handleAiAssist('longer')} className="w-full text-left px-4 py-2 hover:bg-gray-100 text-gray-700 transition-colors">Make Longer</button>
        </div>
    );

    return (
        <div className="bg-yellow-500 min-h-full flex flex-col">
            <Header title="New Note" theme="yellow" showBackButton onBack={() => dispatch({ type: 'SET_SCREEN', payload: 'home' })} />
            <main className="flex-1 bg-gray-100 rounded-t-3xl p-4 flex flex-col">
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Note Title"
                    className="w-full p-3 mb-4 bg-white border-b-2 border-gray-200 focus:border-yellow-500 text-xl font-bold text-gray-800 outline-none transition-colors"
                />
                <div className="relative flex-1">
                    <textarea
                        ref={contentRef}
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Start writing..."
                        className="w-full h-full p-3 bg-white text-gray-700 resize-none outline-none rounded-lg shadow-inner"
                    />
                     <div className="absolute bottom-4 right-4">
                        <div className="relative">
                            <button 
                                onClick={() => setIsAiMenuOpen(prev => !prev)}
                                disabled={isAiLoading}
                                className={`p-3 rounded-full text-white shadow-lg transition-transform active:scale-90 ${isAiLoading ? 'bg-gray-400 animate-pulse' : 'bg-gradient-to-r from-blue-500 to-teal-400'}`}
                            >
                                <SparklesIcon className="w-6 h-6" />
                            </button>
                            {isAiMenuOpen && <AiMenu />}
                        </div>
                    </div>
                </div>
                <div className="mt-4 text-center">
                    <button
                        onClick={handleSaveNote}
                        className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-4 rounded-full shadow-lg transition-colors"
                    >
                        Finish & Analyze
                    </button>
                    <div className="mt-2 h-5 flex items-center justify-center"></div>
                </div>
            </main>
            <style>{`
                @keyframes fade-in-fast { 
                    from { opacity: 0; transform: translateY(10px); } 
                    to { opacity: 1; transform: translateY(0); } 
                }
                .animate-fade-in-fast { animation: fade-in-fast 0.2s ease-out forwards; }
            `}</style>
        </div>
    );
};

export default ManualNoteScreen;