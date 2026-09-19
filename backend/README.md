# EcoSetu AI — Backend

Express API that powers Gemini-backed waste prediction and the AI sustainability assistant for EcoSetu AI.

See the [top-level README](../README.md) for full setup instructions and environment variables.

## Endpoints

- `GET /health` — health check
- `POST /api/waste/predict` — AI waste prediction (Gemini, with a deterministic fallback formula when no `GEMINI_API_KEY` is set)
- `POST /api/chat` — AI sustainability assistant (Gemini, with a built-in fallback response when no `GEMINI_API_KEY` is set)

## Quick start

```bash
npm install
npm run dev       # http://localhost:3001, restarts on change
```

```bash
npm run build     # compiles to dist/
npm start         # runs the compiled server
```
