# SDK INTEGRATION GUIDELINES

This document serves as the developer handbook for building custom extensions using the KETRACO SCM platform SDK.

---

## 1. Local Development Sandbox Setup

1. **Clone SDK Templates**: Download the certified Node.js/TypeScript extension template.
2. **Configure Environment Keys**: Add testing API credentials into a local `.env` block.
3. **Run Mock Emulator**: Boot the local developer emulator on port `3001` to test event calls.

---

## 2. API Signature Protocols

All requests emitted by custom-built extensions must include mandatory signing headers:
* `X-Ketraco-Extension-ID`: The cryptographically registered extension identifier.
* `X-Ketraco-Signature`: HMAC SHA-256 hash verifying payload integrity.
* `Authorization`: Scoped OAuth JWT token.
