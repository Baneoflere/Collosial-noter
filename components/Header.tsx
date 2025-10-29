import React from 'react';
import { ArrowLeftIcon } from './Icons';

interface HeaderProps {
    title: string;
    theme: 'blue' | 'green' | 'orange' | 'yellow' | 'gray';
    showBackButton?: boolean;
    onBack?: () => void;
}

const Header: React.FC<HeaderProps> = ({ title, theme, showBackButton = false, onBack }) => {
    
    const themeClasses = {
        blue: 'text-white',
        green: 'text-white',
        orange: 'text-white',
        yellow: 'text-white',
        gray: 'text-gray-800',
    };

    return (
        <header className={`p-4 pt-8 ${themeClasses[theme]} flex items-center`}>
            {showBackButton && (
                <button onClick={onBack} className="mr-2 p-2 rounded-full hover:bg-black/10">
                    <ArrowLeftIcon className="w-6 h-6" />
                </button>
            )}
            <h1 className="text-2xl font-bold truncate">{title}</h1>
        </header>
    );
};

export default Header;