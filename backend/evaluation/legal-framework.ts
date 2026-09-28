/**
 * PHASE 01: EETF RULE ONTOLOGY - LEGAL FRAMEWORK
 * 
 * PPADA 2015 and PPADR 2020 provisions as queryable data structures.
 * Authoritative source for legal citations in rules.
 * 
 * Authority: Public Procurement Act (Chapter 412, Laws of Kenya)
 * Status: IMPLEMENTATION
 * Date: 2026-08-30
 */

export type LegalInstrumentCode = 'PPADA_2015' | 'PPADR_2020';

/**
 * Legal Instrument Definition
 */
export interface LegalInstrument {
  code: LegalInstrumentCode;
  name: string;
  full_name: string;
  effective_from: Date;
  effective_to: Date | null;
  country: string;
  language: string;
  description: string;
}

/**
 * Legal Section Definition
 */
export interface LegalSection {
  section_id: string;
  instrument_code: LegalInstrumentCode;
  section_number: string;
  subsection: string | null;
  heading: string;
  full_text: string;
  interpretation_guidance?: string;
  related_sections?: string[];
}

/**
 * PPADA 2015 - Public Procurement and Asset Disposal Act 2015
 * 
 * Baseline for Kenyan public procurement.
 * Key sections for EETF:
 * - Section 71: Eligibility & Qualification
 * - Section 74: Preliminary Evaluation
 * - Section 101-115: Evaluation Criteria
 * - Section 157: Preference Schemes
 */
export const PPADA_2015: LegalInstrument = {
  code: 'PPADA_2015',
  name: 'Public Procurement and Asset Disposal Act, 2015',
  full_name: 'Public Procurement and Asset Disposal Act, 2015 (Act No. 33 of 2015)',
  effective_from: new Date('2015-12-18'),
  effective_to: null,
  country: 'Kenya',
  language: 'English',
  description: 'Primary legislation governing public procurement in Kenya. Establishes framework for competitive bidding, evaluation criteria, and award procedures.'
};

/**
 * PPADR 2020 - Public Procurement and Asset Disposal Regulations 2020
 * 
 * Implementing regulations for PPADA 2015.
 * Provides detailed procedures for evaluation.
 */
export const PPADR_2020: LegalInstrument = {
  code: 'PPADR_2020',
  name: 'Public Procurement and Asset Disposal Regulations, 2020',
  full_name: 'Public Procurement and Asset Disposal Regulations, 2020',
  effective_from: new Date('2020-04-22'),
  effective_to: null,
  country: 'Kenya',
  language: 'English',
  description: 'Implementing regulations for PPADA 2015. Provides detailed procedures and standards for procurement processes including evaluation.'
};

/**
 * PPADA 2015 - SECTION 71(1): ELIGIBILITY & QUALIFICATION
 * 
 * Establishes mandatory requirements for bidder qualification.
 */
export const PPADA_SECTION_71_1: LegalSection = {
  section_id: 'PPADA-71-1',
  instrument_code: 'PPADA_2015',
  section_number: '71',
  subsection: '(1)',
  heading: 'Qualification and Eligibility',
  full_text: `A person shall not participate in a procurement proceeding unless the person—
    (a) has the legal capacity to enter into a contract with a public entity;
    (b) is not insolvent, in receivership, bankrupt or being wound up and is not the subject of proceedings relating to insolvency, receivership, bankruptcy or winding up;
    (c) has not, within a period of three years before the date of the invitation for tenders or request for proposals, been convicted—
        (i) in any country, by a court of competent jurisdiction of an offence of theft, fraud, forgery, perjury, corruption, money laundering or terrorism financing; or
        (ii) under any written law relating to tax evasion or money laundering;
    (d) has complied with tax obligations to the Government in accordance with the Tax Procedures Act, 2015;
    (e) has provided valid proof of registration with the Commissioner of Land (for real property professionals) or other relevant professional or regulatory authority;
    (f) meets any specific qualification criteria established by the public entity for the particular procurement.`,
  interpretation_guidance: 'This section establishes mandatory qualification requirements. All bidders must demonstrate compliance. Failure on any criterion results in disqualification.',
  related_sections: ['PPADA-157', 'PPADR-101', 'PPADR-102']
};

