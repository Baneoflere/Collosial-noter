import React, { useState, useRef } from 'react';
import { useAppContext } from '../context/AppContext';
import Header from '../components/Header';
import NoteCard from '../components/NoteCard';
import { PlusIcon, MicrophoneIcon, QuillIcon, DocumentTextIcon, PlayIcon } from '../components/Icons';
import { Note } from '../types';
import { transcribeAudio, generateSummaryAndActionPoints } from '../services/aiService';

const FabMenuItem: React.FC<{ icon: React.FC<any>, label: string, onClick: () => void, delay: number }> = ({ icon: Icon, label, onClick, delay }) => (
    <div 
        className="flex items-center justify-end cursor-pointer group"
        onClick={onClick}
    >
        <span className="bg-white text-gray-700 text-sm font-semibold px-3 py-1 rounded-md shadow-md mr-3 transition-all duration-200 opacity-0 transform translate-x-2 group-hover:opacity-100 group-hover:translate-x-0">{label}</span>
        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-yellow-600 shadow-md transform transition-transform group-hover:scale-110">
            <Icon className="w-6 h-6" />
        </div>
    </div>
);


const NotesListScreen: React.FC = () => {
    const { state, dispatch } = useAppContext();
    const { notes } = state;
    const [isFabMenuOpen, setIsFabMenuOpen] = useState(false);

    const audioInputRef = useRef<HTMLInputElement>(null);
    const textInputRef = useRef<HTMLInputElement>(null);

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
        if (lastNoteId && filesArray.length === 1) {
            dispatch({ type: 'SET_SELECTED_NOTE_ID', payload: lastNoteId });
            dispatch({ type: 'SET_SCREEN', payload: 'note-detail' });
        }
        event.target.value = '';
    };

    const handleTextFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (!files || files.length === 0) return;

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
        if (lastNoteId && processedFileCount === 1) {
            dispatch({ type: 'SET_SELECTED_NOTE_ID', payload: lastNoteId });
            dispatch({ type: 'SET_SCREEN', payload: 'note-detail' });
        }
        event.target.value = '';
    };

    const handleSelectNote = (id: string) => {
        dispatch({ type: 'SET_SELECTED_NOTE_ID', payload: id });
        dispatch({ type: 'SET_SCREEN', payload: 'note-detail' });
    };

    const fabMenuActions = [
        { label: 'Transcribe from Voice', icon: MicrophoneIcon, action: () => dispatch({ type: 'SET_SCREEN', payload: 'record' }) },
        { label: 'Type Manually', icon: QuillIcon, action: () => dispatch({ type: 'SET_SCREEN', payload: 'manual-note' }) },
        { label: 'Upload Audio/Video', icon: PlayIcon, action: () => audioInputRef.current?.click() },
        { label: 'Upload Text/PDF', icon: DocumentTextIcon, action: () => textInputRef.current?.click() },
    ];

    return (
        <div className="bg-yellow-500 min-h-full">
            <style>{`
                .fab-menu-item {
                    transition: all 0.2s ease-out;
                }
            `}</style>

            <input type="file" ref={audioInputRef} onChange={handleAudioFileSelect} accept="audio/*,video/*" className="hidden" multiple />
            <input type="file" ref={textInputRef} onChange={handleTextFileSelect} accept=".txt,text/plain,application/pdf" className="hidden" multiple />

            <Header title="My Notes" theme="yellow" />
            <main className="bg-gray-100 rounded-t-3xl p-4 min-h-[calc(100vh-140px)] pb-24">
                {notes.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {notes.map(note => (
                            <NoteCard key={note.id} note={note} onClick={() => handleSelectNote(note.id)} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 px-4">
                        <h2 className="text-xl font-semibold text-gray-700">No Notes Yet</h2>
                        <p className="text-gray-500 mt-2 mb-6">
                            Tap the '+' button to create your first note.
                        </p>
                    </div>
                )}
            </main>
            
            <div className="fixed bottom-24 right-6 z-20 flex flex-col items-end">
                <div 
                    className={`transition-all duration-300 ease-in-out flex flex-col items-end space-y-3 ${isFabMenuOpen ? 'opacity-100' : 'opacity-0'}`} 
                    style={{ transform: isFabMenuOpen ? 'translateY(0)' : 'translateY(20px)' }}
                >
                    {isFabMenuOpen && fabMenuActions.map((item, index) => (
                        <div key={item.label} className="fab-menu-item" style={{ transitionDelay: `${index * 40}ms`}}>
                             <FabMenuItem 
                                label={item.label}
                                icon={item.icon}
                                onClick={() => { item.action(); setIsFabMenuOpen(false); }}
                                delay={index * 50}
                            />
                        </div>
                    ))}
                </div>

                <button
                    onClick={() => setIsFabMenuOpen(!isFabMenuOpen)}
                    className="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center text-white shadow-lg transform transition-all duration-300 hover:scale-105 active:scale-95 mt-4"
                    aria-haspopup="true"
                    aria-expanded={isFabMenuOpen}
                >
                    <PlusIcon className={`w-8 h-8 transition-transform duration-300 ${isFabMenuOpen ? 'rotate-45' : ''}`} />
                </button>
            </div>
        </div>
    );
};

export default NotesListScreen;