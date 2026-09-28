# COGNITIVE REASONING PIPELINE

This document details the reasoning pipelines, self-reflection gates, and decision trees of the KETRACO SCM Planning Engine.

---

## 1. Cognitive Reflection Loops

The Planning Engine runs iterative reflection loops to optimize plan safety and efficacy before generating execution files:

```
 [ Candidate Plan ] ──► [ Critic Agent Reflection ] ──► [ Plan Adjustments ] ──► [ Dispatch ]
```

---

## 2. Reasoning Strategies

* **Chain-of-Thought Formulation**: Encourages agents to step through complex regulatory conditions systematically.
* **Self-Reflection Gating**: Prompts a critic model to search for logical fallacies or cost inflation in proposed actions.
* **Tree-of-Thought Search**: Generates multiple alternative execution branches, choosing the path with the highest success score.
