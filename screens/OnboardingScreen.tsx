import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { ArrowRightIcon, CheckIcon } from '../components/Icons';

const onboardingSteps = [
    {
        icon: '🎙️',
        title: "Record & Transcribe",
        description: "Capture meetings, lectures, and thoughts effortlessly. Get instant, accurate transcripts.",
    },
    {
        icon: '✨',
        title: "AI Summaries",
        description: "Let Gemini create concise summaries and pull out key action items for you.",
    },
    {
        icon: '💬',
        title: "Chat with Your Notes",
        description: "Ask questions and get instant answers from your notes, powered by AI.",
    }
];

const OnboardingScreen: React.FC = () => {
    const { dispatch } = useAppContext();
    const [step, setStep] = useState(0);

    const handleNext = () => {
        if (step < onboardingSteps.length - 1) {
            setStep(step + 1);
        } else {
            dispatch({ type: 'COMPLETE_ONBOARDING' });
        }
    };

    return (
        <div className="flex flex-col h-full bg-gray-900 text-white p-8 justify-between">
            <div>
                <h1 className="text-3xl font-bold text-blue-400">Welcome to</h1>
                <h2 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-300">Smart Noter</h2>
            </div>

            <div className="flex flex-col items-center text-center">
                <div className="text-7xl mb-6">{onboardingSteps[step].icon}</div>
                <h3 className="text-2xl font-bold mb-2">{onboardingSteps[step].title}</h3>
                <p className="text-gray-300 max-w-xs">{onboardingSteps[step].description}</p>
            </div>
            
            <div className="flex flex-col items-center">
                 <div className="flex space-x-2 mb-8">
                    {onboardingSteps.map((_, index) => (
                        <div
                            key={index}
                            className={`w-2 h-2 rounded-full transition-all duration-300 ${
                                index === step ? 'bg-blue-400 w-6' : 'bg-gray-600'
                            }`}
                        />
                    ))}
                </div>
                <button
                    onClick={handleNext}
                    className="w-full flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-4 rounded-full transition-transform duration-200 active:scale-95"
                >
                    {step < onboardingSteps.length - 1 ? (
                        <>
                            <span className="mr-2">Continue</span>
                            <ArrowRightIcon className="w-5 h-5" />
                        </>
                    ) : (
                        <>
                            <span className="mr-2">Get Started</span>
                            <CheckIcon className="w-5 h-5" />
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};

export default OnboardingScreen;