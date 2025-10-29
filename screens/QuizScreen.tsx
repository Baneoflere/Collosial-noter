import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { getNoteById } from '../services/storageService';
import Header from '../components/Header';
import { CheckIcon, CloseIcon } from '../components/Icons';

const QuizScreen: React.FC = () => {
    const { state, dispatch } = useAppContext();
    const note = getNoteById(state.selectedNoteId!);
    
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [score, setScore] = useState(0);
    const [isAnswered, setIsAnswered] = useState(false);
    
    const quizzes = note?.quizzes || [];
    const currentQuestion = quizzes[currentQuestionIndex];

    const handleAnswerSelect = (option: string) => {
        if (isAnswered) return;
        setSelectedAnswer(option);
        setIsAnswered(true);
        if (option === currentQuestion.correctAnswer) {
            setScore(prev => prev + 1);
        }
    };

    const handleNext = () => {
        setIsAnswered(false);
        setSelectedAnswer(null);
        setCurrentQuestionIndex(prev => prev + 1);
    };

    const handleRestart = () => {
        setCurrentQuestionIndex(0);
        setSelectedAnswer(null);
        setScore(0);
        setIsAnswered(false);
    };

    const getButtonClass = (option: string) => {
        if (!isAnswered) {
            return "bg-gray-800 hover:bg-gray-700";
        }
        if (option === currentQuestion.correctAnswer) {
            return "bg-green-500/50 border-green-400";
        }
        if (option === selectedAnswer) {
            return "bg-red-500/50 border-red-400";
        }
        return "bg-gray-800 opacity-60";
    };

    return (
        <div className="bg-gray-900 min-h-full text-white">
            <Header title="Quiz" theme="gray" showBackButton onBack={() => dispatch({ type: 'SET_SCREEN', payload: 'study' })} />

            <main className="p-6">
                {currentQuestionIndex < quizzes.length ? (
                    <div>
                        <p className="text-sm text-gray-400 mb-2">Question {currentQuestionIndex + 1} of {quizzes.length}</p>
                        <h2 className="text-2xl font-semibold mb-6">{currentQuestion.question}</h2>

                        <div className="space-y-3">
                            {currentQuestion.options.map(option => (
                                <button
                                    key={option}
                                    onClick={() => handleAnswerSelect(option)}
                                    className={`w-full text-left p-4 rounded-lg border-2 border-transparent transition-colors ${getButtonClass(option)}`}
                                >
                                    {option}
                                </button>
                            ))}
                        </div>

                        {isAnswered && (
                             <button
                                onClick={handleNext}
                                className="w-full mt-8 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-lg transition-colors"
                            >
                                {currentQuestionIndex < quizzes.length - 1 ? "Next Question" : "Finish Quiz"}
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="text-center">
                        <h2 className="text-3xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400">Quiz Complete!</h2>
                        <p className="text-xl mb-6">Your score: <span className="font-bold">{score} / {quizzes.length}</span></p>
                        <button
                            onClick={handleRestart}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg transition-colors mr-4"
                        >
                            Try Again
                        </button>
                        <button
                            onClick={() => dispatch({ type: 'SET_SCREEN', payload: 'study' })}
                            className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                        >
                            Back to Study Set
                        </button>
                    </div>
                )}
            </main>
        </div>
    );
};

export default QuizScreen;
