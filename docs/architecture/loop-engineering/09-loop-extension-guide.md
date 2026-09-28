# Loop Engineering — Extension Guide

This guide describes how to extend and customize the Loop Engineering Framework.

## 1. Creating a Custom Validator

To create a new validator, implement the `IValidator` contract from `/src/core/loop/contracts/index.ts`:

```typescript
import { IValidator } from '../contracts';
import { LoopContext } from '../types';

export class CustomRiskLimitValidator implements IValidator {
  async validate(context: LoopContext, executionResult: any): Promise<{ isValid: boolean; violations: string[]; complianceScore: number }> {
    const priceVariance = executionResult?.variance ?? 0;
    const violations: string[] = [];

    if (priceVariance > 25.0) {
      violations.push('Variance exceeds critical risk threshold of 25.0%.');
    }

    return {
      isValid: violations.length === 0,
      violations,
      complianceScore: priceVariance > 25.0 ? 0.3 : 1.0
    };
  }
}
```

Once defined, register your validator with the `ValidationPipeline`:

```typescript
const pipeline = new ValidationPipeline();
pipeline.register(new CustomRiskLimitValidator());
```

## 2. Implementing a Custom Planner

To create a custom planner, implement the `IPlanner` contract:

```typescript
import { IPlanner } from '../contracts';

export class AdvancedReActPlanner implements IPlanner {
  async plan(context) {
    return {
      steps: [
        'Analyze user query',
        'Search legal statutes RAG database',
        'Verify contract provisions'
      ],
      estimatedDurationMs: 1200
    };
  }
}
```
