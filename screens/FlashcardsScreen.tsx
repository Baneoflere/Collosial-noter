import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { getNoteById } from '../services/storageService';
import Header from '../components/Header';
import { ArrowLeftIcon, ArrowRightIcon } from '../components/Icons';

const FlashcardsScreen: React.FC = () => {
    const { state, dispatch } = useAppContext();
    const note = getNoteById(state.selectedNoteId!);

    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);

    const flashcards = note?.flashcards || [];
    const currentCard = flashcards[currentIndex];

    const handleNext = () => {
        setIsFlipped(false);
        setCurrentIndex(prev => (prev + 1) % flashcards.length);
    };

    const handlePrev = () => {
        setIsFlipped(false);
        setCurrentIndex(prev => (prev - 1 + flashcards.length) % flashcards.length);
    };
    
    return (
        <div className="bg-gray-900 min-h-full text-white flex flex-col">
            <Header title="Flashcards" theme="gray" showBackButton onBack={() => dispatch({ type: 'SET_SCREEN', payload: 'study' })} />

            <main className="p-6 flex-1 flex flex-col justify-center items-center">
                {flashcards.length > 0 ? (
                    <>
                        <div className="w-full max-w-lg aspect-[3/2] perspective-1000">
                            <div
                                className={`relative w-full h-full transition-transform duration-500 transform-style-preserve-3d ${isFlipped ? 'rotate-y-180' : ''}`}
                                onClick={() => setIsFlipped(!isFlipped)}
                            >
                                <div className="absolute w-full h-full bg-gray-800 rounded-xl flex items-center justify-center p-6 text-center backface-hidden">
                                    <p className="text-2xl font-semibold">{currentCard.front}</p>
                                </div>
                                <div className="absolute w-full h-full bg-indigo-700 rounded-xl flex items-center justify-center p-6 text-center backface-hidden rotate-y-180">
                                    <p className="text-xl">{currentCard.back}</p>
                                </div>
                            </div>
                        </div>

                        <p className="mt-4 text-gray-400">Card {currentIndex + 1} of {flashcards.length}</p>

                        <div className="flex justify-center items-center space-x-8 mt-6">
                            <button onClick={handlePrev} className="p-4 bg-gray-800 rounded-full hover:bg-gray-700 transition-colors">
                                <ArrowLeftIcon className="w-6 h-6" />
                            </button>
                            <button onClick={() => setIsFlipped(!isFlipped)} className="bg-indigo-600 hover:bg-indigo-700 font-bold py-3 px-8 rounded-lg">
                                Flip Card
                            </button>
                            <button onClick={handleNext} className="p-4 bg-gray-800 rounded-full hover:bg-gray-700 transition-colors">
                                <ArrowRightIcon className="w-6 h-6" />
                            </button>
                        </div>
                    </>
                ) : (
                    <p>No flashcards available for this note.</p>
                )}
            </main>
            <style>{`
                .perspective-1000 { perspective: 1000px; }
                .transform-style-preserve-3d { transform-style: preserve-3d; }
                .rotate-y-180 { transform: rotateY(180deg); }
                .backface-hidden { backface-visibility: hidden; -webkit-backface-visibility: hidden; }
            `}</style>
        </div>
    );
};

export default FlashcardsScreen;
