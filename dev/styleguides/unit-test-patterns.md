# Unit Test Patterns for Node.js CLI

**Scope:** Jest testing patterns for ollacli (Node.js CLI application)
**Adapted from:** Angular NxMono repo best practices, tailored for hexagonal architecture CLI testing

---

## 1. Test Philosophy

### User-Visible Outcomes Focus

Test what users experience, not implementation details.

**For CLI Applications:**

- Exit codes (0 for success, 1 for error)
- stdout/stderr output
- File system changes
- Process execution results

```typescript
// ✅ GOOD - Tests user-visible outcome
it('should exit with code 1 when no staged changes', async () => {
  mockGit.getStagedDiff.mockResolvedValue('');
  await expect(useCase.execute()).rejects.toThrow('No staged changes');
});

// ❌ AVOID - Tests internal state
it('should set _hasChanges flag to false', () => {
  expect(useCase['_hasChanges']).toBe(false);
});
```

### Public API Testing Only

Test only public methods, inputs, and outputs. Never test private methods or internal state.

```typescript
// ✅ GOOD - Tests public interface
it('should generate commit message from diff', async () => {
  const result = await useCase.execute();
  expect(result).toMatch(/^(feat|fix|chore):/);
});

// ❌ AVOID - Tests private method
it('should call private _sanitizeOutput method', () => {
  useCase['_sanitizeOutput']('test');
});
```

### No Comments Rule

Tests should be self-documenting through clear names and structure. Comments indicate unclear code.

```typescript
// ❌ AVOID - Comments explain what test does
it('should work', () => {
  // Setup the mock to return a diff
  mockGit.getStagedDiff.mockResolvedValue('diff --git...');
  // Call the use case
  const result = await useCase.execute();
  // Check the result
  expect(result).toBeDefined();
});

// ✅ GOOD - Clear naming, no comments needed
it('should generate commit message when git has staged changes', async () => {
  const { diff } = getData();
  mockGit.getStagedDiff.mockResolvedValue(diff);
  const result = await useCase.execute();
  expect(result).toMatch(/^(feat|fix|chore):/);
});
```

### Minimal Destructuring

Only destructure what you actually use in the test.

```typescript
// ✅ GOOD - Only destructure what's used
it('should generate message', async () => {
  const { diff } = getData();
  // ... only diff is used
});

// ❌ AVOID - Unnecessary destructuring
it('should generate message', async () => {
  const { diff, config, model, template } = getData(); // Only diff is used
});
```

---

## 2. Test Structure

### Top-Level Describe Block

Always use class/module name as top-level describe.

```typescript
describe('GenerateCommitMessage', () => {
  // tests
});

describe('OllamaProvider', () => {
  // tests
});
```

### "should" Phrasing for It Blocks

All test descriptions use "should" phrasing.

```typescript
it('should generate conventional commit message from diff', () => {});
it('should throw error when no staged changes exist', () => {});
it('should sanitize LLM output by removing code blocks', () => {});
```

### Nested Describe Blocks for Scenarios

Group related tests by scenario or condition.

```typescript
describe('GenerateCommitMessage', () => {
  describe('when git has staged changes', () => {
    it('should generate commit message', async () => {});
    it('should truncate diff when over 4000 characters', async () => {});
  });

  describe('when git has no staged changes', () => {
    it('should throw "No staged changes" error', async () => {});
  });

  describe('#execute', () => {
    it('should call git service to get diff', async () => {});
    it('should call LLM provider with constructed prompt', async () => {});
  });
});
```

### Method-Based Grouping

Use `#methodName` for public method testing.

```typescript
describe('#generate', () => {
  it('should return commit message string', async () => {});
});

describe('#checkHealth', () => {
  it('should return true when Ollama is running', async () => {});
  it('should return false when Ollama is not running', async () => {});
});
```

### File Naming Convention

Use kebab-case for test files: `class-name.spec.ts`

```
tests/
├── unit/
│   ├── use-cases/
│   │   └── generate-commit-message.spec.ts
│   └── infrastructure/
│       ├── ollama-provider.spec.ts
│       └── shell-git-service.spec.ts
```

---

## 3. Test Setup Patterns

### getData() Function Pattern

**Mandatory pattern** - Always define `getData()` function at describe block level.

**Simple Example:**

```typescript
describe('GenerateCommitMessage', () => {
  const getData = () => {
    const diff = 'diff --git a/file.ts\n+added line';
    const commitMessage = 'feat: add new feature';
    const config = {
      model: 'llama3.2:1b',
      temperature: 0.3,
    };

    return { diff, commitMessage, config };
  };

  it('should generate message', async () => {
    const { diff } = getData();
    // ... use diff
  });
});
```

