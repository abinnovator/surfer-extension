import { createGroq } from '@ai-sdk/groq';

let groqProvider: ReturnType<typeof createGroq> | null = null;

export function initGroqProvider(apiKey: string) {
  console.log('[GroqProvider] Initializing Groq provider for AI SDK');
  groqProvider = createGroq({ apiKey });
}

export function isGroqProviderInitialized(): boolean {
  return groqProvider !== null;
}

export function getGroqProvider() {
  if (!groqProvider) {
    throw new Error('Groq provider not initialized. Call initGroqProvider first.');
  }
  return groqProvider;
}

// Export a function to get the model
// Note: For tool calling, use models that support function calling
// Groq models with tool support: llama-3.1-70b-versatile, llama-3.1-8b-instant, mixtral-8x7b-32768
export function getGroqModel(modelName: string = 'openai/gpt-oss-120b') {
  const provider = getGroqProvider();
  return provider(modelName);
}
