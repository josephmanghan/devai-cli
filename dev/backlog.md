2. Add --all pre-beta release
   - reason for this scope creep is because Antigravity have introduced an easy 'Generate commit' button. So we need to increase value by making the tool super easy from the command line
3. Do release branch for 0.1.0 then push `main` to Github
4. Publish beta version as 0.1.0

---

0. Audit for unused code
1. run-demo doesnt work very well
2. `types` could possibly be tidied up
3. Full compliment of integration tests, including moving `tests/integration/setup-auto-pull.test.ts` to a `ts-node` test in scripts.
4. I would like to see more logging for retries
5. Missing tests for `features/utils`
6. Rewrite `SetupController` - it's a bit of a mess with potentially some poor code and empty variable handling
   - May also re-architect how it is used in `main.ts`, as the setup there is turning it into a God File
   - And breakup setup-renderer-controller into components like the commit one
7. Test parity - some using `getInstance`, some using `beforeEach`, some like `tests/integration/setup-auto-pull.test.ts` just look a little poor. Agents prefer `beforeEach` so go with that.
8. Config: custom model (MVP - just a string )
9. Config: custom templates (MVP - user provides, no alternatives)
10. add word-wrap
