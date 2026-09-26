# 🔒 Security Architecture & Threat Model Specification

This document details the threat model, security controls, and compliance boundaries implemented across **EcoSetu AI**.

---

## 1. Threat Modeling Matrix (OWASP API & AI Top 10)

| Threat Category | Potential Risk | EcoSetu AI Mitigation & Control |
| :--- | :--- | :--- |
| **API1: BOLA / IDOR** | User accessing another user's event or pickup | `authorizeResourceAccess` middleware checks `organizerUid` & `partnerUid` match token UID |
| **API2: Broken Authentication** | Forged JWT tokens or unauthenticated calls | Firebase Admin SDK `verifyIdToken(token, true)` checkRevoked validation |
| **API5: Broken Function Level Authorization** | Regular user accessing admin routes | Server-side `requireRole(['ADMIN'])` middleware enforcement |
| **OWASP AI: Prompt Injection** | System prompt override via chat query | Regex pattern scanner (`detectPromptInjection`) rejects injection vectors |
| **Data Leakage** | Exposing private keys in frontend bundles | Secret isolation: `FIREBASE_PRIVATE_KEY` & `GEMINI_API_KEY` restricted to backend |

---

## 2. Role Permissions & Custom Claims

```text
               ┌──────────────────┐
               │  Firebase Auth   │
               └────────┬─────────┘
                        │ Token
                        ▼
               ┌──────────────────┐
               │ Bearer Verification│
               └────────┬─────────┘
                        │
      ┌─────────────────┼─────────────────┐
      ▼                 ▼                 ▼
[ORGANIZER]    [RECOVERY_PARTNER]     [ADMIN]
- Create Events - View Matches       - Verify Partners
- Forecast      - Accept Pickups     - View Model Registry
- Request       - Update Status      - View Audit Logs
```
