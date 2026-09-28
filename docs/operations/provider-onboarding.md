# Salience Atlas V2 - New AI Provider Onboarding Guide

The Salience Atlas V2 AI Federation Layer is built to be completely provider-agnostic. Adding support for a new model cluster or custom provider can be achieved entirely through configuration.

## Step 1: Declare Environment Variables

Define the configuration variables inside `.env` or your environment supervisor:

```bash
#################################################
# COHERE (Example New Provider)
#################################################
COHERE_ENABLED=true
COHERE_API_KEY=your_secure_api_key_here
COHERE_MODEL=command-r-plus
COHERE_FALLBACK_PRIORITY=11
```

## Step 2: Register in Provider Config loader

Open `/backend/ai-federation/config/provider-config.ts` and append the provider definition to the `providersList` structure:

```typescript
const providersList = [
  ...
  { id: 'cohere', name: 'Cohere AI', envPrefix: 'COHERE', defaultModel: 'command-r-plus', defaultPriority: 11 }
];
```

## Step 3: Register in the Router

Open `/backend/ai-federation/routing/model-router.ts` and register the instance:

```typescript
  private static providers: Record<string, AIProvider> = {
    ...
    cohere: new GenericProvider('cohere', 'Cohere AI', 'https://api.cohere.ai/v1/chat', 'command-r-plus')
  };
```

## Step 4: Verify Integration

Restart the server. The `ProviderLoader` will run diagnostics, validate the keys, output your new model priority status, and immediately make Cohere eligible for dynamic routing and automated fallbacks.
