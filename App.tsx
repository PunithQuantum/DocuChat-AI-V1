
import React, { useState } from 'react';
import Header from './components/Header';
import FileUploader from './components/FileUploader';
import ChatInterface from './components/ChatInterface';
import { processFiles } from './services/fileService';
import { initializeChatSession, sendMessageStream } from './services/geminiService';
import { AppState, Message, ProcessedFile } from './types';
import { Content } from '@google/genai';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.UPLOAD);
  const [activeDocuments, setActiveDocuments] = useState<ProcessedFile[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFilesSelected = async (files: File[]) => {
    try {
      setAppState(AppState.PROCESSING);
      setError(null);
      setIsProcessing(true);

      const processedDocs = await processFiles(files);
      
      if (processedDocs.length === 0) {
        throw new Error("No readable text could be extracted from these files.");
      }

      initializeChatSession(processedDocs);
      setActiveDocuments(processedDocs);
      setAppState(AppState.CHAT);
      
      const fileNames = processedDocs.map(d => `**${d.name}**`).join(', ');
      setMessages([
        {
          id: 'welcome',
          role: 'model',
          text: `I've successfully loaded ${processedDocs.length} document(s): ${fileNames}. How can I assist you with them today?`,
          timestamp: Date.now()
        }
      ]);
    } catch (err: any) {
      console.error("File processing failed:", err);
      setError(err.message || "An error occurred while processing files.");
      setAppState(AppState.UPLOAD);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', text, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setIsProcessing(true);

    const botMsgId = (Date.now() + 1).toString();
    setMessages(prev => [...prev, { id: botMsgId, role: 'model', text: '', timestamp: Date.now() }]);

    try {
      const stream = sendMessageStream(text);
      let fullText = '';
      for await (const chunk of stream) {
        fullText += chunk;
        setMessages(prev => prev.map(msg => 
          msg.id === botMsgId ? { ...msg, text: fullText } : msg
        ));
      }
    } catch (err: any) {
      console.error("Stream failed:", err);
      setMessages(prev => prev.map(msg => 
        msg.id === botMsgId ? { ...msg, text: `⚠️ Error: ${err.message}` } : msg
      ));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAddFiles = async (files: File[]) => {
    try {
      setIsProcessing(true);
      const newDocs = await processFiles(files);
      if (newDocs.length === 0) return;

      const updatedDocs = [...activeDocuments, ...newDocs];
      const history: Content[] = messages
        .filter(m => m.id !== 'welcome' && m.text && !m.text.startsWith('⚠️'))
        .map(m => ({ role: m.role, parts: [{ text: m.text }] }));

      initializeChatSession(updatedDocs, history);
      setActiveDocuments(updatedDocs);
      
      const newNames = newDocs.map(d => `**${d.name}**`).join(', ');
      setMessages(prev => [
        ...prev,
        {
          id: Date.now().toString(),
          role: 'model',
          text: `Added ${newDocs.length} more document(s): ${newNames}. Context updated.`,
          timestamp: Date.now()
        }
      ]);
    } catch (err: any) {
      console.error("Add files failed:", err);
      alert(err.message || "Failed to add files.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClearDocuments = () => {
    if (confirm("Are you sure you want to remove all documents and start a new chat?")) {
      setActiveDocuments([]);
      setMessages([]);
      setAppState(AppState.UPLOAD);
      setError(null);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50 overflow-hidden">
      <Header 
        activeDocuments={activeDocuments} 
        onClearDocuments={handleClearDocuments} 
        onAddFiles={handleAddFiles}
      />
      <main className="flex-1 overflow-hidden relative">
        <div className="absolute inset-0 bg-grid-slate-100 opacity-40 pointer-events-none" />
        <div className="relative h-full z-10 flex flex-col">
          {appState === AppState.UPLOAD || appState === AppState.PROCESSING ? (
            <div className="flex-1 flex flex-col justify-center px-4">
               <FileUploader 
                 onFilesSelected={handleFilesSelected} 
                 isLoading={appState === AppState.PROCESSING} 
                 error={error} 
               />
            </div>
          ) : (
            <ChatInterface 
              messages={messages} 
              isProcessing={isProcessing} 
              onSendMessage={handleSendMessage} 
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
