# Salience Atlas V2 — Secret Management

This manual defines standard operating procedures for secret storage, masking, automatic rotations, and hardcoded credential prevention.

## 1. Secrets Precedence & Resolution

To handle secrets safely across local development, staging containers, and production clouds, the platform resolves keys in the following strict order of precedence:

1.  **Orchestrator Injected Secrets (Highest)**: Dynamic cloud environments (Secret Manager, KMS, Vault) injecting values directly into `process.env`.
2.  **`.env.local`**: Locally-defined machine-specific keys.
3.  **`.env` (Default)**: Primary configuration file.

## 2. API Key Masking Policy

Raw secrets must **never** be logged to stdout, written to telemetry databases, or printed in error responses. 

The `KeysVault.maskKey` protocol masks values as follows:
*   If a key is empty or undefined: returns `NOT_CONFIGURED` or `[EMPTY]`.
*   If a key has length $\le 8$: returns `********`.
*   If a key is longer than 8 characters: prints the first 4 characters and the last 4 characters, separating them with ellipses (`...`). E.g., `AIza...9xZ3`.

## 3. Automated Key Rotation Support

The `KeysVault` supports hot-rotations of API credentials in the event of provider rate-limiting, threshold depletion, or expiration. 
*   **Rotated Secret Keys**: Rotated credentials can be loaded as `${PROVIDER}_API_KEY_${INDEX}` (e.g., `GEMINI_API_KEY_1`, `GEMINI_API_KEY_2`).
*   **Hot Fallbacks**: If the primary client encounters repeated quota depletion or authentication failures, calling `KeysVault.rotateKey(providerId)` automatically increments the internal active index to seamlessly load the next configured rotated key without restarting the runtime.

## 4. Secret Prevention and Git Isolation

*   **`.gitignore` Compliance**: The `.gitignore` must enforce exclusion of `.env*` files (except the template `.env.example`).
*   **SecretScanner Verification**: Any attempt to build or run the platform with embedded credential patterns blocks compilation immediately.
