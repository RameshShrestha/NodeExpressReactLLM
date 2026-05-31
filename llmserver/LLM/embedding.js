import { ChromaClient } from "chromadb";
import ollama from "ollama";

// Connect to Chroma server
const chroma = new ChromaClient({
  path: "http://localhost:8001"
});

// Create collection
const collection = await chroma.getOrCreateCollection({
  name: "ollama_ramesh"
});

// ---- Generate embedding using ollama.embed ----
const text = "Chroma works great with Ollama embeddings";

const embeddingResponse = await ollama.embed({
  model: "nomic-embed-text",
  input: text
});

const embedding = embeddingResponse.embeddings[0];

// ---- Store in Chroma ----
await collection.add({
  ids: ["doc1"],
  embeddings: [embedding],
  documents: [text]
});

console.log("Stored!");

// ---- Query ----
const query = "vector database";

const queryResponse = await ollama.embed({
  model: "nomic-embed-text:latest",
  input: query
});

const queryEmbedding = queryResponse.embeddings[0];

const results = await collection.query({
  queryEmbeddings: [queryEmbedding],
  nResults: 2
});

console.log("Results:", results);