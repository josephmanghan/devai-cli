# **Comprehensive Specification for SLM-Driven Granular Commit Message Generation**

## **1\. Introduction: The Intersection of Granular Version Control and Generative AI**

The modern software development lifecycle (SDLC) has evolved from monolithic, infrequent updates to continuous integration and deployment (CI/CD) workflows that demand high-frequency code integration. Central to this workflow is the concept of the "atomic commit"—a discrete, irreducible unit of change that performs a single task and leaves the codebase in a stable state.1 However, the cognitive load required to craft semantic, standardized commit messages for every granular step in a "mid-ticket" workflow—often dozens of times per day—is substantial. This friction leads to the prevalence of low-quality messages such as "wip," "fix," or "save point," which degrade the utility of the version history.4

This report provides an exhaustive specification and training dataset design for a Small Language Model (SLM) specialized in generating commit messages. Unlike Large Language Models (LLMs) which possess broad world knowledge, this SLM is tasked with a highly specific, constrained translation problem: converting a git diff (the technical change) into a Conventional Commit message (the semantic summary) that includes both a header and a descriptive body.

The scope of this report focuses strictly on **ongoing work granularity**. These are not the polished "squash commits" that merge a two-week feature branch into main. rather, they are the breadcrumbs left by a developer _during_ the implementation process. The format enforced throughout this specification is the header-body structure defined by the Conventional Commits specification, specifically excluding scopes and footers to optimize token efficiency for SLMs:

:

