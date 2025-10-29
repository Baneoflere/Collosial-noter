import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import Header from '../components/Header';
import { getNoteById } from '../services/storageService';
import { 
    ShareUpIcon, DocumentTextIcon, MicrophoneIcon,
    WhatsappIcon, SlackIcon, NotionIcon, GoogleDriveIcon, 
    GoogleDocsIcon, LinkedInIcon, SkypeIcon, ClipboardDocumentIcon
} from '../components/Icons';

type ExportFormat = 'text' | 'markdown' | 'pdf';

const ShareTargetButton: React.FC<{ icon: React.FC<any>, label: string, onClick?: () => void }> = ({ icon: Icon, label, onClick }) => (
    <button 
        className="flex items-center justify-center px-4 py-2 space-x-2 bg-black/20 hover:bg-black/30 rounded-full transition-all duration-200 transform hover:scale-105 active:scale-95" 
        onClick={onClick ? onClick : () => alert(`Sharing to ${label} is not implemented yet.`)}
    >
        <Icon className="w-5 h-5 text-white" />
        <span className="font-semibold text-white text-sm">{label}</span>
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

const FormatButton: React.FC<{ format: ExportFormat, label: string, selectedFormat: ExportFormat, setFormat: (format: ExportFormat) => void, disabled?: boolean }> = ({ format, label, selectedFormat, setFormat, disabled }) => {
    const isSelected = format === selectedFormat;
    return (
        <button
            onClick={() => {
                if (disabled) {
                    alert('PDF export is a premium feature coming soon!');
                } else {
                    setFormat(format);
                }
            }}
            disabled={disabled}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all duration-200 border
                ${isSelected ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'}
                ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
            `}
        >
            {label}
        </button>
    );
};


const ShareScreen: React.FC = () => {
    const { state, dispatch } = useAppContext();
    const [includeSummary, setIncludeSummary] = useState(true);
    const [includeTranscript, setIncludeTranscript] = useState(false);
    const [exportFormat, setExportFormat] = useState<ExportFormat>('text');

    const note = getNoteById(state.selectedNoteId!);

    if (!note) {
        return (
            <div className="p-4 text-white">
                <p>Note not found. Please go back.</p>
                <button onClick={() => dispatch({ type: 'SET_SCREEN', payload: 'notes' })}>Back to Notes</button>
            </div>
        );
    }

    const getShareText = () => {
        let text = '';
        const title = note.title;
        const summary = note.summary;
        const transcript = note.transcript;

        if (exportFormat === 'markdown') {
            text += `# Note: ${title}\n\n`;
            if (includeSummary) {
                text += `## Summary\n\n${summary}\n\n`;
            }
            if (includeTranscript) {
                if (includeSummary) text += '---\n\n';
                text += `## Transcript\n\n${transcript}`;
            }
        } else { // 'text'
            text += `Note: ${title}\n\n`;
            if (includeSummary) {
                text += `--- SUMMARY ---\n${summary}\n\n`;
            }
            if (includeTranscript) {
                text += `--- TRANSCRIPT ---\n${transcript}`;
            }
        }
        return text.trim();
    };
    
    const handleShare = async () => {
        if (!includeSummary && !includeTranscript) {
            alert("Please select at least one item to share.");
            return;
        }
        const shareText = getShareText();
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
           handleCopyToClipboard();
        }
    };

    const handleCopyToClipboard = async () => {
        if (!includeSummary && !includeTranscript) {
            alert("Please select at least one item to copy.");
            return;
        }
        const shareText = getShareText();
        try {
            await navigator.clipboard.writeText(shareText);
            alert('Note content copied to clipboard!');
        } catch (err) {
            console.error('Failed to copy text: ', err);
            alert('Could not copy note to clipboard.');
        }
    };

    const shareTargets = [
        { label: 'Copy', icon: ClipboardDocumentIcon, onClick: handleCopyToClipboard },
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
                    <div className="flex flex-wrap justify-center gap-3 mb-8">
                        {shareTargets.map(target => (
                             <ShareTargetButton key={target.label} label={target.label} icon={target.icon} onClick={target.onClick} />
                        ))}
                    </div>
                </div>

                <div className="flex-shrink-0 max-w-sm mx-auto w-full">
                    <div className="bg-white rounded-2xl p-4 shadow-lg mb-4">
                        <h3 className="font-semibold text-gray-600 mb-4 text-left">Which would you like to export?</h3>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <div className={`flex items-center transition-all duration-300 ${includeSummary ? 'opacity-100' : 'opacity-50'}`}>
                                    <MicrophoneIcon className={`w-6 h-6 mr-3 transition-colors ${includeSummary ? 'text-blue-600' : 'text-gray-500'}`}/>
                                    <span className={`font-medium transition-colors ${includeSummary ? 'text-gray-800' : 'text-gray-500'}`}>Summary</span>
                                </div>
                                <ToggleSwitch enabled={includeSummary} setEnabled={setIncludeSummary} />
                            </div>
                            <div className="flex justify-between items-center">
                                <div className={`flex items-center transition-all duration-300 ${includeTranscript ? 'opacity-100' : 'opacity-50'}`}>
                                    <DocumentTextIcon className={`w-6 h-6 mr-3 transition-colors ${includeTranscript ? 'text-blue-600' : 'text-gray-500'}`}/>
                                    <span className={`font-medium transition-colors ${includeTranscript ? 'text-gray-800' : 'text-gray-500'}`}>Transcript</span>
                                </div>
                                <ToggleSwitch enabled={includeTranscript} setEnabled={setIncludeTranscript} />
                            </div>
                        </div>

                        <div className="border-t border-gray-200 my-4" />
                        <h3 className="font-semibold text-gray-600 mb-3 text-left">Export Format</h3>
                        <div className="flex flex-wrap gap-2">
                            <FormatButton format="text" label="Plain Text" selectedFormat={exportFormat} setFormat={setExportFormat} />
                            <FormatButton format="markdown" label="Markdown" selectedFormat={exportFormat} setFormat={setExportFormat} />
                            <FormatButton format="pdf" label="PDF" selectedFormat={exportFormat} setFormat={setExportFormat} disabled />
                        </div>
                    </div>

                    <button 
                        onClick={handleShare}
                        className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-4 px-4 rounded-full flex items-center justify-center text-lg shadow-md transition-transform active:scale-95">
                        <ShareUpIcon className="w-6 h-6 mr-2" />
                        Share
                    </button>
                </div>
            </main>
        </div>
    );
};

export default ShareScreen;