**Complex Example with Variations:**

```typescript
const getData = () => {
  const diffs = {
    simple: 'diff --git a/file.ts\n+added line',
    complex: 'diff --git a/file.ts\n+added\ndiff --git b/other.ts\n+more',
    empty: '',
  };

  const responses = {
    feat: 'feat: add new feature',
    fix: 'fix: resolve bug',
    chore: 'chore: update dependencies',
  };

  const config = {
    default: { model: 'llama3.2:1b', temperature: 0.3 },
    creative: { model: 'llama3.2:1b', temperature: 0.7 },
  };

  return { diffs, responses, config };
};
```

### Factory Functions for Data Variations

```typescript
const createGitDiff = (overrides?: Partial<GitDiff>): GitDiff => ({
  content: 'diff --git a/file.ts\n+line',
  files: ['file.ts'],
  additions: 1,
  deletions: 0,
  ...overrides,
});

const createCommitMessage = (type: string, subject: string): CommitMessage => ({
  type,
  subject,
  scope: undefined,
  body: undefined,
  breaking: false,
});

const getData = () => {
  const diff = {
    simple: createGitDiff(),
    complex: createGitDiff({ files: ['a.ts', 'b.ts'], additions: 10 }),
    empty: createGitDiff({ content: '', files: [] }),
  };

  const message = {
    feat: createCommitMessage('feat', 'add feature'),
    fix: createCommitMessage('fix', 'resolve bug'),
  };

  return { diff, message };
};
```

### getInstance() Pattern for Dependency Injection

**Use Case Instance Setup:**

```typescript
interface InstanceConfig {
  diff?: string;
  response?: string;
}

const getInstance = (config?: InstanceConfig) => {
  const mockGit = {
    getStagedDiff: jest.fn().mockResolvedValue(config?.diff ?? ''),
    getChangedFiles: jest.fn().mockResolvedValue([]),
    commit: jest.fn().mockResolvedValue(undefined),
  };

  const mockLLM = {
    providerId: 'mock',
    generate: jest.fn().mockResolvedValue(config?.response ?? 'feat: test'),
    stream: jest.fn(),
    checkHealth: jest.fn().mockResolvedValue(true),
  };

  const mockTemplate = {
    render: jest.fn((tpl, data) => tpl),
    renderFile: jest.fn().mockResolvedValue('prompt'),
  };

  const mockConfig = {
    get: jest.fn((key: string) => {
      const defaults = { model: 'llama3.2:1b', template: 'conventional' };
      return defaults[key];
    }),
  };

  const useCase = new GenerateCommitMessage(mockGit, mockLLM, mockTemplate, mockConfig);

  return { useCase, mockGit, mockLLM, mockTemplate, mockConfig };
};
```

**Adapter Instance Setup:**

```typescript
const getInstance = (config?: { baseUrl?: string }) => {
  const mockOllamaClient = {
    chat: jest.fn(),
    list: jest.fn().mockResolvedValue([]),
  };

  const provider = new OllamaProvider(
    mockOllamaClient,
    config?.baseUrl ?? 'http://localhost:11434',
  );

  return { provider, mockOllamaClient };
};
```

**Optional Configuration Interface:**

All properties in `InstanceConfig` **must be optional** to promote minimal test setup.

```typescript
interface InstanceConfig {
  diff?: string;
  response?: string;
  model?: string;
  throwError?: boolean;
}

const getInstance = (config?: InstanceConfig) => {
  // Provide defaults with nullish coalescing
  const diff = config?.diff ?? 'default diff';
  const response = config?.response ?? 'feat: default';

  // ... setup with defaults
};
```

---

## 4. Mocking & Dependencies

### jest.fn() for Function Mocks

```typescript
const mockGenerate = jest.fn().mockResolvedValue('feat: commit message');
const mockGetDiff = jest.fn().mockResolvedValue('diff content');
```

### jest.mock() for Module Mocks

```typescript
jest.mock('ollama', () => ({
  Ollama: jest.fn().mockImplementation(() => ({
    chat: jest.fn(),
    list: jest.fn(),
  })),
}));
```

### Mock Adapter Pattern

Create mock implementations of interfaces for testing.

```typescript
// Mock LLM Provider
class MockLLMProvider implements ILLMProvider {
  readonly providerId = 'mock';

  constructor(private responses: string[] = ['feat: test commit']) {}

  async generate(): Promise<string> {
    return this.responses.shift() || 'mock: default';
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

// Usage in tests
const getData = () => {
  const mockLLM = new MockLLMProvider(['feat: add feature', 'fix: bug']);
  return { mockLLM };
};
```

