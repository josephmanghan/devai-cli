# Ollama Integration Patterns

## Client Setup Pattern

```bash
npm install ollama
```

```typescript
import { Ollama } from 'ollama';

class OllamaService {
  private client: Ollama;

  constructor(host = 'http://127.0.0.1:11434') {
    this.client = new Ollama({ host });
  }
}
```

## Chat Generation Pattern

```typescript
async generateResponse(prompt: string): Promise<string> {
  const response = await this.client.chat({
    model: 'llama3.2:1b',
    messages: [{ role: 'user', content: prompt }],
    stream: false,
  });

  return response.message.content;
}
```

## Streaming Pattern

```typescript
async *streamResponse(prompt: string): AsyncGenerator<string> {
  const response = await this.client.chat({
    model: 'llama3.2:1b',
    messages: [{ role: 'user', content: prompt }],
    stream: true,
  });

  for await (const chunk of response) {
    if (chunk.message?.content) {
      yield chunk.message.content;
    }
  }
}
```

## System Prompt Pattern

```typescript
const SYSTEM_PROMPT = `You are an expert software engineer and git commit message generator.
STRICT RULES:
1. Format: <type>(<scope>): <subject>
2. Types: feat, fix, docs, style, refactor, perf, test, build, ci, chore, revert
3. Subject: Imperative, present tense. No trailing period.
4. Output ONLY the commit message. No markdown, no code blocks.`;
```

## Few-Shot Prompting Pattern

```typescript
const messages = [
  { role: 'system', content: SYSTEM_PROMPT },
  { role: 'user', content: 'Diff: package.json version 1.0.0 to 1.1.0' },
  { role: 'assistant', content: 'chore(release): bump version to 1.1.0' },
  { role: 'user', content: 'Diff: function login() {...} added to src/auth.js' },
  { role: 'assistant', content: 'feat(auth): add user login function' },
  { role: 'user', content: actualDiff },
];
```

## Model Availability Check Pattern

```typescript
async checkHealth(): Promise<boolean> {
  try {
    await this.client.list();
    return true;
  } catch (error) {
    return false;
  }
}
```

## Auto-Pull Pattern

```typescript
async ensureModel(model: string): Promise<void> {
  try {
    await this.client.chat({ model, messages: [] });
  } catch (error) {
    // Model doesn't exist, pull it
    const stream = await this.client.pull({ model });
    for await (const chunk of stream) {
      // Show progress
      process.stdout.write(`\rPulling ${model}: ${chunk.status}`);
    }
  }
}
```

## Performance Optimization Pattern

```typescript
const generationOptions = {
  model: 'llama3.2:1b',
  stream: true,
  options: {
    temperature: 0.3, // Lower for more deterministic output
    num_ctx: 8192, // Context window limit
    keep_alive: '60m', // Keep model in memory
  },
};
```

## Context Management Pattern

```typescript
function truncateDiff(diff: string, maxLength = 8000): string {
  if (diff.length <= maxLength) return diff;

  // Keep file names and first 50 lines per file
  const lines = diff.split('\n');
  const result: string[] = [];
  let fileCount = 0;
  let lineCount = 0;

  for (const line of lines) {
    if (line.startsWith('diff --git')) {
      fileCount++;
      lineCount = 0;
    }

    if (lineCount < 50 || line.startsWith('diff') || line.startsWith('index')) {
      result.push(line);
    }

    lineCount++;
  }

  return result.join('\n');
}
```

## Output Sanitization Pattern

```typescript
function sanitizeOutput(output: string): string {
  return output
    .replace(/^\`\`\`(?:json|text)?\s*|\s*\`\`\`$/gi, '') // Remove code blocks
    .replace(/\`/g, '') // Remove backticks
    .trim(); // Remove whitespace
}
```

## Error Handling Pattern

```typescript
interface OllamaError {
  error: string;
  type: 'model_not_found' | 'connection_error' | 'generation_error';
}

function handleOllamaError(error: any): OllamaError {
  if (error.code === 'ECONNREFUSED') {
    return { error: 'Ollama is not running', type: 'connection_error' };
  }
  if (error.status === 404) {
    return { error: 'Model not found', type: 'model_not_found' };
  }
  return { error: 'Generation failed', type: 'generation_error' };
}
```

## Streaming UI Pattern

```typescript
import { spinner } from '@clack/prompts';

async generateWithUI(prompt: string): Promise<string> {
  const loadingSpinner = spinner();
  loadingSpinner.start('Thinking...');

  let result = '';

  for await (const chunk of this.streamResponse(prompt)) {
    if (result === '') {
      loadingSpinner.stop(); // Stop spinner on first token
    }
    process.stdout.write(chunk);
    result += chunk;
  }

  return result;
}
```

## Git Diff Preprocessing Pattern

```typescript
async getCleanStagedDiff(): Promise<string> {
  const { stdout } = await execa('git', [
    'diff', '--cached',
    '--', ':(exclude)package-lock.json', ':(exclude)yarn.lock', ':(exclude)*.min.js'
  ]);

  return truncateDiff(stdout);
}
```

## Cache Pattern

```typescript
class DiffCache {
  private cachePath = '.git/ollama_cache.json';

  async getCachedMessage(diffHash: string): Promise<string | null> {
    const cache = await this.loadCache();
    return cache[diffHash] || null;
  }

  async setCachedMessage(diffHash: string, message: string): Promise<void> {
    const cache = await this.loadCache();
    cache[diffHash] = message;
    await fs.writeFile(this.cachePath, JSON.stringify(cache));
  }

  private async loadCache(): Promise<Record<string, string>> {
    try {
      return JSON.parse(await fs.readFile(this.cachePath, 'utf8'));
    } catch {
      return {};
    }
  }
}
```
