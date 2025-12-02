# **Ollama Integration Style Guide: Architectural Standards for High-Performance CLI Tools**

## **1\. Architectural Philosophy and System Design**

### **1.1 The Paradigm Shift: From Cloud APIs to Local Inference**

The integration of Large Language Models (LLMs) into local Command Line Interface (CLI) tools represents a fundamental architectural shift from traditional cloud-based patterns. In a cloud dependency model, the client application acts as a thin wrapper around a remote API, managing network latency and authentication but delegating the computational heavy lifting to a centralized server cluster. Conversely, integrating a local inference engine like Ollama into a Node.js CLI tool, specifically on Apple Silicon hardware, requires treating the model not merely as a service but as a _managed system resource_ akin to a database daemon or a compilation process.1

For the specific use case of generating Conventional Commit messages using the llama3.2:1b model, the architectural goal is to achieve sub-second inference latency (warm start) while maintaining the stateless, ephemeral nature of a CLI execution. This creates a tension between the CLI’s short lifecycle (milliseconds to seconds) and the model’s loading lifecycle (seconds). The solution lies in a decoupled client-server architecture where the CLI acts as an orchestrator, managing the state of a persistent background daemon (Ollama) to deliver the perception of instant intelligence.3

This style guide defines the rigorous standards required to bridge the gap between Node.js event loops and the lower-level tensor operations managed by llama.cpp (the engine underlying Ollama). It prioritizes deterministic outputs, aggressive latency optimization, and robust error handling to ensure the tool enhances rather than impedes the developer's workflow.

### **1.2 System Topology on Apple Silicon (M1/M2)**

Understanding the hardware substrate is critical for performance tuning. On M1/M2 Macs, the Unified Memory Architecture (UMA) allows the CPU and GPU to share a single address space. The llama3.2:1b model, particularly in its quantized forms (Q4_K_M or Q8_0), fits comfortably within the minimal memory footprint of these devices, typically requiring less than 2GB of VRAM.5

However, the "Cold Start" penalty—the time required to read the model weights from disk into the Unified Memory—remains the primary adversary of the \<1s target. Research indicates that while API calls to a loaded model are expeditious, the initial load time can range from 1 to 4 seconds depending on disk I/O and current system memory pressure.3 Therefore, the architectural pattern must shift from "Load on Demand" to "Pre-emptive Loading," utilizing the CLI’s initialization phase or background hooks to prime the memory state before the user explicitly requests generation.

### **1.3 The Service Orchestration Pattern**

The recommended pattern for this integration is **The State-Aware Orchestrator**. The CLI tool must not blindly fire requests at the API port (11434). Instead, it must implement a rigorous handshake protocol:

1. **Discovery:** Verify the Ollama process is active.
2. **State Assessment:** Query which models are currently loaded in memory using the /api/ps or /api/tags endpoints.7
3. **Conditioning:** If llama3.2:1b is not loaded, trigger a loading sequence with visual feedback; if it is loaded, proceed with an optimized "fast path" request.
4. **Execution:** Stream the response to the user to minimize Time to First Token (TTFT).

This pattern moves the complexity of state management into the CLI application, ensuring that the user is never left staring at a hanging cursor without context.

---

## **2\. Ollama Client Setup and Connectivity**

### **2.1 Client Library Selection: Official Library vs. fetch**

The Node.js ecosystem offers multiple avenues for HTTP communication, primarily the native fetch API (available in Node.js 18+) and the official ollama JavaScript library. While a minimalist philosophy might favor fetch to reduce dependency bloat, a comprehensive analysis of the maintenance and stability requirements suggests a different approach for production-grade tools.

**Prescriptive Standard:** Use the **Official ollama JavaScript Library** (npm install ollama).

**Rationale and Deep Analysis:**

