# E2E Ticket Refinement

## ⚠️ CRITICAL EXECUTION NOTICE ⚠️

**THIS IS AN EXECUTABLE WORKFLOW - NOT REFERENCE MATERIAL**

When this command is invoked:

1. **INPUT REQUIRED** - Tagged file (.doc/.md/text) OR pasted ticket content
2. **SMART EXTRACTION REQUIRED** - Parse any format, ignore HTML markup noise if present
3. **LIGHT ELICITATION ONLY** - Section-by-section confirmation with 1-4 options
4. **CREATE REFINED TICKET** - Generate clean markdown at `dev/ticket/{TICKET-ID}-{kebab-case-title}.md`

**VIOLATION INDICATOR:** If you proceed without any input (tagged file OR pasted content), you have violated this workflow.

---

## Workflow Steps

### Step 1: Validate Input

**Check for reference input (MANDATORY - at least one of):**

- Tagged file: `.doc` (HTML export), `.md`, or plain text file
- Or direct text input in chat

**If no input provided → STOP and show usage:**

```
❌ Please provide ticket information to refine.

Usage:
  /refine-e2e-ticket @path/to/ticket.doc
  OR
  /refine-e2e-ticket (then paste ticket content)

Example: /refine-e2e-ticket @staging/Example tickets TO REFINE/IDWOJ-4099.doc
```

### Step 2: Extract Ticket Information

**Progress feedback:**

```
⏳ Extracting metadata...
```

**Read template first:**

- Load `.codegen/templates/E2E-ticket.yaml` to understand required fields

**Smart extraction from any format:**

**If HTML** (e.g., .doc export):

- Ignore CSS styles, avatarUrls, HTML boilerplate, metadata tables
- Focus on content in `<td id="descriptionArea">` or similar content areas

**If Markdown or plain text:**

- Parse naturally based on structure

**Required Extraction Logic:**

**ticket_id:**

- Look for patterns: `[IDWOJ-XXXX]`, `IDWOJ-XXXX` in title, filename
- Fallback: derive from filename

**title (CRITICAL):**

- Source: `<title>` tag or first heading
- Parse format: `[#TICKET] [ENV][APP] Flow Description`
- Extract components:
  - `env_tags`: `[E2E]`, `[Ephemeral]`, etc.
  - `app_tags`: `[Retail]`, `[Business]`, `[DA]`, etc.
  - `flow_description`: The human-readable description
- Validate format and flag if malformed
- Examples:
  - Input: `[#IDWOJ-4079] [E2E][Retail][Business] change password`
  - Output: env=`[E2E]`, app=`[Retail][Business]`, flow=`change password`

**Auto-suggestions for title parsing:**

- If "System E2E" or "system-e2e" mentioned → suggest `[E2E]`
- If "Retail" mentioned → suggest `[Retail]`
- If "Digital Assist" or "Employee" mentioned → suggest `[DA]`
- If "Business" mentioned → suggest `[Business]`

**epic_link:**

- Find parent ticket links
- Look for "Epic Link" or "Parent" sections

**coverage_link:**

- Extract Google Sheets links
- Look for: `https://docs.google.com/spreadsheets/d/...`
- Common default: `https://docs.google.com/spreadsheets/d/1RLwWgkp0l2qh4Xvm63_aueR8_s0isDA1qzcl8ofbnZE/edit?gid=1404973816#gid=1404973816`

**coverage_table:**

- Parse coverage tables (if present)
- Look for tables with: Spreadsheet Page, Application Support, SubFeatureId, Journey, Feature, Sub feature

**existing_feature_gherkin:**

- Extract from preformatted blocks or code fences
- Look for sections titled "Existing Feature" or "Existing Features"
- Extract Gherkin content between `gherkin` or `<pre>` tags

**journey:**

- Extract from coverage table or metadata
- Common values: "User self-service", "Authentication", "Self Enrollment"

**subfeature_id:**

- Extract from coverage table
- Format: `RB.X.X.X` or similar

