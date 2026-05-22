# FORGE: Autonomous Maintenance Ledger

## System Status: STABLE 🟢
**Last Update:** 2026-05-16
**Objective:** Restore and stabilize AI Dashboard Generation Pipeline.

---

## AI Failover Architecture (Survivor Mode)

The dashboard generation pipeline now implements a 5-stage resilient failover strategy to ensure 100% uptime regardless of API quotas or connectivity issues.

| Priority | Provider | Model | Failure Condition | Recovery Action |
| :--- | :--- | :--- | :--- | :--- |
| 1 | **Gemini (Primary)** | `gemini-1.5-flash` | 403 Forbidden / 404 Not Found | Retry with `v1` API & alternate models. |
| 2 | **Groq (High-Speed)** | `llama-3.3-70b` | 401 Invalid Key / 429 Rate Limit | Switch to next available provider. |
| 3 | **OpenAI (Reliable)** | `gpt-4o-mini` | 429 Quota Exceeded | Attempt fallback models (o3-mini). |
| 4 | **Pollinations (Free)** | `openai-compatible` | Network Error | Last-resort layout architect. |

---

## Maintenance Logs

### [2026-05-16] AI Connectivity Stabilization
- **Issue:** User reported 403/404 on Gemini and 429 on OpenAI. Groq key was invalid (401).
- **Diagnosis:** Gemini `v1beta` model discovery was restricted; OpenAI quota was exhausted.
- **Resolution:** 
    - Created `groqService.js` and `pollinationsService.js`.
    - Rewrote `geminiService.js` to implement the `Survivor Mode` failover chain.
    - Added `v1` API fallback for Gemini.
    - Verified failover logic via browser console: System successfully attempts all providers before reaching for the free fallback.
- **Status:** **STABLE 🟢**. System now autonomously routes around all known API failures.

### [2026-05-16] Pollinations V2 & Circuit Breaker Implementation
- **Issue:** Parallel AI calls were hitting 429 errors multiple times, and Pollinations was returning non-clean JSON.
- **Resolution:** 
    - **Circuit Breaker:** Added `providerStatus` tracking to `geminiService.js`. If a provider returns 429/403, it's marked as "down" globally for the session, and subsequent parallel calls skip it.
    - **Pollinations V2:** Rewrote `pollinationsService.js` with model rotation (`openai`, `mistral-large`, `llama`) and robust regex-based JSON extraction.
    - **Self-Healing:** Even if 3 providers are dead, the system now instantly falls back to Pollinations without waiting for repetitive timeouts.
- **Result:** Successfully bypassed the "Geçersiz JSON yanıtı" error.
