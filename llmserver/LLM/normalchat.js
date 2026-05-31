import { Ollama } from 'ollama'
import { tools } from './tools.js';
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


const ollama = new Ollama();
const normalchat = async (modelName,systemPrompt,chatHistory,prompt,stream) => {
    console.log(`Model: ${green} ${modelName} ${reset}, Prompt: ${green} ${prompt}${reset}, System Prompt: ${green}${systemPrompt}${reset}, Stream :${green} ${stream}${reset}`);
  console.log("calling llm... Normal chat")
    const response = await ollama.chat({
      model: modelName,
      messages: [
        { role: 'system', content: systemPrompt },
        ...chatHistory,
        { role: 'user', content: prompt }
      ],
      stream: stream
    });
   // console.log("response",response);
    return response;
}
const chatWithTools = async (modelName,systemPrompt,chatHistory,prompt,stream) => {
  //   console.log(`Model: ${modelName}, Prompt: ${prompt}, System Prompt: ${systemPrompt}, Stream : ${stream}`);
  console.log(`Model: ${green} ${modelName} ${reset}, Prompt: ${green} ${prompt}${reset}, System Prompt: ${green}${systemPrompt}${reset}, Stream :${green} ${stream}${reset}`);
  console.log("calling llm with tools... Chat with tools chat")
  try{

  console.log("Calling LLM with tools. Tools available:", myTools.map(tool => tool.name).join(', '));
    const response = await ollama.chat({
      model: modelName,
      messages: [
        { role: 'system', content: systemPrompt },
        ...chatHistory,
        { role: 'user', content: prompt }
      ],
      stream: stream,
     // format: 'json', // Ensure the response is in JSON format for easier parsing
      tools: myTools
    });
   // console.log("response",response);
    return response;
    }catch(error){
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
export { normalchat,chatWithTools};