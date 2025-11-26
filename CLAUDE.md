## Code Standards

**Use context7 MCP** for _node.js_ best practices and styleguides.

**Project-Specific Style Guides**:

[CRITICAL] Synthesize all of these each session

- [Style Guide Index](./dev/styleguides/index.md) - Overview and usage guidelines

## Communication

- **Communicate with high signal, low noise.**
- **Brevity is critical**—keep responses concise.
- If extensive information is necessary, provide **high-level, itemized summaries** for easy review.
- When responding at length, **always conclude with a summary**, as this section is most likely to be read by the human developer.

## Behavioral Guidelines

## 🔄 Workflow Patterns

_How to approach and sequence work_

These patterns prevent major workflow failures and ensure consistent, reliable development practices.

### Iterative & Local Development

**CRITICAL:** Work iteratively and locally. Complete all changes for a single component, library, or domain—including updating adjacent files and tests—before moving to the next area. Work **directory → domain → library** to preserve context awareness.

### No Batching

**STRICTLY FORBIDDEN:** Do not batch changes or test fixes across unrelated parts of the codebase. Adjacent files must be adjusted before moving on. Complete each unit of work entirely before proceeding to the next.

### Test-Adjacent Development

**MANDATORY:** Tests are not an afterthought. As you modify or create implementation code, you must immediately update or create the corresponding tests. Testing happens concurrently with development, not as a separate phase. Integrate builds and test validation as part of your process, not just at the end.

### Iterative Inquiry

**REQUIRED:** Gather information iteratively to ensure clarity and prevent incorrect assumptions.

- **One Question at a Time** - Do not ask multiple distinct questions in a single response
- **Build Gradual Understanding** - Frame complex problems question by question, building shared understanding before proceeding
- **Seek Answers Before Acting** - Seek all necessary answers from the user before making assumptions or implementing solutions based on incomplete information

### Verify First

Always verify information before presenting it. Do not make assumptions or speculate without clear evidence.

---

## 🎯 Coding Philosophy

_How to write and modify code_

These principles guide how code should be written and modified to maintain integrity and stability.

### YAGNI (You Ain't Gonna Need It)

Do not add functionality or complexity that has not been explicitly requested. Generate the simplest possible code that satisfies the requirements. Avoid building features "just in case" they might be needed later.

### KISS (Keep It Simple, Stupid)

Always seek the simplest possible solution that correctly solves the problem. Complexity is the primary source of bugs and maintenance difficulties. Simple systems are easier to build, maintain, debug, and extend.

### Self-Documenting Code

Write code that is self-explanatory. Do not add comments that merely describe what the code does—the code should speak for itself. Comments should explain _why_ something is done, not _what_ is being done, and only when the reasoning isn't obvious from the code itself.

### Preserve Existing Code

Don't remove unrelated code or functionalities. Pay attention to preserving existing structures.

### No Inventions

Don't invent changes other than what's explicitly requested.

---

## 💬 Communication Style

_How to interact and communicate_

These guidelines improve communication clarity and reduce noise, making collaboration more efficient and focused.

### No Apologies

Never use apologies in responses.

### No Excessive Validation

Don't say "You're absolutely right" or provide over-the-top validation of user statements. Be objective and factual.

### No Unnecessary Updates

Don't suggest updates or changes to files when there are no actual modifications needed or are unrelated to the task at hand.

### Provide Real File Links

Always provide links to the real files when communicating to the user.
