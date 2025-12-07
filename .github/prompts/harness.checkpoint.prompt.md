# /harness.checkpoint - Create Session Checkpoint

Save current session state before ending or switching context.

## Instructions

1. Gather current state from all artifacts
2. Create a session log in `memory/sessions/`
3. Update `memory/claude-progress.md`

## Process

### 1. Collect State

- Current feature progress from `feature_list.json`
- Git status and recent commits
- Any in-progress work
- Environment state

### 2. Create Session Log

File: `memory/sessions/{YYYY-MM-DD-HH-MM}.md`

```markdown
# Session Log: {YYYY-MM-DD HH:MM}

## Session Summary
- **Duration**: {approximate}
- **Agent Used**: {Coder/Initializer/etc}
- **Focus Area**: {what was worked on}

## Accomplishments
- {What was completed}
- {Features implemented}

## Features Touched
| Feature | Before | After |
|---------|--------|-------|
| {name} | ❌ | ✅ |

## Commits Made
- `{hash}` - {message}

## Issues Encountered
- {Any problems and how they were resolved}

## State Left
- **Environment**: {running/stopped}
- **Uncommitted Changes**: {yes/no}
- **Tests**: {passing/failing}

## Next Session Should
1. {First priority}
2. {Second priority}
```

### 3. Update Progress Notes

Update `memory/claude-progress.md` with:
- Session summary
- Updated feature count
- Next steps

## Usage

```
/harness.checkpoint
/harness.checkpoint "Finished login feature"
```
