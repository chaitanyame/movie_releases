````prompt
# /harness.issues - View Issue Status

Display the current status of all tracked issues from `memory/issues.json`.

## Usage

```
/harness.issues
/harness.issues --open
/harness.issues --category=bug
```

## Instructions

1. Read `memory/issues.json` to get all issues
2. Calculate summary statistics
3. Display dashboard with filtering options

## Output Format

```markdown
# Issue Tracking Dashboard

## Summary
- **Total Issues**: {count}
- **Open**: {count} 🔴
- **In Progress**: {count} 🟡
- **Closed**: {count} ✅
- **Critical Open**: {count} ⚠️

## PR Readiness Check
┌─────────────────────────────────────────────────────────────────┐
│  {✅ Ready | ⛔ Blocked}                                         │
│  {Reason if blocked: e.g., "2 critical bugs still open"}       │
└─────────────────────────────────────────────────────────────────┘

## Open Issues (by priority)

| ID | Category | Priority | Description | Branch | Age |
|----|----------|----------|-------------|--------|-----|
| I001 | 🐛 bug | 🔴 critical | Login crash | same | 2d |
| I003 | 📝 adhoc | 🟡 medium | Add spinner | same | 1d |

## In Progress

| ID | Category | Description | Branch | Assigned |
|----|----------|-------------|--------|----------|
| I002 | 🔧 hotfix | Security patch | hotfix/I002-security | current |

## Recently Closed (last 7 days)

| ID | Category | Description | Closed | Has Test |
|----|----------|-------------|--------|----------|
| I004 | 🐛 bug | Form validation | 2024-12-05 | ✅ |

## Stale Issues (> 7 days open)
⚠️ The following issues have been open for more than 7 days:
- I001: Login crash (opened 2024-11-28) - 9 days

## Quick Commands
- `/harness.issue "description"` - Add new issue
- `@Coder` - Start session (will process open issues)
```

## Filtering Options

| Flag | Purpose | Example |
|------|---------|---------|
| `--open` | Show only open issues | `/harness.issues --open` |
| `--category=X` | Filter by category | `/harness.issues --category=bug` |
| `--priority=X` | Filter by priority | `/harness.issues --priority=critical` |
| `--stale` | Show only stale issues (>7 days) | `/harness.issues --stale` |

## PR Readiness Rules

The dashboard shows whether a PR can be created:

```
✅ READY when:
- All features pass: true
- No critical or high priority issues open

⛔ BLOCKED when:
- Any critical issue is open
- Any bug is open without regression test
```

## Category Icons

| Category | Icon | Meaning |
|----------|------|---------|
| bug | 🐛 | Defect - requires regression test |
| hotfix | 🔧 | Urgent fix |
| enhancement | ✨ | Improvement |
| adhoc | 📝 | One-off request |

## Priority Icons

| Priority | Icon | Meaning |
|----------|------|---------|
| critical | 🔴 | Fix immediately |
| high | 🟠 | Fix after current work |
| medium | 🟡 | Fix when convenient |
| low | 🟢 | Fix if time permits |

## Integration with /harness.status

When running `/harness.status`, a condensed issue summary is included:

```markdown
## Issues
- Open: 3 (1 critical ⚠️)
- In Progress: 1
- Run `/harness.issues` for details
```

````
