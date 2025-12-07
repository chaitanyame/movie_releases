# Session Logs

This directory contains session logs for audit trail and continuity.

## Purpose

Session logs help:
- Track what agents did and when
- Resume interrupted work
- Debug issues and understand decisions
- Provide accountability

## File Format

Filename: `YYYY-MM-DD-HH-MM-{agent}.md`

```markdown
# Session Log: {Agent Name}
Date: YYYY-MM-DD HH:MM
Duration: X minutes

## Task
Brief description of what was being worked on

## Actions Taken
1. Action 1 - outcome
2. Action 2 - outcome
...

## Files Modified
- `path/to/file1.ts` - description of change
- `path/to/file2.ts` - description of change

## Decisions Made
- Decision 1: rationale
- Decision 2: rationale

## State at End
Current status and any pending work

## Next Steps
What should happen next (for handoff or resume)
```

## Retention

- Keep recent sessions (last 30 days)
- Archive older sessions if needed
- Delete sessions for completed/abandoned tasks
