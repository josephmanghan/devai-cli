1. Add --all pre-beta release
2. Do release branch for 0.1.0 then push `main` to Github
3. Publish beta version as 0.1.0

---

1. Full compliment of integration tests
2. I would like to see more logging for retries
3. Missing tests for features/utils
4. Rewrite `SetupController` - it's a bit of a mess with potentially some poor code and empty variable handling
   - May also re-architect how it is used in `main.ts`, as the setup there is turning it into a God File
5. Test parity - some using `getInstance`, some using `beforeEach`, some like `tests/integration/setup-auto-pull.test.ts` just look a little poor
6. Config: custom model (MVP - just a string )
7. Config: custom templates (MVP - user provides, no alternatives)
