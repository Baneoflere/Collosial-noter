import React from 'react';
import Header from '../components/Header';
import { UserIcon, Cog6ToothIcon, BellIcon, SunIcon, QuestionMarkCircleIcon, ChevronRightIcon, ArrowRightOnRectangleIcon } from '../components/Icons';

const SettingsItem: React.FC<{ icon: React.FC<any>, text: string }> = ({ icon: Icon, text }) => (
    <button onClick={() => alert(`${text} clicked!`)} className="w-full flex items-center text-left p-4 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0">
        <div className="p-2 bg-gray-100 rounded-lg mr-4">
            <Icon className="w-6 h-6 text-gray-600" />
        </div>
        <span className="flex-1 font-semibold text-gray-700">{text}</span>
        <ChevronRightIcon className="w-5 h-5 text-gray-400" />
    </button>
);

const ProfileScreen: React.FC = () => {
    return (
         <div className="bg-gray-100 min-h-full">
            <Header title="Profile" theme="gray" />
            <main className="p-4 space-y-6 pb-8">
                <div className="bg-white rounded-xl shadow-md p-6 flex items-center space-x-4">
                    <img src="https://i.pravatar.cc/150?img=5" alt="User Avatar" className="w-20 h-20 rounded-full" />
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">Alex Johnson</h2>
                        <p className="text-gray-500">alex.j@example.com</p>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-md p-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <h3 className="text-lg font-bold text-gray-800">Subscription</h3>
                            <p className="text-green-600 font-semibold">Premium Plan</p>
                        </div>
                        <button className="bg-blue-100 text-blue-700 font-semibold px-4 py-2 rounded-lg hover:bg-blue-200 transition-colors">
                            Manage
                        </button>
                    </div>
                </div>
                
                <div className="bg-white rounded-xl shadow-md overflow-hidden">
                    <SettingsItem icon={Cog6ToothIcon} text="Account Settings" />
                    <SettingsItem icon={BellIcon} text="Notifications" />
                    <SettingsItem icon={SunIcon} text="Appearance" />
                    <SettingsItem icon={QuestionMarkCircleIcon} text="Help & Support" />
                </div>

                <div className="text-center">
                    <button className="flex items-center justify-center w-full max-w-xs mx-auto bg-red-50 hover:bg-red-100 text-red-600 font-bold py-3 px-4 rounded-lg transition-colors">
                        <ArrowRightOnRectangleIcon className="w-6 h-6 mr-2" />
                        Logout
                    </button>
                </div>
            </main>
        </div>
    );
};

export default ProfileScreen;