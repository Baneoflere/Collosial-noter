import React, { useState, useRef, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import Header from '../components/Header';
import { PaperAirplaneIcon, UserIcon, BotIcon } from '../components/Icons';
import { getNoteById } from '../services/storageService';
import { ChatMessage, Note } from '../types';
import Loader from '../components/Loader';
import { GoogleGenAI, Chat, GenerateContentResponse } from '@google/genai';

const ChatScreen: React.FC = () => {
    const { state, dispatch } = useAppContext();
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const chatRef = useRef<Chat | null>(null);

    const note = getNoteById(state.selectedNoteId!);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [note?.chatHistory, isLoading]);

    useEffect(() => {
        if (note && !chatRef.current) {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
    
            const history = note.chatHistory.map(message => ({
                role: message.sender === 'user' ? 'user' : 'model',
                parts: [{ text: message.text }],
            }));
    
            const systemInstruction = `You are an AI assistant chatting about a specific note. Base all your answers on the provided content.
            ---
            Title: ${note.title}
            Summary: ${note.summary}
            Transcript: ${note.transcript}
            ---`;
    
            chatRef.current = ai.chats.create({
                model: 'gemini-2.5-flash',
                history: history,
                config: {
                    systemInstruction: systemInstruction,
                }
            });
        }
    }, [note]);


    if (!note) {
        return <div>Note not found</div>;
    }

    const handleSend = async () => {
        if (!input.trim() || isLoading || !chatRef.current) return;

        const userMessageText = input.trim();
        const userMessage: ChatMessage = {
            id: Date.now().toString(),
            sender: 'user',
            text: userMessageText,
        };

        const updatedNoteWithUserMessage: Note = {
            ...note,
            chatHistory: [...note.chatHistory, userMessage],
        };
        dispatch({ type: 'UPDATE_NOTE', payload: updatedNoteWithUserMessage });
        setInput('');
        setIsLoading(true);
        
        try {
            const response: GenerateContentResponse = await chatRef.current.sendMessage({ message: userMessageText });
            const aiResponseText = response.text;
    
            const aiMessage: ChatMessage = {
                id: (Date.now() + 1).toString(),
                sender: 'ai',
                text: aiResponseText,
            };
    
            const finalNote: Note = {
                ...updatedNoteWithUserMessage,
                chatHistory: [...updatedNoteWithUserMessage.chatHistory, aiMessage],
            }
            dispatch({ type: 'UPDATE_NOTE', payload: finalNote });
        } catch (error) {
            console.error("Error sending chat message:", error);
            const errorMessage: ChatMessage = {
                id: (Date.now() + 1).toString(),
                sender: 'ai',
                text: "I'm sorry, I encountered an error and can't respond right now.",
            };
            const noteWithError: Note = {
                ...updatedNoteWithUserMessage,
                chatHistory: [...updatedNoteWithUserMessage.chatHistory, errorMessage],
            };
            dispatch({ type: 'UPDATE_NOTE', payload: noteWithError });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-screen bg-green-600">
            <Header title="AI Chat with Notes" theme="green" showBackButton onBack={() => dispatch({ type: 'SET_SCREEN', payload: 'note-detail' })} />
            <div className="flex-1 overflow-y-auto bg-gray-100 rounded-t-3xl p-4">
                <div className="space-y-4">
                    {note.chatHistory.map((message) => (
                        <div key={message.id} className={`flex items-start gap-3 ${message.sender === 'user' ? 'justify-end' : ''}`}>
                            {message.sender === 'ai' && <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white"><BotIcon className="w-5 h-5"/></div>}
                            <div className={`max-w-md p-3 rounded-2xl ${message.sender === 'user' ? 'bg-blue-500 text-white rounded-br-none' : 'bg-white text-gray-800 rounded-bl-none'}`}>
                                <p>{message.text}</p>
                            </div>
                             {message.sender === 'user' && <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-gray-600"><UserIcon className="w-5 h-5"/></div>}
                        </div>
                    ))}
                    {isLoading && (
                         <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white"><BotIcon className="w-5 h-5"/></div>
                             <div className="max-w-xs p-3 rounded-2xl bg-white text-gray-800 rounded-bl-none flex items-center">
                                <Loader/>
                             </div>
                         </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </div>
            <div className="bg-white p-2 border-t">
                <div className="flex items-center">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Ask about your note..."
                        className="w-full p-3 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                    <button onClick={handleSend} className="ml-2 p-3 bg-green-500 text-white rounded-full disabled:bg-gray-300">
                        <PaperAirplaneIcon className="w-6 h-6" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChatScreen;