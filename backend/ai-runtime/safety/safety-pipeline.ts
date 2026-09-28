export interface SafetyResult {
  isSafe: boolean;
  score: number;
  reason?: string;
}

export class SafetyPipeline {
  static async validateInput(input: string): Promise<SafetyResult> {
    // Enterprise heuristic safety checks
    const blockedKeywords = ['hack', 'bypass', 'ignore all previous instructions', 'system prompt'];
    const lowerInput = input.toLowerCase();

    for (const word of blockedKeywords) {
      if (lowerInput.includes(word)) {
        return { isSafe: false, score: 0.1, reason: `Potential prompt injection detected: ${word}` };
      }
    }

    return { isSafe: true, score: 0.99 };
  }

  static async validateOutput(output: string): Promise<SafetyResult> {
    // Content filtering
    const sensitivePatterns = [
      /\b\d{3}-\d{2}-\d{4}\b/, // SSN
      /\b\d{4}-\d{4}-\d{4}-\d{4}\b/ // Credit Card
    ];

    for (const pattern of sensitivePatterns) {
      if (pattern.test(output)) {
        return { isSafe: false, score: 0.2, reason: 'Sensitive PII detected in output' };
      }
    }

    return { isSafe: true, score: 0.95 };
  }
}
