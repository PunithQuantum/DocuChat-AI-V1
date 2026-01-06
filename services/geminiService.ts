
import { GoogleGenAI, Chat, Content } from "@google/genai";
import { ProcessedFile } from "../types";

let chatSession: Chat | null = null;

/**
 * Initializes the chat session with the provided documents as context.
 */
export const initializeChatSession = (files: ProcessedFile[], history?: Content[]) => {
  try {
    const apiKey = process.env.API_KEY;
    
    if (!apiKey || apiKey === "undefined") {
      throw new Error("API Key is missing. Set VITE_API_KEY in your environment.");
    }

    const ai = new GoogleGenAI({ apiKey });
    
    const fileContext = files.map((file, index) => `
--- DOCUMENT ${index + 1}: ${file.name} ---
${file.content}
--- END OF DOCUMENT ${index + 1} ---
`).join('\n\n');

    const systemInstruction = `
      You are a specialized Document Analysis Assistant. 
      Answer questions based ONLY on the provided document content.
      Always cite the document name.
      If information is missing, say you don't know based on these files.
      
      DOCUMENTS:
      ${fileContext}
    `;

    chatSession = ai.chats.create({
      model: 'gemini-3-flash-preview',
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.2,
      },
      history: history || []
    });

    return true;
  } catch (error: any) {
    console.error("Initialization error:", error);
    throw error;
  }
};

/**
 * Sends a user message and streams the response.
 */
export const sendMessageStream = async function* (message: string): AsyncGenerator<string, void, unknown> {
  if (!chatSession) {
    throw new Error("Session not initialized.");
  }

  try {
    const responseStream = await chatSession.sendMessageStream({ message });
    for await (const chunk of responseStream) {
      if (chunk.text) {
        yield chunk.text;
      }
    }
  } catch (error: any) {
    console.error("Chat error:", error);
    throw new Error(error.message || "AI failed to respond.");
  }
};
