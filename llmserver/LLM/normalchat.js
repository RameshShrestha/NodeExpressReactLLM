import { Ollama } from 'ollama'
import { tools } from './tools.js';
import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(import.meta.dirname, '../.env') });
// Use the function like this:
const myTools = await tools();  // assuming you're in an async context where 'await' is allowed.
console.log(myTools);

// ANSI escape codes for colors
const red = '\x1b[31m';
const green = '\x1b[32m';
const blue = '\x1b[34m';
const reset = '\x1b[0m';

// console.log(`${red}This text is red.${reset}`);
// console.log(`${green}This text is green and the rest is default.${reset}`);
// console.log(blue, 'You can also use string substitution with codes.', reset);

// Combining styles (e.g., bold and a different color)
//console.log('\x1b[1m\x1b[33mThis is bold yellow text.\x1b[0m'); // \x1b[1m for bold, \x1b[33m for yellow
const debugMode =  process.env.DEBUG_MODE==='true' || false;
let ollamaHost = process.env.OLLAMA_BASE_URL || 'http://docker.internal';

if (process.env.ENVIRONMENT === "development") {
  console.log("Running in development environment, using host.docker.internal to connect to Ollama");
  ollamaHost = 'http://localhost:11434';
}
console.log(`OLLAMA_HOST: ${green}${ollamaHost}${reset}`);


const ollama = new Ollama({
  host: ollamaHost
});
const queryAnalysis = async (modelName, systemPrompt, chatHistory, prompt, stream) => {

}


/**
 * Step 1: The Front-End Intent Router
 * Uses structured outputs to safely classify the user's intent.
 */
const analyzeUserQuery = async (modelName, userQuery) => {

  const userMessage = `Analyze this user query and determine the best operational path: "${userQuery}"`;
  const systemInstruction = `You are an expert intent classifier for a document management system. 
                Categorize the user's query into exactly one of three routes:
                - VECTOR_FACT: User wants specific facts, exact numbers, or small localized rules inside a document.
                - SUMMARY: User wants a high-level overview, a core summary, or themes of entire documents.
                - NONE: The query is general greeting, conversation, math, coding, or does not need any corporate document context.`;
 try {
    // const response = await ai.models.generateContent({
    //     model: "gemini-2.5-flash", // Fast, cost-efficient model ideal for routing
    //     contents: 
    //     config: {

    //         // Enforce a strict JSON schema output
    //         responseMimeType: "application/json",
    //         responseSchema: {
    //             type: Type.OBJECT,
    //             properties: {
    //                 route: {
    //                     type: Type.STRING,
    //                     description: "Must be exactly 'VECTOR_FACT', 'SUMMARY', or 'NONE'",
    //                 },
    //             },
    //             required: ["route"],
    //         },
    //     },
    // });

const schema = {
          "type": "object",
          "properties": {
              "route": {
                  "type": "string",
                  "enum": ["VECTOR_FACT", "SUMMARY", "NONE"]
              }
          },
          "required": ["route"]
      }
    const response = await ollama.chat({
      model: modelName,
      think: false,
      messages: [
        { role: 'system', content: systemInstruction },
        { role: 'user', content: userMessage }
      ],
      stream: false,
      format:schema
    });
     debugMode && console.log("response",response);
    return JSON.parse(response.message.content);

  
  } catch (error) {
    console.error("Routing failed, defaulting to NONE:", error);
    return "NONE";
  }
}

const chatWithImage = async (modelName, prompt,imageBuffer) => {
  
  console.log(`Model: ${green} ${modelName} ${reset}, Prompt: ${green} ${prompt}${reset}, Image Buffer :${green} ${imageBuffer}${reset}`);
  console.log("calling llm... Image chat")

  let systemPrompt = `Role & Objective: You are an expert multimodal AI assistant capable of highly accurate visual analysis, 
                      data extraction, and image-based problem solving. Your goal is to deeply understand the uploaded image(s) and provide clear, 
                      structured, and actionable responses based on the user's specific needs.

                    Behavioral Guidelines:
                    1. Thorough Analysis: Before answering, meticulously analyze the entire image. Note the subject, setting, lighting, dominant colors, text, and 
                          any critical details.
                    2. Direct & Concise: Provide the requested information directly. Avoid long, unnecessary descriptions unless the user explicitly 
                          asks you to describe the image.
                    3. Context-Aware: Tailor your tone and output format based on the user's prompt (e.g., if asked for code, output valid code; 
                        if asked for a recipe, output culinary instructions).
                    4. Image-to-Text Conversion: If requested to transcribe or extract text, ensure high accuracy by double-checking OCR results.
                    5. Limitations & Safety: If an image contains sensitive, inappropriate, or unclear content, refuse politely and explain the limitation. 
                    6. Clarification: If the user's prompt is ambiguous or the image is too blurry to yield a confident answer, ask the user for clarification 
                        or a higher-quality upload.
                    `;

    if (!prompt || prompt.length < 1 )   {
      prompt ="Get the details of the image";
    }             
  const response = await ollama.chat({
    model: modelName,
    think: true,
   
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: prompt , images: [...imageBuffer]}
    ],
    stream: false
  });
  // console.log("response",response);
  return response;
}

const normalchat = async (modelName, systemPrompt, chatHistory, prompt, stream, imageBuffer) => {
  debugMode &&  console.log(`Model: ${green} ${modelName} ${reset}, Prompt: ${green} ${prompt}${reset}, System Prompt: ${green}${systemPrompt}${reset}, Stream :${green} ${stream}${reset}`);
  console.log("calling llm... Normal chat")
  let newPrompt = { };

  if(imageBuffer.length > -1){
    newPrompt =   { role: 'user', content: prompt , images: [...imageBuffer]};
  }else{
   newPrompt =   { role: 'user', content: prompt }
  }
  const response = await ollama.chat({
    model: modelName,
    think: false,
    messages: [
      { role: 'system', content: systemPrompt },
      ...chatHistory,
     newPrompt
    ],
    stream: stream
  });
  // console.log("response",response);
  return response;
}
const chatWithTools = async (modelName, systemPrompt, chatHistory, prompt, stream ,imageBuffer) => {
  debugMode &&  console.log(`Model: ${modelName}, Prompt: ${prompt}, System Prompt: ${systemPrompt}, Stream : ${stream}`);
  debugMode &&  console.log("chatHistory", chatHistory);
   debugMode && console.log(`Model: ${green} ${modelName} ${reset}, Prompt: ${green} ${prompt}${reset}, System Prompt: ${green}${systemPrompt}${reset}, Stream :${green} ${stream}${reset}`);
  console.log("calling llm with tools... Chat with tools chat")

    let newPrompt = { };

  if(imageBuffer.length > -1){
    newPrompt =   { role: 'user', content: prompt , images: [...imageBuffer]};
  }else{
   newPrompt =   { role: 'user', content: prompt }
  }
  try {

    console.log("Calling LLM with tools. Tools available:", myTools.map(tool => tool.function?.name).join(', '));
    const response = await ollama.chat({
      model: modelName,
      think: false,
      messages: [
        { role: 'system', content: systemPrompt },
        ...chatHistory,
        newPrompt
      ],
      stream: stream,
      // format: 'json', // Ensure the response is in JSON format for easier parsing
      tools: myTools
    });
    // console.log("response",response);
    return response;
  } catch (error) {

    console.error(`${red}Error during chatWithTools: ${error} ${reset}`);
    const fallbackSystemPrompt = `
    You do not have native tool support, So just respond with the answer directly without using any tools.
    Ignore any tools related messages in the prompt and respond based on your internal knowledge and the information provided in the prompt. 
 
    System Prompt: ${systemPrompt}
  `;
    // 2. Check if the error is specifically about tool support
    if (error.message.includes('does not support tools')) {
      console.warn(`Model ${modelName} lacks native tool support. Falling back to prompt-based tools.`);

      const fallbackResponse = await ollama.chat({
        model: modelName,
        messages: [
          { role: 'system', content: fallbackSystemPrompt },
          ...chatHistory,
          { role: 'user', content: prompt }
        ],
        // No 'tools' field here—it would just trigger the error again
        //   format: 'json' // Force JSON mode so you can parse the "manual" tool call
      });

      return fallbackResponse;
    }

    throw error; // Re-throw other unexpected errors
  }
}
export { normalchat, chatWithTools ,analyzeUserQuery,chatWithImage};