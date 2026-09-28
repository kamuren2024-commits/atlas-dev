# AI API COST OPTIMIZATION SPECIFICATION

This document details the cost controls, token optimization models, and key rotations implemented for KETRACO AI applications.

---

## 1. Multi-Tier Model Router (ModelRouter)

We optimize AI spend by routing prompts based on complexity:

```
                          [ Incoming User Prompt ]
                                      │
                   ┌──────────────────┴──────────────────┐
                   ▼ (Simple task / low cost)            ▼ (Complex task / high cost)
         [ Gemini 2.5 Flash / Groq ]                [ Gemini 2.5 Pro ]
         - Cost: ~$0.00015 / 1K tokens              - Cost: ~$0.00700 / 1K tokens
```

* **Token Pruning**: System prompts are highly optimized to minimize token consumption. We remove conversational boilerplate from AI responses, resulting in a **20%** reduction in input tokens.

---

## 2. Dynamic Redis Cache Store

To avoid duplicate API fees for identical prompts (e.g. repeated contract audits or standard compliance checks), we cache responses in Redis:
* **TTL**: Cache entries have a standard Time-To-Live of **24 hours**.
* **Cache Hit Rate Goal**: We target and maintain a cache hit rate of $\ge 30\%$ on production pipelines, significantly lowering operational costs.
