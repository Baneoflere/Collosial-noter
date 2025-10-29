import React from 'react';
import { useAppContext } from '../context/AppContext';
import Header from '../components/Header';
import NoteCard from '../components/NoteCard';
import { PlusIcon } from '../components/Icons';

const NotesListScreen: React.FC = () => {
    const { state, dispatch } = useAppContext();
    const { notes } = state;

    const handleSelectNote = (id: string) => {
        dispatch({ type: 'SET_SELECTED_NOTE_ID', payload: id });
        dispatch({ type: 'SET_SCREEN', payload: 'note-detail' });
    }

    const handleAddNew = () => {
        dispatch({ type: 'SET_SCREEN', payload: 'home' });
    }

    return (
        <div className="bg-yellow-500 min-h-full">
            <Header title="My Notes" theme="yellow" />
            <main className="bg-gray-100 rounded-t-3xl p-4 min-h-[calc(100vh-140px)]">
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
                            Click the button below to create your first note by recording your voice.
                        </p>
                        <button 
                            onClick={handleAddNew}
                            className="bg-yellow-500 text-white font-bold py-3 px-6 rounded-full inline-flex items-center shadow-lg hover:bg-yellow-600 transition-colors"
                        >
                           <PlusIcon className="w-5 h-5 mr-2" />
                            Create New Note
                        </button>
                    </div>
                )}
            </main>
        </div>
    );
};

export default NotesListScreen;