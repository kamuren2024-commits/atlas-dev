# Salience Atlas: Enterprise AI Runtime Platform (EARP)
## Architectural Blueprint & Operational Guide

### 1. Vision
Transform Salience Atlas from an AI-integrated application into a robust, centralized AI Runtime Platform. This decoupled architecture ensures that business logic remains provider-agnostic, while AI execution is governed, monitored, and optimized at the platform layer.

### 2. Core Components
- **Model Registry**: A centralized catalog of all available LLMs (Gemini, Llama, GPT) and their metadata (capabilities, pricing, latency).
- **Prompt Registry**: Version-controlled storage for enterprise prompts, separating the "what" from the "how".
- **Context Assembly Engine**: The single source of truth for constructing LLM context, incorporating variables, RAG, and metadata.
- **Enterprise Memory Runtime**: Multi-tier memory (semantic, episodic, working) isolated by tenant and workflow.
- **AI Gateway**: The unified entry point for all inference requests, handling safety, routing, and evaluation.
- **Cost & Token Governance**: Real-time tracking of AI spend and usage quotas.

### 3. Execution Workflow
1. **Request**: Business module sends an `InferenceRequest` to the **AI Gateway**.
2. **Resolution**: Gateway fetches the template from the **Prompt Registry**.
3. **Assembly**: **Context Assembler** pulls in variables and retrieves memories from the **Memory Runtime**.
4. **Safety (Pre)**: **Safety Pipeline** scans the assembled prompt for injection or policy violations.
5. **Routing**: **Intelligent Router** selects the optimal model based on strategy (cost, latency, reasoning).
6. **Execution**: Gateway calls the selected provider SDK.
7. **Safety (Post)**: **Safety Pipeline** scans output for PII or harmful content.
8. **Evaluation**: **Evaluation Service** grades the response for confidence and grounding.
9. **Log**: Execution is audited in the **Governance Ledger**.

### 4. Integration Protocol
Business modules must **never** call AI providers directly.
**Correct Pattern**:
```typescript
const response = await AIGateway.execute({
  promptName: 'procurement-analysis',
  variables: { documentText: '...' },
  context: { tenantId: 'Ketraco', workflowId: 'tender-audit' }
});
```

### 5. Governance & Safety
The EARP enforces a multi-layer safety protocol:
- **Tenant Isolation**: Memory and data are strictly partitioned.
- **PII Filtering**: Automated redaction of sensitive data.
- **Budget Enforcements**: Kill-switches for runaway token usage.
- **Human-in-the-Loop**: Escalation gates for low-confidence AI decisions.
