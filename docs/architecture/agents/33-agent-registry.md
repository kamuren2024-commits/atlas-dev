# 33. Agent Registry
## Salience Atlas v5

The `AgentRegistry` is a thread-safe, in-memory directory managing the availability of all active Enterprise Agents in Salience Atlas.

### Capabilities
- **Registration**: Allows new custom agents to mount capabilities at startup dynamically.
- **Deregistration**: Facilitates clean disabling of agents to prevent further workflow assignments.
- **Versioning**: Indexes agents with semantic version markers, enabling multiple agent generations to exist side-by-side.
- **Metadata Queries**: Exposes tags, descriptions, and authors to presentation layers.
- **Health Lookup**: Links registered agents directly to the `AgentHealthTracker` to check active error ratios.
