import { GoogleGenAI, Type } from "@google/genai";
import { ActionPoint } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

export const transcribeAudio = async (audioBase64: string, mimeType: string): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-pro",
            contents: {
                parts: [
                    {
                        inlineData: {
                            mimeType: mimeType,
                            data: audioBase64,
                        },
                    },
                    { text: "Transcribe this audio file. Provide only the text of the transcription." },
                ],
            },
        });
        return response.text;
    } catch (error) {
        console.error("Error transcribing audio:", error);
        return "";
    }
};

export const generateSummaryAndActionPoints = async (transcript: string): Promise<{ summary: string; actionPoints: Omit<ActionPoint, 'id' | 'completed'>[] }> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-pro", // Using Pro for better JSON generation
            contents: `Based on the following transcript, please provide a concise summary and extract key action items.
            
            Transcript:
            ---
            ${transcript}
            ---
            
            Respond with a JSON object.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        summary: {
                            type: Type.STRING,
                            description: "A concise summary of the transcript."
                        },
                        action_points: {
                            type: Type.ARRAY,
                            description: "A list of action items from the transcript.",
                            items: {
                                type: Type.STRING
                            }
                        }
                    },
                    required: ["summary", "action_points"]
                }
            }
        });

        const jsonString = response.text.trim();
        const result = JSON.parse(jsonString);

        return {
            summary: result.summary,
            actionPoints: (result.action_points || []).map((text: string) => ({ text })),
        };

    } catch (error) {
        console.error("Error generating summary and action points:", error);
        // Fallback in case of API error
        return {
            summary: "Could not generate a summary due to an error. Here is the full transcript:\n\n" + transcript,
            actionPoints: [],
        };
    }
};

export const getChatResponse = async (noteContent: string, userMessage: string, chatHistory: {role: string, parts: {text: string}[]}[]): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `You are an AI assistant chatting about a specific note. 
            Here is the note content:
            ---
            ${noteContent}
            ---
            And here is the conversation history:
            ${chatHistory.map(m => `${m.role}: ${m.parts[0].text}`).join('\n')}
            ---
            Now, please respond to this user message: "${userMessage}"`,
        });

        return response.text;
    } catch (error) {
        console.error("Error getting chat response:", error);
        return "I'm sorry, I encountered an error and can't respond right now.";
    }
};