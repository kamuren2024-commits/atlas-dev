# 36. Agent Security and Isolation
## Salience Atlas v5

All executing agents are encapsulated within security sandboxes governed by the `AgentSecurityGuard` and custom user credentials.

### Isolation Rules
1. **User Role Integration**: The agent maps the initiating user's active directory roles into the executing context.
2. **Context Verification**: Prior to performing actions, the security guard verifies that the agent has valid credentials and matches the specified roles.
3. **No Key Leakage**: Agents never access client-side or public secrets. All critical keys remain completely hidden in backend server configurations.
