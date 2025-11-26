# Modular CLI Architecture Patterns

## Hexagonal Architecture Structure
```
src/
├── core/                 # Domain Layer (no external dependencies)
│   ├── domain/          # Entities
│   ├── interfaces/      # Ports (contracts)
│   ├── types/          # Shared types
│   └── utils/          # Domain utilities
├── infrastructure/     # Adapters Layer
│   ├── config/
│   ├── git/
│   ├── llm/
│   └── templates/
└── features/           # Feature Modules
    ├── commit/
    └── pr/
```

## Port Interface Pattern
```typescript
// src/core/interfaces/ILLMProvider.ts
export interface ILLMProvider {
  readonly providerId: string;
  generate(messages: ChatMessage[], options: GenerationOptions): Promise<string>;
  stream(messages: ChatMessage[], options: GenerationOptions): AsyncGenerator<string>;
  checkHealth(): Promise<boolean>;
}

// src/core/interfaces/IGitService.ts
export interface IGitService {
  getStagedDiff(): Promise<string>;
  getBranchDiff(targetBranch: string): Promise<string>;
  commit(message: string): Promise<void>;
}
```

## Domain Entity Pattern
```typescript
// src/core/domain/CommitMessage.ts
export class CommitMessage {
  constructor(
    public readonly type: string,
    public readonly scope?: string,
    public readonly subject: string,
    public readonly body?: string
  ) {}

  toString(): string {
    const scopePart = this.scope ? `(${this.scope})` : '';
    const bodyPart = this.body ? `\n\n${this.body}` : '';
    return `${this.type}${scopePart}: ${this.subject}${bodyPart}`;
  }

  static fromString(text: string): CommitMessage {
    // Parse from string logic
  }
}
```

## Adapter Implementation Pattern
```typescript
// src/infrastructure/llm/OllamaProvider.ts
import { ILLMProvider } from '../../core/interfaces/ILLMProvider.ts';

export class OllamaProvider implements ILLMProvider {
  readonly providerId = 'ollama';

  constructor(private client: Ollama) {}

  async generate(messages: ChatMessage[], options: GenerationOptions): Promise<string> {
    const response = await this.client.chat({
      model: options.model,
      messages,
      stream: false,
      options: { temperature: options.temperature }
    });

    return response.message.content;
  }

  async *stream(messages: ChatMessage[], options: GenerationOptions): AsyncGenerator<string> {
    const response = await this.client.chat({
      model: options.model,
      messages,
      stream: true,
    });

    for await (const chunk of response) {
      if (chunk.message?.content) {
        yield chunk.message.content;
      }
    }
  }
}
```

## Feature Module Pattern
```
src/features/commit/
├── controllers/
│   └── CommitController.ts
├── use-cases/
│   ├── GenerateCommitMessage.ts
│   └── ValidateDiff.ts
├── templates/
│   ├── conventional.hbs
│   └── emoji.hbs
└── index.ts
```

## Use Case Pattern
```typescript
// src/features/commit/use-cases/GenerateCommitMessage.ts
export class GenerateCommitMessage {
  constructor(
    private gitService: IGitService,
    private llmProvider: ILLMProvider,
    private templateEngine: ITemplateEngine
  ) {}

  async execute(options: { template: string }): Promise<string> {
    // 1. Get diff
    const diff = await this.gitService.getStagedDiff();

    // 2. Render template
    const prompt = await this.templateEngine.renderFile(
      `templates/${options.template}.hbs`,
      { diff }
    );

    // 3. Generate message
    const messages = [
      { role: 'system', content: this.getSystemPrompt() },
      { role: 'user', content: prompt }
    ];

    return await this.llmProvider.generate(messages, {
      model: 'llama3.2:1b',
      temperature: 0.3
    });
  }
}
```

## Controller Pattern
```typescript
// src/features/commit/controllers/CommitController.ts
import { Command } from 'commander';
import { GenerateCommitMessage } from '../use-cases/GenerateCommitMessage.ts';

export class CommitController {
  constructor(private useCase: GenerateCommitMessage) {}

  register(program: Command): void {
    program
      .command('commit')
      .description('Generate commit message using AI')
      .option('-t, --template <name>', 'Template to use', 'conventional')
      .option('--dry-run', 'Generate message without committing')
      .action(async (options) => {
        try {
          const message = await this.useCase.execute(options);

          if (options.dryRun) {
            console.log(message);
          } else {
            await this.commitMessage(message);
          }
        } catch (error) {
          console.error('Error:', error.message);
          process.exit(1);
        }
      });
  }
}
```

