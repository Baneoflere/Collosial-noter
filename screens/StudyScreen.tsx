import React from 'react';
import { useAppContext } from '../context/AppContext';
import { getNoteById } from '../services/storageService';
import Header from '../components/Header';
import { ChevronRightIcon } from '../components/Icons';

const StudyScreen: React.FC = () => {
    const { state, dispatch } = useAppContext();
    const note = getNoteById(state.selectedNoteId!);

    if (!note) {
        return <div className="p-4 text-white">Note not found.</div>;
    }

    const hasQuizzes = note.quizzes && note.quizzes.length > 0;
    const hasFlashcards = note.flashcards && note.flashcards.length > 0;

    return (
        <div className="bg-gray-900 min-h-full text-white">
            <Header 
                title="Study Set" 
                theme="gray" 
                showBackButton 
                onBack={() => dispatch({ type: 'SET_SCREEN', payload: 'note-detail' })} 
            />
            <main className="p-6">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400">Quizzes and Flashcards</h1>
                    <p className="text-gray-400">Generated from your note: "{note.title}"</p>
                </div>

                <div className="space-y-4">
                    <button
                        onClick={() => dispatch({ type: 'SET_SCREEN', payload: 'quiz' })}
                        disabled={!hasQuizzes}
                        className="w-full flex justify-between items-center bg-gray-800 p-6 rounded-xl hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:hover:bg-gray-800"
                    >
                        <div>
                            <h2 className="text-xl font-bold">Start Quiz</h2>
                            <p className="text-gray-400">{hasQuizzes ? `${note.quizzes?.length} questions` : "No quiz available"}</p>
                        </div>
                        <ChevronRightIcon className="w-6 h-6 text-gray-500" />
                    </button>

                    <button
                        onClick={() => dispatch({ type: 'SET_SCREEN', payload: 'flashcards' })}
                        disabled={!hasFlashcards}
                        className="w-full flex justify-between items-center bg-gray-800 p-6 rounded-xl hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:hover:bg-gray-800"
                    >
                        <div>
                            <h2 className="text-xl font-bold">Review Flashcards</h2>
                            <p className="text-gray-400">{hasFlashcards ? `${note.flashcards?.length} cards` : "No flashcards available"}</p>
                        </div>
                        <ChevronRightIcon className="w-6 h-6 text-gray-500" />
                    </button>
                </div>
            </main>
        </div>
    );
};

export default StudyScreen;
