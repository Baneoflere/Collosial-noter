import React, { useState, useRef } from 'react';
import { useAppContext } from '../context/AppContext';
import { getNoteById } from '../services/storageService';
import Header from '../components/Header';
import { TrashIcon, ShareIcon, SparklesIcon, BookOpenIcon, MicrophoneIcon, StopIcon, PlayIcon } from '../components/Icons';
import { Note, AudioClip } from '../types';
import { generateStudySet } from '../services/aiService';

type Tab = 'summary' | 'transcript' | 'actions' | 'audio';

const formatTime = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

const NoteDetailScreen: React.FC = () => {
    const { state, dispatch } = useAppContext();
    const [activeTab, setActiveTab] = useState<Tab>('summary');
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const recordingIntervalRef = useRef<number | null>(null);
    
    const note = getNoteById(state.selectedNoteId!);

    if (!note) {
        return (
            <div className="p-4">
                <p>Note not found.</p>
                <button onClick={() => dispatch({ type: 'SET_SCREEN', payload: 'notes' })}>Back to list</button>
            </div>
        );
    }
    
    const handleToggleActionPoint = (actionPointId: string) => {
        const updatedNote: Note = {
            ...note,
            actionPoints: note.actionPoints.map(ap => 
                ap.id === actionPointId ? { ...ap, completed: !ap.completed } : ap
            ),
        };
        dispatch({ type: 'UPDATE_NOTE', payload: updatedNote });
    };

    const handleDelete = () => {
        if (window.confirm('Are you sure you want to delete this note?')) {
            dispatch({ type: 'DELETE_NOTE', payload: note.id });
            dispatch({ type: 'SET_SCREEN', payload: 'notes' });
        }
    }

    const handleShare = () => {
        dispatch({ type: 'SET_SCREEN', payload: 'share' });
    }

    const handleChat = () => {
        dispatch({ type: 'SET_SCREEN', payload: 'chat' });
    }

    const handleStudy = async () => {
        if (note.quizzes && note.flashcards && (note.quizzes.length > 0 || note.flashcards.length > 0)) {
            dispatch({ type: 'SET_SCREEN', payload: 'study' });
        } else {
            dispatch({ type: 'SET_LOADING', payload: 'Creating study set...' });
            const noteContent = `Title: ${note.title}\nSummary: ${note.summary}\nTranscript: ${note.transcript}`;
            const { quizzes, flashcards } = await generateStudySet(noteContent);
            
            const updatedNote: Note = { ...note, quizzes, flashcards };
            dispatch({ type: 'UPDATE_NOTE', payload: updatedNote });
            
            dispatch({ type: 'SET_LOADING', payload: null });
            if (quizzes.length > 0 || flashcards.length > 0) {
                dispatch({ type: 'SET_SCREEN', payload: 'study' });
            } else {
                alert("Could not generate a study set for this note. The content might be too short.");
            }
        }
    };

    const handleRecord = async () => {
        if (isRecording) {
            mediaRecorderRef.current?.stop();
            if (recordingIntervalRef.current) clearInterval(recordingIntervalRef.current);
            setIsRecording(false);
            setRecordingTime(0);
        } else {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                const recorder = new MediaRecorder(stream);
                mediaRecorderRef.current = recorder;
                const audioChunks: Blob[] = [];

                recorder.ondataavailable = (event) => { audioChunks.push(event.data); };

                recorder.onstop = () => {
                    const audioBlob = new Blob(audioChunks, { type: audioChunks[0]?.type || 'audio/webm' });
                    const reader = new FileReader();
                    reader.readAsDataURL(audioBlob);
                    reader.onloadend = () => {
                        const base64String = (reader.result as string).split(',')[1];
                        const newClip: AudioClip = {
                            id: Date.now().toString(),
                            data: base64String,
                            mimeType: audioBlob.type,
                            createdAt: new Date().toISOString(),
                        };
                        const updatedNote: Note = { ...note, audioClips: [...(note.audioClips || []), newClip] };
                        dispatch({ type: 'UPDATE_NOTE', payload: updatedNote });
                    };
                    stream.getTracks().forEach(track => track.stop());
                };
                
                recorder.start();
                setIsRecording(true);
                recordingIntervalRef.current = window.setInterval(() => setRecordingTime(prev => prev + 1), 1000);
            } catch (err) {
                console.error("Error starting recording:", err);
                alert("Could not start recording. Please ensure microphone permissions are granted.");
            }
        }
    };

    const playAudio = (clip: AudioClip) => {
        const audio = new Audio(`data:${clip.mimeType};base64,${clip.data}`);
        audio.play().catch(e => console.error("Error playing audio:", e));
    };

    const deleteAudioClip = (clipId: string) => {
        if (window.confirm("Are you sure you want to delete this audio clip?")) {
            const updatedNote: Note = { ...note, audioClips: note.audioClips?.filter(clip => clip.id !== clipId) };
            dispatch({ type: 'UPDATE_NOTE', payload: updatedNote });
        }
    };

    return (
        <div className="bg-yellow-500 min-h-full">
            <Header title={note.title} theme="yellow" showBackButton onBack={() => dispatch({ type: 'SET_SCREEN', payload: 'notes' })} />
            <main className="bg-gray-100 rounded-t-3xl p-4 min-h-[calc(100vh-80px)]">
                <div className="flex justify-between items-center mb-4 gap-2">
                    <div className="flex space-x-1">
                        <button onClick={handleDelete} className="p-2 rounded-full hover:bg-gray-200"><TrashIcon className="w-6 h-6 text-gray-600"/></button>
                        <button onClick={handleShare} className="p-2 rounded-full hover:bg-gray-200"><ShareIcon className="w-6 h-6 text-gray-600"/></button>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={handleStudy} className="bg-purple-600 text-white font-semibold px-4 py-2 rounded-full shadow-lg flex items-center">
                            <BookOpenIcon className="w-5 h-5 mr-2"/>
                            Study
                        </button>
                        <button onClick={handleChat} className="bg-gradient-to-r from-blue-500 to-teal-400 text-white font-semibold px-4 py-2 rounded-full shadow-lg flex items-center">
                            <SparklesIcon className="w-5 h-5 mr-2"/>
                            AI Chat
                        </button>
                    </div>
                </div>
                
                <div className="flex border-b border-gray-200 mb-4 overflow-x-auto">
                    <TabButton name="Summary" tab="summary" activeTab={activeTab} setActiveTab={setActiveTab} />
                    <TabButton name="Transcript" tab="transcript" activeTab={activeTab} setActiveTab={setActiveTab} />
                    <TabButton name="Actions" tab="actions" activeTab={activeTab} setActiveTab={setActiveTab} />
                    <TabButton name="Audio" tab="audio" activeTab={activeTab} setActiveTab={setActiveTab} />
                </div>
                
                <div>
                    {activeTab === 'summary' && <div className="prose max-w-none text-gray-700" dangerouslySetInnerHTML={{__html: note.summary.replace(/\n/g, '<br/>')}}></div>}
                    {activeTab === 'transcript' && <div className="prose max-w-none text-gray-700 whitespace-pre-wrap">{note.transcript}</div>}
                    {activeTab === 'actions' && (
                        <div className="space-y-3">
                            {note.actionPoints.map(ap => (
                                <div key={ap.id} onClick={() => handleToggleActionPoint(ap.id)} className="flex items-center bg-white p-3 rounded-lg cursor-pointer shadow-sm">
                                    <div className={`w-6 h-6 rounded-md border-2 ${ap.completed ? 'bg-green-500 border-green-500' : 'border-gray-300'} flex items-center justify-center mr-3 transition-colors`}>
                                        {ap.completed && <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>}
                                    </div>
                                    <span className={`flex-1 ${ap.completed ? 'line-through text-gray-400' : 'text-gray-700'}`}>{ap.text}</span>
                                </div>
                            ))}
                        </div>
                    )}
                    {activeTab === 'audio' && (
                        <div className="space-y-4">
                            <button onClick={handleRecord} className={`w-full flex items-center justify-center p-3 rounded-lg font-semibold transition-colors shadow-sm ${isRecording ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                                {isRecording ? <StopIcon className="w-5 h-5 mr-2" /> : <MicrophoneIcon className="w-5 h-5 mr-2" />}
                                {isRecording ? `Stop Recording (${formatTime(recordingTime)})` : 'Record New Audio Clip'}
                            </button>
                            
                            {(!note.audioClips || note.audioClips.length === 0) && (
                                <p className="text-center text-gray-500 py-4">No audio clips recorded yet.</p>
                            )}

                            {note.audioClips && note.audioClips.length > 0 && (
                                <div className="bg-white p-3 rounded-xl shadow-sm space-y-2">
                                    {note.audioClips.map(clip => (
                                        <div key={clip.id} className="flex items-center justify-between bg-gray-50 p-2 rounded-lg">
                                            <div className="flex items-center">
                                                <button onClick={() => playAudio(clip)} className="p-2 rounded-full hover:bg-gray-200 transition-colors">
                                                    <PlayIcon className="w-6 h-6 text-gray-700" />
                                                </button>
                                                <span className="ml-2 text-sm text-gray-600">
                                                    Recorded on {new Date(clip.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <button onClick={() => deleteAudioClip(clip.id)} className="p-2 rounded-full hover:bg-red-100 transition-colors">
                                                <TrashIcon className="w-5 h-5 text-red-500" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

const TabButton: React.FC<{name: string, tab: Tab, activeTab: Tab, setActiveTab: (tab: Tab) => void}> = ({ name, tab, activeTab, setActiveTab }) => (
    <button
        onClick={() => setActiveTab(tab)}
        className={`px-4 py-2 text-sm font-semibold transition-colors flex-shrink-0 ${
            activeTab === tab 
            ? 'border-b-2 border-yellow-500 text-yellow-600' 
            : 'text-gray-500 hover:text-gray-700'
        }`}
    >
        {name}
    </button>
);


export default NoteDetailScreen;