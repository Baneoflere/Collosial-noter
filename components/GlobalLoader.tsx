import React from 'react';

const GlobalLoader: React.FC<{ message: string }> = ({ message }) => {
    return (
        <div className="fixed inset-0 bg-black/70 flex flex-col items-center justify-center z-50 backdrop-blur-sm">
            <div className="flex space-x-2">
                <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
            </div>
            <p className="text-white mt-4 text-lg font-medium">{message}</p>
        </div>
    );
};

export default GlobalLoader;