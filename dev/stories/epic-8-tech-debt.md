## Issue 1: Setup Command Architecture Violation

SetupCommand feature layer imports OllamaAdapter directly, violating hexagonal architecture. Features should depend on ports/interfaces, not concrete infrastructure implementations.

## Issue 2: Missing UI Layer

No dedicated UI layer exists - feature commands handle user interaction directly instead of delegating to proper UI abstractions.

## Issue 3: Duplicated Stream/Progress Logic

Both OllamaAdapter and SetupCommand implement their own stream handling and ora spinner logic, creating inconsistent user experience and architectural redundancy.
