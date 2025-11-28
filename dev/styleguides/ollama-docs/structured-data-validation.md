# Structured Data & Validation

## Zod Schema Patterns

```typescript
import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';

// Define schema for structured outputs
const CommitMessageSchema = z.object({
  type: z.enum(['feat', 'fix', 'chore', 'docs', 'style', 'refactor', 'test', 'perf']),
  scope: z.string().optional(),
  description: z.string(),
  body: z.string().optional(),
  breaking: z.boolean().optional(),
});

// Convert Zod to JSON Schema for API
const commitSchema = zodToJsonSchema(CommitMessageSchema);

// Validate and parse response
const response = await ollama.chat({
  model: 'llama3.2',
  messages: [{ role: 'user', content: 'Generate commit message' }],
  format: commitSchema,
});

const commitMessage = CommitMessageSchema.parse(JSON.parse(response.message.content));
```

## JSON Schema Pattern

```typescript
// Manual JSON Schema definition
const conventionalCommitSchema = {
  type: 'object',
  required: ['type', 'description'],
  properties: {
    type: {
      type: 'string',
      enum: ['feat', 'fix', 'chore', 'docs', 'style', 'refactor', 'test', 'perf'],
    },
    scope: { type: 'string' },
    description: { type: 'string' },
    body: { type: 'string' },
    breaking: { type: 'boolean' },
  },
};

// Use with Ollama API
const response = await ollama.chat({
  model: 'llama3.2',
  messages: [{ role: 'user', content: prompt }],
  format: conventionalCommitSchema,
});
```

## Validation Patterns

```typescript
// Error handling for structured outputs
function validateResponse<T>(schema: z.ZodSchema<T>, response: string): T {
  try {
    return schema.parse(JSON.parse(response));
  } catch (error) {
    throw new Error(`Invalid response format: ${error.message}`);
  }
}

// Usage example
const commitMessage = validateResponse(CommitMessageSchema, response.message.content);
```
