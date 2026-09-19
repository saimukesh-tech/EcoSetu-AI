# EcoSetu AI — Security Architecture & Guidelines

## Security Measures Implemented

1. **Authentication & Authorization:**
   - Server-side token verification middleware in `backend/src/middleware/auth.ts`.
   - Role-based authorization (`ORGANIZER`, `RECOVERY_PARTNER`, `ADMIN`).
   - Browser-provided user roles are never trusted blindly; claims are verified server-side.

2. **File Upload Security:**
   - Waste image upload validation checks file MIME types (`image/jpeg`, `image/png`, `image/webp`).
   - File size restricted to 10MB max.
   - Image header verification via PIL/Pillow before processing to reject malicious payloads or executable scripts.

3. **Secret Protection & Environment Variables:**
   - Secrets are loaded strictly via `process.env` / `import.meta.env`.
   - `.env.example` provided; `.env`, service account JSONs, and private keys are ignored via `.gitignore`.

4. **Input Validation & Sanitization:**
   - Range validation on guest counts ($>0$), event durations ($>0$), and waste weights ($\ge 0$).
   - Input sanitization on user prompt messages before forwarding to Gemini AI.

5. **Firestore Security Rules:**
   - Rule enforcement in `frontend/firestore.rules` preventing unauthorized user access across events and user profiles.
