import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import Header from '../components/Header';
import { ClipboardDocumentIcon, CheckIcon, CurrencyDollarIcon, UserPlusIcon, LinkIcon } from '../components/Icons';

const StatCard: React.FC<{ icon: React.FC<any>, value: string, label: string, color: string }> = ({ icon: Icon, value, label, color }) => (
    <div className="bg-gray-800/70 backdrop-blur-sm p-4 rounded-xl flex items-center space-x-4 border border-white/10">
        <div className={`p-3 rounded-full ${color}`}>
            <Icon className="w-6 h-6 text-white" />
        </div>
        <div>
            <p className="text-2xl font-bold text-white">{value}</p>
            <p className="text-sm text-gray-400">{label}</p>
        </div>
    </div>
);

const AffiliateScreen: React.FC = () => {
    const { dispatch } = useAppContext();
    const [linkCopied, setLinkCopied] = useState(false);
    
    // In a real app, this would be fetched from a backend
    const affiliateLink = "https://nota.ai/join?ref=alexj123";

    const handleCopyLink = () => {
        navigator.clipboard.writeText(affiliateLink);
        setLinkCopied(true);
        setTimeout(() => setLinkCopied(false), 2000);
    };

    return (
        <div className="bg-gray-900 min-h-full text-white">
            <Header 
                title="Affiliate Program" 
                theme="gray" 
                showBackButton 
                onBack={() => dispatch({ type: 'SET_SCREEN', payload: 'profile' })} 
            />

            <main className="p-6 space-y-8">
                <section>
                    <h2 className="text-2xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400">Promote & Earn</h2>
                    <p className="text-gray-400">
                        Share your unique link and earn a 30% recurring commission for every new Pro subscriber you refer.
                    </p>
                </section>

                <section>
                    <h3 className="text-lg font-semibold mb-3 text-gray-200">Your Affiliate Link</h3>
                    <div className="flex items-center space-x-2">
                        <input 
                            type="text"
                            readOnly
                            value={affiliateLink}
                            className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-gray-300"
                        />
                        <button 
                            onClick={handleCopyLink}
                            className={`p-3 rounded-lg transition-colors ${linkCopied ? 'bg-green-600' : 'bg-indigo-600 hover:bg-indigo-700'}`}
                        >
                            {linkCopied ? <CheckIcon className="w-6 h-6 text-white" /> : <ClipboardDocumentIcon className="w-6 h-6 text-white" />}
                        </button>
                    </div>
                </section>

                <section>
                    <h3 className="text-lg font-semibold mb-3 text-gray-200">Your Earnings</h3>
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <StatCard icon={LinkIcon} value="1,402" label="Total Clicks" color="bg-blue-500" />
                        <StatCard icon={UserPlusIcon} value="78" label="Sign-ups" color="bg-green-500" />
                        <StatCard icon={CurrencyDollarIcon} value="$412.50" label="Total Earnings" color="bg-purple-500" />
                    </div>
                </section>

                <section>
                    <h3 className="text-lg font-semibold mb-3 text-gray-200">Promotional Banners</h3>
                    <div className="space-y-4">
                        <div>
                            <p className="text-sm text-gray-400 mb-2">Square Banner (500x500)</p>
                            <img src="https://images.unsplash.com/photo-1611162617213-6d22e4f2c8d5?q=80&w=500&h=500&auto=format&fit=crop" alt="Square promotional banner" className="rounded-lg w-full max-w-xs"/>
                        </div>
                        <div>
                            <p className="text-sm text-gray-400 mb-2">Horizontal Banner (728x90)</p>
                            <img src="https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=728&h=90&auto=format&fit=crop" alt="Horizontal promotional banner" className="rounded-lg w-full"/>
                        </div>
                    </div>
                </section>

                <div className="text-center pt-4">
                     <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg transition-colors">
                        Withdraw Earnings
                    </button>
                </div>
            </main>
        </div>
    );
};

export default AffiliateScreen;
