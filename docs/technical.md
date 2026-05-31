# Technical Design Document

**Project:** Node‑Express / React LLM
**Repository Root:** `C:\Users\fx_ra\Desktop\Dev\NodeExpressReactLLM`
**Last Updated:** Thu May 14 2026

---

## 1. System Overview

| Layer | Technology | Responsibility |
|-------|------------|----------------|
| **Backend** | Node v18, Express, MongoDB, Ollama | Handles user chat, web‑search, and persistence. |
| **Frontend** | React 18, Vite, TypeScript (optional), Zustand | Provides chat UI, file‑based local data storage, and UI helpers. |
| **Deployment** | Docker (for local dev), optional cloud hosting | Dockerfile (not yet committed) or manual `npm install` + `node llmserver/index.js`. |

The application exposes a REST API on the backend and a set of React components on the frontend. The backend is agnostic of UI specifics and simply stores conversation history, generates replies using the local Ollama model, and fetches supplemental web data.

---

## 2. Backend `llmserver`

### 2.1 Entry Point – `llmserver/index.js`

* Listens on **80** (configurable via `port` env).
* Routes:
  * `POST /api/chat` – Main LLM chat handler.
  * `POST /api/websearch/:searchTerm` – Web‑search endpoint (delegates to `utils/webscraper.js`).
  * `POST /api/chat/:chatID` – Updates existing chat message.
  * `DELETE /api/chat/delete` – Deletes a chat.
  * `GET /api/chats` – Retrieves all chat sessions.
  * `GET /api/chats/:userID` – Retrieves chats for a single user.
  * `GET /api/history` – Retrieves chat history for a specific `chatID`.

* Core flow (`/api/chat`):
  1. **Collect system prompt** from `model/configs/systemPrompt.json`.
  2. Build message list:
     ```js
     [
       { role: "system", content: systemPrompt },
       { role: "user", content: question, ChatID: uuid },
       ...previous messages ...
     ]
     ```
  3. Pass messages to `Ollama.chat()` and stream the answer back.
  4. Persist the final user message + reply to MongoDB.
* **Dependencies**
  * `multer` – file‑upload middleware.
  * `rateLimit` – Protect against flooding.
  * `crypto.randomUUID()` – Generates `ChatID`s (imported from Node core).
  * `webSearch` util – fetches external docs via Scraping API.

### 2.2 Session & History

| Collection | Document Shape |
|------------|----------------|
| **ChatMessage** (`MongoModels/ChatMessageLLMModel.js`) | `ChatID (UUID)`, `MessageID`, `Content`, `ChatName`, `UserID`, `Timestamp`, `ChatHistoryID`. |
| **ChatHistory** (`MongoModels/ChatHistoryModel.js`) | `ChatID`, `UserID`, `ChatMessages []` (embedded `ChatMessage`). |

All writes are performed via Mongoose models in `MongoModels` directory. The history is retrievable via `GET /api/chats` and can be filtered per user.

### 2.3 Rate‑Limiting

Implemented with Express‑Rate‑Limit:

```js
const limiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 mins
  max: 10,                // max 10 requests / window
  statusCode: 429,
  message: "Rate limit hit - try again shortly!"
});
```

This limiter is applied to the entire API stack.

### 2.4 Error Handling

All catch blocks return JSON with `ok: false` and an `error` string. Non‑2xx HTTP status codes are used for obvious violations (e.g., missing parameters, not‑found, server errors).

### 2.5 Dependencies

- **ollama** – Local LLM wrapper; configured via `ollamaBaseURL` (default `[\"http://127.0.0.1:11434\"]`).
- **mongodb** – Atlas free cluster connection string via `.env` (MONGODB_URI).
- **dotenv** – Loads environment variables (`.env`).
- **chromaDB** – Optional vector‑store (not yet used).
- **WebScraper** (`src/utils/webscraper.js`) – Uses axios & cheerio for DOM extraction.

---

## 3. Frontend `webllm`

### 3.1 Build System – `vite.config.js`

* Vite 4 with ESM React JSX. 
* Entry point: `webllm/src/main.jsx` (bootstraps the React DOM). 
* Environment variables: `VITE_API_URL`, etc., resolved at build time.

### 3.2 Core React Components

