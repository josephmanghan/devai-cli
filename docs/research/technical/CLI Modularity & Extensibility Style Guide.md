# **Modular Architecture Style Guide for ollacli: A Framework for Extensible Git Automation**

## **1\. Executive Summary and Architectural Philosophy**

The development of ollacli, a Node.js-based Command Line Interface (CLI) designed to automate Git commit message generation using Ollama and other Large Language Model (LLM) providers, presents a distinct intersection of challenges. It sits at the convergence of deterministic system operations—represented by the rigid, version-controlled environment of Git—and the probabilistic, generative nature of modern AI. The primary objective of this architecture is not merely to facilitate the execution of a script that pipes a git diff into an LLM, but to establish a resilient, extensible framework capable of evolving with the rapidly changing landscape of AI models while maintaining the stability required of a developer tool.

To achieve the stated requirements of modularity, extensibility (specifically for future commands such as pr), swappable templates, and provider agnosticism, this report mandates the adoption of a **Modular Hexagonal Architecture**, also commonly referred to as the Ports and Adapters pattern. This architectural style is specifically chosen to decouple the core business logic—the generation of semantic meaning from code changes—from the volatile infrastructure mechanisms used to achieve it, such as specific API endpoints, local LLM binaries, or file system configurations.1

The prevailing philosophy for ollacli is strict **Separation of Concerns** via **Dependency Inversion**. High-level policies, such as the rules governing what constitutes a valid "Conventional Commit" or how a Pull Request description is structured, must never depend on low-level details, such as whether the inference engine is running locally via Ollama or remotely via OpenAI.4 Instead, both the high-level policy and the low-level detail must depend on shared abstractions. This inversion is the key that unlocks testability, allowing the system to be verified in isolation without requiring a running 8-parameter language model or a live Git repository during CI/CD processes.5

Furthermore, this guide addresses the "Plugin Architecture" necessary for future extensibility. By treating commands like commit and pr as distinct feature modules that plug into a shared kernel, ollacli avoids the monolithic "God Class" anti-pattern common in CLI tools, where a single entry point file grows uncontrollably.7 This document serves as the authoritative reference for the directory structure, interface definitions, and implementation patterns required to build ollacli as a professional-grade, maintainable software product.

## **2\. Architectural Layers and System Boundaries**

The system is conceptualized as a series of concentric layers, where dependencies flow strictly inward. This structure ensures that changes in external libraries or tools (the outer layers) do not necessitate refactoring the core application logic (the inner layers).

### **2.1 The Domain Layer (Entities & Business Rules)**

At the center of the architecture lies the Domain Layer. This layer encapsulates the fundamental concepts of the application that are true regardless of the interface (CLI vs. GUI) or the infrastructure (Ollama vs. GPT-4).

- **Entities:** These are the core data structures. For ollacli, entities include GitDiff, CommitMessage, PromptContext, and UserConfiguration. These are pure TypeScript classes or interfaces with no external dependencies.
- **Business Rules:** This includes logic such as validating that a commit message adheres to the Conventional Commits specification (e.g., \<type\>(\<scope\>): \<subject\>), or calculating the token count of a diff to ensure it fits within a model's context window.

By isolating the Domain Layer, we ensure that the logic defining "what a commit is" remains stable. If Ollama updates its API or Node.js changes its filesystem API, the definition of a CommitMessage remains untouched.3

### **2.2 The Application Layer (Use Cases)**

Surrounding the Domain is the Application Layer, which contains the **Use Cases**. A Use Case represents a specific user action, such as GenerateCommitMessage or DraftPullRequest. This layer orchestrates the flow of data between the Domain entities and the abstract interfaces of the outer layers.

- **Orchestration:** The GenerateCommitMessage use case is responsible for fetching the staged changes (via an abstract IGitService), selecting the appropriate template (via ITemplateEngine), rendering the prompt, sending it to the AI (via ILLMProvider), and returning the result.
- **Purity:** This layer does not know _how_ the diff is fetched or _which_ LLM is used. It only knows that it _can_ fetch a diff and _can_ generate text. This makes the Use Case highly testable using mocks.9

### **2.3 The Adapter Layer (Interface Adapters)**

The Adapter Layer bridges the gap between the internal Use Cases and the external world. It contains the concrete implementations of the interfaces defined by the Application Layer.

- **CLI Controllers:** These adapt the user's command-line input (parsed by Commander.js) into data structures the Use Case understands. For example, converting a \--no-emoji flag into a PromptContext configuration.2
- **Gateways:** This includes the OllamaProvider (adapting the ILLMProvider interface to Ollama's REST API) and the ShellGitService (adapting the IGitService interface to Node's child_process).

