import { ChromaClient } from "chromadb";
import ollama from "ollama";
import { OllamaEmbeddingFunction } from "@chroma-core/ollama";
// Connect to Chroma server
const chroma = new ChromaClient({
  //path: "http://localhost:27011/"
  host: "localhost", // Do NOT include "http://" or "https://" here
  port: 27011,        // Must be parsed or passed as an explicit integer
  ssl: false,        // Set to true if your endpoint uses https://
});
// 2. Configure the Ollama Embedding Function
const embedder = new OllamaEmbeddingFunction({
  url: "http://localhost:11434", // Your local Ollama instance
  model: "nomic-embed-text:latest",     // The model pulled in Step 2
});

let collection = null;

try{


 collection = await chroma.getOrCreateCollection({
  name: "ollama_ramesh_1",
  embeddingFunction: embedder,
});
}catch(error){
  console.error("Error creating or retrieving collection:", error);
}
const clearCollection = async ( selectedChatId) => {

  try {
      console.log("Clearing collection for chat ID ", selectedChatId);
      await collection.delete({
      where: { "chatId": selectedChatId }
    });
    console.log("Collection cleared successfully.");
  } catch (error) {
    console.error("Error clearing collection:", error);
  }
}
async function showAllCollections() {
  try {
    // 1. Fetch the list of all collection names
    const collections = await chroma.listCollections();

    console.log(`Found ${collections.length} collections:\n`);

    // 2. Loop through and print the names
    collections.forEach((collectionName, index) => {
      console.log(`${index + 1}`, collectionName._name);
    });

  } catch (error) {
    console.error("Error fetching collections:", error);
  }
}
async function isFileEmbedded( selectedChatId) {
  const result = await collection.get({
    // Filter by the metadata key where you stored the filename
    where: {  "chatId": selectedChatId },
    limit: 1, // We only need to find 1 match to know it exists
    include: [] // Passing an empty array minimizes network overhead
  });

  // If IDs array contains elements, the file already exists
  return result.ids.length > 0;
}

const doEmbeddingAndStore = async (chunks, fileName, selectedChatId) => {
  try {


    const metadataPayload = chunks.map(() => ({
      source: fileName, // Store the filename in metadata for later reference
      category: "localdevelopment",
      uploadedAt: new Date().toISOString(),
      chatId: selectedChatId,
      "hnsw:space": "cosine" // Specify the distance metric for HNSW indexing
    }));
   // const dynamicIds = chunks.map(() => crypto.randomUUID());
    const dynamicIds = chunks.map((_, index) => `${fileName}_chunk_${index}`);
    //const dynamicIds = chunks.map(() => crypto.randomUUID());
    // 4. Add data (Chroma will automatically use Ollama to embed the documents)
    await collection.upsert({
      ids: dynamicIds,
      documents: chunks,
      metadatas: metadataPayload // Chroma attaches this directly to the vectors
    });
  } catch (error) {
    console.error("Error during embedding and storage:", error);
    return "Error during embedding and storage";
  }
  return "Embedding and storage complete";
}
const getAllDocuments = async (selectedChatId) => {
  try {
    const response = await collection.get({
      where: { "chatId": selectedChatId },
      limit: 10, // Adjust the limit as needed
    });
    const mergedContent = response.documents.flat().join("\n\n");
    return mergedContent;
  } catch (error) {
    console.error("Error fetching all documents:", error);
    return "Error fetching all documents";
  }
}
const getRelevantDocuments = async (query, fileNames, selectedChatId) => {
  const queryResponse = await ollama.embed({
    model: "nomic-embed-text:latest",
    input: query
  });
  const queryEmbedding = queryResponse.embeddings[0];
  const response = await collection.query({
    queryEmbeddings: [queryEmbedding],
    nResults: 5,
   // where: { "source": { $in: fileNames }, "chatId": selectedChatId } // Filter to only search within the specified files and chat ID
      where: { "chatId": selectedChatId }  // Filter to only search within the specified chat ID
  });

    const maxDistance = 0.5;
  const filteredResults = [];
  let filteredDocuments = "";
    if (response.ids && response.ids[0]) {
    for (let i = 0; i < response.ids[0].length; i++) {
      const distance = response.distances[0][i];

      // Only keep results where distance is less than 0.5
      if (distance < maxDistance) {
        filteredDocuments = filteredDocuments + "\n" + response.documents[0]?.[i] || "";
        filteredResults.push({
          id: response.ids[0][i],
          distance: distance,
          document: response.documents[0]?.[i] || null,
          metadata: response.metadatas[0]?.[i] || null,
        });
      }
    }
  }

  console.log("Filtered Results:", filteredResults);

  return filteredDocuments;
};
export { doEmbeddingAndStore, isFileEmbedded, getRelevantDocuments, clearCollection, showAllCollections,getAllDocuments };