### jest.spyOn() for Spying

```typescript
it('should call git service to get staged diff', async () => {
  const { useCase, mockGit } = getInstance();
  const spy = jest.spyOn(mockGit, 'getStagedDiff');

  await useCase.execute();

  expect(spy).toHaveBeenCalled();
});

it('should call LLM with correct prompt', async () => {
  const { useCase, mockLLM } = getInstance();
  const spy = jest.spyOn(mockLLM, 'generate');

  await useCase.execute();

  expect(spy).toHaveBeenCalledWith(
    expect.arrayContaining([
      expect.objectContaining({ role: 'system' }),
      expect.objectContaining({ role: 'user' }),
    ]),
    expect.any(Object),
  );
});
```

### Observable Mocking with ReplaySubject

Use `ReplaySubject` for controllable observables in tests.

```typescript
import { ReplaySubject } from 'rxjs';

const getInstance = () => {
  const isHealthy$$ = new ReplaySubject<boolean>(1);

  const mockProvider = {
    providerId: 'mock',
    health$: isHealthy$$.asObservable(),
    generate: jest.fn(),
  };

  return { mockProvider, isHealthy$$ };
};

it('should emit health status', (done) => {
  const { mockProvider, isHealthy$$ } = getInstance();

  mockProvider.health$.subscribe((status) => {
    expect(status).toBe(true);
    done();
  });

  isHealthy$$.next(true);
});
```

---

## 5. Async & Observable Testing

### async/await Pattern

```typescript
it('should generate commit message asynchronously', async () => {
  const { useCase } = getInstance();
  const result = await useCase.execute();
  expect(result).toBeDefined();
});

it('should throw error when LLM fails', async () => {
  const { mockLLM } = getInstance();
  mockLLM.generate.mockRejectedValue(new Error('LLM error'));

  await expect(useCase.execute()).rejects.toThrow('LLM error');
});
```

### Promise Testing

```typescript
it('should resolve with commit message', () => {
  const { useCase } = getInstance();
  return expect(useCase.execute()).resolves.toMatch(/^(feat|fix):/);
});

it('should reject when git fails', () => {
  const { mockGit } = getInstance();
  mockGit.getStagedDiff.mockRejectedValue(new Error('Git error'));
  return expect(useCase.execute()).rejects.toThrow('Git error');
});
```

### Stream Testing

```typescript
it('should stream commit message chunks', async () => {
  const { provider } = getInstance();
  const chunks: string[] = [];

  for await (const chunk of provider.stream(messages, options)) {
    chunks.push(chunk);
  }

  expect(chunks.join('')).toBe('feat: complete message');
});
```

### RxJS Observable Testing

```typescript
import { firstValueFrom } from 'rxjs';

it('should emit value from observable', async () => {
  const { service } = getInstance();
  const value = await firstValueFrom(service.data$);
  expect(value).toBeDefined();
});

it('should complete observable after emission', (done) => {
  const { service } = getInstance();
  service.data$.subscribe({
    next: (value) => expect(value).toBeDefined(),
    complete: () => done(),
  });
});
```

---

## 6. Complete Examples

### Use Case Test Example

````typescript
// tests/unit/use-cases/generate-commit-message.spec.ts
import { GenerateCommitMessage } from '@/features/commit/use-cases/generate-commit-message';

describe('GenerateCommitMessage', () => {
  const getData = () => {
    const diff = 'diff --git a/file.ts\n+const newFeature = true;';
    const files = ['file.ts'];
    const response = 'feat: add new feature flag';

    return { diff, files, response };
  };

  interface InstanceConfig {
    diff?: string;
    response?: string;
  }

  const getInstance = (config?: InstanceConfig) => {
    const { diff, response } = getData();

    const mockGit = {
      getStagedDiff: jest.fn().mockResolvedValue(config?.diff ?? diff),
      getChangedFiles: jest.fn().mockResolvedValue(['file.ts']),
      commit: jest.fn(),
    };

    const mockLLM = {
      generate: jest.fn().mockResolvedValue(config?.response ?? response),
      stream: jest.fn(),
    };

    const mockTemplate = {
      renderFile: jest.fn().mockResolvedValue('Analyze this diff...'),
    };

    const mockConfig = {
      get: jest.fn((key) => ({ model: 'llama3.2:1b', template: 'conventional' })[key]),
    };

    const useCase = new GenerateCommitMessage(mockGit, mockLLM, mockTemplate, mockConfig);

    return { useCase, mockGit, mockLLM, mockTemplate, mockConfig };
  };

  describe('when git has staged changes', () => {
    it('should generate conventional commit message', async () => {
      const { useCase } = getInstance();
      const result = await useCase.execute();
      expect(result).toBe('feat: add new feature flag');
    });

    it('should call git service to get staged diff', async () => {
      const { useCase, mockGit } = getInstance();
      await useCase.execute();
      expect(mockGit.getStagedDiff).toHaveBeenCalled();
    });

    it('should call LLM with rendered template prompt', async () => {
      const { useCase, mockLLM, mockTemplate } = getInstance();
      await useCase.execute();

      expect(mockTemplate.renderFile).toHaveBeenCalledWith(
        'templates/conventional.hbs',
        expect.objectContaining({ diff: expect.any(String) }),
      );

      expect(mockLLM.generate).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ role: 'system' }),
          expect.objectContaining({ role: 'user' }),
        ]),
        expect.objectContaining({ model: 'llama3.2:1b' }),
      );
    });
  });

  describe('when git has no staged changes', () => {
    it('should throw "No staged changes" error', async () => {
      const { useCase } = getInstance({ diff: '' });
      await expect(useCase.execute()).rejects.toThrow('No staged changes');
    });
  });

  describe('#sanitize', () => {
    it('should remove markdown code blocks from LLM output', async () => {
      const { useCase } = getInstance({ response: '```\nfeat: test\n```' });
      const result = await useCase.execute();
      expect(result).toBe('feat: test');
    });
  });
});
````

