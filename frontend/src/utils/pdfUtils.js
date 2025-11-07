export const extractTextFromPDF = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = async (e) => {
      try {
        const typedArray = new Uint8Array(e.target.result);
        
        // Use PDF.js library
        const pdfjsLib = window['pdfjs-dist/build/pdf'];
        pdfjsLib.GlobalWorkerOptions.workerSrc = 
          'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        
        const pdf = await pdfjsLib.getDocument(typedArray).promise;
        let fullText = '';
        
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          const pageText = textContent.items.map(item => item.str).join(' ');
          fullText += pageText + '\n';
        }
        
        resolve(fullText);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
};

export const chunkText = (text, chunkSize = 1000, overlap = 200) => {
  const chunks = [];
  let start = 0;
  const textLength = text.length;
  
  while (start < textLength) {
    let end = start + chunkSize;
    let chunk = text.substring(start, end);
    
    // Try to break at sentence boundary
    if (end < textLength) {
      const lastPeriod = chunk.lastIndexOf('.');
      const lastNewline = chunk.lastIndexOf('\n');
      const breakPoint = Math.max(lastPeriod, lastNewline);
      
      if (breakPoint > chunkSize * 0.5) {
        chunk = chunk.substring(0, breakPoint + 1);
        end = start + breakPoint + 1;
      }
    }
    
    if (chunk.trim().length > 50) {
      chunks.push(chunk.trim());
    }
    
    start = end - overlap;
  }
  
  return chunks;
};