### Step 3: Library Context Investigation

**MANDATORY: After extraction, immediately prompt user for library path:**

```
Can you point me at a relevant journey library for context?

Example: libs/login-security/

(This helps me provide journey-specific recommendations for setup, teardown, and input data)
```

**Wait for user to provide path like `libs/login-security/`**

**Then quietly investigate journey implementation (prioritize actual code over E2E tests):**

1. **Journey metadata:** Read `catalog-info.yaml` for name, description, type
2. **Journey configuration:** Check `internal/util/src/lib/journey-configuration/` for requirements
3. **Journey structure:** Scan route definitions and component structure to understand flow
4. **Documentation:** Read `README.md` and `docs/markdown/` for capabilities overview
5. **Supplementary:** Glance at existing E2E feature files for style hints (if present)

**Auto-detect journey tag** from library path:

- `libs/{journey-name}/` → `@{journey-name}`

**Acknowledge:**

```
✅ Library context loaded: {Journey Name} (@{journey-tag})
```

**Store insights for later recommendation generation:**

- Setup/teardown suggestions
- Hooks suggestions
- Input data suggestions

### Step 4: Section-by-Section Confirmation

**Progress feedback:**

```
✅ Extracted metadata
```

**Light validation (non-blocking warnings):**

- **Ticket ID format check:** If doesn't match `[A-Z]+-[0-9]+`, show warning:
  ```
  ⚠️ Ticket ID format looks unusual. Expected format: IDWOJ-1234. Continue anyway? (Y/n)
  ```

Display extracted info:

```
✅ Extracted from ticket:

**Ticket ID:** {extracted_id}
**Title:** {extracted_title}
  Environment: {env_tags}
  Application: {app_tags}
  Flow: {flow_description}
**Epic Link:** {extracted_epic or "N/A"}
**Journey:** {extracted_journey or "N/A"}
**SubFeatureId:** {extracted_subfeature_id or "N/A"}

**Coverage Link:** {coverage_link or "Not found"}

**Existing Feature Found:** {Yes/No - show line count if yes}

---
Does this look accurate?

1. Yes - continue to feature refinement
2. Edit title (env/app tags or flow name)
3. Edit other fields
4. Just type your correction/question

Select 1-4 or provide feedback:
```

### Step 5: Process User Choice

**Option 1: Proceed to feature refinement** → Continue to Step 6

**Option 2: Allow inline field editing**

- Ask: "What would you like to change about the title?"
- Parse feedback, adjust title components
- Re-present confirmation

**Option 3: Edit other fields**

- Ask: "Which field would you like to edit?"
- Allow editing
- Re-present confirmation

**Option 4: Parse feedback**

- Interpret natural language feedback
- Adjust extracted information
- Re-present confirmation

---

## Feature Refinement Workflow

### Step 6: Analyze Existing Feature (if provided)

**If no existing feature was extracted, offer options:**

```
ℹ️ No existing feature file found in ticket.

Would you like to:
1. Provide an existing verbose feature file to refine
2. Let me draft from ticket description (recommended)
3. Write the reduced feature yourself

Select 1-3:
```

**Option 1:** Ask user to tag/paste feature file, then proceed with analysis
**Option 2:** Skip to Step 7 with ticket description as basis (recommended)
**Option 3:** Skip to Step 9, only assist with metadata sections

**If existing feature Gherkin was extracted:**

1. Extract Feature title
2. Identify Background section (will be simplified or removed)
3. Parse Scenario(s)
4. **Check for multiple scenarios:**
   - If 2+ scenarios found, ask which to refine:

   ```
   Found {count} scenarios in existing feature:

   1. Scenario: {scenario_1_title}
   2. Scenario: {scenario_2_title}
   3. Scenario: {scenario_3_title}

   How should I handle this?

   1. Refine all scenarios (one feature with multiple scenarios)
   2. Pick one scenario to focus on (which one?)
   3. Let me suggest the most important one

   Select 1-3:
   ```

