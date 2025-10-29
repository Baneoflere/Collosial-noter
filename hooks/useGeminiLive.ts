import { useState, useRef, useCallback } from 'react';
import { GoogleGenAI, LiveSession, LiveServerMessage, Modality, Blob } from '@google/genai';
// FIX: Changed import path to be relative.
import { encode, decode, decodeAudioData } from '../utils/audioUtils';

const INPUT_SAMPLE_RATE = 16000;
const OUTPUT_SAMPLE_RATE = 24000;
const SCRIPT_PROCESSOR_BUFFER_SIZE = 4096;

function createBlob(data: Float32Array): Blob {
  const l = data.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) {
    int16[i] = data[i] * 32768;
  }
  return {
    data: encode(new Uint8Array(int16.buffer)),
    mimeType: 'audio/pcm;rate=16000',
  };
}

export const useGeminiLive = (
    onComplete: (fullTranscript: string) => void,
    onTurnComplete: (turnText: string) => void
) => {
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentSpokenText, setCurrentSpokenText] = useState('');

  const sessionPromiseRef = useRef<Promise<LiveSession> | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);

  const fullTranscriptRef = useRef('');
  const currentInputTranscriptionRef = useRef('');
  
  let nextStartTime = 0;
  const audioSources = new Set<AudioBufferSourceNode>();

  const startConversation = useCallback(async () => {
    setError(null);
    setIsRecording(true);
    fullTranscriptRef.current = '';
    currentInputTranscriptionRef.current = '';
    setCurrentSpokenText('');

    try {
      if (!process.env.API_KEY) {
        throw new Error('API_KEY environment variable not set.');
      }

      streamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });

      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      sessionPromiseRef.current = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        config: {
          inputAudioTranscription: {},
          outputAudioTranscription: {},
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
          },
          systemInstruction: 'You are a helpful note-taking assistant. Listen carefully and provide a clear transcript.'
        },
        callbacks: {
          onopen: () => {
            inputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: INPUT_SAMPLE_RATE });
            outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: OUTPUT_SAMPLE_RATE });

            const source = inputAudioContextRef.current.createMediaStreamSource(streamRef.current!);
            scriptProcessorRef.current = inputAudioContextRef.current.createScriptProcessor(SCRIPT_PROCESSOR_BUFFER_SIZE, 1, 1);
            
            scriptProcessorRef.current.onaudioprocess = (audioProcessingEvent) => {
              const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
              const pcmBlob = createBlob(inputData);
              sessionPromiseRef.current?.then((session) => {
                session.sendRealtimeInput({ media: pcmBlob });
              });
            };
            source.connect(scriptProcessorRef.current);
            scriptProcessorRef.current.connect(inputAudioContextRef.current.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            handleTranscription(message);
            await handleAudio(message);
          },
          onerror: (e) => {
            console.error('Gemini Live API Error:', e);
            setError(`An API error occurred. Please check the console.`);
            stopConversation(false);
          },
          onclose: () => {
            console.log('Gemini Live session closed.');
          },
        },
      });

    } catch (err) {
      console.error('Failed to start conversation:', err);
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(`Failed to start: ${errorMessage}`);
      setIsRecording(false);
    }
  }, []);

  const handleTranscription = (message: LiveServerMessage) => {
    if (message.serverContent?.inputTranscription) {
      const newText = message.serverContent.inputTranscription.text;
      currentInputTranscriptionRef.current += newText;
      setCurrentSpokenText(prev => prev + newText);
    }
    if (message.serverContent?.turnComplete) {
      const completedTurnText = currentInputTranscriptionRef.current.trim();
      if (completedTurnText) {
          fullTranscriptRef.current += completedTurnText + '\n\n';
          onTurnComplete(completedTurnText);
      }
      currentInputTranscriptionRef.current = '';
      setCurrentSpokenText('');
    }
  };

  const handleAudio = async (message: LiveServerMessage) => {
    const audioData = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
    if (audioData && outputAudioContextRef.current) {
        nextStartTime = Math.max(nextStartTime, outputAudioContextRef.current.currentTime);
        const audioBuffer = await decodeAudioData(
            decode(audioData),
            outputAudioContextRef.current,
            OUTPUT_SAMPLE_RATE,
            1,
        );
        const source = outputAudioContextRef.current.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(outputAudioContextRef.current.destination);
        source.addEventListener('ended', () => { audioSources.delete(source); });
        source.start(nextStartTime);
        nextStartTime += audioBuffer.duration;
        audioSources.add(source);
    }
    if (message.serverContent?.interrupted) {
        for (const source of audioSources.values()) {
            source.stop();
            audioSources.delete(source);
        }
        nextStartTime = 0;
    }
  };

  const stopConversation = useCallback(async (shouldComplete: boolean = true) => {
    if (!isRecording) return;
    setIsRecording(false);

    streamRef.current?.getTracks().forEach((track) => track.stop());
    scriptProcessorRef.current?.disconnect();
    await inputAudioContextRef.current?.close().catch(console.error);
    await outputAudioContextRef.current?.close().catch(console.error);

    if (sessionPromiseRef.current) {
      try {
        const session = await sessionPromiseRef.current;
        session.close();
      } catch(e) {
        console.error("Error closing session:", e);
      }
    }
    
    sessionPromiseRef.current = null;
    if (shouldComplete) {
      // Add any remaining text
      const lastTurn = currentInputTranscriptionRef.current.trim();
      if (lastTurn) {
        fullTranscriptRef.current += lastTurn;
        onTurnComplete(lastTurn); // Make sure the last part is added to history
      }
      onComplete(fullTranscriptRef.current);
    }
  }, [isRecording, onComplete, onTurnComplete]);

  return { isRecording, currentSpokenText, startConversation, stopConversation, error };
};