## Dependency Injection Pattern
```typescript
// src/main.ts
import { OllamaProvider } from './infrastructure/llm/OllamaProvider.ts';
import { ShellGitService } from './infrastructure/git/ShellGitService.ts';
import { HandlebarsTemplateEngine } from './infrastructure/templates/HandlebarsEngine.ts';
import { GenerateCommitMessage } from './features/commit/use-cases/GenerateCommitMessage.ts';
import { CommitController } from './features/commit/controllers/CommitController.ts';

// Composition Root
function composeApplication() {
  // Infrastructure
  const llmProvider = new OllamaProvider(new Ollama());
  const gitService = new ShellGitService();
  const templateEngine = new HandlebarsTemplateEngine();

  // Use Cases
  const generateCommitMessage = new GenerateCommitMessage(
    gitService,
    llmProvider,
    templateEngine
  );

  // Controllers
  const commitController = new CommitController(generateCommitMessage);

  return { commitController };
}
```

## Configuration Management Pattern
```typescript
// src/infrastructure/config/ConfigService.ts
import cosmiconfig from 'cosmiconfig';
import { z } from 'zod';

const ConfigSchema = z.object({
  provider: z.enum(['ollama', 'openai']).default('ollama'),
  model: z.string().default('llama3.2:1b'),
  temperature: z.number().min(0).max(1).default(0.3),
  ollamaUrl: z.string().url().default('http://localhost:11434'),
  templates: z.string().default('./templates'),
});

export class ConfigService {
  private config: z.infer<typeof ConfigSchema>;

  async load(): Promise<void> {
    const explorer = cosmiconfig('ollacli');
    const result = await explorer.search();
    this.config = ConfigSchema.parse(result?.config);
  }

  get<T extends keyof z.infer<typeof ConfigSchema>>(key: T): z.infer<typeof ConfigSchema>[T] {
    return this.config[key];
  }
}
```

## Template Engine Pattern
```typescript
// src/core/interfaces/ITemplateEngine.ts
export interface ITemplateEngine {
  render(template: string, data: Record<string, any>): string;
  renderFile(filePath: string, data: Record<string, any>): Promise<string>;
}

// src/infrastructure/templates/HandlebarsEngine.ts
import Handlebars from 'handlebars';

export class HandlebarsTemplateEngine implements ITemplateEngine {
  constructor() {
    // Register custom helpers
    Handlebars.registerHelper('truncate', (str: string, len: number) => {
      return str.length > len ? str.substring(0, len) + '...' : str;
    });
  }

  render(template: string, data: Record<string, any>): string {
    const compiled = Handlebars.compile(template);
    return compiled(data);
  }

  async renderFile(filePath: string, data: Record<string, any>): Promise<string> {
    const template = await fs.readFile(filePath, 'utf8');
    return this.render(template, data);
  }
}
```

## Factory Pattern for Providers
```typescript
// src/infrastructure/llm/LLMProviderFactory.ts
export class LLMProviderFactory {
  constructor(private configService: ConfigService) {}

  createProvider(): ILLMProvider {
    const provider = this.configService.get('provider');

    switch (provider) {
      case 'ollama':
        return new OllamaProvider(
          new Ollama({ host: this.configService.get('ollamaUrl') })
        );
      case 'openai':
        return new OpenAIProvider(this.configService.get('apiKey'));
      default:
        throw new Error(`Unsupported provider: ${provider}`);
    }
  }
}
```

## Testing Mock Pattern
```typescript
// tests/mocks/MockLLMProvider.ts
export class MockLLMProvider implements ILLMProvider {
  readonly providerId = 'mock';

  constructor(private responses: string[] = []) {}

  async generate(): Promise<string> {
    return this.responses.shift() || 'feat: test commit message';
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

## Feature Registration Pattern
```typescript
// src/cli.ts
import { Command } from 'commander';
import { CommitController } from './features/commit/controllers/CommitController.ts';
import { PRController } from './features/pr/controllers/PRController.ts';

export function createCLI(controllers: Array<{ register: (program: Command) => void }>) {
  const program = new Command();

  program.name('ollacli').description('AI-powered Git assistant').version('1.0.0');

  // Register all controllers
  controllers.forEach(controller => controller.register(program));

  return program;
}
```

## Extensibility Pattern
```typescript
// src/features/index.ts
export const features = {
  commit: () => import('./commit/index.js'),
  pr: () => import('./pr/index.js'),
};

// Dynamic feature loading
export async function loadFeature(featureName: string) {
  if (features[featureName]) {
    const module = await features[featureName]();
    return module.default;
  }
  throw new Error(`Feature '${featureName}' not found`);
}
```