/**
 * PPADA 2015 - SECTION 74: PRELIMINARY EVALUATION
 * 
 * Establishes preliminary evaluation procedure (Regulation 74 reference).
 */
export const PPADA_SECTION_74: LegalSection = {
  section_id: 'PPADA-74',
  instrument_code: 'PPADA_2015',
  section_number: '74',
  subsection: null,
  heading: 'Preliminary Evaluation',
  full_text: `(1) A public entity shall use a preliminary evaluation method that requires the procuring entity to—
    (a) determine if each tender is complete, as required;
    (b) verify that the tender security has been provided in the manner required;
    (c) confirm the authenticity and validity of all certificates and documents submitted;
    (d) confirm that the tender has been properly sealed and labeled as required;
    (e) confirm tender validity period has not lapsed;
    (f) verify that the person submitting the tender is authorized to bind the bidder.
  (2) A tender that fails to meet the requirements under subsection (1) shall be rejected unless the public entity waives immaterial irregularities.`,
  interpretation_guidance: 'Preliminary evaluation is mandatory and performed before responsiveness evaluation. Must verify administrative compliance, not technical merit.',
  related_sections: ['PPADR-102', 'PPADR-103']
};

/**
 * PPADA 2015 - SECTION 157: PREFERENCE & RESERVATION SCHEMES
 * 
 * Government preference for disadvantaged groups (AGPO, youth, women, PWD).
 */
export const PPADA_SECTION_157: LegalSection = {
  section_id: 'PPADA-157',
  instrument_code: 'PPADA_2015',
  section_number: '157',
  subsection: null,
  heading: 'Preference and Reservation Schemes',
  full_text: `(1) In accordance with Article 227 of the Constitution and to advance the social and economic interests of the people of Kenya, public entities shall implement preference and reservation schemes in the manner prescribed.
  (2) The schemes include preference for goods and services produced in Kenya, women contractors, youth, and persons with disabilities (PWD).
  (3) Public entities shall allocate a minimum percentage of procurement to disadvantaged groups as defined in regulations.`,
  interpretation_guidance: 'AGPO (Affirmative Action Group Procurement) is mandatory where applicable. Verify certification and eligibility.',
  related_sections: ['PPADR-Annex', 'Constitution-Article-227']
};

/**
 * PPADR 2020 - REGULATION 101: FINANCIAL CAPACITY
 * 
 * Establishes financial capacity evaluation requirements.
 */
export const PPADR_REGULATION_101: LegalSection = {
  section_id: 'PPADR-101',
  instrument_code: 'PPADR_2020',
  section_number: '101',
  subsection: null,
  heading: 'Financial Capacity Assessment',
  full_text: `(1) A procuring entity shall establish financial capacity requirements that are proportionate to the value and nature of the procurement.
  (2) Financial capacity shall be demonstrated by—
    (a) Audited financial statements for the previous three years;
    (b) Bank statements showing liquid funds;
    (c) Evidence of lines of credit;
    (d) Evidence of past successful execution of similar contracts.
  (3) The procuring entity shall specify which forms of evidence are acceptable.`,
  interpretation_guidance: 'Financial capacity verification is essential for large procurements. Must use objective criteria proportionate to contract value.',
  related_sections: ['PPADA-71', 'PPADR-103']
};

/**
 * PPADR 2020 - REGULATION 102: BID SUBMISSION REQUIREMENTS
 * 
 * Establishes what must be included in bid submissions.
 */
