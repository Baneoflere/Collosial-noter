import { Note, ChatMessage } from '../types';

const STORAGE_KEY = 'nota_ai_notes';
const GENERAL_CHAT_KEY = 'nota_ai_chat_history';

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

export const getGeneralChatHistory = (): ChatMessage[] => {
  try {
    const historyJson = localStorage.getItem(GENERAL_CHAT_KEY);
    return historyJson ? JSON.parse(historyJson) : [];
  } catch (error) {
    console.error('Error retrieving general chat history from local storage:', error);
    return [];
  }
};

export const saveGeneralChatHistory = (history: ChatMessage[]): void => {
  try {
    const historyJson = JSON.stringify(history);
    localStorage.setItem(GENERAL_CHAT_KEY, historyJson);
  } catch (error) {
    console.error('Error saving general chat history to local storage:', error);
  }
};