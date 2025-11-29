# Modular CLI Architecture Patterns

## Architecture: Hexagonal (Ports & Adapters)

**Core Principle**: Decouple business logic from infrastructure. The commit message generation logic must not depend on whether you're using Ollama or OpenAI, or how Git is executed.

**Dependency Rule**: Dependencies flow inward. Core defines interfaces; infrastructure implements them.

## Directory Structure

```
src/
├── main.ts                    # Application bootstrap & DI setup
├── cli.ts                     # CLI entry (Commander.js)
│
├── core/                      # Domain layer (no external deps)
│   ├── domain/
│   │   ├── commit-message.ts  # Entity: type, scope, subject, body
│   │   ├── git-diff.ts        # Entity: diff content, metadata
│   │   └── prompt-context.ts  # Entity: template data
│   ├── interfaces/            # Ports (contracts)
│   │   ├── llm-provider.ts
│   │   ├── git-service.ts
│   │   ├── config-service.ts
│   │   └── template-engine.ts
│   ├── types/
│   │   └── config.types.ts
│   └── utils/
│       └── validators.ts
│
├── infrastructure/            # Adapters (implementations)
│   ├── config/
│   │   └── cosmiconfig-service.ts
│   ├── git/
│   │   └── shell-git-service.ts
│   ├── llm/
│   │   ├── ollama-provider.ts
│   │   ├── openai-provider.ts
│   │   └── mock-llm-provider.ts  # For testing
│   └── templates/
│       └── handlebars-engine.ts
│
└── features/                  # Use cases & controllers
    └── commit/
        ├── controllers/
        │   └── commit-controller.ts
        ├── use-cases/
        │   ├── generate-commit-message.ts
        │   └── validate-diff.ts
        └── templates/
            ├── conventional.hbs
            └── emoji.hbs
```

## Core Interfaces (Ports)

### ILLMProvider - AI Provider Contract

```typescript
export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface GenerationOptions {
  model: string;
  temperature?: number;
  maxTokens?: number;
  jsonMode?: boolean;
  abortSignal?: AbortSignal;
}

export interface ILLMProvider {
  readonly providerId: string;

  // Non-streaming generation
  generate(
    messages: ChatMessage[],
    options: GenerationOptions
  ): Promise<string>;

  // Streaming generation (CRITICAL for CLI UX)
  stream(
    messages: ChatMessage[],
    options: GenerationOptions
  ): AsyncGenerator<string>;

  // Health check (fail fast if Ollama not running)
  checkHealth(): Promise<boolean>;
}
```

### IGitService - Git Operations Contract

```typescript
export interface IGitService {
  // Get staged changes for commit
  getStagedDiff(): Promise<string>;

  // Get list of changed files
  getChangedFiles(): Promise<string[]>;

  // Execute commit with message
  commit(message: string): Promise<void>;
}
```

### ITemplateEngine - Prompt Template Contract

```typescript
export interface ITemplateEngine {
  // Render inline template
  render(template: string, data: Record<string, any>): string;

  // Render template file
  renderFile(filePath: string, data: Record<string, any>): Promise<string>;
}
```

## Domain Entities

### CommitMessage Entity

```typescript
export class CommitMessage {
  constructor(
    public readonly type: string, // feat, fix, chore, etc.
    public readonly subject: string,
    public readonly scope?: string,
    public readonly body?: string,
    public readonly breaking?: boolean
  ) {}

  toString(): string {
    const scopePart = this.scope ? `(${this.scope})` : '';
    const bodyPart = this.body ? `\n\n${this.body}` : '';
    const breakingPart = this.breaking ? '\n\nBREAKING CHANGE: ' : '';
    return `${this.type}${scopePart}: ${this.subject}${bodyPart}${breakingPart}`;
  }

  // Parse from Conventional Commits string
  static fromString(text: string): CommitMessage {
    const match = text.match(/^(\w+)(?:\(([^)]+)\))?: (.+)/);
    if (!match) throw new Error('Invalid commit format');
    return new CommitMessage(match[1], match[3], match[2]);
  }
}
```

## Use Case Pattern

### GenerateCommitMessage Use Case

````typescript
// src/features/commit/use-cases/generate-commit-message.ts
export class GenerateCommitMessage {
  constructor(
    private gitService: IGitService,
    private llmProvider: ILLMProvider,
    private templateEngine: ITemplateEngine,
    private config: IConfigService
  ) {}

