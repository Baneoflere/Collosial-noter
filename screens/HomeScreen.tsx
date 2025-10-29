import React, { useRef, useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { ChevronRightIcon, MicrophoneIcon, PlusIcon, PlayIcon, PdfIcon, YoutubeIcon, LinkIcon, TextIcon, CloseIcon } from '../components/Icons';
import { Note } from '../types';
import { transcribeAudio, generateSummaryAndActionPoints } from '../services/aiService';

type ActionButtonProps = {
    icon: React.ElementType;
    title: string;
    subtitle: string;
    onClick?: () => void;
    disabled?: boolean;
};

const ActionButton: React.FC<ActionButtonProps> = ({ icon: Icon, title, subtitle, onClick, disabled = false }) => (
    <button
        onClick={onClick}
        disabled={disabled}
        className={`flex items-center w-full text-left p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
        <div className="p-3 bg-gray-100 rounded-lg mr-4">
            <Icon className="w-6 h-6 text-gray-700" />
        </div>
        <div className="flex-1">
            <h3 className="font-semibold text-gray-800">{title}</h3>
            <p className="text-sm text-gray-500">{subtitle}</p>
        </div>
        {!disabled && <ChevronRightIcon className="w-5 h-5 text-gray-400" />}
    </button>
);

const TemplateCard: React.FC<{ title: string; imageUrl: string }> = ({ title, imageUrl }) => (
    <div className="relative rounded-xl overflow-hidden shadow-lg aspect-square group cursor-pointer" onClick={() => alert(`${title} template coming soon!`)}>
        <img src={imageUrl} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        <div className="absolute inset-0 bg-black/40"></div>
        <p className="absolute bottom-3 left-3 font-bold text-white text-lg">{title}</p>
    </div>
);

const Modal: React.FC<{ children: React.ReactNode; title: string; onClose: () => void; }> = ({ children, title, onClose }) => (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
        <div className="bg-white rounded-2xl p-6 shadow-xl w-full max-w-md relative animate-slide-up">
            <button onClick={onClose} className="absolute top-3 right-3 p-2 rounded-full hover:bg-gray-200">
                <CloseIcon className="w-5 h-5 text-gray-600" />
            </button>
            <h2 className="text-xl font-bold mb-4 text-gray-800">{title}</h2>
            {children}
        </div>
        <style>{`
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        .animate-fade-in { animation: fade-in 0.2s ease-out forwards; }
        @keyframes slide-up { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        .animate-slide-up { animation: slide-up 0.3s ease-out forwards; }
        `}</style>
    </div>
);


const HomeScreen: React.FC = () => {
    const { dispatch } = useAppContext();
    const audioInputRef = useRef<HTMLInputElement>(null);
    const textInputRef = useRef<HTMLInputElement>(null);

    const [isYouTubeModalOpen, setIsYouTubeModalOpen] = useState(false);
    const [youTubeUrl, setYouTubeUrl] = useState('');

    const processAndCreateNote = async (transcript: string, titlePrefix: string) => {
        dispatch({ type: 'SET_LOADING', payload: 'Generating summary...' });
        const { summary, actionPoints } = await generateSummaryAndActionPoints(transcript);
        
        const newNote: Note = {
            id: Date.now().toString(),
            title: summary.split(' ').slice(0, 5).join(' ') || `${titlePrefix} Note`,
            createdAt: new Date().toISOString(),
            summary,
            transcript,
            actionPoints: actionPoints.map((ap, index) => ({ ...ap, id: index.toString(), completed: false })),
            chatHistory: [],
            color: 'blue',
        };

        dispatch({ type: 'ADD_NOTE', payload: newNote });
        dispatch({ type: 'SET_SELECTED_NOTE_ID', payload: newNote.id });
        dispatch({ type: 'SET_LOADING', payload: null });
        dispatch({ type: 'SET_SCREEN', payload: 'note-detail' });
    };

    const fileToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve((reader.result as string).split(',')[1]);
            reader.onerror = error => reject(error);
        });
    };

    const handleAudioFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        dispatch({ type: 'SET_LOADING', payload: 'Reading audio file...' });
        const base64Audio = await fileToBase64(file);
        
        dispatch({ type: 'SET_LOADING', payload: 'Transcribing audio...' });
        const transcript = await transcribeAudio(base64Audio, file.type);

        if (transcript) {
            await processAndCreateNote(transcript, "Transcribed");
        } else {
            alert("Failed to transcribe audio. Please try again.");
            dispatch({ type: 'SET_LOADING', payload: null });
        }
        event.target.value = '';
    };

    const handleTextFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (file.type.startsWith('text/')) {
            dispatch({ type: 'SET_LOADING', payload: 'Reading text file...' });
            const text = await file.text();
            await processAndCreateNote(text, "Text File");
        } else if (file.type === 'application/pdf') {
            alert("PDF processing is not yet supported.");
        } else {
            alert("Unsupported file type.");
        }
         event.target.value = '';
    };

    const handleMeetingLinkClick = () => {
        alert("This feature is for demonstration only.\n\nIn a full-featured native app, this would connect to the meeting service (like Zoom or Google Meet) via their APIs or a bot, record the audio stream, and transcribe it in real-time.");
    };

    const handleYouTubeSubmit = async () => {
        const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/;
        if (!youtubeRegex.test(youTubeUrl)) {
            alert("Please enter a valid YouTube URL.");
            return;
        }

        setIsYouTubeModalOpen(false);
        dispatch({ type: 'SET_LOADING', payload: 'Extracting audio from YouTube... (Simulated)' });
        
        setTimeout(async () => {
            const mockTranscript = `This is a simulated transcript from the YouTube video at URL: ${youTubeUrl}.\n\nThe video discusses the importance of artificial intelligence in modern technology. It covers topics like machine learning, natural language processing, and computer vision. The speaker emphasizes how AI is transforming industries from healthcare to finance, and concludes by speculating on the future of AGI (Artificial General Intelligence).\n\nThis process in a real application would involve downloading the video's audio track and feeding it to a transcription model.`;
            await processAndCreateNote(mockTranscript, "YouTube Video");
            setYouTubeUrl('');
        }, 2500);
    };

    return (
        <div className="bg-[#0D2544] text-white overflow-y-auto">
            <input type="file" ref={audioInputRef} onChange={handleAudioFileSelect} accept="audio/*" className="hidden" />
            <input type="file" ref={textInputRef} onChange={handleTextFileSelect} accept=".txt,text/plain" className="hidden" />

            {isYouTubeModalOpen && (
                <Modal title="Paste YouTube URL" onClose={() => setIsYouTubeModalOpen(false)}>
                    <input 
                        type="text" 
                        value={youTubeUrl}
                        onChange={(e) => setYouTubeUrl(e.target.value)}
                        placeholder="https://www.youtube.com/watch?v=..."
                        className="w-full p-3 border border-gray-300 rounded-lg mb-4 text-gray-800"
                    />
                    <div className="flex justify-end space-x-3">
                        <button onClick={() => setIsYouTubeModalOpen(false)} className="px-5 py-2.5 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors">Cancel</button>
                        <button onClick={handleYouTubeSubmit} className="px-5 py-2.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors">Transcribe</button>
                    </div>
                </Modal>
            )}

            <div className="p-6 pt-12">
                <h1 className="text-4xl font-extrabold">Get Instant</h1>
                <h1 className="text-4xl font-extrabold mb-4">Notes</h1>
                <div className="flex space-x-2">
                    <span className="bg-pink-500/80 px-4 py-1.5 rounded-full text-sm font-semibold">Meetings</span>
                    <span className="bg-yellow-500/80 px-4 py-1.5 rounded-full text-sm font-semibold">Lectures</span>
                    <span className="bg-green-500/80 px-4 py-1.5 rounded-full text-sm font-semibold">Videos</span>
                </div>
            </div>

            <div className="bg-gray-100 p-6 rounded-t-3xl text-gray-800">
                <h2 className="text-xl font-bold mb-4">Get Started</h2>
                <div className="space-y-3">
                    <ActionButton icon={LinkIcon} title="Meeting Link" subtitle="Record & transcribe meetings" onClick={handleMeetingLinkClick} />
                    <ActionButton icon={MicrophoneIcon} title="Record Audio" subtitle="Record with your microphone" onClick={() => dispatch({ type: 'SET_SCREEN', payload: 'record' })} />
                    <ActionButton icon={PlayIcon} title="Upload Audio File" subtitle="Upload audio or video file" onClick={() => audioInputRef.current?.click()} />
                    <ActionButton icon={PdfIcon} title="Upload Text" subtitle="Upload PDFs & more" onClick={() => textInputRef.current?.click()} />
                    <ActionButton icon={YoutubeIcon} title="Paste YouTube Link" subtitle="Type or paste link" onClick={() => setIsYouTubeModalOpen(true)} />
                    <ActionButton icon={TextIcon} title="Type Manually" subtitle="Manually create a note" onClick={() => alert("Manual note creation coming soon!")} />
                </div>
            </div>
            
            <div className="bg-[#121212] p-6">
                 <h2 className="text-xl font-bold text-white mb-4">Start from template</h2>
                 <div className="grid grid-cols-2 gap-4">
                    <TemplateCard title="Lecture" imageUrl="https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=2070&auto=format&fit=crop" />
                    <TemplateCard title="Meeting" imageUrl="https://images.unsplash.com/photo-1573497491208-6b1acb260507?q=80&w=2070&auto=format&fit=crop" />
                    <TemplateCard title="PDF" imageUrl="https://images.unsplash.com/photo-1532012197267-da84d127e765?q=80&w=1887&auto=format&fit=crop" />
                    <TemplateCard title="YouTube video" imageUrl="https://images.unsplash.com/photo-1611162616475-46b635cb6868?q=80&w=1974&auto=format&fit=crop" />
                    <TemplateCard title="Slideshow" imageUrl="https://images.unsplash.com/photo-1557804506-669a67965ba0?q=80&w=1974&auto=format&fit=crop" />
                    <TemplateCard title="Sermon" imageUrl="https://images.unsplash.com/photo-1422306827382-39931053b2ac?q=80&w=2070&auto=format&fit=crop" />
                 </div>
            </div>
        </div>
    );
};

export default HomeScreen;