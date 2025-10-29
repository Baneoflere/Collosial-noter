import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { getNoteById } from '../services/storageService';
import Header from '../components/Header';
import { TrashIcon, ShareIcon, SparklesIcon } from '../components/Icons';
import { Note } from '../types';

type Tab = 'summary' | 'transcript' | 'actions';

const NoteDetailScreen: React.FC = () => {
    const { state, dispatch } = useAppContext();
    const [activeTab, setActiveTab] = useState<Tab>('summary');
    
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

    return (
        <div className="bg-yellow-500 min-h-full">
            <Header title={note.title} theme="yellow" showBackButton onBack={() => dispatch({ type: 'SET_SCREEN', payload: 'notes' })} />
            <main className="bg-gray-100 rounded-t-3xl p-4 min-h-[calc(100vh-80px)]">
                <div className="flex justify-between items-center mb-4">
                    <div className="flex space-x-1">
                        <button onClick={handleDelete} className="p-2 rounded-full hover:bg-gray-200"><TrashIcon className="w-6 h-6 text-gray-600"/></button>
                        <button onClick={handleShare} className="p-2 rounded-full hover:bg-gray-200"><ShareIcon className="w-6 h-6 text-gray-600"/></button>
                    </div>
                    <button onClick={handleChat} className="bg-gradient-to-r from-blue-500 to-teal-400 text-white font-semibold px-4 py-2 rounded-full shadow-lg flex items-center">
                        <SparklesIcon className="w-5 h-5 mr-2"/>
                        AI Chat
                    </button>
                </div>
                
                <div className="flex border-b border-gray-200 mb-4">
                    <TabButton name="Summary" tab="summary" activeTab={activeTab} setActiveTab={setActiveTab} />
                    <TabButton name="Transcript" tab="transcript" activeTab={activeTab} setActiveTab={setActiveTab} />
                    <TabButton name="Action Points" tab="actions" activeTab={activeTab} setActiveTab={setActiveTab} />
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
                </div>
            </main>
        </div>
    );
};

const TabButton = ({ name, tab, activeTab, setActiveTab }) => (
    <button
        onClick={() => setActiveTab(tab)}
        className={`px-4 py-2 text-sm font-semibold transition-colors ${
            activeTab === tab 
            ? 'border-b-2 border-yellow-500 text-yellow-600' 
            : 'text-gray-500 hover:text-gray-700'
        }`}
    >
        {name}
    </button>
);


export default NoteDetailScreen;