export const PPADR_REGULATION_102: LegalSection = {
  section_id: 'PPADR-102',
  instrument_code: 'PPADR_2020',
  section_number: '102',
  subsection: null,
  heading: 'Bid Submission Requirements',
  full_text: `(1) Every bid shall include—
    (a) Signed and sealed technical proposal;
    (b) Signed and sealed financial proposal;
    (c) Tender security as specified;
    (d) Proof of company registration (CR12 or equivalent);
    (e) Tax compliance certificate from Kenya Revenue Authority (KRA);
    (f) Any other documents specified in the tender document.
  (2) Bidders shall number and bind all pages.
  (3) Bids not meeting these requirements shall be rejected at preliminary evaluation stage.`,
  interpretation_guidance: 'Preliminary evaluation checks completeness. Non-responsive bids are rejected without proceeding to technical evaluation.',
  related_sections: ['PPADA-74']
};

/**
 * PPADR 2020 - REGULATION 103: TECHNICAL EVALUATION
 * 
 * Framework for technical evaluation criteria.
 */
export const PPADR_REGULATION_103: LegalSection = {
  section_id: 'PPADR-103',
  instrument_code: 'PPADR_2020',
  section_number: '103',
  subsection: null,
  heading: 'Technical Evaluation of Tenders',
  full_text: `(1) Technical evaluation shall assess the extent to which tenders meet the specifications and other technical requirements set out in the tender documents.
  (2) Technical evaluation criteria shall include—
    (a) Compliance with specifications;
    (b) Technical capacity and qualifications;
    (c) Personnel experience and expertise;
    (d) Equipment and facilities;
    (e) Quality assurance measures;
    (f) Implementation methodology.
  (3) The tender documents shall specify the relative importance of evaluation criteria.
  (4) Technical evaluation shall be completed before financial evaluation.`,
  interpretation_guidance: 'Technical criteria must be specified in tender documents. Evaluation must be objective and apply stated weightings.',
  related_sections: ['PPADA-74', 'PPADR-104']
};

/**
 * All Legal Sections (for registry)
 */
export const ALL_LEGAL_SECTIONS: LegalSection[] = [
  PPADA_SECTION_71_1,
  PPADA_SECTION_74,
  PPADA_SECTION_157,
  PPADR_REGULATION_101,
  PPADR_REGULATION_102,
  PPADR_REGULATION_103
];

/**
 * Legal Instruments Registry
 */
export const LEGAL_INSTRUMENTS: Record<LegalInstrumentCode, LegalInstrument> = {
  PPADA_2015,
  PPADR_2020
};

/**
 * Get legal section by ID
 */
export function getLegalSection(sectionId: string): LegalSection | undefined {
  return ALL_LEGAL_SECTIONS.find(s => s.section_id === sectionId);
}

/**
 * Get all sections for an instrument
 */
export function getSectionsByInstrument(code: LegalInstrumentCode): LegalSection[] {
  return ALL_LEGAL_SECTIONS.filter(s => s.instrument_code === code);
}

/**
 * Citation helper
 * Creates formal legal citation
 */
export function formatLegalCitation(section: LegalSection | string): string {
  if (typeof section === 'string') {
    const s = getLegalSection(section);
    if (!s) return section;
    section = s;
  }
  
  const instrument = LEGAL_INSTRUMENTS[section.instrument_code];
  if (section.subsection) {
    return `${instrument.short_name} Section ${section.section_number}(${section.subsection})`;
  } else {
    return `${instrument.short_name} Section ${section.section_number}`;
  }
}

// Add short name helper
export const LEGAL_INSTRUMENTS_SHORT: Record<LegalInstrumentCode, string> = {
  PPADA_2015: 'PPADA 2015',
  PPADR_2020: 'PPADR 2020'
};

// Extend LegalInstrument type with short_name (used by formatLegalCitation)
declare global {
  interface LegalInstrument {
    short_name?: string;
  }
}

// Add short_name to instances
Object.assign(PPADA_2015, { short_name: 'PPADA 2015' });
Object.assign(PPADR_2020, { short_name: 'PPADR 2020' });

export function formatCitation(instrumentCode: LegalInstrumentCode, section: string): string {
  const shortName = LEGAL_INSTRUMENTS_SHORT[instrumentCode];
  return `${shortName} Section ${section}`;
}