| Feature            | Native fetch        | Official ollama Lib   | Architectural Implication                                                                                                                                                  |
| :----------------- | :------------------ | :-------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Type Safety**    | Manual              | Built-in (TypeScript) | The ollama library ships with up-to-date TypeScript definitions for request/response bodies, ensuring compliance with API changes.8                                        |
| **Streaming**      | Complex Boilerplate | Native Abstraction    | fetch requires manually parsing ndjson streams and handling buffer chunks. The library exposes an async generator (for await...of), drastically simplifying the codebase.9 |
| **Maintenance**    | High                | Low                   | Ollama's API evolves (e.g., adding format: json or tool calling). The library abstracts these changes, decoupling CLI logic from API versioning.9                          |
| **Error Handling** | Raw HTTP Codes      | Normalized Errors     | The library wraps HTTP 404/500 errors into typed exceptions, allowing for cleaner try/catch blocks tailored to model availability issues.10                                |

Implementation Strategy:  
The client should be instantiated as a singleton within a dedicated service module. This isolates the configuration logic (host resolution, timeout settings) from the command execution logic.

JavaScript

import { Ollama } from 'ollama';

// Singleton instance pattern ensures connection reuse logic if extended to keep-alive agents  
class OllamaService {  
 constructor() {  
 this.client \= new Ollama({  
 host: process.env.OLLAMA_HOST |

| 'http://127.0.0.1:11434',  
 });  
 }  
 // Methods for interaction...  
}

### **2.2 Connection Management and Keep-Alive**

To achieve sub-second latency, the HTTP connection setup time must be minimized, and the model must remain resident in memory.

HTTP Keep-Alive:  
Node.js's default HTTP agent creates a new TCP connection for every request unless configured otherwise. While the ollama library handles basic connectivity, for high-performance CLIs that might chain requests (e.g., summarize diff \-\> critique summary \-\> refine message), ensuring persistent TCP connections is beneficial. However, for a single-shot commit generator, the dominant latency factor is the model load time, not the TCP handshake.  
Model Keep-Alive (Crucial):  
Ollama defaults to unloading models after 5 minutes of inactivity to free up VRAM. For a developer workflow, where commits might happen sporadically, this default is generally acceptable. However, during a session of rapid commits (e.g., interactive rebase), the model must stay loaded.  
Prescriptive Standard:  
Always explicitly send the keep_alive parameter in every generation request.

- **Value:** 60m (60 minutes) or \-1 (infinite, until manual unload).
- **Reasoning:** Developers often context-switch. A 5-minute timeout is too aggressive for a "coding session." Extending this to 60 minutes ensures that once the model is warm, it remains warm for the duration of the work session, guaranteeing the \<1s target for subsequent commits.11

### **2.3 Handling Host Configuration**

The CLI must respect the user's environment. While localhost:11434 is the standard, containerized environments (Docker) or remote inference servers are common.

**Configuration Priority:**

1. **CLI Flag:** \--host (Highest priority, for one-off overrides).
2. **Environment Variable:** OLLAMA_HOST (Standard convention).
3. **Default:** http://127.0.0.1:11434.

The client initialization logic must validate the host string format to prevent obscure ECONNREFUSED errors later in the stack.

---

## **3\. Prompt Engineering for Llama 3.2 1B**

### **3.1 The Physics of Small Language Models (SLMs)**

The llama3.2:1b model is a marvel of efficiency, but it operates under strict cognitive constraints compared to larger models like Llama 3.1 70B or GPT-4. With only 1 billion parameters, its ability to maintain disparate instructions, adhere to complex negative constraints, or recover from ambiguous contexts is limited.5

**Implications for Prompting:**

1. **Instruction Drift:** The model may "forget" formatting rules if the input context (the git diff) is too noisy or long.
2. **Hallucination:** It is more prone to inventing files or changes if the diff is truncated or unclear.
3. **Verbosity:** Without strict control, it defaults to conversational filler ("Here is the commit message you asked for...").

To counteract these, the style guide mandates a **Few-Shot, Structured Prompting** strategy utilizing the specific Instruct template tokens native to Llama 3\.

### **3.2 The Llama 3 Instruct Template Structure**