The exclusion of scopes (e.g., feat(ui):) and footers (e.g., Closes: \#123) is a deliberate design choice for this dataset. Scopes often require project-specific knowledge (the topology of the codebase) that generic SLMs may lack without extensive fine-tuning, while footers typically require integration with external issue tracking systems (JIRA, GitHub Issues) which are outside the git diff context.6

### **1.1 The Imperative for Atomic Granularity**

Research into developer productivity suggests that atomic commits act as "save points" that allow for safer experimentation and easier reversion.2 When an SLM is trained to recognize and describe these small changes, it reinforces positive developer behavior. For instance, if a developer combines a formatting change with a logic fix, a well-trained SLM might struggle to generate a single coherent message, implicitly prompting the developer to split the commit—a practice known as disentangling changes.8

The "mid-ticket" context is critical here. A feature is rarely built in one pass. It involves scaffolding interfaces, adding tests, implementing logic, refactoring, and fixing typos. The examples provided in this report capture this messy, iterative reality, distinguishing between "implementing a feature" (completed state) and "scaffolding a feature" (ongoing state).1

### **1.2 Theoretical Framework of the Dataset**

The dataset is constructed around the Conventional Commits taxonomy, mapping the technical nature of a change to a semantic type. The semantic mapping is rigorous:

- **Functional Changes:** feat (additions), fix (corrections).
- **Operational Changes:** build, ci, chore.
- **Quality & Maintenance:** test, style, refactor, perf, docs.
- **State Management:** revert.

Each example in the subsequent sections is designed to serve as a few-shot prompt. They include a Context (the scenario), the Header (imperative summary), and the Body (detailed reasoning). The Body is crucial for SLMs, as it forces the model to articulate the _why_ and _how_, grounded in the visual evidence of the diff.10

---

## **2\. Feature Development (feat): The Granular Journey**

In the context of ongoing work, a feat commit does not necessarily mean a feature is "shippable." It means the codebase has acquired new capabilities or structures that contribute to a feature.6 The SLM must learn to describe incremental additions.

### **2.1 Scenario: Frontend Component Construction (React/TypeScript)**

This section illustrates the step-by-step construction of a user authentication interface. This demonstrates how a single JIRA ticket ("Implement Login") breaks down into granular feat commits.

**Context:** Initial file creation.

- **Analysis:** The developer creates empty files or boilerplate. The commit represents "scaffolding."
- **Header:** feat: scaffold login form component structure
- **Body:** Create the directory structure for the login feature including the main component file, CSS module, and a types definition file. This initializes the entry point for the authentication UI but contains no render logic yet.

**Context:** Adding visual elements (HTML/JSX).

- **Analysis:** The developer adds inputs and buttons. This is visual structure, not logic.
- **Header:** feat: implement visual layout for login inputs
- **Body:** Add email and password input fields to the login component render method. Include the submit button and wrap elements in a form tag to support native submission behavior. No state management is hooked up at this stage.

**Context:** Connecting state management.

- **Analysis:** Adding useState or useReducer. This adds interactivity.
- **Header:** feat: wire up local state for form fields
- **Body:** Initialize React state hooks to track input values for email and password. Bind the onChange handlers to the input elements to enable two-way data binding. This prepares the form for validation and submission logic.

**Context:** Integrating the API client.

- **Analysis:** The form now talks to the backend. This is a functional integration.
- **Header:** feat: connect submit handler to auth service
- **Body:** Import the authentication service and invoke the login method within the form submission handler. Add async/await logic to handle the network request and prevent default form submission refresh behavior.

**Context:** Error handling UI.

- **Analysis:** Adding conditional rendering for error states.
- **Header:** feat: add error message display area
- **Body:** Implement conditional rendering to display authentication errors returned from the API. Add a dedicated alert container that acts as a placeholder for validation messages or server-side rejection notifications.

### **2.2 Scenario: Backend API Development (Python/FastAPI)**

Backend development often requires defining schemas before logic. The SLM must distinguish between "defining" and "implementing."

| Technical Action              | Semantic Type | Commit Header                            | Commit Body                                                                                                                                                                                                                 |
| :---------------------------- | :------------ | :--------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Creating a Pydantic model     | feat          | feat: define user registration schema    | Create the Pydantic data model for user registration requests. Define fields for username, email, and password with basic type validation requirements to ensure strict typing on the payload.                              |
| Adding a route handler        | feat          | feat: expose registration endpoint stub  | Register the POST /register route in the main router. Implement a placeholder handler that returns a 501 Not Implemented status to allow for API contract testing before the logic is fully implemented.                    |
| Implementing password hashing | feat          | feat: integrate password hashing utility | Import the Passlib context and implement the logic to hash plain text passwords before storage. This adds a security layer to the user creation flow by ensuring credentials are never stored in plain text.                |
| Database insertion logic      | feat          | feat: implement user persistence logic   | Connect the registration endpoint to the database session. Add the logic to commit the new user object to the users table after successful validation and hashing. Includes error handling for duplicate email constraints. |
| Returning JWT                 | feat          | feat: return access token on success     | Update the registration response to include a signed JWT access token. This allows the client to immediately authenticate upon successful account creation without requiring a separate login step.                         |

### **2.3 Scenario: Systems Programming (Rust)**

Granular commits in systems languages often involve trait implementations and memory management changes.

**Context:** defining a struct.

- **Header:** feat: define configuration struct for startup
- **Body:** Define the main Config struct to hold application startup parameters including port, host, and log level. Derive Debug and Clone traits to facilitate logging and passing configuration across thread boundaries.

**Context:** Implementing a trait.

- **Header:** feat: implement display trait for error types
- **Body:** Implement the std::fmt::Display trait for the custom ApplicationError enum. This provides human-readable descriptions for internal error states, which is necessary for clear logging and user feedback output.

**Context:** Adding a CLI argument parser.

- **Header:** feat: add command line argument parsing
- **Body:** Integrate the Clap library to parse command line arguments. Map the arguments to the Config struct fields, enabling runtime configuration overrides without recompiling the binary.

**Context:** Adding concurrency.

- **Header:** feat: spawn worker threads for request processing
- **Body:** Initialize a thread pool upon server startup and offload incoming request processing to worker threads. This enables non-blocking I/O operations and leverages multi-core architectures for higher throughput.

---

## **3\. Defect Resolution (fix): The Iterative Repair**

In "mid-ticket" work, fix commits are often corrections to code written _hours_ or _minutes_ ago, rather than formal bug fixes for production issues.8 These are "oops" commits. The SLM must capture the specific nature of the error (syntax, logic, type).

### **3.1 Syntax and Compilation Corrections**

These examples help the SLM identify small, rigorous corrections often caught by compilers or linters.

**Context:** Missing punctuation (JavaScript).

- **Header:** fix: add missing semicolon to export statement
- **Body:** Insert a missing semicolon at the end of the module.exports assignment. While ASI handles this in some environments, it was causing parsing errors in the strict build configuration.

**Context:** Import errors (Python).

- **Header:** fix: correct circular import dependency
- **Body:** Move the User model import inside the function scope to resolve a circular dependency error at module load time. This allows the modules to initialize without waiting for each other.

**Context:** Type mismatches (TypeScript).

- **Header:** fix: resolve type mismatch in event handler
- **Body:** Update the onChange event type definition to React.ChangeEvent\<HTMLInputElement\>. This fixes a compilation error where the generic Event type did not possess the value property expected by the handler.

**Context:** Variable shadowing (Go).

- **Header:** fix: rename shadowed variable in loop scope
- **Body:** Rename the error variable inside the for-loop to err_internal. The previous naming shadowed the function-level error return variable, causing the actual error to be swallowed and nil to be returned incorrectly.

### **3.2 Logic and Runtime Corrections**

These are functional fixes where the code compiled but behaved incorrectly.

**Context:** Off-by-one error.

- **Header:** fix: correct iteration limit in pagination loop
- **Body:** Adjust the loop condition to use less-than-or-equal operator. The previous logic stopped one item short of the total page count, causing the last page of results to be omitted from the view.

**Context:** Null pointer protection.

- **Header:** fix: guard against null response in mapper
- **Body:** Add a null check for the API response object before accessing the data property. This prevents a runtime crash when the external service returns a 204 No Content status or a malformed empty body.

**Context:** Race condition.

- **Header:** fix: debounce search input handler
- **Body:** Wrap the search input change handler in a debounce function with a 300ms delay. This prevents a race condition where earlier API requests resolve after later ones, showing stale results to the user.

**Context:** Incorrect boolean logic.

- **Header:** fix: invert condition for active user check
- **Body:** Change the conditional check from if (user.isActive) to if (\!user.isActive) to correctly identify inactive users for archiving. The previous logic was archiving active users by mistake.

---

## **4\. Refactoring (refactor): Structural Evolution**

refactor commits are distinct because they change the _structure_ of code without altering its _behavior_.6 In ongoing work, developers often "make it work" (feat/fix) and then "make it right" (refactor).15 The SLM must be sensitive to the absence of functional change in the diff.

### **4.1 Code Extraction and DRY (Don't Repeat Yourself)**

**Context:** Extracting a helper function.

- **Header:** refactor: extract date formatting to utility
- **Body:** Move the date string formatting logic from the component view into a dedicated helper function. This reduces code duplication across the profile and dashboard views and centralizes the format definition.

**Context:** Component decomposition.

- **Header:** refactor: split user profile into subcomponents
- **Body:** Decompose the monolithic UserProfile component into smaller Presentational components: UserAvatar, UserBio, and UserSettings. This improves readability and makes the individual sections easier to test in isolation.

**Context:** Renaming for clarity.

- **Header:** refactor: rename data variable to userList
- **Body:** Rename the generic 'data' variable to 'userList' throughout the controller. This makes the code more self-documenting and clarifies exactly what content is being iterated over in the view logic.

### **4.2 Modernization and Optimization**

**Context:** Converting Promises to Async/Await.

- **Header:** refactor: modernize asynchronous calls with await
- **Body:** Replace the nested Promise.then() chains with async/await syntax in the service layer. This flattens the code structure and makes error handling via try/catch blocks more intuitive and readable.

**Context:** Changing iteration methods.

- **Header:** refactor: replace for-loop with map function
- **Body:** Switch from an imperative for-loop to the declarative.map() method for transforming the items array. This reduces the boilerplate code required to push items into a new array and improves functional style consistency.

**Context:** Interface segregation.

- **Header:** refactor: decouple service from http implementation
- **Body:** Introduce an HttpClient interface and accept it as a dependency in the UserService constructor. This removes the hard dependency on Axios, allowing for easier mocking during unit tests and future library swaps.

---

## **5\. Non-Functional Types: Style, Docs, Perf, Test**

These types represent the "hygiene" of the codebase. They are essential for a healthy project but do not change business logic.13

### **5.1 Style (style)**

Style commits are purely cosmetic. The SLM should trigger these when diffs show only whitespace, indentation, or formatting changes.7

**Context:** Running Prettier/Formatter.

- **Header:** style: format source files with prettier
- **Body:** Apply automatic formatting rules to the src directory. This standardizes indentation, line breaks, and quote usage according to the project's.prettierrc configuration. No code logic is altered.

**Context:** Ordering imports.

- **Header:** style: organize import statements alphabetically
- **Body:** Reorder the import statements at the top of the file to follow alphabetical order. This makes scanning dependencies easier and reduces merge conflicts when multiple developers add imports simultaneously.

**Context:** Removing whitespace.

- **Header:** style: remove trailing whitespace
- **Body:** Delete unnecessary trailing whitespace characters from the end of lines in the configuration files. This cleans up the diff noise and adheres to the project's linting standards.

### **5.2 Documentation (docs)**

**Context:** Updating the README.

- **Header:** docs: add local setup instructions
- **Body:** Update the README.md file to include a step-by-step guide for setting up the development environment locally. Include details on environment variables and required database containers.

**Context:** Adding code comments.

- **Header:** docs: document complex regex logic
- **Body:** Add inline comments explaining the regular expression used for password validation. The regex is complex and the comments clarify the specific security requirements (special chars, length) being enforced.

**Context:** Updating API docs.

- **Header:** docs: update swagger definition for auth
- **Body:** Update the OpenAPI/Swagger YAML file to reflect the new optional parameters added to the login endpoint. This ensures the generated documentation website stays in sync with the actual API implementation.

### **5.3 Performance (perf)**

**Context:** Database indexing.

- **Header:** perf: add index to user email column
- **Body:** Create a database index on the 'email' column of the users table. This significantly reduces the lookup time for login queries, changing the complexity from O(N) scan to O(log N) seek.

**Context:** Memoization (React).

- **Header:** perf: memoize expensive calculation
- **Body:** Wrap the data filtering logic in a useMemo hook. This prevents the heavy filtering operation from re-running on every render unless the source data dependencies have actually changed.

**Context:** Lazy loading.

- **Header:** perf: implement lazy loading for dashboard
- **Body:** Switch the Dashboard component import to use React.lazy(). This splits the bundle and prevents the dashboard code from being downloaded until the user actually navigates to that route, improving initial load time.

### **5.4 Testing (test)**

**Context:** Unit testing.

- **Header:** test: add unit tests for validator
- **Body:** Create a new test suite for the input validation utility. Include test cases for valid inputs, empty strings, and edge cases with special characters to ensure robust validation logic.

**Context:** Integration testing.

- **Header:** test: add integration case for signup flow
- **Body:** Implement an integration test that simulates a user signing up. This verifies the interaction between the controller, the service layer, and the mock database, ensuring the full flow works as expected.

**Context:** Fixing flaky tests.

- **Header:** test: increase timeout for async operations
- **Body:** Increase the test timeout configuration from 2s to 5s. The asynchronous tests were occasionally timing out on slower CI runners, causing false negatives in the build pipeline.

---

## **6\. Operational Types: Build, CI, Chore, Revert**

These types manage the environment in which the code lives.

### **6.1 Build Systems (build)**

Changes to how the code is compiled, bundled, or packaged.6

**Context:** Webpack/Vite configuration.

- **Header:** build: configure svg loader plugin
- **Body:** Update the Vite configuration to include the SVGR plugin. This allows SVG files to be imported directly as React components, streamlining the usage of icons in the UI.

**Context:** Docker.

- **Header:** build: switch to multi-stage docker build
- **Body:** Refactor the Dockerfile to use a multi-stage build process. This separates the build environment from the runtime environment, resulting in a much smaller final image size by excluding build tools.

**Context:** Dependency version locking.

- **Header:** build: update package-lock json
- **Body:** Regenerate the package-lock.json file to reflect the dependency tree resolution changes. This ensures that all developers and the CI system install the exact same version of transitive dependencies.

### **6.2 Continuous Integration (ci)**

Changes to the automation pipelines.20

**Context:** GitHub Actions.

- **Header:** ci: add linting job to workflow
- **Body:** Add a new job to the pull request workflow that runs the linter. This ensures that code style standards are enforced automatically before any code can be merged into the main branch.

**Context:** Pipeline optimization.

- **Header:** ci: enable caching for node modules
- **Body:** Configure the CI pipeline to cache the node_modules directory between runs. This significantly reduces the build time by avoiding the need to re-download dependencies if package.json hasn't changed.

**Context:** Environment secrets.

- **Header:** ci: inject api key into test environment
- **Body:** Update the test job configuration to inject the required API key secret as an environment variable. This fixes the failing integration tests that require authentication to external services.

### **6.3 Chores (chore)**

Routine maintenance that is neither code nor build configuration per se.22

**Context:** Dependency updates.

- **Header:** chore: bump lodash to version 4.17
- **Body:** Update the lodash dependency to version 4.17 to address a security vulnerability reported in the previous version. Verify that no breaking changes affect the current usage of the library.

**Context:** Git hygiene.

- **Header:** chore: add local env file to gitignore
- **Body:** Add.env.local to the.gitignore file. This prevents developers from accidentally committing their local environment secrets and configuration to the public repository history.

**Context:** Removing dead files.

- **Header:** chore: delete unused icon assets
- **Body:** Remove the SVG icon files that were deprecated in the last UI overhaul. Cleaning up these unused assets reduces the repository size and prevents confusion about which icons are currently in use.

### **6.4 Reverts (revert)**

Undoing previous work. The body should explain _why_.16

**Context:** Reverting a bug.

- **Header:** revert: undo changes to date parser
- **Body:** Revert the commit 'feat: update date parsing logic'. The new logic introduced a regression for dates in UTC format. We are rolling back to the stable version while we investigate the timezone handling issue.

---

## **7\. Infrastructure as Code (IaC) Granularity**

IaC is a distinct domain where "features" are resources and "fixes" are configuration tweaks.24

### **7.1 Terraform**

**Context:** Adding a resource.

- **Header:** feat: provision s3 bucket for logs
- **Body:** Define an AWS S3 bucket resource dedicated to storing application access logs. Configure the lifecycle policy to transition objects to Glacier after 30 days to reduce storage costs.

**Context:** Updating variables.

- **Header:** fix: correct instance type variable
- **Body:** Change the default value of the instance_type variable from t2.micro to t3.micro. The t2 family is no longer supported in the target region, causing the apply stage to fail.

**Context:** Output definitions.

- **Header:** feat: export database endpoint address
- **Body:** Add an output definition for the RDS instance endpoint. This allows other modules or the calling application to retrieve the database connection string programmatically after provisioning.

### **7.2 Kubernetes (Helm/Manifests)**

**Context:** Resource limits.

- **Header:** perf: increase memory limit for api pod
- **Body:** Update the deployment manifest to increase the memory limit for the API container to 512Mi. The previous limit of 256Mi was causing OOMKilled errors during peak traffic loads.

**Context:** Service definition.

- **Header:** feat: expose internal service via load balancer
- **Body:** Change the Service type from ClusterIP to LoadBalancer. This provisions an external IP address, allowing the internal reporting service to be accessed from the corporate VPN.

---

## **8\. Data Science and Machine Learning Contexts**

Data science workflows often involve notebooks and large data files, presenting unique commit challenges.26

**Context:** Jupyter Notebooks.

- **Header:** chore: clear outputs in exploration notebook
- **Body:** Clear the execution cells and output metadata from the data exploration notebook. This reduces the file size and diff noise, making it easier to track actual logic changes in the version control system.

**Context:** Model parameters.

- **Header:** feat: update hyperparameters for training
- **Body:** Adjust the learning rate to 0.001 and increase the batch size to 64 in the training script. Experiments showed these values provide better convergence stability for the current dataset.

**Context:** Data preprocessing.

- **Header:** refactor: vectorize feature normalization
- **Body:** Replace the iterative row-by-row normalization loop with a vectorized NumPy operation. This significantly speeds up the preprocessing pipeline when handling large datasets.

---

## **9\. Linguistic Patterns and Tokenization Strategy for SLMs**

To train an SLM effectively on this dataset, we must understand the linguistic patterns that define a "high-quality" commit message.

### **9.1 The Verb-Object Constraint**

A valid Conventional Commit header follows a strict \<Verb\> \<Object\> syntax.4

- _Weak:_ feat: login stuff (Vague object)
- _Weak:_ feat: adding login (Gerund verb)
- _Strong:_ feat: implement login (Imperative Verb \+ Concrete Object)

**Training Note:** The SLM should be penalized for using:

1. **Gerunds:** adding, fixing, updating.
2. **Past Tense:** added, fixed, updated.
3. **Vague Nouns:** stuff, things, code, logic (without qualifiers).

### **9.2 The "Why" vs. "What" Dichotomy**

The diff tells the SLM _what_ changed (e.g., \+ func login()). The Body must explain _why_.

- _Input:_ git diff shows a change from http to https.
- _Bad Generation:_ fix: change http to https. Body: changed the protocol.
- _Good Generation:_ fix: enforce secure protocol. Body: Update the API client to use HTTPS. This is required to meet the new security compliance standards and prevents cleartext data transmission.

**Insight for SLMs:** The model must be capable of _inference_. It must infer "security compliance" from "https". This requires the training data to be rich in these causal links.29

### **9.3 Handling the "WIP" (Work In Progress) Problem**

A major goal of this dataset is to eliminate "WIP" messages. The SLM should be trained to analyze a partial diff and describe the _intent_ of the partial work.1

**Scenario:** A developer pushes a commit with a new file but empty functions.

- _Human Impulse:_ wip: started auth
- _SLM Target:_ feat: stub out authentication interface. Body: Create the initial file structure and empty function signatures for the authentication service. This defines the contract that will be implemented in subsequent commits.

**Scenario:** A developer adds console logs to debug.

- _Human Impulse:_ debugging
- _SLM Target:_ chore: add temporary logging to debug crash. Body: Insert console log statements in the payment handler to trace the variable state prior to the intermittent crash. These should be removed before merging.

---

## **10\. Database Schema and SQL Granularity**

Database changes are high-risk. Granular messages are essential for database administrators (DBAs) to review changes.27

**Context:** Creating a table.

- **Header:** feat: create inventory items table
- **Body:** Define the SQL schema for the inventory_items table including primary keys and check constraints. This table will store the stock levels for all product SKUs.

**Context:** Altering a column.

- **Header:** feat: expand username column length
- **Body:** Alter the users table to increase the username column limit from 50 to 100 characters. This accommodates the new requirement to support longer email-based usernames.

**Context:** Data migration.

- **Header:** chore: migrate legacy user roles
- **Body:** Add a data migration script to map existing integer-based roles to the new string-based role enum. This ensures backward compatibility for existing user records during the deployment phase.

**Context:** Stored Procedures.

- **Header:** fix: correct logic in daily report proc
- **Body:** Update the calculate_daily_revenue stored procedure to exclude cancelled orders from the total sum. Previously, refunded orders were incorrectly contributing to the revenue metrics.

---

## **11\. Large-Scale Examples Library for Training**

The following section provides a tabulated view of dense, high-variety examples suitable for batch ingestion into a training pipeline.

### **11.1 Frontend (Vue.js)**

| Type     | Header                                           | Body                                                                                                                                                                                |
| :------- | :----------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| feat     | feat: register global notification component     | Import and register the ToastNotification component in the main Vue instance. This makes the notification system available to all child components without manual importation.      |
| fix      | fix: resolve reactivity issue in list            | Use Vue.set() to update the items array index. Direct assignment was preventing the view from re-rendering when the underlying data changed.                                        |
| style    | style: standardise slot syntax                   | Replace the deprecated slot="name" syntax with the v-slot:name shorthand directive. This aligns the templates with the Vue 2.6+ syntax standards.                                   |
| refactor | refactor: convert options api to composition api | Rewrite the user profile component using the Composition API setup function. This improves logic reuse and keeps related code co-located rather than split by options.              |
| test     | test: mount component with shallow render        | Update the test suite to use shallowMount instead of mount. This prevents child components from rendering during unit tests, isolating the test scope to the parent component only. |

### **11.2 Backend (Go/Golang)**

| Type  | Header                                      | Body                                                                                                                                                                                   |
| :---- | :------------------------------------------ | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| feat  | feat: implement reader interface for stream | Add the Read method to the LogStream struct to satisfy the io.Reader interface. This allows the log stream to be passed directly to standard compression libraries.                    |
| fix   | fix: handle mutex lock contention           | Switch from a standard Mutex to RWMutex for the cache store. This allows multiple concurrent readers to access the cache without blocking, fixing a performance bottleneck under load. |
| perf  | perf: preallocate slice capacity            | Initialize the results slice with a known capacity using make(). This prevents memory reallocation and copying overhead as elements are appended inside the loop.                      |
| chore | chore: run go fmt on project                | Execute the standard go fmt tool across all packages. This ensures the codebase adheres to the canonical Go formatting style guidelines.                                               |
| build | build: upgrade go version to 1.21           | Update the go.mod file and CI pipeline configuration to use Go 1.21. This enables the use of the new built-in min/max functions and loop variable capturing fixes.                     |

### **11.3 Scripting (Bash/Shell)**

| Type     | Header                                         | Body                                                                                                                                                                   |
| :------- | :--------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| feat     | feat: add argument validation to deploy script | Add a check at the start of the script to verify that the required environment name argument is provided. Exit with a usage message if the argument is missing.        |
| fix      | fix: quote variables to prevent splitting      | Wrap the filename variable in quotes in the find command. This prevents the script from failing when processing files that contain spaces in their names.              |
| chore    | chore: add execution permission to hook        | Update the file permissions for the pre-commit hook script. This ensures it is executable by git immediately after cloning the repository.                             |
| refactor | refactor: extract logging to function          | Define a log_message function that handles timestamping and output redirection. Replace raw echo statements with calls to this function for consistent log formatting. |

---

## **12\. Edge Cases and Conflict Resolution**

A robust SLM must handle the "ugly" side of git: merge commits, conflicts, and reverts.

### **12.1 Merge Commits**

While Conventional Commits usually apply to linear history, SLMs parsing git log will encounter merges.

- **Header:** chore: merge branch 'feature/login' into main
- **Body:** Merge the completed login feature branch. This introduces the user authentication flow, registration endpoints, and associated unit tests into the production branch. Resolves conflicts in the user schema file.

### **12.2 Handling Rebase Conflicts**

When a rebase pauses for conflict resolution, the resulting commit is often a hybrid.

- **Header:** fix: resolve merge conflict in routing
- **Body:** Manually resolve the conflict in routes.ts. Retain the new profile routes from the current branch while accepting the admin routes introduced by the upstream changes.

---

## **13\. Training Data Formatting for SLM Ingestion**

To train the SLM, the data should be formatted as JSONL (JSON Lines) pairs. The "Input" is the simulated git diff, and the "Output" is the Conventional Commit.26

**Example JSONL Record:**

JSON

{  
 "prompt": "Generate a conventional commit message for the following diff:\\n\\nfile: src/auth.ts\\n- const timeout \= 1000;\\n+ const timeout \= 5000;\\n\\nContext: Users reported login timing out on slow connections.",  
 "completion": "fix: increase auth request timeout\\n\\nIncrease the default request timeout from 1s to 5s. This addresses user reports of timeouts occurring on high-latency mobile networks, ensuring the handshake has enough time to complete."  
}

**Tokenization Strategy:**

1. **System Prompt:** "You are an expert developer. You write atomic, imperative commit messages following the Conventional Commits standard. Format: \<type\>: \<description\>\\n\\n\<body\>. Do not use scopes."
2. **Stop Sequences:** The model should stop after generating the body.

## **14\. Conclusion**

This specification provides the foundational architecture for an SLM-based commit message generator tailored to the "mid-ticket" workflow. By training a model on thousands of examples that strictly adhere to the \<type\>: \<description\>\\n\\n\<body\> format, organizations can automate the documentation of granular work.

The value of this system lies in the "Body" generation. While many developers can write fix: bug quickly, an SLM that can generate fix: handle null response. Body: Add a null check to prevent runtime crash... based on the code evidence provides immense value for code review and historical auditing. This transforms the commit log from a mandatory bureaucratic hurdle into a rich, queryable knowledge base of the software's evolution. This shift towards high-fidelity, granular history is the defining characteristic of elite engineering teams, and SLMs are the tool that makes this level of detail sustainable at scale.

#### **Works cited**

1. Granularity of (Git) Commits \- Kenny Ballou, accessed November 27, 2025, [https://kennyballou.com/blog/2021/03/commit-granularity/index.html](https://kennyballou.com/blog/2021/03/commit-granularity/index.html)
2. How focused commits make you a better coder | tekin.co.uk, accessed November 27, 2025, [https://tekin.co.uk/2021/01/how-atomic-commits-make-you-a-better-coder](https://tekin.co.uk/2021/01/how-atomic-commits-make-you-a-better-coder)
3. A Developer's Guide to Atomic Git Commits | by Sandro Dzneladze \- Medium, accessed November 27, 2025, [https://medium.com/@sandrodz/a-developers-guide-to-atomic-git-commits-c7b873b39223](https://medium.com/@sandrodz/a-developers-guide-to-atomic-git-commits-c7b873b39223)
4. Advantages of standardized commit messages? : r/ExperiencedDevs \- Reddit, accessed November 27, 2025, [https://www.reddit.com/r/ExperiencedDevs/comments/1fitu38/advantages_of_standardized_commit_messages/](https://www.reddit.com/r/ExperiencedDevs/comments/1fitu38/advantages_of_standardized_commit_messages/)
5. Atomic Commits \- A Real Life Case Study : r/talesfromtechsupport \- Reddit, accessed November 27, 2025, [https://www.reddit.com/r/talesfromtechsupport/comments/1jr9x91/atomic_commits_a_real_life_case_study/](https://www.reddit.com/r/talesfromtechsupport/comments/1jr9x91/atomic_commits_a_real_life_case_study/)
6. Conventional Commits, accessed November 27, 2025, [https://www.conventionalcommits.org/en/v1.0.0/](https://www.conventionalcommits.org/en/v1.0.0/)
7. Conventional Commits Cheatsheet \- GitHub Gist, accessed November 27, 2025, [https://gist.github.com/qoomon/5dfcdf8eec66a051ecd85625518cfd13](https://gist.github.com/qoomon/5dfcdf8eec66a051ecd85625518cfd13)
8. Mastering Atomic Commits, The Secret to Efficient Git Workflows \- LeanIX Engineering Blog, accessed November 27, 2025, [https://engineering.leanix.net/blog/atomic-commit/](https://engineering.leanix.net/blog/atomic-commit/)
9. Commits in Detail: Making Them Atomic, Crafting Messages, and Using Amendments | CodeSignal Learn, accessed November 27, 2025, [https://codesignal.com/learn/courses/git-basics/lessons/commits-in-detail-making-them-atomic-crafting-messages-and-using-amendments](https://codesignal.com/learn/courses/git-basics/lessons/commits-in-detail-making-them-atomic-crafting-messages-and-using-amendments)
10. Write Git Commit Messages That Your Colleagues Will Love \- DEV Community, accessed November 27, 2025, [https://dev.to/simeg/write-git-commit-messages-that-your-colleagues-will-love-1757](https://dev.to/simeg/write-git-commit-messages-that-your-colleagues-will-love-1757)
11. How to Write Better Git Commit Messages – A Step-By-Step Guide \- freeCodeCamp, accessed November 27, 2025, [https://www.freecodecamp.org/news/how-to-write-better-git-commit-messages/](https://www.freecodecamp.org/news/how-to-write-better-git-commit-messages/)
12. How atomic Git commits dramatically increased my productivity \- and will increase yours too, accessed November 27, 2025, [https://dev.to/samuelfaure/how-atomic-git-commits-dramatically-increased-my-productivity-and-will-increase-yours-too-4a84](https://dev.to/samuelfaure/how-atomic-git-commits-dramatically-increased-my-productivity-and-will-increase-yours-too-4a84)
13. DataBits: Conventional Commits \- LTER Network, accessed November 27, 2025, [https://lternet.edu/stories/databits-conventional-commits/](https://lternet.edu/stories/databits-conventional-commits/)
14. docs(Conventional Commits): Feat, Fix, Refactor… which is which? | by Bruno Noriller | Medium, accessed November 27, 2025, [https://medium.com/@noriller/docs-conventional-commits-feat-fix-refactor-which-is-which-531614fcb65a](https://medium.com/@noriller/docs-conventional-commits-feat-fix-refactor-which-is-which-531614fcb65a)
15. How to structure commits when unit test requires refactoring, accessed November 27, 2025, [https://softwareengineering.stackexchange.com/questions/409910/how-to-structure-commits-when-unit-test-requires-refactoring](https://softwareengineering.stackexchange.com/questions/409910/how-to-structure-commits-when-unit-test-requires-refactoring)
16. My Ultimate Cheatsheet for Conventional Commit Types: Simplified for Everyday Use, accessed November 27, 2025, [https://www.bavaga.com/blog/2025/01/27/my-ultimate-conventional-commit-types-cheatsheet/](https://www.bavaga.com/blog/2025/01/27/my-ultimate-conventional-commit-types-cheatsheet/)
17. Modern Python part 2: write unit tests & enforce Git commit conventions \- Adaltas, accessed November 27, 2025, [https://www.adaltas.com/en/2021/06/24/unit-tests-conventional-commits/](https://www.adaltas.com/en/2021/06/24/unit-tests-conventional-commits/)
18. Writing Better Git Commit Messages: A Guide to feat, fix, chore, and More \- Medium, accessed November 27, 2025, [https://medium.com/@aslandjc7/git-is-a-powerful-version-control-system-but-writing-clear-and-meaningful-commit-messages-is-48eebc428a00](https://medium.com/@aslandjc7/git-is-a-powerful-version-control-system-but-writing-clear-and-meaningful-commit-messages-is-48eebc428a00)
19. What would be a good commit message for updating package versions using Conventional Commits? \- Stack Overflow, accessed November 27, 2025, [https://stackoverflow.com/questions/65855111/what-would-be-a-good-commit-message-for-updating-package-versions-using-conventi](https://stackoverflow.com/questions/65855111/what-would-be-a-good-commit-message-for-updating-package-versions-using-conventi)
20. Add & Commit · Actions · GitHub Marketplace, accessed November 27, 2025, [https://github.com/marketplace/actions/add-commit](https://github.com/marketplace/actions/add-commit)
21. What is the GitHub eqivolent of GitLab's CI_COMMIT_MESSAGE?, accessed November 27, 2025, [https://devops.stackexchange.com/questions/20012/what-is-the-github-eqivolent-of-gitlabs-ci-commit-message](https://devops.stackexchange.com/questions/20012/what-is-the-github-eqivolent-of-gitlabs-ci-commit-message)
22. When to use "chore" as type of commit message? \[closed\] \- Stack Overflow, accessed November 27, 2025, [https://stackoverflow.com/questions/26944762/when-to-use-chore-as-type-of-commit-message](https://stackoverflow.com/questions/26944762/when-to-use-chore-as-type-of-commit-message)
23. What about the revert type? · Issue \#88 · conventional-commits/conventionalcommits.org \- GitHub, accessed November 27, 2025, [https://github.com/conventional-commits/conventionalcommits.org/issues/88](https://github.com/conventional-commits/conventionalcommits.org/issues/88)
24. CONTRIBUTING.md \- dsaidgovsg/terraform-modules \- GitHub, accessed November 27, 2025, [https://github.com/dsaidgovsg/terraform-modules/blob/master/CONTRIBUTING.md](https://github.com/dsaidgovsg/terraform-modules/blob/master/CONTRIBUTING.md)
25. New git guidelines: We have switched to Conventional Commits \- DEV Community, accessed November 27, 2025, [https://dev.to/visuellverstehen/new-git-guidelines-we-have-switched-to-conventional-commits-1p0c](https://dev.to/visuellverstehen/new-git-guidelines-we-have-switched-to-conventional-commits-1p0c)
26. How to automatically write git commit messages \- Eric Ma, accessed November 27, 2025, [https://ericmjl.github.io/blog/2023/9/23/how-to-automatically-write-git-commit-messages/](https://ericmjl.github.io/blog/2023/9/23/how-to-automatically-write-git-commit-messages/)
27. Database migration: Concepts and principles (Part 1\) | Cloud Architecture Center, accessed November 27, 2025, [https://docs.cloud.google.com/architecture/database-migration-concepts-principles-part-1](https://docs.cloud.google.com/architecture/database-migration-concepts-principles-part-1)
28. Git Commit Messages Best Practices: Expert Tips \- Pull Checklist, accessed November 27, 2025, [https://www.pullchecklist.com/posts/git-commit-messages-best-practices](https://www.pullchecklist.com/posts/git-commit-messages-best-practices)
29. AI based script to generate commit text based on git diff. : r/Python \- Reddit, accessed November 27, 2025, [https://www.reddit.com/r/Python/comments/1jgeykx/ai_based_script_to_generate_commit_text_based_on/](https://www.reddit.com/r/Python/comments/1jgeykx/ai_based_script_to_generate_commit_text_based_on/)
