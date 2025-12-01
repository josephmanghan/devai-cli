# Development Process Notes

## Error-First Implementation Pattern

### Issue Identified (2025-12-01)
During Epic 2 development, we discovered that error handling classes were designed and implemented **after** the core functionality was already delivered. This created several problems:

1. **Misaligned Acceptance Criteria**: Story 2.6 ACs referenced obsolete error types (BaseModelMissing) that no longer applied after Story 2.5.1 (auto-pull)
2. **Implementation Without Contracts**: Student implementations proceeded without proper error class definitions
3. **Retrofitting**: Required significant rework to align error handling with implementation reality

### Solution: Error-First Development

For all future epics, implement this **mandatory pattern**:

#### Epic Planning Phase
1. **First Story**: Define all error classes and exit codes for the entire epic
2. **Error Contract**: Create comprehensive error handling that covers all failure modes
3. **Documentation**: Map each error type to specific remediation guidance and exit codes

#### Implementation Phase
1. **Implement Error Classes First**: Before any core functionality
2. **Test Error Classes**: Verify exit codes and messages work correctly
3. **Build Features**: Core implementation can now rely on established error contracts

#### Benefits
- ✅ Clear contracts for implementation stories
- ✅ Consistent error handling across the epic
- ✅ No retrofitting or misalignment
- ✅ Better user experience with properly designed error messages

### Template for Future Epics

```markdown
## Story X.1: Epic Error Handling Contracts

**As a** developer
**I want** comprehensive error classes for the entire epic
**So that** all implementation stories have consistent error handling

**Acceptance Criteria:**
- [ ] Error class definitions for all epic failure modes
- [ ] Exit code mapping (2=user, 3=system, 4=validation)
- [ ] Remediation guidance for each error type
- [ ] Unit tests for all error classes
- [ ] Documentation of error flow for the epic
```

### Enforcement
- **Scrum Master**: Validate error contracts exist before epic implementation begins
- **Code Review**: Reject implementation stories that don't use defined error classes
- **Acceptance Criteria**: Include error handling validation in each story