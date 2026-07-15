import { createGoogleGenerativeAI } from '@ai-sdk/google';

// Create a custom Google Generative AI instance
export const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
});
