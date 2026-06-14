

import express from 'express';
import dotenv from 'dotenv';
import { Ollama } from 'ollama'
import multer from 'multer';
import { rateLimit } from 'express-rate-limit';
import webSearch from './websearch.js';
import { normalchat, chatWithTools , analyzeUserQuery} from './LLM/normalchat.js';
import { ChatMessageLLM } from './MongoModels/ChatMessageLLMModel.js';
import { connectDB } from './mongodb.js';
import chatHistoryDB from './routes/chatHistoryDB.js';
import path from 'path';
import handleFileUpload from './FileHandlers/fileManager.js';
import { isFileEmbedded, getRelevantDocuments ,getAllDocuments} from './LLM/embedding.js';
const red = '\x1b[31m';
const green = '\x1b[32m';
const blue = '\x1b[34m';
const reset = '\x1b[0m';
let dbConnectedStatus = false;
const debugMode =  process.env.DEBUG_MODE==='true' || false;
if(debugMode){

console.log(path.resolve(import.meta.dirname, '.env'));
}
dotenv.config({ path: path.resolve(import.meta.dirname, './.env') });
//require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
let ollamaHost = process.env.OLLAMA_BASE_URL || 'http://docker.internal';


if (ollamaHost === 'http://docker.internal') {
  ollamaHost = 'http://docker.internal';
}

if (process.env.ENVIRONMENT === "development") {
 
  console.log("Running in development environment, using host.docker.internal to connect to Ollama");
 
  ollamaHost = 'http://localhost:11434';
}
console.log(`Connecting to Ollama at: ${ollamaHost}`);
const ollama = new Ollama({
  host: ollamaHost
});

const app = express();
//const upload = multer({ dest: './uploads/' }); // Set the destination folder to store uploaded files.
// Middleware
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);
app.use(express.json());

app.use(express.static('public'))


const fileStorage = multer.memoryStorage();
// 2. Initialize Multer Instance with Validations
const upload = multer({
  storage: fileStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // Limit size to 10MB
  fileFilter: (req, file, cb) => {
    // Allow only images
    const allowedTypes = /jpeg|jpg|png|gif|pdf|txt|plain/;
    const isExtValid = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const isMimeValid = allowedTypes.test(file.mimetype);

    if (isExtValid && isMimeValid) {
      return cb(null, true);
    }
    cb(new Error('Only image files (jpeg, jpg, png, gif,pdf,txt) are allowed!'));
  }
});


