import { createOpenAI } from '@eliware/openai';

export function createOpenAIClient({ createClient = createOpenAI, getApiKey = () => process.env.OPENAI_API_KEY } = {}) {
  let client;
  return function getOpenAIClient() {
    if (!client) client = createClient({ apiKey: getApiKey() });
    return client;
  };
}
