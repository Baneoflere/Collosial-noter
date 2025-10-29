import React, { useState, useRef, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import Header from '../components/Header';
import { PaperAirplaneIcon, UserIcon, BotIcon } from '../components/Icons';
import { ChatMessage } from '../types';
import Loader from '../components/Loader';
import { GoogleGenAI, Chat, GenerateContentResponse } from '@google/genai';

const GeneralChatScreen: React.FC = () => {
    const { state, dispatch } = useAppContext();
    const { generalChatHistory } = state;
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const chatRef = useRef<Chat | null>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [generalChatHistory, isLoading]);

    useEffect(() => {
        if (!chatRef.current) {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
    
            const history = generalChatHistory.map(message => ({
                role: message.sender === 'user' ? 'user' : 'model',
                parts: [{ text: message.text }],
            }));
    
            const systemInstruction = `You are a friendly and helpful AI assistant named Nota AI.`;
    
            chatRef.current = ai.chats.create({
                model: 'gemini-2.5-flash',
                history: history,
                config: {
                    systemInstruction: systemInstruction,
                }
            });
        }
    }, [generalChatHistory]);


    const handleSend = async () => {
        if (!input.trim() || isLoading || !chatRef.current) return;

        const userMessageText = input.trim();
        const userMessage: ChatMessage = {
            id: Date.now().toString(),
            sender: 'user',
            text: userMessageText,
        };

        const updatedHistoryWithUser = [...generalChatHistory, userMessage];
        dispatch({ type: 'SET_GENERAL_CHAT_HISTORY', payload: updatedHistoryWithUser });
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
    
            const finalHistory = [...updatedHistoryWithUser, aiMessage];
            dispatch({ type: 'SET_GENERAL_CHAT_HISTORY', payload: finalHistory });
        } catch (error) {
            console.error("Error sending chat message:", error);
            const errorMessage: ChatMessage = {
                id: (Date.now() + 1).toString(),
                sender: 'ai',
                text: "I'm sorry, I encountered an error and can't respond right now.",
            };
            const historyWithError = [...updatedHistoryWithUser, errorMessage];
            dispatch({ type: 'SET_GENERAL_CHAT_HISTORY', payload: historyWithError });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-screen bg-blue-600">
            <Header title="AI Chat" theme="blue" />
            <div className="flex-1 overflow-y-auto bg-gray-100 rounded-t-3xl p-4">
                <div className="space-y-4">
                    {generalChatHistory.length === 0 && !isLoading && (
                        <div className="text-center text-gray-500 pt-10">
                            <BotIcon className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                            <h2 className="text-xl font-semibold">Welcome to AI Chat!</h2>
                            <p>Ask me anything.</p>
                        </div>
                    )}
                    {generalChatHistory.map((message) => (
                        <div key={message.id} className={`flex items-start gap-3 ${message.sender === 'user' ? 'justify-end' : ''}`}>
                            {message.sender === 'ai' && <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white"><BotIcon className="w-5 h-5"/></div>}
                            <div className={`max-w-md p-3 rounded-2xl ${message.sender === 'user' ? 'bg-blue-500 text-white rounded-br-none' : 'bg-white text-gray-800 rounded-bl-none'}`}>
                                <p>{message.text}</p>
                            </div>
                             {message.sender === 'user' && <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-gray-600"><UserIcon className="w-5 h-5"/></div>}
                        </div>
                    ))}
                    {isLoading && (
                         <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white"><BotIcon className="w-5 h-5"/></div>
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
                        placeholder="Ask me anything..."
                        className="w-full p-3 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button onClick={handleSend} disabled={isLoading} className="ml-2 p-3 bg-blue-500 text-white rounded-full disabled:bg-gray-300">
                        <PaperAirplaneIcon className="w-6 h-6" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default GeneralChatScreen;