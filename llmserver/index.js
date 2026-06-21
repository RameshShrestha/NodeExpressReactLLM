import express from 'express';
import dotenv, { configDotenv } from 'dotenv';
import { Ollama } from 'ollama'
import multer from 'multer';
import { rateLimit } from 'express-rate-limit';
import webSearch from './websearch.js';
import { normalchat, chatWithTools, analyzeUserQuery, chatWithImage } from './LLM/normalchat.js';
import { ChatMessageLLM } from './MongoModels/ChatMessageLLMModel.js';
import { connectDB } from './mongodb.js';
import chatHistoryDB from './routes/chatHistoryDB.js';
import handleLLMCall from './routes/handleLLMCall.js'
import path from 'path';
import handleFileUpload from './FileHandlers/fileManager.js';
import { isFileEmbedded, getRelevantDocuments, getAllDocuments } from './LLM/embedding.js';

const red = '\x1b[31m';
const green = '\x1b[32m';
const blue = '\x1b[34m';
const reset = '\x1b[0m';
let dbConnectedStatus = false;

dotenv.config({ path: path.resolve(import.meta.dirname, './.env') });
const debugMode = process.env.DEBUG_MODE === 'true' || false;
if (debugMode) {

  console.log(path.resolve(import.meta.dirname, '.env'));
}
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

// Routes
//app.post('/getLLMResponse', upload.array('attachments', 5), );
app.use("/getLLMResponse", upload.array('attachments', 5), handleLLMCall);
app.get("/getModels", async (req, res) => {
  try {
    const response = await ollama.list();


    const nonEmbeddingModels = response.models.filter(model => {
      // 1. Check family types if available (embedding models often use 'bert')
      const families = model.details?.families || [];
      const isEmbeddingFamily = families.includes('nomic-bert');

      // 2. Fallback check for common embedding keywords in the name
      const hasEmbeddingName = model.name.toLowerCase().includes('embed');

      // Return true only if it is NOT an embedding model
      return !isEmbeddingFamily && !hasEmbeddingName;
    });

    // Optional: Extract just the names using map
    const cleanedModel = nonEmbeddingModels.map(m => {
      delete m.details;
      delete m.digest;
      delete m.size;
      delete m.modified_at;
      return m;

    });
    // console.log(cleanedModel);
    res.send(cleanedModel);

  } catch (error) {
    console.error("Error fetching models:", error);
    res.status(500).send({ error: error });
  }

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