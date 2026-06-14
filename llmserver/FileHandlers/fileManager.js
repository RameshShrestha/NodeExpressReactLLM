import { PDFParse } from 'pdf-parse';
import dotenv from 'dotenv';
import mammoth from 'mammoth';
import * as fs from 'node:fs/promises';
import fsSync from 'fs';
import path from 'path';
import {doEmbeddingAndStore} from '../LLM/embedding.js';
function splitTextIntoChunks(text, chunkSize, overlap) {
  if (chunkSize <= overlap) {
    throw new Error("chunkSize should be greater than overlap.");
  }

  const textLength = text.length;
  const chunks = [];

  // Calculate step size considering the overlap
  const stepSize = chunkSize - overlap;

  for (let start = 0; start < textLength; start += stepSize) {
    const end = start + chunkSize;

    // Ensure chunk does not exceed text length
    const chunk = text.substring(start, Math.min(end, textLength));

    chunks.push(chunk);

    // Break if the end of the text is reached
    if (end >= textLength) {
      break;
    }
  }

  return chunks;
}
const extractTextFromPdf = async (pathStr) => {
  try {
    // Read the PDF file into a buffer
    const dataBuffer = fsSync.readFileSync(pathStr);
    // Parse the buffer to extract data
  //  const data = await pdfParse(dataBuffer);
    const parser = new PDFParse({ data: dataBuffer }); // or {url: link}
const result = await parser.getText();

    // 'data.text' contains the full text content of the PDF
    return result.text;
  } catch (error) {
    console.error("An error occurred during PDF extraction:", error);
    throw error;
  }
};

const extractWordContent = async (filePath) => {
  let text = await mammoth.extractRawText({ path: filePath })
    .then(function (result) {
      var text = result.value; // The raw text
      var messages = result.messages;
      return text;
    })
    .catch(function (error) {
      console.error(error);
    });
  return text;
}
//const fs = require('fs');

const readTextFile = async (filePath) => {
  try {
    const data = await fs.readFile(filePath, 'utf8'); // Specify 'utf8' for text content
  //  console.log(data); // The file content as a string
    return data;
  } catch (error) {
    console.error(`Got an error trying to read the file: ${error.message}`);
  }
}

const handleFileUpload = async (selectedChatId, files) => {

 for (const file of files) {
    const filePath = path.join('uploads', file.originalname);
    await fs.writeFile(filePath, file.buffer); // Save the file to disk

    let textContent;
    if (file.mimetype === 'application/pdf') {
      textContent = await extractTextFromPdf(filePath);
    } else if (file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      textContent = await extractWordContent(filePath);
    } else if (file.mimetype.startsWith('text/')) {
      textContent = await readTextFile(filePath);
    } else {
      console.warn(`Unsupported file type: ${file.mimetype}`);
      continue; // Skip unsupported file types
    }

    // Process the extracted text content as needed (e.g., save to database, analyze, etc.)
    console.log(`Extracted text from ${file.originalname}:`, textContent);


    // Optionally, split the text into chunks for better processing
    const chunks = splitTextIntoChunks(textContent, 1000, 50); // Example chunk size and overlap
    console.log(`Text chunks for ${file.originalname}:`);
    for (const [index, chunk] of chunks.entries()) {
      console.log(`\x1b[33mChunk ${index + 1}: \x1b[32m`, chunk , '\x1b[0m');
      // You can further process each chunk as needed (e.g., embedding, storing, etc.)
    }

    doEmbeddingAndStore(chunks, file.originalname, selectedChatId); // Call your embedding function with the chunks and metadata

    // Clean up the saved file if you don't need it anymore
    await fs.unlink(filePath);  
  }
 
};
export default handleFileUpload ;