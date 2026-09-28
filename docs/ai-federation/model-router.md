# Salience Atlas V2 - Cognitive Model Router

All downstream modules, agents, and pipelines inside Salience Atlas V2 routing request intelligence must invoke the unified `AIService` layer. Direct, low-level provider SDK calls are strictly prohibited to prevent architectural coupling.

## Strategic Router Classifications

```
                       [AIService.generate()]
                                  │
                                  ▼
                             ModelRouter
                                  │
         ┌────────────────────────┴────────────────────────┐
         ▼                                                 ▼
    [Fast Tasks]                                   [Heavy Reasoning]
 - Chat, Copilot, Summaries                     - Compliance, Auditing, Risks
 - Targets: Groq, OpenRouter                    - Targets: Gemini, OpenAI, Anthropic
```

### 1. Fast Tasks (Latency/Throughput Optimized)
- **Target Providers**: `groq`, `openrouter`
- **Application Scope**: Real-time Chat panel, conversational Copilot prompts, raw transactional summary generations, and micro-summaries.

### 2. Heavy Reasoning (Quality/Cognition Optimized)
- **Target Providers**: `gemini`, `openai`, `anthropic`
- **Application Scope**: Contract clause analysis, risk level prediction algorithms, procurement tender score evaluations, SCM Digital Twin stress tests, and compliance reporting against Kenya PPADA regulations.

### 3. Emergency Safe Fallback
- **Target Provider**: `ollama` (Local containment node)
- **Application Scope**: Reached when all cloud-based providers are simultaneously experiencing service outages, key depletion, or billing-limit locks.
