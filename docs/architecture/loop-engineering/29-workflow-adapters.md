# 29. Workflow Module Adapters
## Salience Atlas v5

Adapters provide non-intrusive wrapping of existing Salience Atlas modules, translating workflow action definitions into native modular calls.

### Adapter Registry Mapping
The following modules are adapted:
- **Tender Intelligence**: Exposes `evaluateBids`, `checkCompliance`.
- **Tender AI Studio**: Exposes `triggerCopilotDraft`, `refineLanguage`.
- **Procurement Intelligence**: Exposes `matchVendors`, `auditProcurementPlan`.
- **SCM Intelligence**: Exposes `predictStockOut`, `analyzeSupplierRisk`.
- **Knowledge Services**: Exposes `queryKnowledgeCortex`, `indexRegulatoryAct`.
- **Data Science Studio**: Exposes `trainDemandModel`, `forecastSupplyDisruption`.
- **Cyber Operations**: Exposes `detectSecurityAnomaly`, `auditDataAccessLogs`.
- **Analytics**: Exposes `generateExecutionReport`, `aggregateKpis`.
- **Dashboard Services**: Exposes `refreshStateViews`, `publishExecutiveAlert`.
- **Future Modules**: Forwarding and routing mocks to preserve scalability.
