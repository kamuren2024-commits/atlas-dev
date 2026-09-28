import { ProcurementRule } from '../../src/types/evaluation';

export interface KnowledgeEntry {
  id: string;
  source: string;
  section: string;
  text: string;
  tags: string[];
}

export class ProcurementKnowledgeBase {
  private static entries: KnowledgeEntry[] = [
    {
      id: 'PPADA_71_1',
      source: 'PPADA 2015',
      section: 'Section 71(1)',
      text: 'A person is eligible to bid for a contract in procurement or an asset being disposed, only if the person has the legal capacity to enter into a contract.',
      tags: ['eligibility', 'capacity']
    },
    {
      id: 'PPADA_71_1_B',
      source: 'PPADA 2015',
      section: 'Section 71(1)(b)',
      text: 'The person has fulfilled his tax obligations or has made arrangements satisfactory to the relevant authority for the payment of his tax obligations.',
      tags: ['tax', 'compliance']
    },
    {
      id: 'PPADR_101',
      source: 'PPADR 2020',
      section: 'Regulation 101',
      text: 'The evaluation committee shall evaluate the bids in accordance with the criteria and weightings set out in the tender document.',
      tags: ['evaluation', 'criteria']
    }
  ];

  static query(tags: string[]): KnowledgeEntry[] {
    return this.entries.filter(e => e.tags.some(t => tags.includes(t)));
  }

  static getBySection(source: string, section: string): KnowledgeEntry | undefined {
    return this.entries.find(e => e.source === source && e.section === section);
  }

  static getAll(): KnowledgeEntry[] {
    return this.entries;
  }
}
