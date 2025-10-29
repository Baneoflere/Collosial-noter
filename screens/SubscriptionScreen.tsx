import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { 
    CloseIcon, 
    InformationCircleIcon, 
    MicrophoneIcon, 
    SparklesIcon, 
    CloudIcon, 
    UploadIcon,
    CheckIcon
} from '../components/Icons';

type Plan = 'yearly' | 'onetime';

const features = [
    {
        icon: MicrophoneIcon,
        title: "Unlimited Transcription",
        description: "Record and transcribe without limits from meetings, lectures, and voice notes.",
    },
    {
        icon: SparklesIcon,
        title: "Advanced AI Chat",
        description: "Ask deeper questions and get more insightful answers from your notes.",
    },
    {
        icon: CloudIcon,
        title: "Cloud Sync & Backup",
        description: "Securely access your notes across all your devices, anytime.",
    },
    {
        icon: UploadIcon,
        title: "Export to All Formats",
        description: "Share your notes as PDF, DOCX, TXT, and more.",
    }
];

const FeatureCard: React.FC<{ icon: React.FC<any>, title: string, description: string }> = ({ icon: Icon, title, description }) => (
    <div className="flex-shrink-0 w-40 bg-gray-800/60 backdrop-blur-sm rounded-2xl p-4 text-center border border-white/10">
        <div className="w-12 h-12 mx-auto mb-3 bg-blue-500/20 rounded-xl flex items-center justify-center">
            <Icon className="w-7 h-7 text-blue-300" />
        </div>
        <h3 className="font-bold text-white text-base mb-1">{title}</h3>
        <p className="text-gray-400 text-xs">{description}</p>
    </div>
);

const SubscriptionScreen: React.FC = () => {
    const { dispatch } = useAppContext();
    const [selectedPlan, setSelectedPlan] = useState<Plan>('yearly');

    const handleCtaClick = () => {
        if (selectedPlan === 'yearly') {
            alert('Starting 7-day free trial...\n(This is a demo, no subscription will be started)');
        } else {
            alert('Processing one-time purchase...\n(This is a demo, no payment will be processed)');
        }
        dispatch({ type: 'SET_SCREEN', payload: 'profile' });
    }

    return (
        <div className="relative flex flex-col h-full bg-gray-900 text-white overflow-y-auto">
            <img 
                src="https://images.unsplash.com/photo-1554147090-e1221a04a025?q=80&w=2070&auto=format&fit=crop" 
                alt="Abstract background"
                className="absolute inset-0 w-full h-full object-cover opacity-20"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-gray-900/50 to-gray-900" />
            
            <header className="relative flex justify-between items-center p-4 z-10">
                <button onClick={() => dispatch({ type: 'SET_SCREEN', payload: 'profile' })} className="p-2 rounded-full bg-black/30 hover:bg-black/50 transition-colors">
                    <CloseIcon className="w-6 h-6" />
                </button>
                <button onClick={() => alert('Subscription Info')} className="p-2 rounded-full bg-black/30 hover:bg-black/50 transition-colors">
                    <InformationCircleIcon className="w-6 h-6" />
                </button>
            </header>

            <main className="relative flex-1 flex flex-col p-6 z-10">
                <div className="text-center mb-6">
                    <h1 className="text-3xl font-extrabold flex items-center justify-center space-x-2">
                        <span>Smart Noter</span>
                        <span className="bg-gradient-to-r from-blue-400 to-teal-300 text-transparent bg-clip-text">Pro</span>
                    </h1>
                    <p className="text-lg text-gray-300 mt-1">Unlock All Features</p>
                </div>

                <div className="relative mb-8">
                    <div className="flex space-x-4 overflow-x-auto pb-4 -mx-6 px-6 scrollbar-hide">
                        {features.map(feature => (
                            <FeatureCard key={feature.title} {...feature} />
                        ))}
                    </div>
                </div>

                <div className="space-y-3 mb-6">
                    <div 
                        onClick={() => setSelectedPlan('yearly')}
                        className={`relative p-4 border-2 rounded-xl cursor-pointer transition-all ${selectedPlan === 'yearly' ? 'border-blue-500 bg-blue-500/20' : 'border-gray-600 bg-gray-800/50'}`}
                    >
                        <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full -rotate-12">BEST VALUE</div>
                        <div className="flex items-center">
                            <div className={`w-6 h-6 rounded-full border-2 flex-shrink-0 mr-4 flex items-center justify-center ${selectedPlan === 'yearly' ? 'border-blue-500 bg-blue-500' : 'border-gray-400'}`}>
                                {selectedPlan === 'yearly' && <CheckIcon className="w-4 h-4 text-white" />}
                            </div>
                            <div>
                                <h3 className="font-bold text-lg">7 Days Free Trial</h3>
                                <p className="text-gray-300">then $29.99/year <span className="line-through text-gray-500">$49.99</span></p>
                            </div>
                        </div>
                    </div>
                    <div 
                         onClick={() => setSelectedPlan('onetime')}
                         className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${selectedPlan === 'onetime' ? 'border-blue-500 bg-blue-500/20' : 'border-gray-600 bg-gray-800/50'}`}
                    >
                         <div className="flex items-center">
                             <div className={`w-6 h-6 rounded-full border-2 flex-shrink-0 mr-4 flex items-center justify-center ${selectedPlan === 'onetime' ? 'border-blue-500 bg-blue-500' : 'border-gray-400'}`}>
                                {selectedPlan === 'onetime' && <CheckIcon className="w-4 h-4 text-white" />}
                            </div>
                            <div>
                                <h3 className="font-bold text-lg">One-Time Purchase</h3>
                                <p className="text-gray-300">$79.99 to unlock forever</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-auto space-y-3">
                    <button
                        onClick={handleCtaClick}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-full text-lg shadow-lg transition-transform active:scale-95"
                    >
                        {selectedPlan === 'yearly' ? 'Start 7 Days Free Trial' : 'Unlock Forever for $79.99'}
                    </button>
                    <button className="w-full text-center text-gray-400 hover:text-white text-sm py-2">Already a Pro member?</button>
                    <p className="text-xs text-gray-500 text-center px-4">
                        Subscription is billed annually and automatically renews. You can cancel anytime.
                        A one-time purchase is not a subscription and does not renew.
                    </p>
                </div>
            </main>
            <style>{`.scrollbar-hide::-webkit-scrollbar { display: none; } .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }`}</style>
        </div>
    );
};

export default SubscriptionScreen;