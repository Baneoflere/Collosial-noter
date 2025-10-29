import React from 'react';
import Header from '../components/Header';
import { UserIcon } from '../components/Icons';

const ProfileScreen: React.FC = () => {
    return (
         <div className="bg-gray-100 min-h-full">
            <Header title="Profile" theme="gray" />
            <main className="p-4">
                <div className="bg-white rounded-xl shadow-md p-6 text-center">
                    <div className="mx-auto w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center mb-4">
                        <UserIcon className="w-16 h-16 text-gray-500"/>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800">User Profile</h2>
                    <p className="text-gray-500">This section is a placeholder for user settings, subscription status, and more.</p>
                </div>
            </main>
        </div>
    );
};

export default ProfileScreen;