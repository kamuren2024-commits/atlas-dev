# Salience Atlas V2 — Configuration Service Architecture

This document provides a detailed overview of the system design, classes, and interactions within the unified config service core.

## 1. Class Design

### `ConfigService`
*   **Purpose**: Singleton configuration loader and cache.
*   **Methods**:
    *   `init()`: Loads and compiles variables from files and processes.
    *   `get(key, default)`: Retrieve a string configuration parameter.
    *   `getBoolean(key, default)`: Retrieve a boolean configuration parameter.
    *   `getNumber(key, default)`: Retrieve a numeric configuration parameter.
    *   `getAllMasked()`: Returns the loaded environment catalog with sensitive keys redacted.

### `ConfigValidator`
*   **Purpose**: Validates active model variables, priorities, URL formats, and budget constraints on startup.
*   **Methods**:
    *   `validateEnvFile()`: Executes the suite of preflight environmental checks and throws an error if any fatal misconfigurations are present.

### `EnvIntegrityMonitor`
*   **Purpose**: Monitors active `.env` file safety, modifications, and unexpected deletion.
*   **Methods**:
    *   `init()`: Establishes a SHA-256 hash checksum of the baseline `.env` configuration.
    *   `check()`: Performs immediate file existence and checksum checks.
    *   `startContinuousMonitoring(ms)`: Periodically polls file attributes and attaches filesystem watch listeners.

### `SecretScanner`
*   **Purpose**: Scan server source files for raw hardcoded credentials.
*   **Methods**:
    *   `scanCodebase()`: Blocks builds or boots if specific pattern matches are found in non-ignored `.ts`, `.tsx`, `.js`, or `.jsx` files.

### `StartupValidator`
*   **Purpose**: Prevents illegal imports or accesses of `.env.example`.
*   **Methods**:
    *   `verifyNoEnvExampleReferences()`: Throws an error if any file references the configuration template.

---

## 2. Boot Sequence Flow

```
1. [server.ts] launches startServer()
   ├──► 2. ConfigService.init()  => Reconstructs .env if missing from .env.example
   ├──► 3. SecretScanner.scanCodebase() => Halts if any sk- / AIza keys are committed
   ├──► 4. StartupValidator.verifyNoEnvExampleReferences() => Halts if code imports .env.example
   ├──► 5. PreflightEnvironmentValidation.run() => Validates active keys, budgets, & priorities
   ├──► 6. ProviderLoader.runStartupAudit() => Prints startup audit status
   ├──► 7. EnvIntegrityMonitor.init() & startContinuousMonitoring() => Launches file watches
   └──► 8. Express app binds to port 3000
```
