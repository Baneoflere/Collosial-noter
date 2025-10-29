import React, { useState, useRef, useEffect } from 'react';
import { useGeminiLive } from '../hooks/useGeminiLive';
import { useAppContext } from '../context/AppContext';
import { generateSummaryAndActionPoints } from '../services/aiService';
import { Note } from '../types';
import { CloseIcon, PlayIcon, MicrophoneIcon, BotIcon } from '../components/Icons';
import Loader from '../components/Loader';

const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    const padded = (num: number) => num.toString().padStart(2, '0');

    if (hours > 0) {
        return `${padded(hours)}:${padded(minutes)}:${padded(seconds)}`;
    }
    return `${padded(minutes)}:${padded(seconds)}`;
};

const RecordScreen: React.FC = () => {
    const { dispatch } = useAppContext();
    const [isProcessing, setIsProcessing] = useState(false);
    const [elapsedTime, setElapsedTime] = useState(0);
    const [transcriptHistory, setTranscriptHistory] = useState<{ id: number; text: string }[]>([]);
    
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
    const visualizerStreamRef = useRef<MediaStream | null>(null);
    const timerIntervalRef = useRef<number | null>(null);
    const transcriptEndRef = useRef<HTMLDivElement>(null);

    const handleComplete = async (transcript: string) => {
        if (!transcript.trim()) {
            dispatch({ type: 'SET_SCREEN', payload: 'home' });
            return;
        }
        setIsProcessing(true);
        const { summary, actionPoints } = await generateSummaryAndActionPoints(transcript);
        
        const newNote: Note = {
            id: Date.now().toString(),
            title: summary.split(' ').slice(0, 5).join(' ') || 'New Recorded Note',
            createdAt: new Date().toISOString(),
            summary,
            transcript,
            actionPoints: actionPoints.map((ap, index) => ({ ...ap, id: index.toString(), completed: false })),
            chatHistory: [],
            color: 'blue',
        };

        dispatch({ type: 'ADD_NOTE', payload: newNote });
        dispatch({ type: 'SET_SELECTED_NOTE_ID', payload: newNote.id });
        dispatch({ type: 'SET_SCREEN', payload: 'note-detail' });
        setIsProcessing(false);
    };

    const handleTurnComplete = (turnText: string) => {
        setTranscriptHistory(prev => [...prev, { id: Date.now(), text: turnText }]);
    };
    
    const { isRecording, currentSpokenText, startConversation, stopConversation, error } = useGeminiLive(handleComplete, handleTurnComplete);

    useEffect(() => {
        transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [transcriptHistory, currentSpokenText]);

    useEffect(() => {
        let animationFrameId: number;

        const drawWaveform = () => {
            if (!analyserRef.current || !canvasRef.current) {
                return;
            }
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            if (!ctx) return;
            
            const bufferLength = analyserRef.current.fftSize;
            const dataArray = new Uint8Array(bufferLength);
            analyserRef.current.getByteTimeDomainData(dataArray);

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.lineWidth = 2;
            ctx.strokeStyle = '#3B82F6'; // blue-500

            const sliceWidth = canvas.width * 1.0 / bufferLength;
            let x = 0;

            for (let i = 0; i < bufferLength; i++) {
                const v = dataArray[i] / 128.0;
                const y = v * canvas.height / 2;
                ctx.beginPath();
                ctx.moveTo(x, canvas.height/2);
                ctx.lineTo(x, y);
                ctx.stroke();
                x += sliceWidth;
            }

            animationFrameId = requestAnimationFrame(drawWaveform);
        };

        const setupVisualizer = async () => {
            try {
                visualizerStreamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
                audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
                analyserRef.current = audioContextRef.current.createAnalyser();
                sourceRef.current = audioContextRef.current.createMediaStreamSource(visualizerStreamRef.current);
                
                sourceRef.current.connect(analyserRef.current);
                analyserRef.current.fftSize = 256;
                
                drawWaveform();
            } catch (err) {
                console.error("Error setting up visualizer:", err);
            }
        };

        const cleanupVisualizer = () => {
            cancelAnimationFrame(animationFrameId);
            visualizerStreamRef.current?.getTracks().forEach(track => track.stop());
            sourceRef.current?.disconnect();
            analyserRef.current?.disconnect();
            audioContextRef.current?.close().catch(console.error);
        };
        
        if (isRecording) {
            setElapsedTime(0);
            setTranscriptHistory([]);
            timerIntervalRef.current = window.setInterval(() => {
                setElapsedTime(prev => prev + 1);
            }, 1000);
            setupVisualizer();
        } else {
            if (timerIntervalRef.current) {
                clearInterval(timerIntervalRef.current);
            }
            cleanupVisualizer();
        }

        return () => {
            if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
            cleanupVisualizer();
        };
    }, [isRecording]);

    const handleCancel = () => {
        if(isRecording) {
            stopConversation(false);
        }
        dispatch({ type: 'SET_SCREEN', payload: 'home' });
    };

    if (isProcessing) {
        return <div className="flex flex-col items-center justify-center h-full bg-[#0D2544] text-white p-4">
            <Loader />
            <p className="mt-4 text-lg font-medium">Processing your note...</p>
            <p className="text-gray-300">Generating summary and action items.</p>
        </div>
    }

    return (
        <div className="flex flex-col h-full bg-[#0D2544] text-white p-6 pt-12">
            <header className="text-left mb-6">
                <h1 className="text-4xl font-extrabold">Record &</h1>
                <h1 className="text-4xl font-extrabold">Transcribe</h1>
            </header>

            <div className="flex-1 bg-white rounded-t-3xl text-gray-800 p-4 flex flex-col min-h-0">
                <div className="text-center mb-4">
                    <h2 className="font-semibold text-lg">Meeting Recording</h2>
                    <p className="text-gray-500 font-mono">{formatTime(elapsedTime)}</p>
                </div>

                <canvas ref={canvasRef} className="w-full h-20 mb-4"></canvas>
                
                <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                    {transcriptHistory.map(item => (
                         <div key={item.id} className="flex items-start gap-2.5">
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500"><BotIcon className="w-5 h-5"/></div>
                            <div className="bg-gray-100 p-3 rounded-xl rounded-tl-none">
                                <p>{item.text}</p>
                            </div>
                        </div>
                    ))}
                    {currentSpokenText && (
                        <div className="flex items-start gap-2.5">
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500"><BotIcon className="w-5 h-5"/></div>
                            <div className="bg-gray-100 p-3 rounded-xl rounded-tl-none">
                                <p>{currentSpokenText}</p>
                            </div>
                        </div>
                    )}
                     <div ref={transcriptEndRef} />
                </div>
                
                <footer className="flex-shrink-0 flex items-center justify-around pt-4 mt-auto">
                    <div className="flex flex-col items-center">
                        <button onClick={handleCancel} className="p-4 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors">
                            <CloseIcon className="w-6 h-6"/>
                        </button>
                        <span className="text-sm mt-1 font-medium text-gray-600">Cancel</span>
                    </div>
                    <div className="flex flex-col items-center">
                        <button onClick={isRecording ? () => stopConversation(true) : startConversation} className="p-6 rounded-full bg-red-600 hover:bg-red-700 transition-colors shadow-lg">
                             <MicrophoneIcon className="w-8 h-8 text-white" />
                        </button>
                        <span className="text-sm mt-1 font-medium text-gray-600">{isRecording ? 'Stop' : 'Done'}</span>
                    </div>
                    <div className="flex flex-col items-center">
                        <button disabled className="p-4 rounded-full bg-gray-200 opacity-50">
                            <PlayIcon className="w-6 h-6"/>
                        </button>
                        <span className="text-sm mt-1 font-medium text-gray-400">Continue</span>
                    </div>
                </footer>
            </div>
             {error && <div className="mt-2 text-center text-red-300 bg-red-900/50 p-2 rounded-lg">{error}</div>}
        </div>
    );
};

export default RecordScreen;