### **2.4 The Infrastructure Layer (Frameworks & Drivers)**

The outermost layer contains the specific tools and frameworks used to run the application.

- **Frameworks:** Commander.js for CLI routing, Cosmiconfig for configuration loading, and Axios/Fetch for network requests.
- **Drivers:** The actual git executable on the user's machine, the Ollama background process, and the local file system.

## **3\. Detailed Module Structure and Directory Organization**

To satisfy the requirement for "future commands like pr" and "modularity," ollacli must adopt a **Feature-Based Modular Structure** rather than a purely Layer-Based structure. In a purely layer-based structure (folders named controllers, services, models), adding a new feature requires touching files in every folder, scattering the logic. In a Feature-Based structure, all logic for a specific command is co-located, making the system easier to extend and navigate.9

### **3.1 Recommended Directory Tree**

The following directory structure is mandated for the project. It clearly separates the shared "Core" capabilities from the distinct "Features" (Commands).

/ollacli  
├── bin/  
│ └── ollacli.js \# Compiled entry point (executable)  
├── src/  
│ ├── main.ts \# Application Bootstrap & DI Container Setup  
│ ├── cli.ts \# CLI Entry Point (Commander setup)  
│ │  
│ ├── core/ \# THE KERNEL (Shared Logic)  
│ │ ├── domain/ \# Domain Entities  
│ │ │ ├── CommitMessage.ts  
│ │ │ ├── GitDiff.ts  
│ │ │ └── PromptContext.ts  
│ │ ├── interfaces/ \# Ports (Contracts)  
│ │ │ ├── IGitService.ts  
│ │ │ ├── ILLMProvider.ts  
│ │ │ ├── IConfigService.ts  
│ │ │ └── ITemplateEngine.ts  
│ │ ├── types/ \# Shared Types  
│ │ │ └── config.types.ts  
│ │ └── utils/ \# Shared Utilities  
│ │ ├── logger.ts  
│ │ └── validators.ts  
│ │  
│ ├── infrastructure/ \# ADAPTERS (Implementations)  
│ │ ├── config/  
│ │ │ └── CosmiconfigService.ts  
│ │ ├── git/  
│ │ │ ├── SimpleGitAdapter.ts  
│ │ │ └── ShellGitAdapter.ts  
│ │ ├── llm/  
│ │ │ ├── OllamaProvider.ts  
│ │ │ ├── OpenAIProvider.ts  
│ │ │ └── MockLLMProvider.ts  
│ │ └── templates/  
│ │ ├── HandlebarsEngine.ts  
│ │ └── parsers/  
│ │  
│ └── features/ \# MODULAR COMMANDS  
│ ├── commit/ \# The 'commit' Command Module  
│ │ ├── controllers/  
│ │ │ └── CommitController.ts  
│ │ ├── use-cases/  
│ │ │ ├── GenerateCommitMessage.ts  
│ │ │ └── ValidateDiff.ts  
│ │ ├── templates/ \# Default templates for this feature  
│ │ │ ├── conventional.hbs  
│ │ │ └── emoji.hbs  
│ │ └── index.ts \# Module Export  
│ │  
│ └── pr/ \# Future 'pr' Command Module  
│ ├── controllers/  
│ │ └── PRController.ts  
│ ├── use-cases/  
│ │ └── GeneratePRDescription.ts  
│ └── templates/  
│ └── pr-default.hbs  
│  
├── tests/ \# Testing Strategy  
│ ├── unit/  
│ ├── integration/  
│ └── mocks/  
├── package.json  
├── tsconfig.json  
└──.ollaclirc.example

### **3.2 Analysis of the Structure**

The core Directory:  
This directory contains the "contracts" of the application. It has zero dependencies on infrastructure or features. The interfaces folder is critical; it defines the ILLMProvider which both OllamaProvider (in infrastructure) and the GenerateCommitMessage use case (in features) rely upon. This breaks the direct dependency between the feature and the specific tool.1  
The infrastructure Directory:  
This contains the "dirty" code. Any file that imports child_process, fs, axios, or cosmiconfig belongs here. By isolating these implementation details, we create a boundary that makes testing easier. For example, to test the application without Git installed, we simply swap ShellGitAdapter for a MockGitAdapter that returns strings, without changing a single line of the feature code.5  
The features Directory:  
This is where the application grows. When the user requests a pr command, a new folder src/features/pr is created. It defines its own Controller and Use Case. It reuses the shared IGitService and ILLMProvider from core, but defines its own logic for how to use them (e.g., fetching a branch comparison log instead of a staged diff). This structure prevents the "spaghetti code" phenomenon where a single controller file handles logic for multiple unrelated commands.9

