import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, StopCircle, CornerDownLeft } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Message } from '../types';

interface ChatInterfaceProps {
  messages: Message[];
  isProcessing: boolean;
  onSendMessage: (text: string) => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ messages, isProcessing, onSendMessage }) => {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isProcessing]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (inputText.trim() && !isProcessing) {
      onSendMessage(inputText.trim());
      setInputText('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const showLoader = isProcessing && messages.length > 0 && messages[messages.length - 1].role === 'user';

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] w-full max-w-5xl mx-auto bg-white shadow-xl sm:rounded-xl sm:my-4 sm:h-[calc(100vh-96px)] overflow-hidden border border-slate-200">
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-slate-50 scroll-smooth">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 opacity-60">
             <div className="bg-indigo-50 p-6 rounded-full mb-4">
                <Bot className="w-12 h-12 text-indigo-400" />
             </div>
             <p className="text-lg font-medium">Ready to chat!</p>
             <p className="text-sm">Ask any question about your document.</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <div className={`
                flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center shadow-sm
                ${msg.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-emerald-600 text-white'}
              `}>
                {msg.role === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
              </div>

              <div className={`
                flex flex-col max-w-[85%] sm:max-w-[75%]
                ${msg.role === 'user' ? 'items-end' : 'items-start'}
              `}>
                <div className={`
                  px-5 py-3.5 rounded-2xl shadow-sm text-sm sm:text-base leading-relaxed
                  ${msg.role === 'user' 
                    ? 'bg-indigo-600 text-white rounded-tr-none' 
                    : 'bg-white text-slate-800 border border-slate-100 rounded-tl-none prose prose-sm max-w-none'
                  }
                `}>
                  {msg.role === 'model' ? (
                    <ReactMarkdown 
                      components={{
                        p: (props: any) => <p className="mb-2 last:mb-0" {...props} />,
                        ul: (props: any) => <ul className="list-disc pl-4 mb-2" {...props} />,
                        ol: (props: any) => <ol className="list-decimal pl-4 mb-2" {...props} />,
                        li: (props: any) => <li className="mb-1" {...props} />,
                        strong: (props: any) => <strong className="font-bold text-slate-900" {...props} />,
                        code: ({ className, children, ...props }: any) => {
                           const match = /language-(\w+)/.exec(className || '')
                           return !match ? (
                             <code className="bg-slate-100 text-pink-600 px-1 py-0.5 rounded text-xs font-mono" {...props}>
                               {children}
                             </code>
                           ) : (
                             <code className={className} {...props}>
                               {children}
                             </code>
                           )
                        }
                      }}
                    >
                      {msg.text}
                    </ReactMarkdown>
                  ) : (
                    msg.text
                  )}
                </div>
                <span className="text-[10px] text-slate-400 mt-1 px-1">
                   {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          ))
        )}
        
        {showLoader && (
          <div className="flex items-start gap-4 animate-pulse">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center">
              <Bot className="w-5 h-5" />
            </div>
            <div className="bg-white px-5 py-4 rounded-2xl rounded-tl-none border border-slate-100 shadow-sm flex items-center gap-2">
              <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
              <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
              <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="bg-white p-4 border-t border-slate-200">
        <form onSubmit={handleSubmit} className="relative flex items-end gap-2 max-w-4xl mx-auto">
          <div className="relative flex-1 bg-slate-100 rounded-2xl border border-slate-200 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
            <textarea
              ref={inputRef}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask a question about the document..."
              className="w-full bg-transparent border-0 focus:ring-0 p-3.5 max-h-32 min-h-[52px] resize-none text-slate-800 placeholder:text-slate-400 text-sm sm:text-base scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent rounded-2xl"
              rows={1}
              style={{ height: 'auto', minHeight: '52px' }}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = 'auto';
                target.style.height = `${Math.min(target.scrollHeight, 128)}px`;
              }}
            />
            <div className="absolute right-2 bottom-2 text-[10px] text-slate-400 font-medium hidden sm:flex items-center gap-1 bg-white/50 px-1.5 py-0.5 rounded">
               <CornerDownLeft className="w-3 h-3" /> Return to send
            </div>
          </div>
          
          <button
            type="submit"
            disabled={!inputText.trim() || isProcessing}
            className={`
              p-3.5 rounded-xl flex-shrink-0 transition-all duration-200 shadow-sm
              ${!inputText.trim() || isProcessing
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-md active:scale-95'
              }
            `}
          >
            {isProcessing ? <StopCircle className="w-5 h-5 animate-pulse" /> : <Send className="w-5 h-5" />}
          </button>
        </form>
        <div className="text-center mt-2">
           <p className="text-[10px] text-slate-400">
             AI can make mistakes. Please verify important information from the document.
           </p>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;