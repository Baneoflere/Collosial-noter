import React, { createContext, useReducer, useContext, useEffect } from 'react';
import { Note, Screen } from '../types';
import { getNotes, saveNotes } from '../services/storageService';

interface AppState {
  activeScreen: Screen;
  selectedNoteId: string | null;
  notes: Note[];
  loadingMessage: string | null;
  hasOnboarded: boolean;
}

type Action =
  | { type: 'SET_SCREEN'; payload: Screen }
  | { type: 'SET_SELECTED_NOTE_ID'; payload: string | null }
  | { type: 'SET_NOTES'; payload: Note[] }
  | { type: 'ADD_NOTE'; payload: Note }
  | { type: 'UPDATE_NOTE'; payload: Note }
  | { type: 'DELETE_NOTE'; payload: string }
  | { type: 'SET_LOADING'; payload: string | null }
  | { type: 'COMPLETE_ONBOARDING' };

const initialState: AppState = {
  activeScreen: 'onboarding',
  selectedNoteId: null,
  notes: [],
  loadingMessage: null,
  hasOnboarded: false,
};

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<Action>;
}>({
  state: initialState,
  dispatch: () => null,
});

const appReducer = (state: AppState, action: Action): AppState => {
  switch (action.type) {
    case 'SET_SCREEN':
      return { ...state, activeScreen: action.payload };
    case 'SET_SELECTED_NOTE_ID':
      return { ...state, selectedNoteId: action.payload };
    case 'SET_NOTES':
      return { ...state, notes: action.payload };
    case 'ADD_NOTE': {
      const newNotes = [action.payload, ...state.notes];
      saveNotes(newNotes);
      return { ...state, notes: newNotes };
    }
    case 'UPDATE_NOTE': {
      const updatedNotes = state.notes.map(note =>
        note.id === action.payload.id ? action.payload : note
      );
      saveNotes(updatedNotes);
      return { ...state, notes: updatedNotes };
    }
    case 'DELETE_NOTE': {
      const filteredNotes = state.notes.filter(note => note.id !== action.payload);
      saveNotes(filteredNotes);
      return { ...state, notes: filteredNotes };
    }
    case 'SET_LOADING':
        return { ...state, loadingMessage: action.payload };
    case 'COMPLETE_ONBOARDING':
        localStorage.setItem('hasOnboarded', 'true');
        return { ...state, hasOnboarded: true, activeScreen: 'home' };
    default:
      return state;
  }
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  useEffect(() => {
    dispatch({ type: 'SET_LOADING', payload: 'Initializing...' });
    const loadedNotes = getNotes();
    dispatch({ type: 'SET_NOTES', payload: loadedNotes });
    const onboarded = localStorage.getItem('hasOnboarded') === 'true';
    if(onboarded) {
        dispatch({ type: 'SET_SCREEN', payload: 'home' });
    } else {
        dispatch({ type: 'SET_SCREEN', payload: 'onboarding' });
    }
    dispatch({ type: 'SET_LOADING', payload: null });
  }, []);

  return <AppContext.Provider value={{ state, dispatch }}>{children}</AppContext.Provider>;
};

export const useAppContext = () => useContext(AppContext);