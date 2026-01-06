
import React, { useRef } from 'react';
import { Bot, FileText, Trash2, Layers, Plus } from 'lucide-react';
import { ProcessedFile } from '../types';

interface HeaderProps {
  activeDocuments: ProcessedFile[];
  onClearDocuments: () => void;
  onAddFiles: (files: File[]) => void;
}

// Added onAddFiles prop to interface and implemented UI for adding more files to resolve TS error in App.tsx
const Header: React.FC<HeaderProps> = ({ activeDocuments, onClearDocuments, onAddFiles }) => {
  const fileCount = activeDocuments.length;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAddClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onAddFiles(Array.from(e.target.files));
      // Reset input so same file can be selected again if needed
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };
  
  return (
    <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-4 sm:px-6 shadow-sm z-10 sticky top-0">
      <div className="flex items-center gap-2">
        <div className="bg-indigo-600 p-2 rounded-lg">
          <Bot className="w-5 h-5 text-white" />
        </div>
        <h1 className="text-xl font-bold text-slate-800 tracking-tight">
          Docu<span className="text-indigo-600">Chat</span> AI
        </h1>
      </div>

      {fileCount > 0 && (
        <div className="flex items-center gap-2 sm:gap-4 animate-fade-in">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-full border border-slate-200">
            {fileCount === 1 ? (
              <>
                <FileText className="w-4 h-4 text-slate-500" />
                <span className="text-sm font-medium text-slate-700 truncate max-w-[150px]" title={activeDocuments[0].name}>
                  {activeDocuments[0].name}
                </span>
              </>
            ) : (
              <>
                <Layers className="w-4 h-4 text-slate-500" />
                <span className="text-sm font-medium text-slate-700" title={activeDocuments.map(d => d.name).join(', ')}>
                  {fileCount} Docs
                </span>
              </>
            )}
            <span className="text-xs text-slate-400 border-l border-slate-300 pl-2 ml-1">
              {activeDocuments.reduce((acc, file) => acc + (file.size / 1024), 0).toFixed(0)} KB
            </span>
          </div>
          
          <div className="flex items-center gap-1 border-l border-slate-200 pl-2 ml-2 sm:border-0 sm:pl-0 sm:ml-0">
            <input 
              type="file" 
              multiple 
              ref={fileInputRef} 
              className="hidden" 
              onChange={handleFileChange} 
            />
            <button
              onClick={handleAddClick}
              className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors duration-200"
              title="Add more documents"
            >
              <Plus className="w-5 h-5" />
            </button>
            
            <button
              onClick={onClearDocuments}
              className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors duration-200"
              title="Remove all documents and reset chat"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
