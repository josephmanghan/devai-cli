# Git Diff Reading Instructions

## Git Diff Syntax

- `---` = OLD file version | `+++` = NEW file version
- `-` = REMOVED line | `+` = ADDED line | no prefix = context line

## Interpreting Changes

**Modification**: `- old code` followed by `+ new code` means replacement

**Example**:

```
- pattern: '[a-z]+',
+ rule: '[a-z]+',
```

This means property `pattern` was renamed to `rule`, value unchanged.

## Common Change Types

- **Property rename**: `- oldProp: val, + newProp: val,`
- **Logic change**: Block replacement with new conditions
- **Import change**: Service/module imports swapped
- **File move**: `--- a/old/path +++ b/new/path`

<!-- TODO this also needs to specific what a jsdoc is -->
