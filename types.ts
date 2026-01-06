
export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export interface ProcessedFile {
  name: string;
  content: string;
  type: string;
  size: number;
}

export interface PDFDocument {
  name: string;
  content: string;
  pageCount: number;
  size: number;
}

export enum AppState {
  UPLOAD = 'UPLOAD',
  PROCESSING = 'PROCESSING',
  CHAT = 'CHAT',
  ERROR = 'ERROR'
}
