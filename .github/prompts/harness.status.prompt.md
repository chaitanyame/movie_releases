# /harness.status - Check Feature Progress

Display the current status of all features and recent progress.

## Instructions

1. Read `memory/feature_list.json` to get all features
2. Read `memory/issues.json` to get all issues (if exists)
3. Read `memory/claude-progress.md` for recent activity
4. Display a summary dashboard

## Output Format

```markdown
# Feature Progress Dashboard

## Summary
- **Total Features**: {count}
- **Passing**: {count} ({percentage}%)
- **Remaining**: {count}
- **Last Session**: {date from progress notes}

## Issues Summary
- **Open**: {count} {🔴 if critical issues exist}
- **In Progress**: {count}
- **Closed**: {count}
- Run `/harness.issues` for details

## PR Readiness
┌─────────────────────────────────────────────────────────────────┐
│  {✅ READY | ⛔ BLOCKED}                                         │
│                                                                 │
│  Features: {X}/{Y} passing                                      │
│  Issues: {no critical open | N critical issues blocking}       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

## Feature Status

| # | Feature | Priority | Status |
|---|---------|----------|--------|
| 1 | {name} | {priority} | ✅ Passing |
| 2 | {name} | {priority} | ❌ Not Started |
| 3 | {name} | {priority} | 🔄 In Progress |

## Open Issues (if any)

| ID | Category | Priority | Description |
|----|----------|----------|-------------|
| I001 | 🐛 bug | 🔴 critical | {description} |

## Recent Activity
{Last 3-5 entries from claude-progress.md}

## Suggested Next
Based on priority and dependencies, consider:
1. **{Feature Name}** - {reason}

## Quick Commands
- `/speckit.implement {id}` - Implement specific feature
- `/harness.verify` - Verify passing features
- `/harness.issue "desc"` - Add new issue
- `/harness.issues` - View all issues
- `@Coder` - Start implementation session
```

## Usage

```
/harness.status
```
