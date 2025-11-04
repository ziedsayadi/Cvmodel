import * as pdfjsLib from 'pdfjs-dist';
import { CVData } from '../types/cv';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';


pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

export const extractTextFromPDF = async (file: File): Promise<string> => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

    let fullText = '';

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');
      fullText += pageText + '\n\n';
    }

    return fullText.trim();
  } catch (error) {
    console.error('Error extracting PDF text:', error);
    throw new Error('Failed to extract text from PDF');
  }
};

export const extractCVDataFromText = async (text: string): Promise<CVData> => {
  try {
    const response = await fetch('http://localhost:4000/api/extract-cv', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`);
    }

    return (await response.json()) as CVData;
  } catch (err) {
    console.error('CV extraction API error:', err);
    throw err;
  }
};

export const processPDFToCV = async (file: File): Promise<CVData> => {
  const text = await extractTextFromPDF(file);
  const cvData = await extractCVDataFromText(text);
  return cvData;
};
