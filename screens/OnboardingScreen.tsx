import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { ArrowRightIcon, CheckIcon, CloudIcon, SparkleMagicIcon, ChatBubbleIdeaIcon, BookOpenIcon, QuillIcon } from '../components/Icons';

const onboardingSteps = [
    {
        icon: CloudIcon,
        title: "Capture Everything, Effortlessly",
        description: "Record lectures or meetings, upload audio, video, or text files. We'll transcribe it all with best-in-class accuracy.",
        imageUrl: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2071&auto=format&fit=crop",
    },
    {
        icon: SparkleMagicIcon,
        title: "Instant Clarity with AI",
        description: "Go from hours of recordings to concise summaries, key takeaways, and actionable to-do lists in seconds. Gemini AI finds what matters most.",
        imageUrl: "https://images.unsplash.com/photo-1677756119517-756a188d2d94?q=80&w=2070&auto=format&fit=crop",
    },
    {
        icon: ChatBubbleIdeaIcon,
        title: "Chat with Your Knowledge",
        description: "Don't just read your notes, interact with them. Ask questions, get explanations, and uncover connections you never saw before.",
        imageUrl: "https://images.unsplash.com/photo-1516116216624-53e6973bea12?q=80&w=2070&auto=format&fit=crop",
    },
    {
        icon: BookOpenIcon,
        title: "Supercharge Your Studies",
        description: "Automatically generate quizzes and flashcards from any note. Turn your learning materials into interactive study sessions and master any subject.",
        imageUrl: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?q=80&w=1973&auto=format&fit=crop",
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

    const { icon: Icon, title, description, imageUrl } = onboardingSteps[step];

    return (
        <div className="relative flex flex-col h-full bg-gray-900 text-white justify-between overflow-hidden">
            <img src={imageUrl} alt="Onboarding background" className="absolute inset-0 w-full h-full object-cover opacity-30 transition-opacity duration-1000" key={step} />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/70 to-transparent" />

            <div className="relative z-10 flex flex-col h-full justify-between p-8">
                <header className="flex items-center space-x-3">
                    <QuillIcon className="w-10 h-10 text-blue-400" />
                    <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-300">Nota AI</h1>
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
        </div>
    );
};

export default OnboardingScreen;