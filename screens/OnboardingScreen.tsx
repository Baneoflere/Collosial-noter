import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { ArrowRightIcon, CheckIcon, BrainCircuitIcon, SparkleMagicIcon, ChatBubbleIdeaIcon } from '../components/Icons';

const onboardingSteps = [
    {
        icon: BrainCircuitIcon,
        title: "Your Second Brain Awaits",
        description: "Effortlessly capture everything—from fleeting ideas to important meetings. Our best-in-class transcription means you'll never miss a detail.",
    },
    {
        icon: SparkleMagicIcon,
        title: "Transform Noise into Signal",
        description: "Go from long transcripts to crystal-clear summaries and action items in seconds. Gemini AI finds what matters, so you can focus on the work.",
    },
    {
        icon: ChatBubbleIdeaIcon,
        title: "Dialogue with Your Data",
        description: "Don't just store information, interact with it. Chat with your notes to uncover insights, create study sets, and unlock your full potential.",
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

    const { icon: Icon, title, description } = onboardingSteps[step];

    return (
        <div className="flex flex-col h-full bg-gray-900 text-white p-8 justify-between">
            <header>
                <h1 className="text-3xl font-bold text-blue-400">Unlock Your</h1>
                <h2 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-300">Second Brain</h2>
            </header>

            <div className="flex flex-col items-center text-center">
                <div className="w-24 h-24 mb-6 text-teal-300">
                    <Icon className="w-full h-full" />
                </div>
                <h3 className="text-2xl font-bold mb-2">{title}</h3>
                <p className="text-gray-300 max-w-xs">{description}</p>
            </div>
            
            <div className="flex flex-col items-center">
                 <div className="flex space-x-2 mb-8">
                    {onboardingSteps.map((_, index) => (
                        <div
                            key={index}
                            className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                                index === step ? 'bg-blue-400 w-8' : 'bg-gray-600'
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