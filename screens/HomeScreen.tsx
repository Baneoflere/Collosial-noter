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

const TemplateCard: React.FC<{ title: string; imageUrl: string; onClick: () => void }> = ({ title, imageUrl, onClick }) => (
    <div 
        className="relative rounded-2xl shadow-lg aspect-[4/3] group cursor-pointer overflow-hidden transition-transform duration-200 hover:-translate-y-1" 
        onClick={onClick}
    >
        <img src={imageUrl} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent" />
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
    const [isMeetingModalOpen, setIsMeetingModalOpen] = useState(false);
    const [meetingUrl, setMeetingUrl] = useState('');


    const processAndCreateNote = async (transcript: string, titlePrefix: string): Promise<string> => {
        dispatch({ type: 'SET_LOADING', payload: `Generating summary for ${titlePrefix}...` });
        const { summary, actionPoints } = await generateSummaryAndActionPoints(transcript);
        
        const newNote: Note = {
            id: `${Date.now()}-${Math.random()}`,
            title: summary.split(' ').slice(0, 5).join(' ') || titlePrefix,
            createdAt: new Date().toISOString(),
            summary,
            transcript,
            actionPoints: actionPoints.map((ap, index) => ({ ...ap, id: `${index}-${Math.random()}`, completed: false })),
            chatHistory: [],
            color: 'blue',
        };

        dispatch({ type: 'ADD_NOTE', payload: newNote });
        return newNote.id;
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
        const files = event.target.files;
        if (!files || files.length === 0) return;

        // FIX: Explicitly type filesArray as File[] to resolve type errors.
        const filesArray: File[] = Array.from(files);
        let lastNoteId: string | null = null;

        for (let i = 0; i < filesArray.length; i++) {
            const file = filesArray[i];
            dispatch({ type: 'SET_LOADING', payload: `Processing ${file.name} (${i + 1}/${filesArray.length})...` });
            
            try {
                const base64Audio = await fileToBase64(file);
                dispatch({ type: 'SET_LOADING', payload: `Transcribing ${file.name} (${i + 1}/${filesArray.length})...` });
                const transcript = await transcribeAudio(base64Audio, file.type);
        
                if (transcript) {
                    lastNoteId = await processAndCreateNote(transcript, `Transcribed from ${file.name}`);
                } else {
                    alert(`Failed to transcribe audio for ${file.name}. Please try again.`);
                }
            } catch (error) {
                console.error(`Error processing file ${file.name}:`, error);
                alert(`An error occurred while processing ${file.name}.`);
            }
        }
        
        dispatch({ type: 'SET_LOADING', payload: null });
        if (lastNoteId) {
            if (filesArray.length === 1) {
                dispatch({ type: 'SET_SELECTED_NOTE_ID', payload: lastNoteId });
                dispatch({ type: 'SET_SCREEN', payload: 'note-detail' });
            } else {
                dispatch({ type: 'SET_SCREEN', payload: 'notes' });
            }
        }
        event.target.value = '';
    };

    const handleTextFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (!files || files.length === 0) return;

        // FIX: Explicitly type filesArray as File[] to resolve type errors.
        const filesArray: File[] = Array.from(files);
        let lastNoteId: string | null = null;
        let processedFileCount = 0;

        for (let i = 0; i < filesArray.length; i++) {
            const file = filesArray[i];
            if (file.type.startsWith('text/')) {
                dispatch({ type: 'SET_LOADING', payload: `Processing ${file.name} (${i + 1}/${filesArray.length})...` });
                const text = await file.text();
                lastNoteId = await processAndCreateNote(text, `Note from ${file.name}`);
                processedFileCount++;
            } else if (file.type === 'application/pdf') {
                alert("PDF processing is not yet supported.");
            } else {
                alert(`Unsupported file type for ${file.name}: ${file.type}`);
            }
        }
        
        dispatch({ type: 'SET_LOADING', payload: null });
        if (lastNoteId) {
            if (processedFileCount === 1) {
                dispatch({ type: 'SET_SELECTED_NOTE_ID', payload: lastNoteId });
                dispatch({ type: 'SET_SCREEN', payload: 'note-detail' });
            } else if (processedFileCount > 1) {
                dispatch({ type: 'SET_SCREEN', payload: 'notes' });
            }
        }
        event.target.value = '';
    };

    const handleMeetingLinkSubmit = async () => {
        if (!meetingUrl.trim().toLowerCase().startsWith('http')) {
            alert("Please enter a valid meeting URL.");
            return;
        }

        const generateDynamicMockTranscript = (url: string): string => {
            const commonIntro = `This is a simulated transcript from the meeting at URL: ${url}.\n\nIn a real application, this would involve a meeting bot joining the call, capturing the audio stream, and processing it for transcription.\n\n--- Transcript Start ---\n\n`;
            const commonOutro = "\n\n--- Transcript End ---";
            
            const transcripts = [
                `**Speaker 1:** Alright team, let's kick off the Q3 project review for 'Project Phoenix'. Sarah, can you start with the latest on the front-end development?\n\n**Speaker 2 (Sarah):** Thanks, Mark. We've successfully completed the user authentication module and the dashboard UI is about 80% complete. We hit a small snag with the new charting library, but we're on track to resolve it by end of week.\n\n**Speaker 1:** Great to hear. What about the resource constraints we discussed last time?\n\n**Speaker 2 (Sarah):** We've onboarded the new junior dev, and she's getting up to speed quickly. I think we're in a much better place now.`,
                `**Speaker A (Jen):** Okay, brainstorming session for the new 'Eco-Friendly Product Line' campaign. Let's hear some wild ideas. No bad ideas in brainstorming!\n\n**Speaker B (Mike):** How about a social media campaign centered around user-generated content? We could have a hashtag like #GoGreenWithUs and feature the best posts.\n\n**Speaker C (Leo):** I like that. We could also partner with environmental influencers to amplify the message. Maybe a launch event at a national park?\n\n**Speaker A (Jen):** A launch event is ambitious but interesting. Let's table that for now and focus on the digital-first approach. Mike, can you flesh out the user-generated content idea?`,
                `**Lead Dev (Chris):** Let's do a deep dive on the API performance issue. I've been looking at the logs from production, and the latency spikes seem to correlate with high database read operations, specifically on the 'user_profiles' table.\n\n**Backend Dev (Priya):** I noticed that too. I suspect the query isn't using the correct index. We could try forcing the index or restructuring the query to be more efficient.\n\n**Lead Dev (Chris):** Good point. Before we force an index, let's run an EXPLAIN ANALYZE on the query to see the execution plan. Priya, can you take the lead on that and report back this afternoon? We need to get this resolved before the feature flag is turned on for more users.`
            ];
        
            const index = url.length % transcripts.length;
            return commonIntro + transcripts[index] + commonOutro;
        };
    
        setIsMeetingModalOpen(false);
        dispatch({ type: 'SET_LOADING', payload: 'Connecting to meeting... (Simulated)' });
        
        setTimeout(async () => {
            dispatch({ type: 'SET_LOADING', payload: 'Listening to audio... (Simulated)' });
            setTimeout(async () => {
                const mockTranscript = generateDynamicMockTranscript(meetingUrl);
                const noteId = await processAndCreateNote(mockTranscript, "Meeting");
                dispatch({ type: 'SET_LOADING', payload: null });
                dispatch({ type: 'SET_SELECTED_NOTE_ID', payload: noteId });
                dispatch({ type: 'SET_SCREEN', payload: 'note-detail' });
                setMeetingUrl('');
            }, 2000);
        }, 1500);
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
            const noteId = await processAndCreateNote(mockTranscript, "YouTube Video");
            dispatch({ type: 'SET_LOADING', payload: null });
            dispatch({ type: 'SET_SELECTED_NOTE_ID', payload: noteId });
            dispatch({ type: 'SET_SCREEN', payload: 'note-detail' });
            setYouTubeUrl('');
        }, 2500);
    };

    const handleTemplateClick = (templateTitle: string) => {
        const templates: { [key: string]: { title: string; content: string } } = {
            'Lecture': {
                title: 'Lecture Notes',
                content: 'Subject: \n\nDate: \n\nProfessor/Speaker: \n\nKey Topics:\n1. \n2. \n3. \n\nSummary:\n'
            },
            'Meeting': {
                title: 'Meeting Notes',
                content: 'Meeting Title: \n\nDate & Time: \n\nAttendees: \n\nAgenda:\n\nDiscussion Points:\n\nAction Items:\n- [ ] Task 1\n- [ ] Task 2\n'
            },
            'PDF': {
                title: 'PDF Summary',
                content: 'Source PDF Title: \n\nAuthor(s): \n\nKey Takeaways:\n\nCritical Analysis:\n'
            },
            'YouTube video': {
                title: 'YouTube Video Notes',
                content: 'Video Title: \n\nCreator: \n\nKey Points:\n\nMy Thoughts:\n'
            },
            'Slideshow': {
                title: 'Slideshow Presentation Notes',
                content: 'Presentation Title: \n\nPresenter: \n\nSlide 1: \n\nSlide 2: \n\nSlide 3: \n\nOverall Summary:\n'
            },
            'Sermon': {
                title: 'Sermon Notes',
                content: 'Speaker: \n\nDate: \n\nScripture/Topic: \n\nKey Points:\n\nPersonal Reflection & Application:\n'
            }
        };

        if (templateTitle === 'YouTube video') {
            setIsYouTubeModalOpen(true);
        } else {
            const template = templates[templateTitle];
            if (template) {
                dispatch({
                    type: 'SET_INITIAL_MANUAL_NOTE',
                    payload: template
                });
                dispatch({ type: 'SET_SCREEN', payload: 'manual-note' });
            }
        }
    };

    const templateData = [
        { title: 'Lecture', imageUrl: 'https://images.unsplash.com/photo-1543269865-cbf427effbad?q=80&w=800&auto=format&fit=crop' },
        { title: 'Meeting', imageUrl: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=800&auto=format&fit=crop' },
        { title: 'PDF', imageUrl: 'https://images.pexels.com/photos/159114/pexels-photo-159114.jpeg?auto=compress&cs=tinysrgb&w=800' },
        { title: 'YouTube video', imageUrl: 'https://images.pexels.com/photos/220327/pexels-photo-220327.jpeg?auto=compress&cs=tinysrgb&w=800' },
        { title: 'Slideshow', imageUrl: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?q=80&w=800&auto=format&fit=crop' },
        { title: 'Sermon', imageUrl: 'https://images.pexels.com/photos/236339/pexels-photo-236339.jpeg?auto=compress&cs=tinysrgb&w=800' }
    ];

    return (
        <div className="bg-[#0D2544] text-white overflow-y-auto">
            <input type="file" ref={audioInputRef} onChange={handleAudioFileSelect} accept="audio/*,video/*" className="hidden" multiple />
            <input type="file" ref={textInputRef} onChange={handleTextFileSelect} accept=".txt,text/plain,application/pdf" className="hidden" multiple />

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

            {isMeetingModalOpen && (
                <Modal title="Paste Meeting URL" onClose={() => setIsMeetingModalOpen(false)}>
                    <p className="text-sm text-gray-600 mb-4">A bot will join the meeting to record and transcribe. This is a simulation.</p>
                    <input 
                        type="text" 
                        value={meetingUrl}
                        onChange={(e) => setMeetingUrl(e.target.value)}
                        placeholder="https://zoom.us/j/..."
                        className="w-full p-3 border border-gray-300 rounded-lg mb-4 text-gray-800"
                    />
                    <div className="flex justify-end space-x-3">
                        <button onClick={() => setIsMeetingModalOpen(false)} className="px-5 py-2.5 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors">Cancel</button>
                        <button onClick={handleMeetingLinkSubmit} className="px-5 py-2.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors">Connect</button>
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
                    <ActionButton icon={LinkIcon} title="Meeting Link" subtitle="Record & transcribe meetings" onClick={() => setIsMeetingModalOpen(true)} />
                    <ActionButton icon={MicrophoneIcon} title="Record Audio" subtitle="Record with your microphone" onClick={() => dispatch({ type: 'SET_SCREEN', payload: 'record' })} />
                    <ActionButton icon={PlayIcon} title="Upload Audio File" subtitle="Upload audio or video file" onClick={() => audioInputRef.current?.click()} />
                    <ActionButton icon={PdfIcon} title="Upload Text" subtitle="Upload PDFs & more" onClick={() => textInputRef.current?.click()} />
                    <ActionButton icon={YoutubeIcon} title="Paste YouTube Link" subtitle="Type or paste link" onClick={() => setIsYouTubeModalOpen(true)} />
                    <ActionButton icon={TextIcon} title="Type Manually" subtitle="Manually create a note" onClick={() => dispatch({ type: 'SET_SCREEN', payload: 'manual-note' })} />
                </div>
            </div>
            
            <div className="bg-[#121212] p-6">
                 <h2 className="text-xl font-bold text-white mb-4">Start from template</h2>
                 <div className="grid grid-cols-2 gap-4">
                    {templateData.map(template => (
                         <TemplateCard 
                            key={template.title}
                            title={template.title} 
                            imageUrl={template.imageUrl}
                            onClick={() => handleTemplateClick(template.title)} 
                        />
                    ))}
                 </div>
            </div>
        </div>
    );
};

export default HomeScreen;