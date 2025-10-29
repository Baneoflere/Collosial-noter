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

export interface Note {
  id: string;
  title: string;
  createdAt: string;
  summary: string;
  transcript: string;
  actionPoints: ActionPoint[];
  chatHistory: ChatMessage[];
  color: 'blue' | 'green' | 'orange' | 'yellow';
}

export type Screen = 'onboarding' | 'home' | 'record' | 'notes' | 'note-detail' | 'chat' | 'testimonials' | 'profile' | 'share';