  async execute(): Promise<string> {
    // 1. Get staged diff
    const diff = await this.gitService.getStagedDiff();
    if (!diff) throw new Error('No staged changes');

    // 2. Build prompt context
    const context = {
      diff: this.truncateDiff(diff),
      files: await this.gitService.getChangedFiles(),
    };

    // 3. Render template
    const template = this.config.get('template');
    const prompt = await this.templateEngine.renderFile(
      `templates/${template}.hbs`,
      context
    );

    // 4. Generate with LLM
    const messages: ChatMessage[] = [
      { role: 'system', content: this.getSystemPrompt() },
      { role: 'user', content: prompt },
    ];

    const result = await this.llmProvider.generate(messages, {
      model: this.config.get('model'),
      temperature: 0.3,
      maxTokens: 100,
    });

    return this.sanitize(result);
  }

  private getSystemPrompt(): string {
    return `Generate a Conventional Commit message.
Format: <type>(<scope>): <subject>
Types: feat, fix, chore, docs, style, refactor, test, perf
Output ONLY the commit message. No markdown, no code blocks.`;
  }

  private truncateDiff(diff: string, maxLength = 4000): string {
    return diff.length > maxLength
      ? diff.substring(0, maxLength) + '\n... (truncated)'
      : diff;
  }