// // Route for Multiple Files Upload (Max 5 files)
// app.post('/upload-multiple', upload.array('galleryImages', 5), (req, res) => {
//     try {
//         if (!req.files || req.files.length === 0) {
//             return res.status(400).json({ error: 'Please select at least one file.' });
//         }
//         // Metadata array is exposed via req.files
//         res.status(200).json({
//             message: 'Multiple files uploaded successfully!',
//             filesCount: req.files.length,
//             filesDetails: req.files
//         });
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// });
// Routes
app.post('/getLLMResponse', upload.array('attachments', 5), async (req, res) => {
  // Here you can access req.body to get the data sent from the client
  // console.log(req.body);
  let { modelName, prompt, systemPrompt, chatHistory, stream } = req.body;
  if (stream === 'false') {
    stream = false;
  }else if( stream == 'true' ){
    stream = true;
  }
  let { selectedChatId } = req.body;

  // const handleFiles = (chatId, files) => {
  //   console.log(`Handling files for chat ID: ${chatId}`);
  // }
  chatHistory = JSON.parse(chatHistory || "[]");
  if (req.files) {
    debugMode && console.log("Received files:", req.files);
    await handleFileUpload(selectedChatId, req.files);
    // handleFiles( selectedChatId, req.files); // Process the uploaded files as needed (e.g., save to disk, analyze content, etc.)
    //  const fileContent = req.file.buffer.toString('utf-8');
  }
   let tempPrompt = prompt;
    if(tempPrompt === "" &&  req.files && req.files.length > 0){
     tempPrompt = `User has provided the following files: ${req.files.map(file => file.originalname).join(', ')}. Please analyze the content of these files and provide a summary or relevant information based on their content.`;
    }
   let userQueryCategory = await analyzeUserQuery(modelName, tempPrompt);
    
     console.log(red + "userQueryCategory", userQueryCategory, reset);

   if(userQueryCategory.route === "VECTOR_FACT"){
    systemPrompt = systemPrompt + "\n\n The user query seems to be looking for specific facts, exact numbers, or small localized rules inside a document. So prioritize retrieving and using precise information from the relevant documents to answer the query.";
   } else if(userQueryCategory.route === "SUMMARY"){
    systemPrompt = systemPrompt + "\n\n The user query seems to be looking for a high-level overview, a core summary, or themes of entire documents. So prioritize providing a concise summary that captures the main points and themes from the relevant documents to answer the query.";
   
  } else {
    systemPrompt = systemPrompt + "\n\n The user query seems to be a general greeting, conversation, math, coding, or does not need any corporate document context. So you can rely more on your internal knowledge and general reasoning to answer the query without needing to pull in specific details from the documents.";
   }

  if (!selectedChatId) {

   debugMode &&   console.log("Creating new chat document in the database for prompt:", prompt);
    const newChat = await ChatMessageLLM.create({
      title: prompt,
      UserId: "localUser",
      SystemMessage: systemPrompt ||  `Helpful assistant on provided topics,

              Rules
              1. Always respond as html5 tags inside div which can be added into webpage. This is very critical, you should always make sure on this before final response.
              2. You will respond within 100  words for interaction as general communication. 
              3. Content should not be more than 500 words at all.
              4. If you have some more information, ask for user if user wanted to know more on that.
              5. Do not use tools when internal knowledge is sufficient or already knowledge is provided via tool or user. 
                  When you use tools, always use them at the beginning of the response and do not add any other content
                    in that and your answer should be based on tool response not your response do not need to be in html5 tags for tool use response response, 
                    wait for tool response and then respond with complete answer using the tool response and internal knowledge.
         Remember todays date and time is ` + new Date(),
      ChatID: crypto.randomUUID(), // Generate a unique UUID for each chat
      children: [{ userName: "User", Message: prompt , Attachments: req.files ? req.files.map(file => file.originalname).join('\n') : "" }] // Initialize with an empty array for chat messages
    });
    // const newChatDocument = await newChat.save();
     debugMode &&  console.log("Created new chat with ID:", newChat._id);
    selectedChatId = newChat._id; // Update the selectedChatId to the newly created chat's ID
  } else {
    // If a chat ID is selected, update the existing chat document in the database
    // await ChatMessageLLM.findByIdAndUpdate(selectedChatId, {
    //     children: [ { userName: "user", Message: prompt } ]
    //   });

    const updatedParent = await ChatMessageLLM.findByIdAndUpdate(
      selectedChatId,
      { $push: { children: { userName: "User", Message: prompt, Attachments: req.files ? req.files.map(file => file.originalname).join('\n') : "" } } }, // req.body contains the child data
      { new: true, runValidators: true } // Returns updated doc and runs schema checks
    );


  debugMode &&   console.log("Updated chat with ID:", selectedChatId);
  }
  const isJson = str => {
    str = str.replace("<tool_call>", ""); // Remove the tool_call tags if present
    str = str.replace("<tool_call>", ""); // Remove the closing tool_call tags if present
    try { JSON.parse(str); return true; } catch { return false; }
  };
  let isEmbedded = await isFileEmbedded(selectedChatId);
  console.log("Embedded knowledge is available ?  ", isEmbedded);
  let RAG_Content = "";
  if (isEmbedded && userQueryCategory.route === "VECTOR_FACT") {
    RAG_Content = await getRelevantDocuments(prompt, [], selectedChatId);
    // RAG_Content.QueryResult?.documents?.forEach((doc, index) => {
    //   console.log(`\x1b[35mRelevant Document ${index + 1} (Source: ${doc.metadata.source}):\x1b[0m \n\x1b[36m${doc.document}\x1b[0m\n`);
    // });
  debugMode && console.log("Relevant documents from embedded knowledge:", RAG_Content);
  }else if(isEmbedded && userQueryCategory.route === "SUMMARY"){
    RAG_Content = await getAllDocuments(selectedChatId);
    // RAG_Content.QueryResult?.documents?.forEach((doc, index) => {
    //   console.log(`\x1b[35mRelevant Document ${index + 1} (Source: ${doc.metadata.source}):\x1b[0m \n\x1b[36m${doc.document}\x1b[0m\n`);
    // });
  debugMode &&  console.log("Relevant documents from embedded knowledge for summary:", RAG_Content);
   if(RAG_Content){
    RAG_Content = RAG_Content.substring(0, 5000); // Limit the content to the first 3000 characters
   }
  }


  // For demonstration, we'll just send back a static response
  if (modelName && prompt && systemPrompt) {
    // console.log(`Model: ${modelName}, Prompt: ${prompt}, System Prompt: ${systemPrompt}`);
    let response = {};
    if(RAG_Content){
      systemPrompt = systemPrompt + `\n\n You also have access to the following relevant information based on your internal knowledge and the query, 
      When user ask about the internal knowledge or document  below is the available content: \n\n` + RAG_Content + 
      `\n\n Use this information to provide a more accurate and context-aware response to the user's query.
       Do not use websearch tool when you are using this internal knowledge`;

         response = await normalchat(modelName, systemPrompt, chatHistory, prompt, stream);
         console.log(`${red} RAG realted search so no tools are used ${reset}`);
    }else{
    response = await chatWithTools(modelName, systemPrompt, chatHistory, prompt, stream);
    }
    
    
    
    console.log("LLM Response: received response from llm, checking if streaming or not");
      debugMode &&  console.log("LLM Response:", response);

    if (stream) {
      console.log("inside Streaming response");
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      let collectedResponse = "";
      for await (const chunk of response) {
        if (chunk?.message?.tool_calls) {
          console.log("Tool Call Invoked:", chunk.message.tool_calls);
          if (chunk.message.tool_calls[0].function.name === "getDetailsFromWeb") {
            // Simulate fetching web details
            const functionArgs = chunk.message.tool_calls[0].function.arguments;
            console.log("functionArgs", functionArgs);
            let query = functionArgs.query_topic;
            console.log("Fetching web details for topic:", query);
            const webDetails = `Details for topic ${query} are available.`;  // This is a placeholder for the rest of the code that needs to be filled in
          debugMode &&   console.log("Fetched Web Details:", webDetails);
            res.write(`message: "calling tools"`);
            let webresponse = await webSearch(query);
          debugMode &&   console.log("Web Search Response:", JSON.stringify(webresponse).substring(0, 500));

            let newChatHistory = [...chatHistory, { role: "tool", content: JSON.stringify(webresponse) }];
            const responseWithTools = await normalchat(modelName, systemPrompt, newChatHistory, prompt, stream);
            let collectedResponse = "";
            for await (const chunk of responseWithTools) {
              collectedResponse += chunk?.message?.content || "";
              const content = chunk?.message?.content || "";
              // console.log(content);
              if (content) {
                // Format as Server-Sent Event (SSE)
                // console.log("Executed here");
                res.write(`data: ${JSON.stringify({ content })}\n\n`);
              }
              if (chunk.done) {
                console.log("Executed done");

                res.end(`end: ${chunk.done}\n\n`);
              }

            }
          debugMode &&   console.log("Final collected response after tool execution:", collectedResponse);
            const updatedParent = await ChatMessageLLM.findByIdAndUpdate(
              selectedChatId,
              { $push: { children: { userName: "Assistant", Message: collectedResponse } } }, // req.body contains the child data
              { new: true, runValidators: true } // Returns updated doc and runs schema checks
            );

            //  res.end(`data: ${JSON.stringify({ webresponse })}\n\n`);
            break;
            // You would typically call the LLM again with the fetched details here
          } else {
            console.log("Unknown tool call", chunk.message.tool_calls[0].function.name);
          }
        } else {


          const content = chunk?.message?.content || "";
       debugMode &&    console.log(content);
          if (content) {
            // Format as Server-Sent Event (SSE)
            res.write(`data: ${JSON.stringify({ content })}\n\n`);
            collectedResponse += content;
          }
          if (chunk.done) {
            console.log("No tools calls made");
            res.end(`end: ${chunk.done}\n\n`);
        debugMode &&     console.log("Final collected response without tool execution:", collectedResponse);
            const updatedParent = await ChatMessageLLM.findByIdAndUpdate(
              selectedChatId,
              { $push: { children: { userName: "Assistant", Message: collectedResponse } } }, // req.body contains the child data
              { new: true, runValidators: true } // Returns updated doc and runs schema checks
            );
          }
        }
      }
    } else if (isJson(response.message.content)) {
      //Response from granite 4.1 is like below
      // message: {
      //   role: 'assistant',
      //   content: '{"name": "getDetailsFromWeb", "arguments": {"query_topic": "current president of the United States 2026"}}}'
      // },
      console.log("response content is json");
      let responseContent = JSON.parse(response.message.content);
      if (responseContent.name === "getDetailsFromWeb" && responseContent.arguments && responseContent.arguments.query_topic) {
        let query = responseContent.arguments.query_topic;
        console.log("Fetching web details for topic:", query);
        let webresponse = await webSearch(query);
     debugMode &&    console.log("Web Search Response:", JSON.stringify(webresponse).substring(0, 500));
        let newChatHistory = [...chatHistory, { role: "tool", content: "You have knowledge from websearch: " + JSON.stringify(webresponse) }];
    debugMode &&     console.log("New Chathistory", newChatHistory);
        let newSystemPrompt = systemPrompt + "You have knowledge from websearch, So Do not use tools and respond based on your internal knowledge and the information provided in the prompt and websearch information ";
        const responseWithTools = await normalchat(modelName, newSystemPrompt, newChatHistory, prompt, stream);
     debugMode &&    console.log("responseWithTools", responseWithTools);
        const updatedParent = await ChatMessageLLM.findByIdAndUpdate(
          selectedChatId,
          { $push: { children: { userName: "Assistant", Message: responseWithTools.message.content } } }, // req.body contains the child data
          { new: true, runValidators: true } // Returns updated doc and runs schema checks
        );
        res.send({ llmresponse: responseWithTools.message.content, selectedChatId: selectedChatId });
      } else {
       debugMode &&  console.log("response content is json but no tool calls, responding with normal response");
        const updatedParent = await ChatMessageLLM.findByIdAndUpdate(
          selectedChatId,
          { $push: { children: { userName: "Assistant", Message: response.message.content } } }, // req.body contains the child data
          { new: true, runValidators: true } // Returns updated doc and runs schema checks
        );
        res.send({ llmresponse: response.message.content, selectedChatId: selectedChatId });
      }

    }
    else {

      console.log("response content is not json, checking for tool calls in response object, At else part of Not Stream response");



      if (response.message?.tool_calls || response.message?.tool_calls) {
        let functionname = response.message.tool_calls[0].function.name;
        console.log("functionname", functionname);
        if (functionname === "getDetailsFromWeb") {
          let functionArgs = response.message.tool_calls[0].function.arguments;
          let query = functionArgs.query_topic;
          console.log("Fetching web details for topic:", query);
          let webresponse = await webSearch(query);

     debugMode &&      console.log("Web Search Response:", JSON.stringify(webresponse).substring(0, 1000));
          let newChatHistory = [...chatHistory, { role: "tool", content: "You have knowledge from websearch: " + JSON.stringify(webresponse) }];
     debugMode &&      console.log("New Chathistory", newChatHistory);

          const responseWithTools = await normalchat(modelName, systemPrompt, newChatHistory, prompt, stream);
     debugMode &&      console.log("responseWithTools", responseWithTools);
          const updatedParent = await ChatMessageLLM.findByIdAndUpdate(
            selectedChatId,
            { $push: { children: { userName: "Assistant", Message: response.message.content } } }, // req.body contains the child data
            { new: true, runValidators: true } // Returns updated doc and runs schema checks
          );
          res.send({ llmresponse: responseWithTools.message.content, selectedChatId: selectedChatId });

        }

      }
      else {

        const updatedParent = await ChatMessageLLM.findByIdAndUpdate(
          selectedChatId,
          { $push: { children: { userName: "Assistant", Message: response.message.content } } }, // req.body contains the child data
          { new: true, runValidators: true } // Returns updated doc and runs schema checks
        );
        res.send({ llmresponse: response.message.content, selectedChatId: selectedChatId });
      }

    }
  }
  else {
    res.status(400).send({ error: "Missing required fields" });

  }
});
app.get("/getModels", async (req, res) => {
  try {
    const models = await ollama.list();
    // console.log(models);
    res.send(models.models);
  } catch (error) {
    console.error("Error fetching models:", error);
    res.status(500).send({ error: error });
  }


});