5. Analyze steps for:
   - Navigation sequences → collapse
   - Form filling → abstract
   - Assertions → keep critical ones
   - Multiple similar steps → consolidate

**Identify applicable pattern based on journey and ticket description:**

- **Pattern A: User Self-Service Journey** - Login simplified to Background, navigation collapsed, abstract actions
- **Pattern B: Admin/CSR Journey** - CSR perspective, customer-facing verification separate
- **Pattern C: Authentication Journey** - Minimal Background, focus on auth flow
- **Pattern D: Self-Enrollment Journey** - Multi-page wizard, page transitions, abstracted data entry

### Step 7: Generate Reduced Feature Suggestion

**Progress feedback:**

```
✅ Library context loaded
⏳ Generating reduced feature...
```

**Use sources in priority order:**

1. **User's ticket/description** - WHAT they're testing (the flow they defined)
2. **Golden patterns** - HOW to write it declaratively
3. **Journey library insights** - To inform recommendations only (NOT to dictate steps)

**Light Gherkin validation (non-blocking):**

After generating feature, check:

- Feature keyword present
- Scenario keyword present
- Steps start with Given/When/Then/And/But
- Journey tag present
- Environment tag present

If issues found, show warning:

```
⚠️ Gherkin syntax check:
- Missing journey tag (will add @{journey-tag})
- Missing environment tag (will add @system-e2e)

I'll include these in the feature. Review before finalizing.
```

**Present feature verbally:**

````markdown
**Reduced Feature:**

Based on your ticket description and the {pattern type} pattern:

```gherkin
Feature: {Feature Title}

  @{journey-tag} @system-e2e
  Scenario: {Scenario Title}
    {Background or Given steps}
    When {high-level action}
    And {high-level action}
    Then {assertion}
    And {final verification}
```

**Changes Made:**

- Collapsed {N} navigation steps into "{step}"
- Abstracted form inputs (username, password)
- Removed {N} redundant field visibility checks
- Removed environment setup tables
- Simplified Background section
- Changed tags: {old_tags} → @{journey-tag} @system-e2e
- Reduced from {N} lines to {M} lines

**What I kept:**

- Business logic flow
- Critical page transitions
- Success notification
- Final verification

---

I've also synthesized journey-informed recommendations for Setup, Teardown, Input Data, Hooks, and Tags based on the {Journey Name} journey. These will be presented section-by-section when we get to them.

---

This is ready for conversational editing. You can:

1. Accept and continue to remaining sections
2. Ask me to add more detail to specific steps
3. Ask me to remove or consolidate steps
4. Point to a specific line/step to modify
5. Just tell me what changes you want

Type your choice or feedback:
````

### Step 8: Conversational Editing (Iterative Refinement)

User can provide feedback in natural language, and agent adjusts the feature accordingly.

**Example Interactions:**

**User says**: "Add a step that shows the confirmation modal before the final action"
**Agent does**: Inserts modal display step, re-presents feature

**User says**: "Remove the step about clicking the button, just go straight to entering password"
**Agent does**: Consolidates steps, re-presents

**User says**: "Change line 5 - make it more specific about which page"
**Agent does**: Asks for clarification or suggests options, updates line 5

**User says**: "Make it more concise"
**Agent does**: Identifies and removes 1-2 non-critical steps, re-presents

**User says**: "Add more detail about the two-factor selection"
**Agent does**: Adds intermediate steps for that section, re-presents

**User says**: "That looks good now" or selects option 1
**Agent does**: Confirms and moves to Step 9 (remaining sections)

**Pattern:**

1. User provides feedback (numbered choice OR natural language)
2. Agent interprets and applies changes
3. Agent re-presents updated feature with explanation of changes
4. Repeat until user confirms (option 1 or says "looks good")

**Handle ambiguity:** If unclear, ask specific questions rather than guessing.

### Step 9: Remaining Sections Elicitation

**Progress feedback:**

```
✅ Feature refined
⏳ Eliciting remaining sections...
```