| Directory | Files | Purpose |
|-----------|-------|---------|
| `src/Components` | `ChatWindow.jsx`, `ChatInput.jsx`, `History.jsx`, `FileInput.jsx` | UI for chatting, file uploads, and conversation history list. |
| `src/Dataprovider` | `LocalStorage.js`, `api.js` | Handles persistence of user data in browser `localStorage` and abstracts API calls. |
| `src/Actions`, `src/Helper` | `Button.jsx`, `ChatBubble.jsx`, `Image.jsx`, `ChatHistory.jsx`, `ChatHistoryCard.jsx` | UI primitives reused across components. |
| `src/Tabs`, `src/Files` | `Tab.jsx`, `File.jsx` | Tabbed chat panels and file view/metadata. |
| `src/utils` | `constants.js`, `helpers.js`, `file.js` | Config constants, helper utilities, and file‑upload helpers. |

### 3.3 State Management
- Primarily uses **Zustand** for lightweight global state:
  - `useChatStore` (holds current chat, messages).
  - `useFilesStore` (holds uploaded file metadata).
- Local storage fallback via `LocalStorage.js` for offline persistence.

### 3.4 Data Flow
1. **Chat**
   - User types in `ChatInput.jsx` → `api/chat` POST → Backend streams LLM reply → `ChatWindow` displays with streaming UI.
2. **Web‑Search**
   - Search term entered in any component → Hits `api/websearch/:searchTerm` → Backend scrapes and returns relevant snippets → Used to augment system prompt and displayed in sidebar.
3. **File Upload**
   - File chooser loads metadata to `api/file` path via `Multer`; server returns `filePath`; UI shows file content via `File.jsx`.
4. **History**
   - `GET /api/chats` returns all sessions → Rendered in `History.jsx` and persisted in local storage.

---

## 4. API Reference

| Endpoint | Method | Path | Input | Output |
|----------|-------|------|-------|--------|
| Chat | POST | `/api/chat` | `questionText: string, userID: string, promptText?: string, systemPromptText?: string` | `{replyText: string, chatID: string}` |
| WebSearch | POST | `/api/websearch/:searchTerm` | `{}` | `Array< {title, url, content} >` |
| Update Message | POST | `/api/chat/:chatID` | `{content: string, messageID: string}` | `{updatedMessage: object}` |
| Delete Message | DELETE | `/api/chat/delete` | `{chatID: string}` | `{deleted: boolean}` |
| Get Chats | GET | `/api/chats` | `?userID=` | `Array<Chat>` |
| Get Chat History | GET | `/api/chats/:chatID` | `?userID=` | `ChatHistory` |

All payloads and responses are JSON. Errors return `{ok:false, error:"message"}` with appropriate HTTP status codes.

---

## 5. Dependencies Summary
| Package | Role |
|---------|-----|
| `express`, `cors` | HTTP API server. |
| `dotenv` | Load env. |
| `mongodb`, `mongoose` | Document store for chats. |
| `ollama` | In‑process LLM inference. |
| `multer` | File upload handling. |
| `axios`, `cheerio` | Web scraping. |
| `react`, `react-dom` | UI. |
| `zustand` | Minimal global state. |

All third‑party packages are listed in each layer’s `package.json` and are fetched automatically via `npm install`. The Docker image can be built from the provided `Dockerfile*` placeholder.

---

## 6. Development / Run Instructions
1. **Backend**
   ```bash
   cd llmserver
   npm install
   node index.js
   ```
   Or run the Docker container (once built):
   ```bash
   docker compose -f Docker.yml up --build
   ```

2. **Frontend**
   ```bash
   cd webllm
   npm install
   npm run dev
   ```
   This serves the React app on `<host>:3000` (default Vite dev server).

3. **Environment Variables**
   * `port` – Backend listening port.
   * `MONGODB_URI` – Connection string for MongoDB Atlas.
   * `ollamaBaseURL` – Base URL of the Ollama service.

---

## 7. Security & Rate‑Limiting
* Backend enforces a 5‑minute limit of 10 requests per IP.
* CORS headers set to `*` for local dev; restrict in prod.
* Sensitive data (API keys, DB credentials) stored in `.env` and omitted from version control.

---

## 8. Future Work
* **Dockerization** – complete Dockerfile for reproducible deployment.
* **Persisted Local Storage** – extend `LocalStorage.js` to support sync with Cloud Storage.
* **Authentication** – JWT or session middleware.
* **Monitoring** – Export Prometheus metrics.

---

**Prepared by:** Ramesh Shrestha
**Repository Lead:** Ramesh Shrestha
