# Salience Atlas V5: AI Runtime Technical Specification

## 1. System Services

### 1.1 AI Gateway (`gateway.ts`)
The primary execution orchestrator.
- **Port**: Internal Service Port
- **Responsibilities**: Validation, Routing Orchestration, Result Evaluation.

### 1.2 Prompt Registry (`prompt-registry.ts`)
- **Storage**: SQLite Table `prompt_registry`
- **Schema**: `id, name, version, content, system_instruction, parameters_json, status`
- **Versioning**: Incremental versioning with `ACTIVE` tag support.

### 1.3 Context Assembler (`context-assembler.ts`)
- **Input**: Raw Prompt + Variables + Context
- **RAG Integration**: Automatically pulls Top-K semantic memories.
- **Metadata Injection**: Appends system headers for auditability.

### 1.4 Memory Runtime (`memory-runtime.ts`)
- **Tiers**:
  - `Semantic`: Long-term knowledge (RAG).
  - `Episodic`: Historical interactions.
  - `Working`: Short-term workflow state.
- **Isolation**: Row-level security based on `tenant_id`.

## 2. Model Routing Strategies

| Strategy | Description | Preferred Models |
| :--- | :--- | :--- |
| `cost` | Minimizes token spend | Gemini 1.5 Flash, Llama 3 8B |
| `reasoning` | Maximizes logical output | Gemini 1.5 Pro, GPT-4o |
| `latency` | Minimizes TTFT | Groq Llama 3, Gemini Flash |
| `availability` | Picks highest health model | Dynamic based on health registry |

## 3. Telemetry & Accounting
- **Log Table**: `ai_execution_logs`
- **Metrics**: Prompt Tokens, Completion Tokens, Cost (USD), Latency (ms), Safety Score.
