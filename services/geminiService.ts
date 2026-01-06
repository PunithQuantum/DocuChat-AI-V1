import { GoogleGenAI, Chat, Content, GenerateContentResponse } from "@google/genai";
import { ProcessedFile } from "../types";

let chatSession: Chat | null = null;

export const initializeChatSession = (files: ProcessedFile[], history?: Content[]): void => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const fileContext = files.map((file, index) => `
DOCUMENT ${index + 1} START
Name: ${file.name}
Content:
${file.content}
DOCUMENT ${index + 1} END
`).join('\n\n');

    const systemInstruction = `
      You are an expert Document Analysis AI. 
      Answer questions based ONLY on the following documents.
      Always cite document names using [Filename].
      Use Markdown for formatting.
      
      CONTEXT:
      ${fileContext}
    `;

    chatSession = ai.chats.create({
      model: 'gemini-3-pro-preview',
      config: {
        systemInstruction,
        temperature: 0.2,
      },
      history: history || []
    });
  } catch (error) {
    console.error("Gemini Init Error:", error);
    throw new Error("AI Session failed to start.");
  }
};

export const sendMessageStream = async function* (message: string): AsyncGenerator<string, void, unknown> {
  if (!chatSession) throw new Error("No active session.");

  try {
    const responseStream = await chatSession.sendMessageStream({ message });
    for await (const chunk of responseStream) {
      const typedChunk = chunk as GenerateContentResponse;
      if (typedChunk.text) {
        yield typedChunk.text;
      }
    }
  } catch (error: any) {
    console.error("Gemini Error:", error);
    throw new Error("Failed to get response from AI.");
  }
};