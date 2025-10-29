import React from 'react';
import { Note } from '../types';

interface NoteCardProps {
    note: Note;
    onClick: () => void;
}

const NoteCard: React.FC<NoteCardProps> = ({ note, onClick }) => {
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    return (
        <div 
            onClick={onClick}
            className="bg-white rounded-xl p-4 shadow-sm hover:shadow-lg transition-shadow cursor-pointer border border-gray-200"
        >
            <h3 className="font-bold text-gray-800 truncate mb-1">{note.title}</h3>
            <p className="text-sm text-gray-600 line-clamp-2 mb-3">{note.summary}</p>
            <p className="text-xs text-gray-400">{formatDate(note.createdAt)}</p>
        </div>
    );
};

export default NoteCard;