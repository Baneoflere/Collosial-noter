import React from 'react';
import { useAppContext } from './context/AppContext';
import BottomNavBar from './components/BottomNavBar';

// Import Screens
import OnboardingScreen from './screens/OnboardingScreen';
import HomeScreen from './screens/HomeScreen';
import RecordScreen from './screens/RecordScreen';
import NotesListScreen from './screens/NotesListScreen';
import NoteDetailScreen from './screens/NoteDetailScreen';
import ChatScreen from './screens/ChatScreen';
import TestimonialScreen from './screens/TestimonialScreen';
import ProfileScreen from './screens/ProfileScreen';
import ShareScreen from './screens/ShareScreen';
import GlobalLoader from './components/GlobalLoader';

const App: React.FC = () => {
  const { state } = useAppContext();

  const renderScreen = () => {
    switch (state.activeScreen) {
      case 'onboarding':
        return <OnboardingScreen />;
      case 'home':
        return <HomeScreen />;
      case 'record':
        return <RecordScreen />;
      case 'notes':
        return <NotesListScreen />;
      case 'note-detail':
        return <NoteDetailScreen />;
      case 'chat':
        return <ChatScreen />;
      case 'testimonials':
        return <TestimonialScreen />;
      case 'profile':
        return <ProfileScreen />;
      case 'share':
        return <ShareScreen />;
      default:
        return <HomeScreen />;
    }
  };

  const screenBackgroundColor = () => {
    switch (state.activeScreen) {
        case 'home':
        case 'record':
            return 'bg-[#0D2544]';
        case 'chat':
            return 'bg-green-600';
        case 'notes':
        case 'note-detail':
            return 'bg-yellow-500';
        case 'testimonials':
        case 'share':
            return 'bg-orange-500';
        default:
            return 'bg-gray-100';
    }
  }

  const showNavBar = !['onboarding', 'record', 'share'].includes(state.activeScreen);

  return (
    <div className={`w-full h-screen flex flex-col font-sans antialiased ${screenBackgroundColor()}`}>
      {state.loadingMessage && <GlobalLoader message={state.loadingMessage} />}
      <div className="flex-1 overflow-y-auto">
        {renderScreen()}
      </div>
      {showNavBar && <BottomNavBar />}
    </div>
  );
};

export default App;