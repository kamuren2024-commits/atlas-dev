import { IValidator } from '../contracts';
import { LoopContext } from '../types';

export class ValidationPipeline implements IValidator {
  private validators: IValidator[] = [];

  public register(validator: IValidator): void {
    this.validators.push(validator);
  }

  async validate(context: LoopContext, executionResult: any): Promise<{ isValid: boolean; violations: string[]; complianceScore: number }> {
    let isValid = true;
    const allViolations: string[] = [];
    let scoreSum = 0;

    if (this.validators.length === 0) {
      return { isValid: true, violations: [], complianceScore: 1.0 };
    }

    for (const validator of this.validators) {
      try {
        const res = await validator.validate(context, executionResult);
        if (!res.isValid) {
          isValid = false;
          allViolations.push(...res.violations);
        }
        scoreSum += res.complianceScore;
      } catch (err: any) {
        isValid = false;
        allViolations.push(`Validator exception: ${err.message || err}`);
      }
    }

    return {
      isValid,
      violations: allViolations,
      complianceScore: scoreSum / this.validators.length
    };
  }
}

export class StatutoryComplianceValidator implements IValidator {
  async validate(context: LoopContext, executionResult: any): Promise<{ isValid: boolean; violations: string[]; complianceScore: number }> {
    const violations: string[] = [];
    const ppadaExempt = context.metadata.section102Exempt === true;
    const directAwardOverLimit = executionResult?.amount > 5000000 && !ppadaExempt;

    if (directAwardOverLimit) {
      violations.push('Statutory alert: Direct award over KES 5,000,000 without Section 102 Patented/Emergency exemption violates PPADA 2015.');
    }

    return {
      isValid: violations.length === 0,
      violations,
      complianceScore: violations.length === 0 ? 1.0 : 0.4
    };
  }
}

export class SupplierRiskValidator implements IValidator {
  async validate(context: LoopContext, executionResult: any): Promise<{ isValid: boolean; violations: string[]; complianceScore: number }> {
    const violations: string[] = [];
    const supplierRating = executionResult?.supplierRating ?? 100;

    if (supplierRating < 60) {
      violations.push('Operational Alert: Supplier rating is below critical safety limit (60%).');
    }

    return {
      isValid: violations.length === 0,
      violations,
      complianceScore: supplierRating / 100
    };
  }
}
