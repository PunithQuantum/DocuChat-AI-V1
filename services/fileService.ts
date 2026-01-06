
import { ProcessedFile } from '../types';

const getLib = (name: string) => {
  const lib = (window as any)[name];
  if (!lib) throw new Error(`Library ${name} not loaded correctly.`);
  return lib;
};

const extractTextFromPDF = async (file: File): Promise<string> => {
  const pdfjsLib = getLib('pdfjsLib');
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  const pdf = await loadingTask.promise;
  let text = '';
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items.map((item: any) => item.str).join(' ');
    text += `[PAGE ${i}]\n${pageText}\n\n`;
  }
  return text;
};

const extractTextFromDocx = async (file: File): Promise<string> => {
  const mammoth = getLib('mammoth');
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  return result.value;
};

const extractTextFromXlsx = async (file: File): Promise<string> => {
  const XLSX = getLib('XLSX');
  const arrayBuffer = await file.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer, { type: 'array' });
  let text = '';
  workbook.SheetNames.forEach((sheetName: string) => {
    const sheet = workbook.Sheets[sheetName];
    text += `### SHEET: ${sheetName}\n`;
    text += XLSX.utils.sheet_to_csv(sheet) + '\n\n';
  });
  return text;
};

const extractTextFromPptx = async (file: File): Promise<string> => {
  const JSZip = getLib('JSZip');
  const zip = await JSZip.loadAsync(file);
  let text = '';
  const slideFiles = Object.keys(zip.files)
    .filter(name => name.startsWith('ppt/slides/slide') && name.endsWith('.xml'))
    .sort((a, b) => {
      const aNum = parseInt(a.match(/\d+/)![0] || "0");
      const bNum = parseInt(b.match(/\d+/)![0] || "0");
      return aNum - bNum;
    });

  for (const [index, slidePath] of slideFiles.entries()) {
    const slideXml = await zip.file(slidePath)?.async('text');
    if (slideXml) {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(slideXml, 'text/xml');
      const textNodes = xmlDoc.getElementsByTagName('a:t');
      const slideText = Array.from(textNodes).map(node => node.textContent).join(' ');
      if (slideText.trim()) {
        text += `### SLIDE ${index + 1}\n${slideText}\n\n`;
      }
    }
  }
  return text;
};

const extractTextFromPlain = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string || '');
    reader.onerror = () => reject(new Error(`Failed to read ${file.name}`));
    reader.readAsText(file);
  });
};

const TEXT_EXTS = ['txt', 'md', 'csv', 'json', 'ts', 'tsx', 'js', 'jsx', 'py', 'java', 'html', 'css', 'sql', 'yaml', 'yml', 'xml', 'log', 'sh', 'env'];

export const processFiles = async (files: File[]): Promise<ProcessedFile[]> => {
  const processed: ProcessedFile[] = [];
  for (const file of files) {
    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    try {
      let content = '';
      if (ext === 'pdf' || file.type === 'application/pdf') {
        content = await extractTextFromPDF(file);
      } else if (ext === 'docx') {
        content = await extractTextFromDocx(file);
      } else if (ext === 'xlsx' || ext === 'xls') {
        content = await extractTextFromXlsx(file);
      } else if (ext === 'pptx') {
        content = await extractTextFromPptx(file);
      } else if (ext === 'ppt' || ext === 'doc') {
        throw new Error(`Legacy .${ext} files are not supported. Please save as .pptx or .docx first.`);
      } else if (TEXT_EXTS.includes(ext) || file.type.startsWith('text/')) {
        content = await extractTextFromPlain(file);
      } else {
        throw new Error(`The file extension .${ext} is not supported yet.`);
      }

      if (content.trim()) {
        processed.push({
          name: file.name,
          content: content.trim(),
          type: file.type || ext,
          size: file.size
        });
      } else {
        throw new Error("No readable text found in this file.");
      }
    } catch (e: any) {
      throw new Error(`Error with ${file.name}: ${e.message}`);
    }
  }
  return processed;
};
