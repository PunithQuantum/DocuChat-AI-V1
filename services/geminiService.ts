
import { GoogleGenAI, Chat, Content } from "@google/genai";
import { ProcessedFile } from "../types";

let chatSession: Chat | null = null;

export const initializeChatSession = (files: ProcessedFile[], history?: Content[]) => {
  const apiKey = process.env.API_KEY;
  
  if (!apiKey) {
    throw new Error("AI API Key is missing. Ensure VITE_API_KEY is set in your environment.");
  }

  const ai = new GoogleGenAI({ apiKey });
  
  const fileContext = files.map((file, index) => `
[DOC ${index + 1}: ${file.name}]
${file.content}
`).join('\n\n');

  const systemInstruction = `
    You are an expert Document Analysis AI. Use ONLY the following documents to answer questions.
    Cite document names. If information is missing, say you cannot find it.
    
    DOCUMENTS:
    ${fileContext}
  `;

  chatSession = ai.chats.create({
    model: 'gemini-3-flash-preview',
    config: {
      systemInstruction,
      temperature: 0.2,
    },
    history: history || []
  });
};

export const sendMessageStream = async function* (message: string): AsyncGenerator<string, void, unknown> {
  if (!chatSession) throw new Error("AI not initialized.");

  try {
    const responseStream = await chatSession.sendMessageStream({ message });
    for await (const chunk of responseStream) {
      if (chunk.text) {
        yield chunk.text;
      }
    }
  } catch (error: any) {
    throw new Error(error.message || "Failed to communicate with AI.");
  }
};

