# Salience Atlas V2 — Provider Configuration

This document outlines options for enabling, prioritizing, and managing federated AI providers inside Salience Atlas V2.

## 1. Provider Control Matrix

Each model provider can be toggled and configured independently through environmental variables matching their specific prefix.

| Provider | Enabled Toggle | API Key Variable | Default Model | Priority Variable |
|---|---|---|---|---|
| **Google Gemini** | `GEMINI_ENABLED` | `GEMINI_API_KEY` | `gemini-2.5-pro` | `GEMINI_FALLBACK_PRIORITY` |
| **Groq Cloud** | `GROQ_ENABLED` | `GROQ_API_KEY` | `llama-4-scout` | `GROQ_FALLBACK_PRIORITY` |
| **OpenRouter** | `OPENROUTER_ENABLED` | `OPENROUTER_API_KEY` | `deepseek/deepseek-r1` | `OPENROUTER_FALLBACK_PRIORITY` |
| **OpenAI GPT** | `OPENAI_ENABLED` | `OPENAI_API_KEY` | `gpt-5` | `OPENAI_FALLBACK_PRIORITY` |
| **Anthropic** | `ANTHROPIC_ENABLED` | `ANTHROPIC_API_KEY` | `claude-opus` | `ANTHROPIC_FALLBACK_PRIORITY` |

---

## 2. Priority Fallback System

*   **Fallback Resolution**: If the primary provider fails, the federation router scans the registered provider chain, sorted by priority.
*   **Force Override**: Define `FORCE_PROVIDER=gemini` to force all requests to a single enabled provider for benchmarking, testing, or isolation.

---

## 3. Cost & Telemetry Governance

Manage operational costs and latency limits through:
*   `AI_MONTHLY_BUDGET_USD`: Maximum monthly budget (e.g., `100`).
*   `AI_DAILY_BUDGET_USD`: Maximum daily budget limit (e.g., `10`).
*   `AI_REQUEST_LIMIT_PER_MINUTE`: Multi-agent rate limits (e.g., `500`).
*   `AI_CACHE_ENABLED`: Enables semantic or local memory query caching to reduce duplicate API costs.
