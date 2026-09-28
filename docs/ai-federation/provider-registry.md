# Salience Atlas V2 - Dynamic Provider Registry

The Dynamic Provider Registry handles runtime provider discovery, credential validation, and prioritization entirely through environment variables. This avoids any hardcoded LLM client SDK dependencies, allowing seamless scaling and onboarding.

## Key Features

- **Zero-Downtime Configuration**: Providers are declared, enabled, or prioritized purely using system environment variables.
- **Dynamic Discovery**: Calling `ProviderRegistry.initialize()` at boot automatically detects available endpoints and filters out unconfigured or disabled clusters.
- **Active Provider Catalog**: Generates a typed active catalog string array (e.g., `["gemini", "groq", "openrouter"]`) representing only healthy, configured nodes.

## Environment Mapping Schema

| Environment Prefix | Enabled Flag | API Key Parameter | Default Priority | Standard Model |
| :--- | :--- | :--- | :--- | :--- |
| `GEMINI` | `GEMINI_ENABLED` | `GEMINI_API_KEY` | `1` | `gemini-2.5-pro` |
| `GROQ` | `GROQ_ENABLED` | `GROQ_API_KEY` | `2` | `llama-4-scout` |
| `OPENROUTER` | `OPENROUTER_ENABLED` | `OPENROUTER_API_KEY` | `3` | `deepseek/deepseek-r1` |
| `CEREBRAS` | `CEREBRAS_ENABLED` | `CEREBRAS_API_KEY` | `4` | `llama-4` |
| `OPENAI` | `OPENAI_ENABLED` | `OPENAI_API_KEY` | `5` | `gpt-5` |
| `ANTHROPIC` | `ANTHROPIC_ENABLED` | `ANTHROPIC_API_KEY` | `6` | `claude-opus` |
| `OLLAMA` | `OLLAMA_ENABLED` | (Local endpoint check) | `999` | `llama3` |

## Onboarding Validation Sequence

```
[System Startup]
       │
       ▼
ProviderRegistry.initialize()
       │
       ├─► Read environmental configurations
       ├─► Check credentials validity
       ├─► Filter unconfigured / disabled providers
       └─► Generate active runtime catalog list
```