Llama 3 models utilize a specific prompt format involving special tokens: \<|begin_of_text|\>, \<|start_header_id|\>, \<|end_header_id|\>, and \<|eot_id|\>.15 While the ollama library abstracts the raw string formatting when using the chat endpoint, understanding this structure is vital for debugging.

**Prescriptive Standard:** Use the chat endpoint (not generate) to leverage the library's automatic formatting of these tokens. Manually constructing the raw string is error-prone and brittle.

### **3.3 System Prompt Design**

The system prompt is the cognitive anchor for the 1B model. It must be authoritative, concise, and restrictive.

Recommended System Prompt:  
You are an expert software engineer and git commit message generator.  
Your task is to analyze the provided code changes and generate a single, concise commit message following the Conventional Commits specification.  
STRICT RULES:

1. Format: ():
2. Types: feat, fix, docs, style, refactor, perf, test, build, ci, chore, revert.
3. Subject: Imperative, present tense (e.g., "add" not "added"). No trailing period.
4. Output ONLY the commit message. No markdown, no code blocks, no intro/outro text.
5. If the diff is empty or ambiguous, default to "chore: update code".

**Analysis of Directives:**

- **Persona:** "Expert software engineer" primes the latent space for technical accuracy.
- **Format:** Explicitly defining type(scope): subject is necessary as 1B models may mix formats.
- **Negative Constraints:** "No markdown, no code blocks" is critical. 1B models have a strong bias towards Markdown formatting because they are trained on code repositories (GitHub/StackOverflow) where code is almost always wrapped in backticks.17

### **3.4 The "Few-Shot" Injection Strategy**

For llama3.2:1b, Zero-Shot prompting (providing instructions only) is often insufficient for rigid formatting. **Few-Shot Prompting**—providing examples of input-output pairs—drastically improves adherence.18

Prescriptive Standard:  
Inject 2-3 static examples into the message history immediately after the system prompt and before the actual user query.  
**Example Structure:**

1. **System Message:** (As defined above)
2. **User Message (Example 1):** "Diff: content of package.json changing version 1.0.0 to 1.1.0"
3. **Assistant Message (Example 1):** "chore(release): bump version to 1.1.0"
4. **User Message (Example 2):** "Diff: function login() {...} added to src/auth.js"
5. **Assistant Message (Example 2):** "feat(auth): add user login function"
6. **User Message (Actual):** "Diff: \[Actual git diff content\]"

This "pre-loading" of the context window aligns the model's pattern-matching algorithms with the desired output format, effectively "fine-tuning" the model via the prompt for the duration of the session.20

### **3.5 Handling Diff Noise and Context Limits**

Raw git diffs contain metadata that consumes tokens without adding semantic value (e.g., index 8f2a1b..3c4d5e 100644).

**Prescriptive Standard:**

- **Preprocessing:** Strip index lines and large blocks of deleted code if the context limit is approached.
- **Token Estimation:** A 1B model has a theoretical context of 128k, but for speed and memory on local devices, Ollama often defaults to 4k or 8k.11
- **Truncation Strategy:** If the diff \> 8000 characters (approx 2000 tokens), prioritize the _file names_ and the _added lines_ (green lines in diff). The model can often infer the "why" from the file name and the new code alone.

---

## **4\. Template Management System**

### **4.1 Architecture for Swappability**

Hardcoding prompts into the JavaScript logic creates technical debt. As the model evolves or user preferences change (e.g., "I want emojis in my commits"), the prompting strategy needs to change without code recompilation.

Prescriptive Standard:  
Implement a Filesystem-Based Template Registry using JSON files.  
**Directory Structure:**

\~/.config/my-cli/templates/  
 ├── conventional.json (Default)  
 ├── gitmoji.json  
 └── verbose.json

**JSON Schema:**

JSON

{  
 "name": "conventional",  
 "description": "Standard Conventional Commits format",  
 "system_prompt": "You are an expert...",  
 "few_shot_examples": \[  
 {  
 "input": "...",  
 "output": "..."  
 }  
 \],  
 "user_template": "Analyze the following diff:\\n\\n{{diff}}"  
}