### Adapter Test Example

```typescript
// tests/unit/infrastructure/ollama-provider.spec.ts
import { OllamaProvider } from '@/infrastructure/llm/ollama-provider';

describe('OllamaProvider', () => {
  const getData = () => {
    const messages = [
      { role: 'system', content: 'You are a commit message generator' },
      { role: 'user', content: 'Generate a commit message' },
    ];

    const options = {
      model: 'llama3.2:1b',
      temperature: 0.3,
      maxTokens: 100,
    };

    const response = {
      message: { content: 'feat: implement feature' },
    };

    return { messages, options, response };
  };

  const getInstance = () => {
    const mockClient = {
      chat: jest.fn(),
      list: jest.fn().mockResolvedValue([]),
    };

    const provider = new OllamaProvider(mockClient);

    return { provider, mockClient };
  };

  describe('#generate', () => {
    it('should call Ollama client with correct parameters', async () => {
      const { provider, mockClient } = getInstance();
      const { messages, options, response } = getData();

      mockClient.chat.mockResolvedValue(response);

      await provider.generate(messages, options);

      expect(mockClient.chat).toHaveBeenCalledWith({
        model: options.model,
        messages,
        stream: false,
        options: {
          temperature: options.temperature,
          num_predict: options.maxTokens,
        },
      });
    });

    it('should return message content from response', async () => {
      const { provider, mockClient } = getInstance();
      const { messages, options, response } = getData();

      mockClient.chat.mockResolvedValue(response);

      const result = await provider.generate(messages, options);

      expect(result).toBe('feat: implement feature');
    });
  });

  describe('#checkHealth', () => {
    it('should return true when Ollama is running', async () => {
      const { provider, mockClient } = getInstance();
      mockClient.list.mockResolvedValue([{ name: 'llama3.2:1b' }]);

      const result = await provider.checkHealth();

      expect(result).toBe(true);
    });

    it('should return false when Ollama is not running', async () => {
      const { provider, mockClient } = getInstance();
      mockClient.list.mockRejectedValue(new Error('Connection refused'));

      const result = await provider.checkHealth();

      expect(result).toBe(false);
    });
  });
});
```

### Integration Test Example

```typescript
// tests/integration/commit-workflow.spec.ts
import { GenerateCommitMessage } from '@/features/commit/use-cases/generate-commit-message';
import { OllamaProvider } from '@/infrastructure/llm/ollama-provider';
import { ShellGitService } from '@/infrastructure/git/shell-git-service';

describe('Commit Workflow Integration', () => {
  it('should generate and create commit with real services', async () => {
    // Use real adapter implementations with test data
    const gitService = new ShellGitService();
    const llmProvider = new MockLLMProvider(['feat: integration test commit']);
    const templateEngine = new HandlebarsEngine();
    const config = { get: (key) => ({ model: 'llama3.2:1b' })[key] };

    const useCase = new GenerateCommitMessage(gitService, llmProvider, templateEngine, config);

    // Mock git to avoid actual file system changes
    jest.spyOn(gitService, 'getStagedDiff').mockResolvedValue('diff content');
    jest.spyOn(gitService, 'commit').mockResolvedValue(undefined);

    const message = await useCase.execute();

    expect(message).toBe('feat: integration test commit');
    expect(gitService.getStagedDiff).toHaveBeenCalled();
  });
});
```
