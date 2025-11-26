# Research Prompt: Developer Micro-Task Inventory for Local SLM Applications

## Research Objective

Identify specific, bounded, high-frequency micro-tasks in a software developer's workday that fit the capabilities and constraints of Small Language Models (SLMs) running locally.

## Context: SLM Constraints (Hard Rules)

Based on prior research, local SLMs have these characteristics:

- **Small context window**: Can't process large amounts of information at once
- **Stateless with frequent resets**: Limited ability to maintain long-running context
- **Pattern matching, not deep reasoning**: Excel at bounded transformations, not complex analysis
- **Speed over perfection**: 80% accuracy in 0.5 seconds beats 100% in 5 seconds
- **"Good Enough" principle**: For high-frequency tasks, instant + good enough > slow + perfect

## The "Fit Pattern" (Reference Example)

**Screenshot Autopilot** fits perfectly because it:

- Bounded: A manageable batch of screenshots (e.g., 10-20) within context limits
- Clear transformation: Images → intelligent filenames
- Instant: Local processing, immediate result
- High-frequency: Developers take many screenshots daily
- Tedious: Manual naming is annoying
- Privacy-sensitive: Screenshots may contain sensitive code

**Important:** "Bounded" doesn't mean "one item only" - it means a manageable scope that fits within SLM context limits. An SLM can process multiple items in a batch as long as the total context doesn't exceed its window.

## Research Questions

### Primary Question

What are the specific, bounded, repetitive tasks that developers perform frequently that:

1. Have clear input/output boundaries (like batch of screenshots → filenames, or set of files → organized structure)
2. Can be completed within SLM context limits (may involve multiple items, but total context fits in window)
3. Are tedious/annoying enough to want automation
4. Don't require deep reasoning or large context synthesis
5. Could benefit from semantic understanding (not just regex/scripting)
6. May involve sensitive data (benefit from local-only processing)

**Note:** These can be batch operations (processing 10-20 items at once) as long as the total context stays within limits. The constraint is not "one item per session" but rather "manageable scope within context window."

### Discovery Framework

For each micro-task category, identify:

1. **File & Asset Management Micro-Tasks**
   - What small file operations do developers repeat constantly?
   - What naming, organizing, or formatting tasks are tedious?
   - What transformations between formats happen frequently?

2. **Communication & Documentation Micro-Tasks**
   - What tiny pieces of writing do developers produce repeatedly?
   - What status updates, messages, or comments are formulaic but require slight customization?
   - What explanations or summaries are written over and over?

3. **Code Artifact Micro-Tasks**
   - What small code transformations or generations happen frequently?
   - What boilerplate or snippets need slight customization each time?
   - What formatting or style adjustments are repetitive?

4. **Context Switching Micro-Tasks**
   - What small lookups or retrievals happen when switching between tasks?
   - What "where was I?" or "what was this?" questions recur?
   - What small orientation or reminder needs happen frequently?

5. **Developer Tooling Micro-Tasks**
   - What git operations are tedious to construct?
   - What CLI commands need slight variations each time?
   - What configuration or setup steps are repetitive with small changes?

### Output Requirements

For each identified micro-task, provide:

- **Task name**: Clear, specific description
- **Frequency**: How often per day/week
- **Current friction**: What makes it tedious/annoying
- **Input/Output**: What goes in, what comes out
- **Context needs**: How much context required (small/medium/large)
- **Privacy sensitivity**: Does it involve sensitive data?
- **SLM fit score**: Low/Medium/High based on constraints above
- **Novel factor**: Is this already well-solved or unexplored territory?

## Success Criteria

The research should produce 20-30 specific micro-tasks that:

- Haven't been targeted by existing developer tools
- Genuinely fit SLM constraints (not requiring LLM capabilities)
- Are high-frequency enough to deliver daily value
- Could form the basis for a focused, deliverable MVP tool

Focus on discovering the "unsexy" micro-tasks that are too small for most tools to bother with, but annoying enough that developers would love automation.
