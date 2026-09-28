# RISK REGISTER — KETRACO SCM Intelligence Nexus

This register lists identified technical, security, operational, and AI risks, their severity ratings, impact matrices, and planned mitigations.

---

## 1. Active Risk Mitigation Log

| Risk ID | Risk Description | Probability | Impact | Score | Planned Mitigation Strategy | Status |
| :--- | :--- | :---: | :---: | :---: | :--- | :---: |
| **RSK-01** | Primary AI Provider Service Outage | Medium | High | **High** | Federated Router active; falls back to backup providers dynamically. | 🟢 Mitigated |
| **RSK-02** | Exposure of API credentials in codebase | Low | Critical | **High** | Pre-boot `SecretScanner` isolates and blocks startup on credentials. | 🟢 Mitigated |
| **RSK-03** | Runaway AI Agent loops & cost spikes | Medium | Medium | **Medium**| Strict daily and monthly cost budgets with max agent depth settings. | 🟢 Mitigated |
| **RSK-04** | Environmental file modifications | Low | High | **Medium**| Background `EnvIntegrityMonitor` checks hashes and logs alerts. | 🟢 Mitigated |
| **RSK-05** | Model response format variations | Medium | Medium | **Medium**| Forced structured JSON outputs strictly validated before rendering. | 🟢 Mitigated |

---

## 2. Risk Evaluation Matrix

```
       IMPACT ->      [ Low ]    [ Medium ]   [ High ]   [ Critical ]
 PROBABILITY |
   [ High ]           Medium       High        High       Critical
   [ Medium ]         Low          Medium      High       High
   [ Low ]            Low          Low         Medium     High
```
Each risk is evaluated, monitored, and updated weekly under the oversight of KETRACO SRE Leads.