  private sanitize(output: string): string {
    return output
      .replace(/^```(?:json|text)?\s*|\s*```$/gi, '')
      .replace(/`/g, '')
      .trim();
  }
}
````

## Adapter Implementation Pattern

### OllamaProvider Adapter

```typescript
// src/infrastructure/llm/ollama-provider.ts
import { Ollama } from 'ollama';
import {
  ILLMProvider,
  ChatMessage,
  GenerationOptions,
} from '../../core/interfaces/llm-provider';

export class OllamaProvider implements ILLMProvider {
  readonly providerId = 'ollama';

  constructor(
    private client: Ollama,
    private baseUrl = 'http://localhost:11434'
  ) {}

  async generate(
    messages: ChatMessage[],
    options: GenerationOptions
  ): Promise<string> {
    const response = await this.client.chat({
      model: options.model,
      messages,
      stream: false,
      options: {
        temperature: options.temperature,
        num_predict: options.maxTokens,
      },
    });
    return response.message.content;
  }

  async *stream(
    messages: ChatMessage[],
    options: GenerationOptions
  ): AsyncGenerator<string> {
    const response = await this.client.chat({
      model: options.model,
      messages,
      stream: true,
      options: { temperature: options.temperature },
    });

    for await (const chunk of response) {
      if (chunk.message?.content) {
        yield chunk.message.content;
      }
    }
  }

  async checkHealth(): Promise<boolean> {
    try {
      await this.client.list();
      return true;
    } catch (error) {
      return false;
    }
  }
}
```

## Dependency Injection Pattern

### Application Bootstrap (main.ts)

```typescript
// src/main.ts - Composition Root
import { Ollama } from 'ollama';
import { OllamaProvider } from './infrastructure/llm/ollama-provider';
import { ShellGitService } from './infrastructure/git/shell-git-service';
import { HandlebarsEngine } from './infrastructure/templates/handlebars-engine';
import { CosmiconfigService } from './infrastructure/config/cosmiconfig-service';
import { GenerateCommitMessage } from './features/commit/use-cases/generate-commit-message';
import { CommitController } from './features/commit/controllers/commit-controller';

export async function bootstrap() {
  // Load config first
  const configService = new CosmiconfigService();
  await configService.load();

  // Instantiate adapters
  const llmProvider = new OllamaProvider(
    new Ollama({ host: configService.get('ollamaUrl') })
  );
  const gitService = new ShellGitService();
  const templateEngine = new HandlebarsEngine();

  // Instantiate use cases (inject dependencies)
  const generateCommitMessage = new GenerateCommitMessage(
    gitService,
    llmProvider,
    templateEngine,
    configService
  );

  // Instantiate controllers
  const commitController = new CommitController(generateCommitMessage);

  return { commitController };
}
```

## Controller Pattern

```typescript
// src/features/commit/controllers/commit-controller.ts
import { Command } from 'commander';
import { GenerateCommitMessage } from '../use-cases/generate-commit-message';
import { confirm } from '@clack/prompts';

export class CommitController {
  constructor(private generateCommitMessage: GenerateCommitMessage) {}

  register(program: Command): void {
    program
      .command('commit')
      .description('Generate AI commit message')
      .option('--dry-run', 'Generate without committing')
      .action(async options => {
        try {
          const message = await this.generateCommitMessage.execute();

          console.log('\nGenerated commit message:\n');
          console.log(message);

          if (!options.dryRun) {
            const shouldCommit = await confirm({
              message: 'Create commit with this message?',
            });

            if (shouldCommit) {
              await this.gitService.commit(message);
              console.log('✓ Committed successfully');
            }
          }
        } catch (error) {
          console.error('Error:', error.message);
          process.exit(1);
        }
      });
  }
}
```

## Configuration Management

### Config Schema with Zod

```typescript
// src/core/types/config.types.ts
import { z } from 'zod';

export const ConfigSchema = z.object({
  provider: z.enum(['ollama', 'openai']).default('ollama'),
  model: z.string().default('llama3.2:1b'),
  temperature: z.number().min(0).max(1).default(0.3),
  template: z.string().default('conventional'),
  ollamaUrl: z.string().url().default('http://localhost:11434'),
  apiKey: z.string().optional(),
});

export type UserConfig = z.infer<typeof ConfigSchema>;
```

### Config Service with Cosmiconfig

```typescript
// src/infrastructure/config/cosmiconfig-service.ts
import { cosmiconfig } from 'cosmiconfig';
import { ConfigSchema, UserConfig } from '../../core/types/config.types';
import { IConfigService } from '../../core/interfaces/config-service';

export class CosmiconfigService implements IConfigService {
  private config!: UserConfig;

  async load(): Promise<void> {
    const explorer = cosmiconfig('ollacli');
    const result = await explorer.search();

    // Validate with Zod
    this.config = ConfigSchema.parse(result?.config || {});
  }

  get<K extends keyof UserConfig>(key: K): UserConfig[K] {
    return this.config[key];
  }
}
```

## Testing Strategy

### Mock Provider for Tests

```typescript
// src/infrastructure/llm/mock-llm-provider.ts
export class MockLLMProvider implements ILLMProvider {
  readonly providerId = 'mock';
  private responses: string[];

  constructor(responses: string[] = ['feat: test commit']) {
    this.responses = responses;
  }

  async generate(): Promise<string> {
    return this.responses.shift() || 'mock: default message';
  }

  async *stream(): AsyncGenerator<string> {
    const message = await this.generate();
    for (const char of message) {
      yield char;
    }
  }

  async checkHealth(): Promise<boolean> {
    return true;
  }
}
```

### Unit Test Example

```typescript
// tests/unit/generate-commit-message.test.ts
import { GenerateCommitMessage } from '@/features/commit/use-cases/generate-commit-message';
import { MockLLMProvider } from '@/infrastructure/llm/mock-llm-provider';
import { MockGitService } from '@tests/mocks/mock-git-service';

describe('GenerateCommitMessage', () => {
  it('should generate commit message for valid diff', async () => {
    const mockGit = new MockGitService({
      stagedDiff: 'diff --git a/file.ts\n+added line',
    });
    const mockLLM = new MockLLMProvider(['feat: add new feature']);

    const useCase = new GenerateCommitMessage(
      mockGit,
      mockLLM,
      mockTemplate,
      mockConfig
    );

    const result = await useCase.execute();

    expect(result).toBe('feat: add new feature');
  });
});
```

## Key Architectural Rules

1. **Core is pure**: No imports of `ollama`, `execa`, `fs`, etc. in `core/`
2. **Use cases orchestrate**: They compose domain entities and call through interfaces
3. **Adapters are swappable**: Test with mocks, run with real implementations
4. **Dependencies inject at root**: `main.ts` is the only place that knows concrete types
5. **Interfaces define contracts**: Changes to Ollama API only affect `OllamaProvider.ts`

## Template System

### Handlebars with Custom Helpers

```typescript
// src/infrastructure/templates/handlebars-engine.ts
import Handlebars from 'handlebars';

export class HandlebarsEngine implements ITemplateEngine {
  constructor() {
    // Register custom helpers for Git
    Handlebars.registerHelper('truncate', (str: string, len: number) => {
      return str.length > len ? str.substring(0, len) + '...' : str;
    });

    Handlebars.registerHelper('fileList', (diff: string) => {
      const matches = diff.match(/diff --git a\/([^\s]+)/g) || [];
      return matches.map(m => m.split('/').pop()).join(', ');
    });
  }

  render(template: string, data: Record<string, any>): string {
    const compiled = Handlebars.compile(template);
    return compiled(data);
  }

  async renderFile(
    filePath: string,
    data: Record<string, any>
  ): Promise<string> {
    const template = await fs.readFile(filePath, 'utf8');
    return this.render(template, data);
  }
}
```

### Example Template (conventional.hbs)

```handlebars
Analyze this git diff and generate a Conventional Commit message.

Changed files: {{fileList diff}}

Diff:
{{truncate diff 4000}}

Generate ONLY the commit message in format: <type>(<scope>): <subject>
```
