import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import Header from '../components/Header';
import { getNoteById } from '../services/storageService';
import { 
    UploadIcon, DocumentTextIcon, MicrophoneIcon,
    WhatsappIcon, SlackIcon, NotionIcon, GoogleDriveIcon, 
    GoogleDocsIcon, LinkedInIcon, SkypeIcon 
} from '../components/Icons';

const ShareButton: React.FC<{ icon: React.FC<any>, label: string }> = ({ icon: Icon, label }) => (
    <button className="flex flex-col items-center justify-center p-2 space-y-2 bg-white/20 hover:bg-white/30 rounded-xl transition-colors" onClick={() => alert(`Sharing to ${label} is not implemented yet.`)}>
        <div className="p-3 bg-white/80 rounded-full flex items-center justify-center w-12 h-12">
             <Icon className="w-8 h-8 text-orange-800" />
        </div>
        <span className="text-xs font-semibold text-white text-center">{label}</span>
    </button>
);

const ToggleSwitch: React.FC<{ enabled: boolean, setEnabled: (enabled: boolean) => void }> = ({ enabled, setEnabled }) => (
    <button
      onClick={() => setEnabled(!enabled)}
      className={`${
        enabled ? 'bg-blue-600' : 'bg-gray-300'
      } relative inline-flex items-center h-6 rounded-full w-11 transition-colors duration-200 ease-in-out focus:outline-none`}
    >
      <span
        className={`${
          enabled ? 'translate-x-6' : 'translate-x-1'
        } inline-block w-4 h-4 transform bg-white rounded-full transition-transform duration-200 ease-in-out`}
      />
    </button>
);

const ShareScreen: React.FC = () => {
    const { state, dispatch } = useAppContext();
    const [includeSummary, setIncludeSummary] = useState(true);
    const [includeTranscript, setIncludeTranscript] = useState(false);
    
    const note = getNoteById(state.selectedNoteId!);

    if (!note) {
        return (
            <div className="p-4 text-white">
                <p>Note not found. Please go back.</p>
                <button onClick={() => dispatch({ type: 'SET_SCREEN', payload: 'notes' })}>Back to Notes</button>
            </div>
        );
    }
    
    const handleShare = async () => {
        if (!includeSummary && !includeTranscript) {
            alert("Please select at least one item to share.");
            return;
        }

        let shareText = `Note: ${note.title}\n\n`;
        if (includeSummary) {
            shareText += `--- SUMMARY ---\n${note.summary}\n\n`;
        }
        if (includeTranscript) {
            shareText += `--- TRANSCRIPT ---\n${note.transcript}`;
        }

        // The user prompt mentioned the 'share_plus' plugin, which is for Flutter.
        // The equivalent for the web is the Web Share API (`navigator.share`).
        if(navigator.share) {
            try {
                await navigator.share({
                    title: `Note: ${note.title}`,
                    text: shareText,
                });
            } catch (error) {
                console.error('Error sharing:', error);
                alert("Could not share the note at this time.");
            }
        } else {
            // Fallback for browsers that don't support the Web Share API
            try {
                await navigator.clipboard.writeText(shareText);
                alert('Note content copied to clipboard!');
            } catch (err) {
                console.error('Failed to copy text: ', err);
                alert('Could not copy note to clipboard.');
            }
        }
    };

    const shareTargets = [
        { label: 'Whatsapp', icon: WhatsappIcon },
        { label: 'Slack', icon: SlackIcon },
        { label: 'Notion', icon: NotionIcon },
        { label: 'Google Drive', icon: GoogleDriveIcon },
        { label: 'Google Docs', icon: GoogleDocsIcon },
        { label: 'LinkedIn', icon: LinkedInIcon },
        { label: 'Skype', icon: SkypeIcon },
    ];
    
    return (
        <div className="bg-orange-500 min-h-full flex flex-col">
            <Header title="Share Your Notes" theme="orange" showBackButton onBack={() => dispatch({ type: 'SET_SCREEN', payload: 'note-detail' })} />
            <main className="flex-1 p-4 flex flex-col justify-between">
                <div>
                     <div className="flex justify-center -space-x-4 mb-6">
                        <img className="w-12 h-12 border-2 border-white rounded-full" src="https://i.pravatar.cc/150?img=1" alt="User 1"/>
                        <img className="w-12 h-12 border-2 border-white rounded-full" src="https://i.pravatar.cc/150?img=2" alt="User 2"/>
                        <img className="w-12 h-12 border-2 border-white rounded-full" src="https://i.pravatar.cc/150?img=3" alt="User 3"/>
                    </div>
                    <div className="grid grid-cols-4 gap-4 mb-8">
                        {shareTargets.map(target => (
                             <ShareButton key={target.label} label={target.label} icon={target.icon} />
                        ))}
                    </div>
                </div>

                <div className="flex-shrink-0">
                    <div className="bg-white rounded-2xl p-4 shadow-lg mb-4">
                        <h3 className="font-semibold text-gray-600 mb-4 text-center">Export Options</h3>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center">
                                    <MicrophoneIcon className="w-6 h-6 text-gray-500 mr-3"/>
                                    <span className="font-medium text-gray-800">Summary</span>
                                </div>
                                <ToggleSwitch enabled={includeSummary} setEnabled={setIncludeSummary} />
                            </div>
                            <div className="flex justify-between items-center">
                                <div className="flex items-center">
                                    <DocumentTextIcon className="w-6 h-6 text-gray-500 mr-3"/>
                                    <span className="font-medium text-gray-800">Transcript</span>
                                </div>
                                <ToggleSwitch enabled={includeTranscript} setEnabled={setIncludeTranscript} />
                            </div>
                        </div>
                    </div>

                    <button 
                        onClick={handleShare}
                        className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-4 px-4 rounded-full flex items-center justify-center text-lg shadow-md transition-transform active:scale-95">
                        <UploadIcon className="w-6 h-6 mr-2" />
                        Share
                    </button>
                </div>
            </main>
        </div>
    );
};

export default ShareScreen;