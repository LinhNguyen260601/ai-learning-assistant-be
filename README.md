## AI Learning Assistant – Backend (`ai-learning-assistant-be`)

Node.js/Bun + Express backend for the AI Learning Assistant application.  
It handles authentication, document uploads/parsing, AI interactions (Gemini), quizzes/flashcards, and progress tracking.

---

## Tech Stack

- **Runtime**: Bun (v1.2.x)
- **Framework**: Express
- **Database**: MongoDB (via Mongoose)
- **Auth**: JWT
- **AI**: Google Gemini
- **File Storage**: Cloudinary + local uploads

---

## Getting Started

### 1. Install dependencies

```bash
cd ai-learning-assistant-be
bun install
```

### 2. Environment variables

Create a `.env` file in the `ai-learning-assistant-be` directory based on the template below:

```bash
MONGO_URI=your-mongodb-connection-string
JWT_SECRET=your-jwt-secret
JWT_EXPIRES_IN=7d
NODE_ENV=development
MAX_FILE_SIZE=5242880
GEMINI_API_KEY=your-gemini-api-key
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret
```

**Note**: `MAX_FILE_SIZE` is in bytes (5 MB in the example above).

### 3. Run the development server

```bash
bun run index.ts
```

By default the server will start on the port configured inside `index.ts` (commonly `http://localhost:3000` or similar).  
Check `index.ts` if you need to change the port.

---

## Scripts

- **Start (dev)**: `bun run index.ts`
- **Install deps**: `bun install`

---

## Project Structure (high level)

- `src/config` – DB, Cloudinary, multer, and other configuration files
- `src/controllers` – Request handlers for each domain (AI, auth, documents, flashcards, quizzes, progress)
- `src/services` – Business logic for each feature
- `src/routes` – Express route definitions
- `src/models` – Mongoose models
- `src/utils` – Helpers (Gemini client, PDF parser, token utilities, etc.)

---

## Notes

- This project was initially created using `bun init` with Bun v1.2.2.  
- Make sure MongoDB, Cloudinary, and Gemini credentials are correctly configured before running in production.

