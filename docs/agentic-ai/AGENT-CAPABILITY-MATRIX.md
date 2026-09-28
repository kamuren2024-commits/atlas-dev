# Agent Capability Matrix

Capabilities are explicit declarations, not inferred from provider or model names.

| Capability | Canonical value | Atlas runtime bridge | Vendor SDK adapters |
|---|---|---|---|
| Reasoning | `REASONING` | Declared | UNAVAILABLE |
| Planning | `PLANNING` | Declared | UNAVAILABLE |
| Tool use | `TOOL_USE` | Declared; Atlas ToolGateway path | UNAVAILABLE |
| Handoff / delegation | `HANDOFF`, `DELEGATION` | Not verified | UNAVAILABLE |
| Memory / retrieval / RAG | `MEMORY`, `RETRIEVAL`, `RAG` | Existing memory subsystems | UNAVAILABLE |
| Code / file / browser / computer use | `CODE_EXECUTION`, `FILE_OPERATION`, `BROWSER`, `COMPUTER_USE` | Not claimed | UNAVAILABLE |
| Multimodal / document processing | `MULTIMODAL`, `DOCUMENT_PROCESSING` | Not claimed by bridge | UNAVAILABLE |
| Structured output / streaming | `STRUCTURED_OUTPUT`, `STREAMING` | Not verified | UNAVAILABLE |
| Background / long-running execution | `BACKGROUND_EXECUTION`, `LONG_RUNNING_EXECUTION` | Not verified | UNAVAILABLE |
| Human approval / workflow | `HUMAN_APPROVAL`, `WORKFLOW_EXECUTION` | Existing platform controls; adapter conformance not verified | UNAVAILABLE |
| Self-evaluation / skills | `SELF_EVALUATION`, `SKILL_EXECUTION` | Evaluation/skill contract only | UNAVAILABLE |
| MCP / A2A | `MCP`, `A2A` | Not claimed | UNAVAILABLE |

Provider adapter health states are defined as `AVAILABLE`, `CONFIGURED`, `HEALTHY`, `UNAVAILABLE`, `UNVERIFIED`, and `DISABLED`. Installation or model discovery alone never promotes health or execution eligibility.