app.get('/api/users', (req, res) => {
  const users = [
    { id: 1, name: 'John Doe' },
    { id: 2, name: 'Jane Smith' }
  ];
  res.json(users);
});
app.get('/status', (req, res) => {
  const nodeInfo = process; // process holds runtime info
  res.json({
    dbConnected: dbConnectedStatus,
    status: 'ok',
    uptime: nodeInfo.uptime(),          // server uptime in seconds
    memory: {
      rss: nodeInfo.memoryUsage().rss,  // Resident Set Size
      heapTotal: nodeInfo.memoryUsage().heapTotal,
      heapUsed: nodeInfo.memoryUsage().heapUsed,
      external: nodeInfo.memoryUsage().external,
    },
    timestamp: new Date().toISOString()
  });
});
app.post('/upload', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send("No file uploaded.");
    } else {
      return res.status(200).send({ message: 'File uploaded successfully', filename: req.file.filename });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).send('Server error while uploading file');
  }
});
app.use("/chathistory", chatHistoryDB);
// Error handling
// app.use((err, req, res, next) => {
//   console.error(err.stack);
//   res.status(500).send('Something broke!');
// });


// 4. Global Error Handling Middleware (Catches Multer / Validation Errors)
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    // Specific Multer errors (e.g., file too large, too many files)
    return res.status(400).json({ error: `Multer Error: ${err.message}` });
  } else if (err) {
    // Custom application validation errors
    // return res.status(400).json({ error: err.message });
    console.error(err.stack);
    return res.status(500).send('Something broke!');
  }
  next();
});


let { dbConnected, dbInstance } = await connectDB();
dbConnectedStatus = dbConnected;

// Start the server
const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

