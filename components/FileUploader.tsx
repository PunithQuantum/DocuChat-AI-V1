
import React, { useCallback, useState } from 'react';
import { UploadCloud, FileType, Loader2, AlertCircle, Files, FileSpreadsheet, Presentation } from 'lucide-react';

interface FileUploaderProps {
  onFilesSelected: (files: File[]) => void;
  isLoading: boolean;
  error: string | null;
}

const FileUploader: React.FC<FileUploaderProps> = ({ onFilesSelected, isLoading, error }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFilesSelected(Array.from(e.dataTransfer.files));
    }
  }, [onFilesSelected]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFilesSelected(Array.from(e.target.files));
    }
  }, [onFilesSelected]);

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-3xl mx-auto p-6 animate-fade-in-up">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-slate-900 mb-2">Multi-Document Analysis</h2>
        <p className="text-slate-500 text-lg">
          Upload PDF, Word, Excel, PPT, or Code to start analyzing them with Gemini 3.
        </p>
      </div>

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative w-full border-3 border-dashed rounded-3xl p-12 transition-all duration-300 ease-in-out
          flex flex-col items-center justify-center cursor-pointer group bg-white
          ${isDragging ? 'border-indigo-500 bg-indigo-50 scale-[1.02] shadow-xl' : 'border-slate-300 hover:border-indigo-400 hover:bg-slate-50 shadow-sm'}
          ${isLoading ? 'opacity-75 pointer-events-none' : ''}
        `}
      >
        <input type="file" multiple onChange={handleFileInput} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" disabled={isLoading} />
        {isLoading ? (
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center"><Files className="w-6 h-6 text-indigo-600" /></div>
            </div>
            <div>
              <p className="text-lg font-semibold text-slate-700">Analyzing Documents...</p>
              <p className="text-sm text-slate-400">Extracting text from your files</p>
            </div>
          </div>
        ) : (
          <>
            <div className="w-20 h-20 rounded-2xl bg-indigo-100 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <UploadCloud className="w-10 h-10 text-indigo-600" />
            </div>
            <p className="text-xl font-medium text-slate-700 mb-2">Click or drag files here</p>
            <p className="text-slate-400 text-sm text-center">
              Supports <span className="font-semibold">PDF, DOCX, XLSX, XLS, PPTX</span>, TXT, CSV, JSON & Code
            </p>
            <p className="text-slate-300 text-[11px] mt-2 italic">Note: Save legacy .doc or .ppt as .docx or .pptx first</p>
          </>
        )}
      </div>

      {error && (
        <div className="mt-6 flex items-start gap-3 p-4 bg-red-50 text-red-700 rounded-xl border border-red-100 max-w-xl w-full">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-bold">Parsing Error</p>
            <p className="opacity-90">{error}</p>
          </div>
        </div>
      )}

      {!isLoading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 w-full">
          <div className="p-4 rounded-xl bg-white border border-slate-100 shadow-sm text-center">
            <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center mx-auto mb-3"><Files className="w-5 h-5" /></div>
            <h3 className="font-semibold text-slate-800 text-sm">PDF & Word</h3>
            <p className="text-[10px] text-slate-400 mt-1">Full text extraction</p>
          </div>
          <div className="p-4 rounded-xl bg-white border border-slate-100 shadow-sm text-center">
            <div className="w-10 h-10 bg-green-100 text-green-600 rounded-lg flex items-center justify-center mx-auto mb-3"><FileSpreadsheet className="w-5 h-5" /></div>
            <h3 className="font-semibold text-slate-800 text-sm">Excel Sheets</h3>
            <p className="text-[10px] text-slate-400 mt-1">Multi-sheet analysis</p>
          </div>
          <div className="p-4 rounded-xl bg-white border border-slate-100 shadow-sm text-center">
            <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-lg flex items-center justify-center mx-auto mb-3"><Presentation className="w-5 h-5" /></div>
            <h3 className="font-semibold text-slate-800 text-sm">Presentations</h3>
            <p className="text-[10px] text-slate-400 mt-1">Slide content parsing</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUploader;
