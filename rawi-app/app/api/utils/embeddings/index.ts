import { OpenAIEmbeddings } from '@langchain/openai';

export function loadEmbeddingsModel() {
  return new OpenAIEmbeddings({
    openAIApiKey: process.env.EMBEDDINGS_API_KEY, // Make sure this env var is set
    modelName: 'text-embedding-3-small'
  });
}