### **4.2 Template Loading Logic**

The CLI should instantiate a TemplateManager class that:

1. Checks the user's config for a preferred template name.
2. Loads the corresponding JSON file.
3. Validates the JSON structure (preventing crashes from malformed user edits).
4. Exposes a render(diff) method that interpolates the git diff into the user_template string.

Rationale:  
JSON is natively supported by Node.js (require or JSON.parse), lightweight, and easily editable by users. Avoiding complex templating engines (like Handlebars) keeps the CLI startup time minimal, aligning with the performance goals.23

---

## **5\. API Communication Patterns**

### **5.1 Streaming vs. Non-Streaming**

The user experience of a CLI tool is defined by responsiveness. A "loading" spinner that spins for 3 seconds feels significantly longer than text that begins streaming after 0.5 seconds and finishes in 3 seconds.

**Prescriptive Standard:** **Always Use Streaming (stream: true).**

Mechanism:  
When stream: true is enabled, the Ollama API returns an application/x-ndjson (Newline Delimited JSON) response. The ollama library exposes this as an async iterable.  
**Implementation Details:**

1. **Buffer Management:** Do not simply console.log every chunk. Use process.stdout.write to append text smoothly.
2. **UI Feedback:** Before the stream starts, show a spinner (e.g., using ora). Once the first token arrives, stop the spinner and begin streaming the text. This precise transition marks the "Time to First Token" (TTFT) and is the critical metric for user satisfaction.
3. **Parsing:** Accumulate the full response in memory while streaming to the console. This full string will be needed for the final validation/confirmation step before executing git commit.

### **5.2 Handling Structured Outputs (JSON Mode)**

Ollama and Llama 3.2 support a format: 'json' parameter.25

**Prescriptive Standard:** **Do NOT use JSON mode for the commit message.**

**Rationale:**

