export interface AIResponse {
  text: string;
  promptTokens: number;
  completionTokens: number;
  cost: number;
  latencyMs: number;
  provider: string;
  model: string;
  timestamp: string;
}

export interface AIProvider {
  id: string;
  name: string;
  generate(prompt: string, systemInstruction?: string, config?: any): Promise<AIResponse>;
  stream(prompt: string, systemInstruction?: string, config?: any): AsyncGenerator<string, void, unknown>;
  embed(text: string): Promise<number[]>;
  healthCheck(): Promise<boolean>;
  estimateCost(promptTokens: number, completionTokens: number): number;
  health(): string;
}
