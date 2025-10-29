import React from 'react';
import { HomeIcon, NoteIcon, StarIcon, UserIcon } from './Icons';
import { useAppContext } from '../context/AppContext';
import { Screen } from '../types';

const BottomNavBar: React.FC = () => {
    const { state, dispatch } = useAppContext();

    const navItems: { screen: Screen; label: string; icon: React.FC<any> }[] = [
        { screen: 'home', label: 'Home', icon: HomeIcon },
        { screen: 'notes', label: 'Notes', icon: NoteIcon },
        { screen: 'testimonials', label: 'Reviews', icon: StarIcon },
        { screen: 'profile', label: 'Profile', icon: UserIcon },
    ];

    return (
        <div className="bg-white/95 backdrop-blur-sm shadow-[0_-5px_20px_-5px_rgba(0,0,0,0.1)] rounded-t-2xl sticky bottom-0">
            <div className="max-w-4xl mx-auto flex justify-around items-center p-2">
                {navItems.map(({ screen, label, icon: Icon }) => {
                    const isActive = state.activeScreen === screen;
                    return (
                        <button
                            key={screen}
                            onClick={() => dispatch({ type: 'SET_SCREEN', payload: screen })}
                            className={`flex flex-col items-center justify-center p-2 rounded-lg transition-colors duration-200 w-20 ${
                                isActive ? 'text-blue-600' : 'text-gray-500 hover:text-blue-500'
                            }`}
                        >
                            <Icon className="w-6 h-6 mb-1" />
                            <span className="text-xs font-medium">{label}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default BottomNavBar;