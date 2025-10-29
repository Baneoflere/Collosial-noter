import { Note } from '../types';

const STORAGE_KEY = 'smart_noter_notes';

export const getNotes = (): Note[] => {
  try {
    const notesJson = localStorage.getItem(STORAGE_KEY);
    return notesJson ? JSON.parse(notesJson) : [];
  } catch (error) {
    console.error('Error retrieving notes from local storage:', error);
    return [];
  }
};

export const saveNotes = (notes: Note[]): void => {
  try {
    const notesJson = JSON.stringify(notes);
    localStorage.setItem(STORAGE_KEY, notesJson);
  } catch (error) {
    console.error('Error saving notes to local storage:', error);
  }
};

export const getNoteById = (id: string): Note | undefined => {
    const notes = getNotes();
    return notes.find(note => note.id === id);
}