

import express from 'express';
import { Ollama } from 'ollama'
import multer from 'multer';
import { rateLimit } from 'express-rate-limit';
import webSearch from './websearch.js';
import { normalchat, chatWithTools } from './LLM/normalchat.js';
import  {ChatMessageLLM}   from './MongoModels/ChatMessageLLMModel.js';
import { connectDB } from './mongodb.js'; 
import chatHistoryDB from './routes/chatHistoryDB.js';
let dbConnectedStatus = false;
import dotenv from 'dotenv';
dotenv.config({
  path: "./.env",
});
const ollama = new Ollama();

const app = express();
const upload = multer({ dest: './uploads/' }); // Set the destination folder to store uploaded files.
// Middleware
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);
app.use(express.json());

app.use(express.static('public'))
// Routes
app.post('/getLLMResponse', async (req, res) => {
  // Here you can access req.body to get the data sent from the client
  // console.log(req.body);
  const { modelName, prompt, systemPrompt, chatHistory, stream } = req.body;
  let {selectedChatId} = req.body;
  if(!selectedChatId){
    // If no chat ID is selected, create a new chat document in the database
    // const newChat = new ChatMessageLLM({
    //   title: prompt,
    //   UserId: "localUser",
    //   children: [{
    //     userName: "user",
    //     Message: prompt
    //   }]
    // });
    console.log("Creating new chat document in the database for prompt:", prompt);
      const newChat = await ChatMessageLLM.create({
                title : prompt,
                UserId: "localUser",
                SystemMessage: systemPrompt || "You are Helpful Assistant on provided topics, always respond as html5 tags inside div which can be added into webpage. You will respond within 100 words for interaction as general communication. Content should not be more than 500 words at all. If you have some more information, ask for user if user wanted to know more on that. Do not use tools when internal knowledge is sufficient or already knowledge is provided via tool or user. When you use tools, always use them at the beginning of the response and do not add any other content in that and your answer should be based on tool response not your response do not need to be in html5 tags for tool use response response, wait for tool response and then respond with complete answer using the tool response and internal knowledge. Remember todays date and time is " + new Date(),
                ChatID: crypto.randomUUID(), // Generate a unique UUID for each chat
                children: [{ userName: "User", Message: prompt }] // Initialize with an empty array for chat messages
            });
   // const newChatDocument = await newChat.save();
    console.log("Created new chat with ID:", newChat._id);
     selectedChatId = newChat._id; // Update the selectedChatId to the newly created chat's ID
  } else {
    // If a chat ID is selected, update the existing chat document in the database
    // await ChatMessageLLM.findByIdAndUpdate(selectedChatId, {
    //     children: [ { userName: "user", Message: prompt } ]
    //   });

      const updatedParent = await ChatMessageLLM.findByIdAndUpdate(
            selectedChatId,
            { $push: { children: { userName: "User", Message: prompt } } }, // req.body contains the child data
            { new: true, runValidators: true } // Returns updated doc and runs schema checks
          );
      
     
    console.log("Updated chat with ID:", selectedChatId);
  } 
  const isJson = str => {
    str = str.replace("<tool_call>", ""); // Remove the tool_call tags if present
    str = str.replace("<tool_call>", ""); // Remove the closing tool_call tags if present
    try { JSON.parse(str); return true; } catch { return false; }
};
  // For demonstration, we'll just send back a static response
  if (modelName && prompt && systemPrompt) {
   // console.log(`Model: ${modelName}, Prompt: ${prompt}, System Prompt: ${systemPrompt}`);
    const response = await chatWithTools(modelName, systemPrompt, chatHistory, prompt, stream);
    console.log("LLM Response: received response from llm, checking if streaming or not");
    console.log("LLM Response:", response);
    
    if (stream) {
      console.log("inside Streaming response");
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
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
            console.log("Fetched Web Details:", webDetails);
              res.write(`message: "calling tools"`);
            let webresponse = await webSearch(query);
            console.log("Web Search Response:", JSON.stringify(webresponse).substring(0,200));

            let newChatHistory = [...chatHistory, { role: "tool", content: JSON.stringify(webresponse) }];
            const responseWithTools = await normalchat(modelName, systemPrompt, newChatHistory, prompt, stream);
            for await (const chunk of responseWithTools) {
             
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

            //  res.end(`data: ${JSON.stringify({ webresponse })}\n\n`);
            break;
            // You would typically call the LLM again with the fetched details here
          } else {
            console.log("Unknown tool call", chunk.message.tool_calls[0].function.name);
          }
        } else {
           
          
          const content = chunk?.message?.content || "";
          // console.log(content);
          if (content) {
            // Format as Server-Sent Event (SSE)
            res.write(`data: ${JSON.stringify({ content })}\n\n`);
          }
          if (chunk.done) {
             console.log("No tools calls made");
            res.end(`end: ${chunk.done}\n\n`);
          }
        }
      }
    }else if(isJson(response.message.content)){
//Response from granite 4.1 is like below
  // message: {
  //   role: 'assistant',
  //   content: '{"name": "getDetailsFromWeb", "arguments": {"query_topic": "current president of the United States 2026"}}}'
  // },
      console.log("response content is json");
      let responseContent = JSON.parse(response.message.content);
      if(responseContent.name === "getDetailsFromWeb" && responseContent.arguments  && responseContent.arguments.query_topic){
        let query = responseContent.arguments.query_topic;
        console.log("Fetching web details for topic:", query);
        let webresponse = await webSearch(query);
        console.log("Web Search Response:", JSON.stringify(webresponse).substring(0,500));
        let newChatHistory = [...chatHistory, { role: "tool", content: "You have knowledge from websearch: " + JSON.stringify(webresponse) }];
        console.log("New Chathistory", newChatHistory);  
        let newSystemPrompt = systemPrompt + "You have knowledge from websearch, So Do not use tools and respond based on your internal knowledge and the information provided in the prompt and websearch information ";
        const responseWithTools = await normalchat(modelName, newSystemPrompt, newChatHistory, prompt, stream);
        console.log("responseWithTools", responseWithTools);
           const updatedParent = await ChatMessageLLM.findByIdAndUpdate(
            selectedChatId,
            { $push: { children: { userName: "Assistant", Message:  responseWithTools.message.content } } }, // req.body contains the child data
            { new: true, runValidators: true } // Returns updated doc and runs schema checks
          );
        res.send({ llmresponse: responseWithTools.message.content, selectedChatId: selectedChatId });
      }else{
          console.log("response content is json but no tool calls, responding with normal response"); 
             const updatedParent = await ChatMessageLLM.findByIdAndUpdate(
            selectedChatId,
            { $push: { children: { userName: "Assistant", Message:  response.message.content } } }, // req.body contains the child data
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

          console.log("Web Search Response:", JSON.stringify(webresponse).substring(0,500));
          let newChatHistory = [...chatHistory, { role: "tool", content: "You have knowledge from websearch: " + JSON.stringify(webresponse) }];
          console.log("New Chathistory", newChatHistory);

          const responseWithTools = await normalchat(modelName, systemPrompt, newChatHistory, prompt, stream);
          console.log("responseWithTools", responseWithTools);
           const updatedParent = await ChatMessageLLM.findByIdAndUpdate(
            selectedChatId,
            { $push: { children: { userName: "Assistant", Message:  response.message.content } } }, // req.body contains the child data
            { new: true, runValidators: true } // Returns updated doc and runs schema checks
          );
          res.send({ llmresponse: responseWithTools.message.content, selectedChatId: selectedChatId });

        }

      }
      else {

           const updatedParent = await ChatMessageLLM.findByIdAndUpdate(
            selectedChatId,
            { $push: { children: { userName: "Assistant", Message:  response.message.content } } }, // req.body contains the child data
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

  const models = await ollama.list();
  // console.log(models);
  res.send(models.models);


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
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});


  let {dbConnected, dbInstance} = await connectDB();
   dbConnectedStatus = dbConnected;
  
// Start the server
const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

