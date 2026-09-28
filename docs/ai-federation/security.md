# Salience Atlas V2 - Secret Governance & Key Security

Salience Atlas V2 enforces a strict Zero Credentials-in-Code Policy to guard cognitive infrastructure from external exposure or leakage.

## Strict Security Standards

1. **Zero Client Exposure**: All API keys, tokens, and endpoints exist exclusively in server-side context. No credentials can exist in build bundles, frontend code, or browser assets.
2. **Safe Diagnostics Masking**: Telemetry endpoints and server terminal logs are forbidden from displaying keys in plaintext. The `KeysVault.maskKey()` helper must be applied to all outputs (e.g. producing `sk-pr...xyz` or `NOT_CONFIGURED`).
3. **Dynamic Key Rotation**: Supported by `KeysVault` via rotational index flags (e.g., `GEMINI_API_KEY_0`, `GEMINI_API_KEY_1`) to swap keys in case of quota depletion without requiring container restarts.
