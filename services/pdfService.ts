
import { PDFDocument } from '../types';

const getPdfLib = () => {
  const lib = (window as any).pdfjsLib;
  if (!lib) throw new Error('PDF.js library not loaded');
  return lib;
};

export const extractTextFromPDF = async (file: File): Promise<PDFDocument> => {
  const pdfjsLib = getPdfLib();
  
  try {
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    
    let fullText = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');
      
      fullText += `--- Page ${i} ---\n${pageText}\n\n`;
    }

    return {
      name: file.name,
      content: fullText,
      pageCount: pdf.numPages,
      size: file.size
    };
  } catch (error) {
    console.error('PDF parsing error:', error);
    throw new Error(`Failed to extract text from ${file.name}.`);
  }
};