1. **Complexity:** Enforcing JSON output ({"subject": "..."}) requires the model to spend tokens on syntax ({, ", }), increasing latency.
2. **Fragility:** 1B models are prone to syntax errors in JSON generation (e.g., unescaped quotes inside the commit message string).
3. Utility: The CLI needs a plain text string to pass to git commit \-m. Parsing JSON adds an unnecessary failure point.  
   Exception: Use JSON mode only if you are building a complex multi-step agent that needs to categorize the commit type before generating the message. For a simple generator, raw text is superior.

---

## **6\. Performance Optimization**

### **6.1 The "Warm Start" Strategy**

The goal is \<1s latency. The biggest bottleneck is loading the model into RAM.

Optimization Technique: Speculative Loading.  
Most developers run git status before git commit.

- **Hook:** If possible, alias git or use a shell integration (like zsh precmd) to send a lightweight "ping" to Ollama when the user enters a git repository.
- **The "Ping":** Send a generation request for 1 token with keep_alive: 60m.
- **Result:** By the time the user types the commit command, the model is already in memory.

### **6.2 Caching Strategies**

Git diffs are content-addressable. If the staged changes haven't changed, the commit message shouldn't need to be regenerated.

Prescriptive Standard:  
Implement a Local Content-Addressable Cache.

1. **Key Generation:** Compute a SHA-256 hash of the sanitized git diff output.
2. **Storage:** Check a local file (e.g., .git/ollama_cache.json).
3. **Hit:** If the hash exists, return the cached message immediately (0ms latency).
4. **Miss:** Generate via API, then store the result.
5. **Invalidation:** The cache is naturally invalidated because any change to the code produces a new diff hash.

This is critical for the "I forgot to add a file" workflow. The user adds the file, runs the tool, sees the message. They decide to edit a typo in the code, run it again. The tool should re-generate. If they simply run the tool again without changing code, it should be instant.

### **6.3 Context Window Management**

Llama 3.2 1B supports 128k context, but using it all is slow and memory-intensive.5

**Prescriptive Standard:**

- **Default:** Set num_ctx to **8192** (8k).
- **Logic:** This covers 99% of commits.
- **Overflow:** If the input tokens \> 8192, do not increase context (which might cause OOM on 8GB Macs). Instead, apply **Smart Truncation**.
- **Smart Truncation Algorithm:**
  1. Keep the file list (first part of diff).
  2. Keep the first 50 lines of changes for each file.
  3. Discard the rest. The model can infer the "gist" from the headers and initial changes.

---

## **7\. Error Handling and Resilience**

### **7.1 Hierarchy of Failures**

A robust CLI must distinguish between "user errors" and "system errors."

| Error Scenario    | Technical Cause            | UX Response                                                                                                                        |
| :---------------- | :------------------------- | :--------------------------------------------------------------------------------------------------------------------------------- |
| **Daemon Down**   | ECONNREFUSED (Port 11434\) | **Critique:** Don't crash. **Action:** "Ollama is not running. Starting background service..." (Spawn ollama serve).               |
| **Model Missing** | HTTP 404                   | **Critique:** User hasn't pulled the model. **Action:** "Model llama3.2:1b not found. Pulling now (1.3GB)..." (Show progress bar). |
| **Timeout**       | Request \> 10s             | **Critique:** System overloaded/hung. **Action:** "Generation timed out. Retrying with smaller context..."                         |
| **Hallucination** | Output is not Conventional | **Critique:** Model failed instructions. **Action:** Regex validation failed. Retry once, then fallback to manual input.           |

### **7.2 The "Auto-Pull" Pattern**

The user experience should be seamless. If llama3.2:1b is missing, the tool should not exit. It should offer to fix the problem.

Implementation:  
Use the ollama.pull({ model: 'llama3.2:1b', stream: true }) API to download the model inline, rendering the download progress bar in the CLI. This turns a fatal error into a setup step.26

### **7.3 Markdown Sanitization**

Even with strict prompts, Llama 3.2 will occasionally output backticks.

Prescriptive Standard:  
Apply a Sanitization Pipeline to the output string before displaying it to the user.

1. **Regex 1:** Remove wrapping code blocks: /^\`\`\`(?:json|text)?\\s\*|\\s\*\`\`\`$/gi.28
2. **Regex 2:** Remove inline backticks: /\`/g.
3. **Regex 3:** Trim whitespace.
4. **Validation:** Ensure the string starts with a valid type (feat|fix|...). If not, prepend "chore: " or warn the user.

---

## **8\. Testing Strategies**

### **8.1 Unit Testing: Mocking the Library**

Testing against a live LLM is non-deterministic and slow. Unit tests must use mocks.

Prescriptive Standard:  
Use Jest with jest.mock. Mock the ollama module to return a controlled AsyncIterator for the chat method.

JavaScript

// Example Jest Mock for Streaming  
jest.mock('ollama', () \=\> ({  
 chat: jest.fn().mockImplementation(async function\* () {  
 yield { message: { content: 'feat' } };  
 yield { message: { content: '(core)' } };  
 yield { message: { content: ': update' } };  
 }),  
}));

This ensures that your parsing, streaming logic, and UI rendering are tested deterministically.29

### **8.2 Integration Testing: The "Dry Run"**

Create a CLI flag \--dry-run or \--test-model.

- **Behavior:** Instead of sending the diff, send a static prompt "Say 'test'".
- **Goal:** Verify the full pipeline (Network \-\> Ollama \-\> Response \-\> UI) works without consuming token costs or waiting for diff processing.

### **8.3 Golden Dataset Evaluation**

To verify prompt engineering changes (e.g., upgrading to Llama 3.3), maintain a tests/fixtures/diffs directory containing 10-20 sample diffs.

- **Script:** Run the generator against all fixtures.
- **Check:** Verify that the output adheres to the Conventional Commits regex.
- **Metric:** "Pass Rate" (Percentage of valid outputs).

---

## **9\. Comprehensive Implementation Checklist**

This checklist synthesizes the style guide into actionable steps for the development team.

- \[ \] **Dependency:** Install ollama (not fetch).
- \[ \] **Config:** Default model llama3.2:1b. Default host 127.0.0.1:11434.
- \[ \] **Client:** Implement OllamaService singleton with keep_alive: 60m.
- \[ \] **Prompt:** Use Llama 3 chat format with System Prompt \+ 2 Few-Shot Examples.
- \[ \] **Context:** Cap at 8192 tokens. Truncate diffs intelligently (files \> content).
- \[ \] **Performance:** Implement git diff caching (SHA-256).
- \[ \] **Resilience:** Handle ECONNREFUSED (Auto-start) and 404 (Auto-pull).
- \[ \] **Sanitization:** Strip markdown blocks and backticks.
- \[ \] **Testing:** Mock streaming responses in Jest; use golden datasets for prompts.

---

## **10\. Conclusion**

By adhering to this architectural style guide, the resulting Git Commit Message Generator will transcend the status of a simple script to become a robust developer tool. The use of llama3.2:1b on M1/M2 hardware, when orchestrated with the specific patterns of pre-loading, connection persistence, and few-shot prompting, enables a workflow where AI assistance feels instantaneous and native. This guide ensures that the complexity of local inference is completely abstracted, leaving the developer with a simple, powerful command that "just works."

The key to success is viewing the CLI not as a client of an API, but as a manager of a local intelligence resource. Every decision—from the library choice to the keep-alive parameter—serves the singular goal of reducing friction in the tight loop of software development.

---

### **Table 1: Library Comparison Matrix**

| Feature            | ollama (Official Lib)       | Native fetch          | Verdict                              |
| :----------------- | :-------------------------- | :-------------------- | :----------------------------------- |
| **Package Size**   | \~17KB (min+gzip)           | 0KB (Built-in)        | ollama overhead is negligible.       |
| **Streaming**      | Native Async Iterator       | Manual Buffer Parsing | ollama wins on developer experience. |
| **Type Support**   | Full TypeScript Definitions | Manual Interface Defs | ollama ensures API compliance.       |
| **Error Handling** | Typed Exceptions            | Status Code Checks    | ollama simplifies logic.             |

### **Table 2: Quantization & Performance (M1 Mac)**

| Model           | Quantization       | Size      | RAM Usage | Load Time (Cold) | Inference Speed |
| :-------------- | :----------------- | :-------- | :-------- | :--------------- | :-------------- |
| **llama3.2:1b** | **Q8_0 (Default)** | **1.3GB** | **\~2GB** | **\~0.8s**       | **\~120 tok/s** |
| llama3.2:1b     | Q4_K_M             | 800MB     | \~1.2GB   | \~0.5s           | \~150 tok/s     |
| llama3.2:3b     | Q4_K_M             | 2.0GB     | \~2.5GB   | \~1.5s           | \~80 tok/s      |

Data synthesized from.5 The Q8_0 (Default) is recommended for best instruction adherence at 1B size.

### **Citations**

3 \- Performance perception of API vs CLI.  
1 \- Ollama vs vLLM and system resource management.  
5 \- Llama 3.2 1B model specifications and context.  
11 \- API keep-alive parameters and pre-loading.  
8 \- Ollama JavaScript library documentation.  
14 \- Llama 3.2 vision and edge capabilities.  
15 \- Llama 3 instruct prompt formatting.  
18 \- Prompt engineering for 1B models.  
29 \- Jest mocking strategies for node modules.

#### **Works cited**

1. Performance vs Practicality: A Comparison of vLLM and Ollama | by Robert McDermott, accessed November 26, 2025, [https://robert-mcdermott.medium.com/performance-vs-practicality-a-comparison-of-vllm-and-ollama-104acad250fd](https://robert-mcdermott.medium.com/performance-vs-practicality-a-comparison-of-vllm-and-ollama-104acad250fd)
2. How To Use Ollama: Set Up and Run a Local LLM With Llama 3 \- The New Stack, accessed November 26, 2025, [https://thenewstack.io/how-to-set-up-and-run-a-local-llm-with-ollama-and-llama-2/](https://thenewstack.io/how-to-set-up-and-run-a-local-llm-with-ollama-and-llama-2/)
3. Can the Ollama API be slower than the CLI \- YouTube, accessed November 26, 2025, [https://www.youtube.com/watch?v=jOmfpu41H5w](https://www.youtube.com/watch?v=jOmfpu41H5w)
4. Ollama performs \*much\* slower via API than CLI on M1 Mac · Issue \#7081 \- GitHub, accessed November 26, 2025, [https://github.com/ollama/ollama/issues/7081](https://github.com/ollama/ollama/issues/7081)
5. Llama 3.2 | Model Cards and Prompt formats, accessed November 26, 2025, [https://www.llama.com/docs/model-cards-and-prompt-formats/llama3_2/](https://www.llama.com/docs/model-cards-and-prompt-formats/llama3_2/)
6. LLama 3.2 1B and 3B: small but mighty\! | by Jeremy K | The Pythoneers \- Medium, accessed November 26, 2025, [https://medium.com/pythoneers/llama-3-2-1b-and-3b-small-but-mighty-23648ca7a431](https://medium.com/pythoneers/llama-3-2-1b-and-3b-small-but-mighty-23648ca7a431)
7. Possible to show currently loaded model(s) via API or Client? : r/ollama \- Reddit, accessed November 26, 2025, [https://www.reddit.com/r/ollama/comments/1cex92f/possible_to_show_currently_loaded_models_via_api/](https://www.reddit.com/r/ollama/comments/1cex92f/possible_to_show_currently_loaded_models_via_api/)
8. ollama \- NPM, accessed November 26, 2025, [https://www.npmjs.com/package/ollama](https://www.npmjs.com/package/ollama)
9. ai-sdk-ollama \- NPM, accessed November 26, 2025, [https://www.npmjs.com/package/ai-sdk-ollama](https://www.npmjs.com/package/ai-sdk-ollama)
10. Errors \- Ollama's documentation, accessed November 26, 2025, [https://docs.ollama.com/api/errors](https://docs.ollama.com/api/errors)
11. FAQ \- Ollama, accessed November 26, 2025, [https://docs.ollama.com/faq](https://docs.ollama.com/faq)
12. Ollama model keep in memory and prevent unloading between requests (keep_alive?), accessed November 26, 2025, [https://stackoverflow.com/questions/79526074/ollama-model-keep-in-memory-and-prevent-unloading-between-requests-keep-alive](https://stackoverflow.com/questions/79526074/ollama-model-keep-in-memory-and-prevent-unloading-between-requests-keep-alive)
13. Question: How to keep ollama from unloading model out of memory \- Reddit, accessed November 26, 2025, [https://www.reddit.com/r/ollama/comments/1fh040f/question_how_to_keep_ollama_from_unloading_model/](https://www.reddit.com/r/ollama/comments/1fh040f/question_how_to_keep_ollama_from_unloading_model/)
14. Llama 3.2: Revolutionizing edge AI and vision with open, customizable models \- AI at Meta, accessed November 26, 2025, [https://ai.meta.com/blog/llama-3-2-connect-2024-vision-edge-mobile-devices/](https://ai.meta.com/blog/llama-3-2-connect-2024-vision-edge-mobile-devices/)
15. Llama 3.1 | Model Cards and Prompt formats, accessed November 26, 2025, [https://www.llama.com/docs/model-cards-and-prompt-formats/llama3_1/](https://www.llama.com/docs/model-cards-and-prompt-formats/llama3_1/)
16. Best prompting practices for using Meta Llama 3 with Amazon SageMaker JumpStart \- AWS, accessed November 26, 2025, [https://aws.amazon.com/blogs/machine-learning/best-prompting-practices-for-using-meta-llama-3-with-amazon-sagemaker-jumpstart/](https://aws.amazon.com/blogs/machine-learning/best-prompting-practices-for-using-meta-llama-3-with-amazon-sagemaker-jumpstart/)
17. I wrote a little script to automate commit messages : r/LocalLLaMA \- Reddit, accessed November 26, 2025, [https://www.reddit.com/r/LocalLLaMA/comments/1l40835/i_wrote_a_little_script_to_automate_commit/](https://www.reddit.com/r/LocalLLaMA/comments/1l40835/i_wrote_a_little_script_to_automate_commit/)
18. Prompt Engineering Cheatsheet (17 Techniques for 1B LLMs) \- GitHub, accessed November 26, 2025, [https://github.com/FareedKhan-dev/prompt-engineering-cheatsheet](https://github.com/FareedKhan-dev/prompt-engineering-cheatsheet)
19. The Few Shot Prompting Guide \- PromptHub, accessed November 26, 2025, [https://www.prompthub.us/blog/the-few-shot-prompting-guide](https://www.prompthub.us/blog/the-few-shot-prompting-guide)
20. What is few shot prompting? \- IBM, accessed November 26, 2025, [https://www.ibm.com/think/topics/few-shot-prompting](https://www.ibm.com/think/topics/few-shot-prompting)
21. An Empirical Study on Commit Message Generation using LLMs via In-Context Learning, accessed November 26, 2025, [https://arxiv.org/html/2502.18904v1](https://arxiv.org/html/2502.18904v1)
22. Context length \- Ollama's documentation, accessed November 26, 2025, [https://docs.ollama.com/context-length](https://docs.ollama.com/context-length)
23. Supercharge Code Workflows with Gemini CLI \+ JSON Prompts Parameters \- Medium, accessed November 26, 2025, [https://medium.com/@and.gpch.dev/supercharge-code-workflows-with-gemini-cli-json-prompts-parameters-5ce9deaf15b2](https://medium.com/@and.gpch.dev/supercharge-code-workflows-with-gemini-cli-json-prompts-parameters-5ce9deaf15b2)
24. Let's create a Node CLI for generating files from templates\! \- DEV Community, accessed November 26, 2025, [https://dev.to/dusan100janovic/lets-create-a-node-cli-for-generating-files-from-templates-4m05](https://dev.to/dusan100janovic/lets-create-a-node-cli-for-generating-files-from-templates-4m05)
25. ollama/docs/api.md at main · ollama/ollama \- GitHub, accessed November 26, 2025, [https://github.com/ollama/ollama/blob/main/docs/api.md](https://github.com/ollama/ollama/blob/main/docs/api.md)
26. Pull a model \- Ollama's documentation, accessed November 26, 2025, [https://docs.ollama.com/api/pull](https://docs.ollama.com/api/pull)
27. Ollama in Docker pulls models via interactive shell but not via RUN command in the dockerfile \- Stack Overflow, accessed November 26, 2025, [https://stackoverflow.com/questions/78232178/ollama-in-docker-pulls-models-via-interactive-shell-but-not-via-run-command-in-t](https://stackoverflow.com/questions/78232178/ollama-in-docker-pulls-models-via-interactive-shell-but-not-via-run-command-in-t)
28. How to remove markdown syntax and output only plain text in Flutter \- Stack Overflow, accessed November 26, 2025, [https://stackoverflow.com/questions/74977041/how-to-remove-markdown-syntax-and-output-only-plain-text-in-flutter](https://stackoverflow.com/questions/74977041/how-to-remove-markdown-syntax-and-output-only-plain-text-in-flutter)
29. Mocking a node module in a jest test \- Stack Overflow, accessed November 26, 2025, [https://stackoverflow.com/questions/59831697/mocking-a-node-module-in-a-jest-test](https://stackoverflow.com/questions/59831697/mocking-a-node-module-in-a-jest-test)
30. Mock Functions \- Jest, accessed November 26, 2025, [https://jestjs.io/docs/mock-function-api](https://jestjs.io/docs/mock-function-api)
