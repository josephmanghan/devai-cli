2. We could do with providing some form of intent to the agent
   1. On this note, I'm not convinced that the type is being provided within the prompt
3. It's not reading git diff very well, tends to read deletion as removal
4. Editor SAVES when you EXIT. I think we probably need a confirm button.
5. It's terrible at reading REMOVAL in general
6. It feels like we need to work on the PROMPTING side of things tbh. Which is fine, to be expected. We were supposed to work in a mock repo and test.
7. Verify upgrade path - it SHOULD just be install with an included post-install / setup (which will delete the custom model and recreate it)
8. Overall refinement

---

1. Audit for unused code
2. run-demo doesnt work very well
3. `types` could possibly be tidied up
4. Full compliment of integration tests, including moving `tests/integration/setup-auto-pull.test.ts` to a `ts-node` test in scripts.
5. I would like to see more logging for retries
6. Missing tests for `features/utils`
7. Rewrite `SetupController` - it's a bit of a mess with potentially some poor code and empty variable handling
   - May also re-architect how it is used in `main.ts`, as the setup there is turning it into a God File
   - And breakup setup-renderer-controller into components like the commit one
8. Test parity - some using `getInstance`, some using `beforeEach`, some like `tests/integration/setup-auto-pull.test.ts` just look a little poor. Agents prefer `beforeEach` so go with that.
9. Config: custom model (MVP - just a string )
10. Config: custom templates (MVP - user provides, no alternatives)
11. add word-wrap
12. regenerate should close and restart model - if it doesnt already, that needs checking
