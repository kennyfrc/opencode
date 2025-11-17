import {
  type EmbeddingModelV2,
  type EmbeddingModelV3,
  type EmbeddingModelV3Embedding,
} from '@ai-sdk/provider';

/**
Embedding model that is used by the AI SDK Core functions.
*/
export type EmbeddingModel<VALUE = string> =
  | string
  | EmbeddingModelV3<VALUE>
  | EmbeddingModelV2<VALUE>;

/**
Embedding.
 */
export type Embedding = EmbeddingModelV3Embedding;
