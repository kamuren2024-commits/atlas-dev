import { ProcurementRule } from '../../src/types/evaluation';

export const PROCUREMENT_RULES: ProcurementRule[] = [
  {
    id: 'RULE_TAX_COMPLIANCE',
    legalSource: 'PPADA 2015',
    section: 'Section 71(1)(b)',
    description: 'Valid Tax Compliance Certificate from KRA is required.',
    severity: 'MANDATORY',
    agentOwnerId: 'kra-validation-agent',
    evidenceRequirements: ['TAX_CERTIFICATE'],
    effectiveDate: '2015-12-18',
    version: '1.0.0'
  },
  {
    id: 'RULE_BUSINESS_REG',
    legalSource: 'PPADA 2015',
    section: 'Section 71(1)(a)',
    description: 'The person has the legal capacity to enter into a contract.',
    severity: 'MANDATORY',
    agentOwnerId: 'cr12-validation-agent',
    evidenceRequirements: ['BUSINESS_REGISTRATION', 'CR12'],
    effectiveDate: '2015-12-18',
    version: '1.0.0'
  },
  {
    id: 'RULE_BANK_CAPACITY',
    legalSource: 'PPADR 2020',
    section: 'Regulation 101',
    description: 'Demonstrated financial capacity through audited accounts or bank statements.',
    severity: 'HIGH',
    agentOwnerId: 'financial-capacity-agent',
    evidenceRequirements: ['AUDITED_ACCOUNTS', 'BANK_STATEMENT'],
    effectiveDate: '2020-04-22',
    version: '1.0.0'
  },
  {
    id: 'RULE_AGPO_PREFERENCE',
    legalSource: 'PPADA 2015',
    section: 'Section 157',
    description: 'Preference and reservation schemes for disadvantaged groups (AGPO).',
    severity: 'MEDIUM',
    agentOwnerId: 'agpo-verification-agent',
    evidenceRequirements: ['AGPO_CERTIFICATE'],
    effectiveDate: '2015-12-18',
    version: '1.0.0'
  },
  {
    id: 'RULE_LITIGATION_HISTORY',
    legalSource: 'Standard Tender Document',
    section: 'ITB 4.5',
    description: 'Bidders must provide details of any litigation or arbitration history.',
    severity: 'HIGH',
    agentOwnerId: 'legal-risk-agent',
    evidenceRequirements: ['LITIGATION_HISTORY_DECLARATION'],
    effectiveDate: '2023-01-01',
    version: '1.0.0'
  }
];

export class RuleEngine {
  static getRule(id: string): ProcurementRule | undefined {
    return PROCUREMENT_RULES.find(r => r.id === id);
  }

  static getRulesBySeverity(severity: ProcurementRule['severity']): ProcurementRule[] {
    return PROCUREMENT_RULES.filter(r => r.severity === severity);
  }

  static getAllRules(): ProcurementRule[] {
    return PROCUREMENT_RULES;
  }
}