**CRITICAL: Present sections ONE AT A TIME. Wait for user confirmation/response before proceeding to the next section.**

After feature is confirmed, elicit remaining sections **sequentially** (one section → wait for response → next section) **in this order**:

**1. Tagging Section (FIRST):**

```
**Gherkin Tags:**

I've applied:
- Journey: `@{journey-tag}` - Auto-detected from library path
- Environment: `@system-e2e` - Recommended default for full environment testing

{If applicable based on title/context:}
Consider adding:
- `@{optional-tag}` - {reasoning for why this might be useful}

Do you need any additional optional tags? (Type tag names or write Continue):
```

**2. Setup and Teardown:**

**Setup** = Actions to prepare test data (usually in `beforeEach`) (e.g., ensure user is unlocked before testing lock)

**Teardown** = Actions to restore state after test (usually in `afterEach`) (e.g., unlock user after lock test, restore password after password change)

**Smart default logic:**

- User self-service journey → suggest login setup
- State modification (password/username change) → suggest restoration teardown
- Read-only operations → suggest no teardown needed
- Admin/CSR journey → suggest navigation setup

```
**Setup and Teardown:**

Based on the {Journey Name} journey and your test flow, I suggest:

**Setup:**
{smart suggestion based on journey type and actions with reasoning}

**Teardown:**
{smart suggestion based on state changes with reasoning}

Confirm or edit:
1. Looks good
2. Edit setup
3. Edit teardown
4. No setup/teardown needed

Select 1-4 or provide feedback:
```

**Handle "I don't know" responses:**

- If user says "I don't know" or "not sure" → offer to skip section or use default
- Example: "No problem! I'll leave this section empty. You can add it later if needed."

**3. Input Data:**

**Input Data** = Data needed for the test, including:

- **TestData** = Scenario-specific values entered during the test (form values, comments, test passwords) - defined in `TestData` type in fixture model
- **UserType/TargetUserType** = Config values that determine which users from config are used (`userType` = logged-in user, `targetUserType` = target user). Document when set to non-default values or relevant to test scenario. **User credentials (username/password) come from these config entries:** `config.users[userType]` and `config.users[targetUserType]`.
- **UserData** = Target user identity information (userId, username, legalEntityId) - derived from `targetUserType` config. Document when `targetUserType` is set (always present when there's a target user).

{Check lib fixture model for TestData type to see what fields are defined}
{Check fixture for userType/targetUserType values}
{Look at the test scenario to identify what values need to be entered/used}

```
**Input Data:**

Based on the {Journey Name} journey fixture model and your test scenario:

**TestData fields needed:**
{List fields from TestData type that are relevant to this scenario}

**UserType/TargetUserType:**
{Document userType and targetUserType values - e.g., "userType: 'userManagement' (admin user - credentials from config.users.userManagement)", "targetUserType: 'unlockUserTarget' (locked user account - credentials from config.users.unlockUserTarget)"}

**UserData:**
{Document when targetUserType is set - e.g., "Target user identity (userId, username, legalEntityId) from unlockUserTarget config"}

Example:
- TestData: `statusChangeComment` - Comment entered when requesting unlock
- TestData: `originalPassword` - Current password for password change test
- TestData: `testPassword` - New password for password change test
- UserType: `userManagement` (admin user for business app - **credentials from `config.users.userManagement`**)
- TargetUserType: `unlockUserTarget` (locked user account - **credentials from `config.users.unlockUserTarget`**)
- UserData: Target user identity (userId, username, legalEntityId) from unlockUserTarget config

Anything missing?
1. Looks complete
2. Add more fields (specify)
3. Just type additions

Select 1-3:
```

**4. Hooks:**

**Hooks** = Reusable helper functions provided by fixtures. At the library level, hooks are no-op placeholders (e.g. `Promise.resolve()`). At the app level, they're implemented with actual functionality (implementation details are decided at app level).

{Check if hooks already exist in lib fixture model - if yes, note they exist but still list them}
{If custom steps need helper functions that don't exist, indicate NEW hook needed}

```
**Hooks:**

{Check lib fixture model for existing hooks}

**Existing hooks in lib:**
{List hooks that already exist in the fixture model, if any}

**Hooks needed for this test:**
{List hooks needed - mark with [EXISTS] or [NEW]}

Example:
- `lockUser()` [EXISTS]
- `unlockUser()` [EXISTS]
- `verifyPasswordResetAvailable()` [NEW]

Do you need to document any hooks?
1. No - all steps use standard page object methods
2. Yes - let me add hook documentation
3. Just type the hook names/functions

Select 1-3:
```

**5. Possible Issues:**

```
**Possible Issues:**

Any known issues or outstanding questions?

1. None
2. Type issues/questions

Select 1-2:
```

### Step 10: Generate Final Output

**Progress feedback:**

```
✅ All sections complete
⏳ Writing file...
```

**Process template with all confirmed data:**

1. Read `.codegen/templates/E2E-ticket.yaml`
2. For each section in template:
   - Substitute all `{{variables}}` with extracted/confirmed values
   - If optional field is empty, handle according to template logic
   - Concatenate section content into complete markdown
3. Generate final markdown document

**File system safety:**

1. **Ensure directory exists:**
   - Check if `dev/ticket/` directory exists
   - If not, create it automatically
   - Log: "Created directory: dev/ticket/"

2. **Check for existing file:**
   - Filename: `{TICKET-ID}-{kebab-case-title}.md`
   - Full path: `dev/ticket/{filename}`
   - If file exists, prompt:

     ```
     ⚠️ File exists: dev/ticket/{TICKET-ID}-{kebab-case-title}.md

     Overwrite? (Y/n):
     ```

   - If user says "n" or "no" → abort and notify
   - If user says "y" or "yes" or presses Enter → proceed

3. **Write file:**
   - Write markdown to `dev/ticket/{filename}`

**Summary report:**

```
✅ Refined E2E Ticket Created

📄 File: dev/ticket/{TICKET-ID}-{kebab-case-title}.md

📊 Summary:
- Ticket: {TICKET-ID}
- Title: {title}
- Journey: @{journey-tag}
- Environment: @{environment-tag}
- Scenarios: {count}

{Optional: Refinement summary if existing feature was refined}
📊 Refinement Summary:
Original: {N} lines, {M} steps
Refined: {X} lines, {Y} steps

Removed: {count} redundant steps
Kept: Core business logic + critical assertions

---

Next: Review and adjust the ticket as needed
```

**Optional: Journey consistency check:**

After successful creation, offer optional verification:

```
Would you like me to verify alignment with journey patterns?
1. Yes - quick consistency check
2. No - I'll review manually
3. Show me what to verify

Select 1-3:
```

**If option 1 selected, verify:**

- Tags match journey metadata (catalog-info.yaml)
- Input data aligns with journey configuration requirements
- Setup/teardown recommendations appropriate for journey type
- **Note:** Don't check if steps match journey pages (user may be testing new flow)

**Output format:**

```
✅ Consistency Check:

- Tags: ✅ @{journey-tag} matches library
- Environment: ✅ @{environment-tag} (standard default)
- Input data: ✅ Aligns with journey configuration
- Setup: ✅ Appropriate ({reasoning})
- Teardown: ✅ Appropriate ({reasoning})

All checks passed! Ticket is consistent with journey patterns.
```

**If option 3 selected, show checklist:**

```
📋 Manual Verification Checklist:

1. Tags match journey library name
2. Environment tag is appropriate (@system-e2e, @ephemeral, or @mocks)
3. Input data aligns with journey configuration
4. Setup/teardown appropriate for journey type
5. Gherkin steps are declarative and high-level
6. Business logic flow is preserved
7. Critical assertions are present

Review these points in the generated ticket.
```

---

## Feature Refinement Principles

### What to Remove

**Implementation Details:**

- BEFORE: `When user enters 'Pass1234' into the 'Password' field with id 'password-input'`
- AFTER: `When the user enters their password`

**UI-Specific Language:**

- BEFORE: `Then the login form is displayed with the 'Username or email' field`
- AFTER: `Then the Login page is displayed`

**Verbose Navigation:**

- BEFORE: `When the user clicks on 'Self Service' from navigation bar / And the user selects 'My Profile' / When the user clicks on the 'Login & Security' tab`
- AFTER: `When the user navigates to the Login & security page`

**Redundant Assertions:**

- BEFORE: `Then 'Terms and Conditions' screen is displayed / And 'Accept' and 'Decline' buttons are displayed on the screen`
- AFTER: `Then the 'Terms and Conditions' page is displayed`

**Background Sections:**

- Remove verbose login flows
- Replace with: `Given the user is logged in` or `Given the CSR user has navigated to the {Page} for the bank customer`

**Test Data Tables:**

- Remove environment-specific data tables
- Keep test data abstract

**Intermediate State Checks (Often Redundant):**

- BEFORE:
  ```
  When the user clicks the 'Change' button
  Then the password change modal is displayed
  And the 'Current password' field is visible
  And the 'New password' field is visible
  And the 'Confirm password' field is visible
  When the user enters their current password
  ```
- AFTER:
  ```
  When the user clicks the 'Change' button next to the password field
  And the user enters their current password
  ```
- **Why**: If the fields weren't visible, entering password would fail anyway. Trust the implementation.

**Environment Setup Details (Remove Entirely):**

- BEFORE:
  ```
  Given the available environments are:
    | Environment  | Prefix          | Default Password |
    | system-e2e   | ref-system-e2e- | Pass1234         |
  And the following test user is available:
    | Username    | Email   |
    | username    | email   |
  ```
- AFTER: _(Remove entirely - handled by test framework)_

**Explicit Wait/Timing Steps (Remove):**

- BEFORE: `And the user waits for the page to load / Then the loading spinner disappears`
- AFTER: _(Remove - implicit in next action)_

**Button/Link Descriptions (Remove Redundancy):**

- BEFORE: `When the user clicks the 'Submit' button which is blue and located at the bottom right`
- AFTER: `When the user clicks the 'Submit' button`

### What to Keep/Add

**High-Level User Intent:**

- Focus on WHAT the user does, not HOW
- Use declarative language
- Preserve business logic flow

**Key Assertions:**

- Success notifications
- Page transitions
- Final state verification

**Tags (Critical):**

- Journey tag: `@journey-name` (e.g., `@login-security`, `@web-auth`, `@self-enrollment`)
- Environment tier tag: ONE of `@system-e2e`, `@ephemeral`, `@mocks` (default to `@system-e2e`)
- Optional tags: `@us`, `@un`, `@login-template`, etc.

**Background (Simplified):**

- Use when setup is critical to scenario
- Keep brief: `Given the user is logged in` or `Given the CSR user navigates to the {Page} for the bank customer`

### Step Consolidation Rules

- 3+ navigation clicks → 1 "navigates to" step
- Multiple field entries → 1-2 abstract "enters their X" steps
- Multiple button/link clicks in sequence → single action step
- Keep page transition assertions (Then... page is displayed)
- Keep final success notification/verification

---

## Edge Cases

### No input provided:

```
❌ Please provide ticket information to refine.

Usage:
  /refine-e2e-ticket @path/to/ticket.doc
  OR
  /refine-e2e-ticket (then paste ticket content)

Example: /refine-e2e-ticket @staging/Example tickets TO REFINE/IDWOJ-4099.doc
```

### Missing ticket ID:

- Try to derive from filename
- If ambiguous, use clear error format:

```
❌ Error: No ticket ID found in title or filename

How to fix: Provide ticket ID (e.g., IDWOJ-4079): _____
```

### Ticket Title Parsing Ambiguity (CRITICAL):

Title doesn't follow `[ENV][APP] Flow Description` format:

```
⚠️ Ticket title format unclear: "{title}"

Expected format: [ENV][APP] Flow Description
Examples:
  - [E2E][Retail] Change password
  - [E2E][Retail][Business] Reset a forgotten password
  - [E2E][DA] Create a new customer

I need to parse this into:
1. Environment tag (e.g., [E2E], [Ephemeral]): _____
2. Application tag(s) (e.g., [Retail], [Business], [DA]): _____
3. Flow description (e.g., Change password): _____

Or just type the full formatted title:
```

### No existing feature found:

- Set `existing_feature_gherkin` to empty
- Note in confirmation: "No existing feature file found - will create reduced feature from description"

### Multiple feature blocks found:

- Ask: "Found {count} feature blocks. Which one should I refine? (1-{count})"

### Complex formatting:

- Trust AI natural reasoning for parsing any format
- **If HTML**: Ignore all markup noise, focus on content
- **If other formats**: Parse naturally based on structure

---

## Critical Reminders

**✅ ALWAYS:**

- Require input (tagged file OR pasted content) - MANDATORY
- Extract critical info from any format (HTML/MD/text)
- **Parse title into ENV/APP tags + flow description** (CRITICAL)
- Validate title format matches `[ENV][APP] Flow Description`
- Use light 1-4 options format for confirmation
- **Ask for journey library path immediately after extraction** (MANDATORY - Step 3)
- **Investigate journey IMPLEMENTATION** (configuration, components, routes, docs)
- Auto-detect journey tag from library path
- Store insights for recommendations (not prescriptions)
- Use golden sample patterns as reference for HOW to write declaratively
- Focus on user's ticket description for WHAT to test
- Collapse verbose steps into high-level ones
- Add proper tags (journey + environment)
- Keep critical assertions
- **Present feature verbally first, then allow conversational editing**
- Accept natural language feedback (not just numbered options)
- Re-present feature after each change with explanation
- Allow multiple rounds of refinement
- **Provide journey-informed recommendations** (setup/teardown/hooks/data) with reasoning
- Frame recommendations as **suggestions**, not requirements
- Show progress feedback at phase transitions (⏳ Extracting... → ✅ Extracted)
- Provide smart defaults (environment: @system-e2e, setup/teardown based on journey type)
- Ensure `dev/ticket/` directory exists before writing
- Check for existing files and confirm before overwriting
- Provide summary report after successful creation
- Handle "I don't know" responses gracefully (offer to skip or use default)
- Use clear error message format: "❌ Error: {what} / How to fix: {action}"
- Offer optional consistency check after ticket creation

**❌ NEVER:**

- Proceed without any input
- Include HTML markup/boilerplate in extractions
- Skip title parsing/validation (it's mandatory)
- Accept malformed title without elicitation
- Over-elicit (one checkpoint only at metadata stage)
- **Skip library context question** (CRITICAL - must ask in Step 3)
- Proceed to Step 4 without asking for library path first
- **Rely solely on E2E tests** (may not exist or cover new features)
- List library files back to user (just acknowledge findings)
- Include UI implementation details in reduced feature
- Keep verbose navigation sequences
- Keep redundant field visibility checks
- Keep environment setup tables
- Omit tags from reduced feature
- Remove business logic flow
- Skip user confirmation on feature
- Generate features longer than golden samples
- Lock user into numbered options only (allow natural language)
- **Prescribe Gherkin steps based on journey components** (user defines the flow)
- **Assume E2E tests cover all journey features** (user may be testing new functionality)
- Overwrite files without confirmation
- Block on validation warnings (warn but allow continuation)
- Fail silently (always provide clear error messages with fix instructions)
- Skip progress feedback (users need to know what's happening)
- Force users to provide info they don't have (offer skip/default options)

**🎯 GOAL:**
Transform verbose test cases into clean, declarative, implementation-agnostic Gherkin scenarios that focus on user intent and business value, matching the quality of golden sample tickets.

---