## **4\. Interface Definitions and Abstractions**

The success of a modular architecture hinges on the quality of its interfaces. These interfaces act as the "Ports" in the Hexagonal architecture, defining how the core interacts with the outside world.

### **4.1 The ILLMProvider Interface**

To satisfy the requirement for "different LLM providers" (Ollama, OpenAI, Anthropic), the interface must abstract away the differences in API endpoints, authentication methods, and response formats.

Challenge: Ollama provides a /api/chat endpoint that is similar but not identical to OpenAI's /v1/chat/completions. OpenAI requires an API key; Ollama typically does not. OpenAI charges per token; Ollama consumes local CPU/GPU resources.  
Solution: A unified interface that supports streaming (essential for CLI UX) and standardizes the message format.

TypeScript

/\*\*  
 \* Represents a single message in the chat history.  
 \* Standardizes role-based prompting (System/User/Assistant).  
 \*/  
export interface ChatMessage {  
 role: 'system' | 'user' | 'assistant';  
 content: string;  
}

/\*\*  
 \* Options to control the generation process.  
 \* Allows the Use Case to specify behavior without knowing the provider.  
 \*/  
export interface GenerationOptions {  
 model: string; // e.g., 'llama3', 'gpt-4'  
 temperature?: number; // 0.0 to 1.0  
 maxTokens?: number; // limit output length  
 jsonMode?: boolean; // Force structured output  
 abortSignal?: AbortSignal;// Allow user cancellation via Ctrl+C  
}

/\*\*  
 \* The Contract for any AI Provider.  
 \*/  
export interface ILLMProvider {  
 /\*\*  
 \* The unique identifier for the provider (e.g., 'ollama', 'openai').  
 \* Used for logging and configuration verification.  
 \*/  
 readonly providerId: string;

/\*\*  
 \* Generates a complete response in one go.  
 \* Useful for non-interactive modes or short outputs.  
 \*/  
 generate(messages: ChatMessage, options: GenerationOptions): Promise\<string\>;

/\*\*  
 \* Streams the response chunk by chunk.  
 \* CRITICAL for CLI tools to provide immediate feedback to the user.  
 \*/  
 stream(messages: ChatMessage, options: GenerationOptions): AsyncGenerator\<string, void, unknown\>;

/\*\*  
 \* Verifies the provider is reachable and the model is available.  
 \* Allows the CLI to "Fail Fast" if Ollama is not running.  
 \*/  
 checkHealth(): Promise\<boolean\>;  
}

**Context:** The stream method returns an AsyncGenerator. This is a modern JavaScript feature that allows the CLI controller to print characters to the terminal as they are received from the LLM, vastly improving the perceived performance of the tool compared to waiting for the full response.13

### **4.2 The IGitService Interface**

Directly using child_process.exec throughout the codebase leads to security vulnerabilities (command injection) and testing nightmares. The IGitService abstracts git operations into semantic methods.

TypeScript

export interface IGitService {  
 /\*\*  
 \* Retrieves the diff of files staged for commit.  
 \* Must handle encoding issues and large outputs.  
 \*/  
 getStagedDiff(): Promise\<string\>;

/\*\*  
 \* Retrieves the diff between two branches (for the PR command).  
 \*/  
 getBranchDiff(targetBranch: string): Promise\<string\>;

/\*\*  
 \* Gets a list of changed files.  
 \* Useful for context-aware prompting (e.g., focusing on specific files).  
 \*/  
 getChangedFiles(): Promise\<string\>;

/\*\*  
 \* Commits the staged changes with the provided message.  
 \*/  
 commit(message: string): Promise\<void\>;  
}

### **4.3 The ITemplateEngine Interface**

To support "swappable templates," the system must not lock into a specific syntax. The interface allows for different rendering backends, though Handlebars is the recommended default.

TypeScript

export interface ITemplateEngine {  
 /\*\*  
 \* Renders a template string with the provided data context.  
 \*/  
 render(template: string, data: Record\<string, any\>): string;

/\*\*  
 \* Loads a template from the file system and renders it.  
 \*/  
 renderFile(filePath: string, data: Record\<string, any\>): Promise\<string\>;  
}

