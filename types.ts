export interface TranscriptMessage {
  speaker: 'user' | 'model';
  text: string;
}

export interface ActionPoint {
  id: string;
  text: string;
  completed: boolean;
}

export interface ChatMessage {
    id: string;
    sender: 'user' | 'ai';
    text: string;
}

export interface QuizItem {
  question: string;
  options: string[];
  correctAnswer: string;
}

export interface FlashcardItem {
  front: string;
  back: string;
}

export interface Note {
  id: string;
  title: string;
  createdAt: string;
  summary: string;
  transcript: string;
  actionPoints: ActionPoint[];
  chatHistory: ChatMessage[];
  color: 'blue' | 'green' | 'orange' | 'yellow';
  quizzes?: QuizItem[];
  flashcards?: FlashcardItem[];
}

export type Screen = 
  | 'onboarding' 
  | 'home' 
  | 'record' 
  | 'notes' 
  | 'note-detail' 
  | 'chat' 
  | 'testimonials' 
  | 'profile' 
  | 'share'
  | 'study'
  | 'quiz'
  | 'flashcards';