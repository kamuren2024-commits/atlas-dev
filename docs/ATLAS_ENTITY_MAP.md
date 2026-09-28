# Atlas entity map

This map records only entity classes already represented by Atlas frontend interactions or backend ontology contracts.

| Entity | Existing source | Phase 2 context behavior |
| --- | --- | --- |
| Project | Project Supply Nexus constellation and project workspaces | Select opens Atlas Inspector; context persists into Graph |
| Substation | National Grid Command Center canonical grid data | Select opens Atlas Inspector with state, health, risk and voltage |
| Transmission line | National Grid Command Center canonical grid data | Select opens Atlas Inspector with state, health, risk and voltage |
| Supplier | Canonical ontology and Supplier Network module | Recognized entity class; existing module retained |
| Contract | Canonical ontology and Contract Intelligence module | Recognized entity class; existing module retained |
| Tender | Canonical ontology and Tender Intelligence module | Recognized entity class; existing module retained |
| Risk | Canonical ontology, finance state and graph modules | Recognized entity class; related graph route available |
| Workflow | Existing workflow runtime and approval modules | Recognized entity class; no execution shortcut is fabricated |
| Financial record | Finance state service and Finance Intelligence module | Recognized entity class; existing finance flow retained |
| Document / Event / Approval | Existing module-level data and audit flows | Remain module-specific until an authorized shared query is available |

The shared context deliberately does not invent records or attach cross-module actions that lack a backing route, entity query, or authorization path.