## **5\. Adapter Implementation and Provider Patterns**

This section details how to implement the adapters that fulfill the interfaces defined above, focusing on the specific requirements of Ollama and OpenAI integration.

### **5.1 The Ollama Adapter (OllamaProvider)**

Ollama serves as the primary local inference engine. Its API is designed to be compatible with OpenAI's in many respects, but distinct enough to require a dedicated adapter.

Connection Strategy:  
The adapter connects to http://localhost:11434 (default). It must handle ECONNREFUSED errors gracefully, interpreting them as "Ollama is not running" rather than a generic network error. This is a crucial user experience detail for a CLI tool.15  
Streaming Implementation:  
Ollama's /api/chat endpoint returns a stream of JSON objects, not raw text. The adapter must parse these objects on the fly.

TypeScript

// Conceptual implementation of stream in OllamaProvider  
async \*stream(messages: ChatMessage, options: GenerationOptions): AsyncGenerator\<string, void, unknown\> {  
 const response \= await fetch(\`${this.baseUrl}/api/chat\`, {  
 method: 'POST',  
 body: JSON.stringify({  
 model: options.model,  
 messages: messages,  
 stream: true, // Enable Ollama streaming  
 options: { temperature: options.temperature }  
 })  
 });

if (\!response.body) throw new Error('No response body');  
 const reader \= response.body.getReader();  
 const decoder \= new TextDecoder();

while (true) {  
 const { done, value } \= await reader.read();  
 if (done) break;  
 const chunk \= decoder.decode(value, { stream: true });  
 // Parse JSON-line format from Ollama  
 const lines \= chunk.split('\\n').filter(Boolean);  
 for (const line of lines) {  
 const json \= JSON.parse(line);  
 if (json.message?.content) {  
 yield json.message.content; // Yield only the text delta  
 }  
 }  
 }  
}

**Insight:** This implementation hides the complexity of JSON parsing and buffering from the application core. The Use Case simply iterates over the generator, unaware that the data is coming from a local HTTP stream.13

### **5.2 The OpenAI Adapter (OpenAIProvider)**

The OpenAI adapter implements the same ILLMProvider interface but handles API keys and the specific payload structure of the OpenAI API.

Security Consideration:  
The OpenAI adapter must never accept an API key hardcoded in the source. It should rely on the IConfigService to inject the key, which retrieves it from environment variables or a secure configuration file. This adheres to the Twelve-Factor App methodology regarding configuration.16  
Standardization:  
OpenAI's streaming format utilizes Server-Sent Events (SSE) starting with data:. The adapter's stream method must parse this distinct format and normalize it to yield simple string chunks, matching the behavior of the OllamaProvider.18

### **5.3 The Factory Pattern for Provider Selection**

To support runtime switching between providers (e.g., via a \--provider=openai flag), a **Provider Factory** is recommended.

TypeScript

// src/infrastructure/llm/LLMFactory.ts  
export class LLMFactory {  
 constructor(private configService: IConfigService) {}

createProvider(): ILLMProvider {  
 const providerType \= this.configService.get('provider');  
 switch (providerType) {  
 case 'ollama':  
 return new OllamaProvider(this.configService.get('ollamaUrl'));  
 case 'openai':  
 return new OpenAIProvider(this.configService.get('openaiApiKey'));  
 default:  
 throw new Error(\`Unsupported provider: ${providerType}\`);  
 }  
 }  
}

This factory is used during the application bootstrap phase to instantiate the correct provider, which is then injected into the controllers.4

## **6\. Template System Architecture**

The requirement for "swappable templates" drives the selection of the template engine. The goal is to allow users to define their own prompt structures in external files (e.g., .ollaclirc.hbs) without modifying the CLI code.

### **6.1 Engine Selection: Handlebars**

While EJS offers full JavaScript power and Mustache offers logic-less simplicity, **Handlebars** is the optimal choice for this architecture.

- **vs. EJS:** EJS allows arbitrary code execution (\<% rm \-rf / %\>), which is a security risk if a user downloads a malicious template pack from the internet. Handlebars is strictly logic-less in terms of executing system commands but powerful enough to handle display logic.19
- **vs. Mustache:** Git logic often requires conditional rendering (e.g., "Only add the 'Breaking Changes' footer if the diff contains a breaking change"). Mustache's lack of if/else logic makes this difficult. Handlebars supports Block Helpers which are perfect for this.21

### **6.2 Custom Helpers for Git Automation**

The HandlebarsEngine should register domain-specific helpers to make prompts robust.

- {{truncate diff 4000}}: A helper that truncates the git diff input to 4000 characters. This is essential for preventing LLM context window overflows, which is a common failure mode in LLM CLIs.
- {{fileList diff}}: A helper that extracts just the file names from the diff, allowing the prompt to say "This commit modifies X, Y, and Z" before analyzing the code.

### **6.3 Template Management Strategy**

Templates should be treated as **Configuration**, not Code.

1. **Defaults:** The CLI ships with a set of default templates (Conventional Commits, Emoji, Concise) embedded in the binary.
2. **User Overrides:** The ConfigService checks for a templates directory in the user's config path. If a template matching the requested name exists, it takes precedence.
3. **Prompt Injection Defense:** The "System Prompt" (the instruction to the LLM) and the "User Prompt" (the diff) should be rendered separately. The System Prompt should include instructions to ignore any instructions found within the diff itself, mitigating prompt injection attacks where code comments might trick the LLM.23

## **7\. Configuration Management**

A robust CLI must handle configuration from multiple sources with a clear precedence order.

### **7.1 The Configuration Hierarchy**

ollacli will use **Cosmiconfig** to manage this complexity.25 The precedence order (highest to lowest) is:

1. **CLI Arguments:** Flags passed at runtime (e.g., \--provider=openai).
2. **Environment Variables:** OLLACLI_PROVIDER, OPENAI_API_KEY.
3. **Local Config:** .ollaclirc or ollacli.config.js in the current project root.
4. **Global Config:** \~/.config/ollacli/config (User preferences).
5. **Defaults:** Hardcoded fallbacks in the application.

### **7.2 Schema Validation with Zod**

Configuration files are prone to user error (typos, invalid types). To prevent the application from crashing deep in the execution stack, the config object must be validated immediately upon loading. **Zod** is the recommended library for this due to its TypeScript integration.7

TypeScript

import { z } from 'zod';

const ConfigSchema \= z.object({  
 provider: z.enum(\['ollama', 'openai', 'anthropic'\]).default('ollama'),  
 model: z.string().default('llama3'),  
 temperature: z.number().min(0).max(1).default(0.7),  
 maxTokens: z.number().optional(),  
 template: z.string().default('conventional'),  
 ollamaUrl: z.string().url().default('http://localhost:11434'),  
 // Secret management: API keys can be strings or environment variable references  
 apiKey: z.string().optional(),  
});

export type UserConfig \= z.infer\<typeof ConfigSchema\>;

### **7.3 Managing "Secrets" vs "Settings"**

API Keys (Secrets) should ideally not be stored in the checked-in .ollaclirc file. The architecture should encourage the use of .env files. The CosmiconfigService should automatically load dotenv before parsing the configuration, allowing users to reference ${OPENAI_API_KEY} in their config files or simply rely on the app reading the environment variable directly.26

## **8\. Future Extensibility Case Study: The pr Command**

To demonstrate the architecture's modularity, we analyze the addition of a pr (Pull Request) generation command.

### **8.1 The Requirement**

The user wants to run ollacli pr to generate a title and description for a Pull Request based on the changes between the current branch and the main branch.

### **8.2 Integration Steps**

1. **New Feature Module:** Create src/features/pr.
2. **New Use Case:** GeneratePRDescription.ts.
   - _Difference:_ Unlike commit which calls gitService.getStagedDiff(), this use case calls gitService.getBranchDiff('main').
   - _Reuse:_ It reuses the exact same ILLMProvider to talk to Ollama. It reuses the ITemplateEngine but requests a different template (pr.hbs).
3. **New Controller:** PRController.ts.
   - _Flags:_ Accepts target branch flags (--target=develop).
4. **Registration:** The cli.ts registry scans the features folder and registers the new command.

### **8.3 Context Window Management**

PRs are typically much larger than single commits. The GeneratePRDescription use case must implement a more sophisticated **Context Management Strategy**.

- **Summarization:** If the diff is too large, the use case might need to perform a "Map-Reduce" operation: chunk the diff, summarize each chunk with the LLM, and then generate the PR description from the summaries.
- **Architectural Support:** The ILLMProvider interface supports this by being stateless; the use case can make multiple calls to generate() to process chunks before making the final call. This complex logic is contained entirely within the pr feature module, keeping the commit module lightweight.28

## **9\. Testing and Quality Assurance Strategy**

A CLI tool is difficult to test because it depends on the shell environment and external APIs. The architecture mitigates this via strict mocking.

### **9.1 Unit Testing with Mocks**

Tests should run in isolation without spawning git processes or hitting Ollama.

- **MockLLMProvider:** An implementation of ILLMProvider that returns fixed strings instantly. This allows testing the prompt rendering and CLI output formatting without latency or cost.
- **MockGitService:** An implementation of IGitService that returns pre-defined diff strings. This allows testing edge cases (empty diffs, binary files, huge diffs) that are hard to reproduce in a real repo.5

**Example Test Spec (Jest):**

TypeScript

it('should generate a commit message for a valid diff', async () \=\> {  
 const mockGit \= new MockGitService({ stagedDiff: 'diff \--git a/file.ts...' });  
 const mockLLM \= new MockLLMProvider({ response: 'feat: update file' });  
 const useCase \= new GenerateCommitMessage(mockGit, mockLLM);

const result \= await useCase.execute();  
 expect(result).toBe('feat: update file');  
 expect(mockLLM.lastPrompt).toContain('diff \--git'); // Verify prompt construction  
});

### **9.2 Integration Testing**

To verify the wiring, "Integration" tests should use the real ShellGitService but operate in a temporary directory.

- **Tools:** Use mock-fs or tmp to create a ephemeral git repo.
- **Scope:** Initialize a repo, stage a file, run the CLI command (using a Mock LLM), and verify that git log shows the new commit. This validates the Commander \-\> Controller \-\> GitService pipeline.31

## **10\. Conclusion and Implementation Roadmap**

This Modular Architecture Style Guide provides a comprehensive blueprint for ollacli. By adopting the **Hexagonal Architecture**, the system achieves:

1. **Provider Agnosticism:** The ability to switch between Ollama and OpenAI is baked into the core via the ILLMProvider interface.
2. **Testability:** Business logic is testable without side effects.
3. **Extensibility:** New commands like pr can be added as isolated modules without destabilizing existing functionality.
4. **Configurability:** A robust configuration hierarchy using Cosmiconfig and Zod ensures user control and type safety.

**Implementation Priorities:**

1. **Phase 1:** Establish the Core Interfaces (ILLMProvider, IGitService) and the DI structure.
2. **Phase 2:** Implement the OllamaProvider and ShellGitService.
3. **Phase 3:** Build the commit feature using Handlebars templates.
4. **Phase 4:** Implement the Configuration subsystem.
5. **Phase 5:** Add the pr command to validate the modularity of the design.

This rigorous approach ensures ollacli will be not just a script, but a platform for AI-assisted development workflows.

---

**Table 1: Feature Comparison of AI Providers for ollacli**

| Feature            | Ollama (Local)                     | OpenAI (Cloud)              | Architectural Implication                                                                 |
| :----------------- | :--------------------------------- | :-------------------------- | :---------------------------------------------------------------------------------------- |
| **Latency**        | Low (Network) / Variable (Compute) | Medium (Network)            | ILLMProvider must support stream() to prevent UI freezing.                                |
| **Cost**           | Free (Local Resources)             | Pay-per-token               | Config must support maxTokens to limit API costs.                                         |
| **Privacy**        | High (Data stays local)            | Medium (Data sent to cloud) | IGitService should verify if repo is private before sending to OpenAI (optional feature). |
| **Context Window** | Dependent on Hardware (e.g., 8k)   | Large (128k in GPT-4o)      | Template helpers must truncate diffs based on the _selected provider's_ limits.           |
| **API Format**     | JSON Stream / /api/chat            | SSE Stream / /v1/chat       | Adapter pattern required to normalize response parsing.                                   |

**Table 2: Template Engine Evaluation**

| Engine         | Logic Support     | Security       | Syntax       | Recommendation                                     |
| :------------- | :---------------- | :------------- | :----------- | :------------------------------------------------- |
| **EJS**        | Full JavaScript   | Low (RCE risk) | \<% code %\> | **Rejected** (Too risky for shared templates).     |
| **Mustache**   | None (Logic-less) | High           | {{ val }}    | **Rejected** (Too limiting for complex Git logic). |
| **Handlebars** | Limited (Helpers) | High           | {{\#if val}} | **Accepted** (Balances logic needs with security). |

#### **Works cited**

1. sebajax/nodejs-ts-clean-architecture: Nodejs \+ Typescript code archetype using clean architecture \- GitHub, accessed November 26, 2025, [https://github.com/sebajax/nodejs-ts-clean-architecture](https://github.com/sebajax/nodejs-ts-clean-architecture)
2. Clean Architecture in Node.js: An Approach with TypeScript and Dependency Injection., accessed November 26, 2025, [https://dev.to/evangunawan/clean-architecture-in-nodejs-an-approach-with-typescript-and-dependency-injection-16o](https://dev.to/evangunawan/clean-architecture-in-nodejs-an-approach-with-typescript-and-dependency-injection-16o)
3. This is a project trying to implement the clean architecture on Nodejs \+ Typescript if you have some opinion let me know (If you like it give me an star) : r/node \- Reddit, accessed November 26, 2025, [https://www.reddit.com/r/node/comments/12znb39/this_is_a_project_trying_to_implement_the_clean/](https://www.reddit.com/r/node/comments/12znb39/this_is_a_project_trying_to_implement_the_clean/)
4. Is Dependency Injection in Node.js Really Worth It? | by Arunangshu Das \- Medium, accessed November 26, 2025, [https://medium.com/@arunangshudas/is-dependency-injection-in-node-js-really-worth-it-d071758bed6b](https://medium.com/@arunangshudas/is-dependency-injection-in-node-js-really-worth-it-d071758bed6b)
5. Mocha \- the fun, simple, flexible JavaScript test framework, accessed November 26, 2025, [https://mochajs.org/](https://mochajs.org/)
6. Unit testing node CLI apps with Jest | by Jon Short \- Medium, accessed November 26, 2025, [https://medium.com/@altshort/unit-testing-node-cli-apps-with-jest-2cd4adc599fb](https://medium.com/@altshort/unit-testing-node-cli-apps-with-jest-2cd4adc599fb)
7. Plugin Based Architecture in Node.js \- Expert Guide, accessed November 26, 2025, [https://www.n-school.com/plugin-based-architecture-in-node-js/](https://www.n-school.com/plugin-based-architecture-in-node-js/)
8. Node.js Plugin Architecture: Build Your Own Plugin System with ES Modules \- Medium, accessed November 26, 2025, [https://medium.com/codeelevation/node-js-plugin-architecture-build-your-own-plugin-system-with-es-modules-5b9a5df19884](https://medium.com/codeelevation/node-js-plugin-architecture-build-your-own-plugin-system-with-es-modules-5b9a5df19884)
9. A definitive guide to building a NodeJS app, using Clean Architecture (and TypeScript), accessed November 26, 2025, [https://vitalii-zdanovskyi.medium.com/a-definitive-guide-to-building-a-nodejs-app-using-clean-architecture-and-typescript-41d01c6badfa](https://vitalii-zdanovskyi.medium.com/a-definitive-guide-to-building-a-nodejs-app-using-clean-architecture-and-typescript-41d01c6badfa)
10. howardmann/clean-node: Clean Node Architecture \- GitHub, accessed November 26, 2025, [https://github.com/howardmann/clean-node](https://github.com/howardmann/clean-node)
11. Clean and Adaptive Node.js Architecture with TypeScript \- Bits and Pieces, accessed November 26, 2025, [https://blog.bitsrc.io/a-clean-and-adaptive-nodejs-architecture-with-typescript-b144c1735447](https://blog.bitsrc.io/a-clean-and-adaptive-nodejs-architecture-with-typescript-b144c1735447)
12. What folder structure do you use for your projects? : r/node \- Reddit, accessed November 26, 2025, [https://www.reddit.com/r/node/comments/z72wkr/what_folder_structure_do_you_use_for_your_projects/](https://www.reddit.com/r/node/comments/z72wkr/what_folder_structure_do_you_use_for_your_projects/)
13. Adapter in TypeScript / Design Patterns \- Refactoring.Guru, accessed November 26, 2025, [https://refactoring.guru/design-patterns/adapter/typescript/example](https://refactoring.guru/design-patterns/adapter/typescript/example)
14. How To Use Ollama (Or Other LLM Providers) In OpenAI Agents SDK. \- YouTube, accessed November 26, 2025, [https://www.youtube.com/watch?v=Ee9ACL7ITlM](https://www.youtube.com/watch?v=Ee9ACL7ITlM)
15. What is the different between /api/generate and /api/chat? · Issue \#2774 \- GitHub, accessed November 26, 2025, [https://github.com/ollama/ollama/issues/2774](https://github.com/ollama/ollama/issues/2774)
16. NodeJs Environment variables vs config file \- Stack Overflow, accessed November 26, 2025, [https://stackoverflow.com/questions/54362959/nodejs-environment-variables-vs-config-file](https://stackoverflow.com/questions/54362959/nodejs-environment-variables-vs-config-file)
17. Managing Environment Variables in Node.js \- Better Stack, accessed November 26, 2025, [https://betterstack.com/community/guides/scaling-nodejs/node-environment-variables/](https://betterstack.com/community/guides/scaling-nodejs/node-environment-variables/)
18. A Comparative Guide to OpenAI and Ollama APIs (with cheatsheet) — Part 1 | by Zakk Yang, accessed November 26, 2025, [https://medium.com/@zakkyang/a-comparative-guide-to-openai-and-ollama-apis-with-cheathsheet-5aae6e515953](https://medium.com/@zakkyang/a-comparative-guide-to-openai-and-ollama-apis-with-cheathsheet-5aae6e515953)
19. handlebars vs ejs vs mustache vs pug | Template Engines for Node.js Comparison, accessed November 26, 2025, [https://npm-compare.com/ejs,handlebars,mustache,pug](https://npm-compare.com/ejs,handlebars,mustache,pug)
20. New to Node and template engines \- handlebars vs mustache \- Reddit, accessed November 26, 2025, [https://www.reddit.com/r/node/comments/ac68oe/new_to_node_and_template_engines_handlebars_vs/](https://www.reddit.com/r/node/comments/ac68oe/new_to_node_and_template_engines_handlebars_vs/)
21. What are the differences between Mustache.js and Handlebars.js? \- Stack Overflow, accessed November 26, 2025, [https://stackoverflow.com/questions/10555820/what-are-the-differences-between-mustache-js-and-handlebars-js](https://stackoverflow.com/questions/10555820/what-are-the-differences-between-mustache-js-and-handlebars-js)
22. Mustache vs. Handlebars scoping \- Guy Pursey, accessed November 26, 2025, [https://guypursey.com/blog/201411022009-mustache-vs-handlebars-scoping](https://guypursey.com/blog/201411022009-mustache-vs-handlebars-scoping)
23. Best practices for LLM prompt engineering \- Palantir, accessed November 26, 2025, [https://palantir.com/docs/foundry/aip/best-practices-prompt-engineering/](https://palantir.com/docs/foundry/aip/best-practices-prompt-engineering/)
24. Mastering System Prompts for LLMs \- DEV Community, accessed November 26, 2025, [https://dev.to/simplr_sh/mastering-system-prompts-for-llms-2d1d](https://dev.to/simplr_sh/mastering-system-prompts-for-llms-2d1d)
25. cosmiconfig/cosmiconfig: Find and load configuration from a package.json property, rc file, TypeScript module, and more\! \- GitHub, accessed November 26, 2025, [https://github.com/cosmiconfig/cosmiconfig](https://github.com/cosmiconfig/cosmiconfig)
26. Node.js Everywhere with Environment Variables\! | by John Papa \- Medium, accessed November 26, 2025, [https://medium.com/the-node-js-collection/making-your-node-js-work-everywhere-with-environment-variables-2da8cdf6e786](https://medium.com/the-node-js-collection/making-your-node-js-work-everywhere-with-environment-variables-2da8cdf6e786)
27. How do you manage your app configuration? : r/node \- Reddit, accessed November 26, 2025, [https://www.reddit.com/r/node/comments/txkzxd/how_do_you_manage_your_app_configuration/](https://www.reddit.com/r/node/comments/txkzxd/how_do_you_manage_your_app_configuration/)
28. Using Large Language Models for Commit Message Generation: A Preliminary Study \- arXiv, accessed November 26, 2025, [https://arxiv.org/html/2401.05926v2](https://arxiv.org/html/2401.05926v2)
29. From Commit Message Generation to History-Aware Commit Message Completion \- Danny Dig, accessed November 26, 2025, [https://danny.cs.colorado.edu/papers/ASE23_CMG.pdf](https://danny.cs.colorado.edu/papers/ASE23_CMG.pdf)
30. How to mock test a Node.js CLI with Jest? \- Stack Overflow, accessed November 26, 2025, [https://stackoverflow.com/questions/50379916/how-to-mock-test-a-node-js-cli-with-jest](https://stackoverflow.com/questions/50379916/how-to-mock-test-a-node-js-cli-with-jest)
31. Unit-testing a child process in a Node.js\\Typescript app | by Tzafrir Ben Ami | Medium, accessed November 26, 2025, [https://unhandledexception.dev/unit-testing-a-child-process-in-a-node-js-typescript-app-b7d89615e8e0](https://unhandledexception.dev/unit-testing-a-child-process-in-a-node-js-typescript-app-b7d89615e8e0)
