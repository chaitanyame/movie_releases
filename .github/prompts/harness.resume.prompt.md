# /harness.resume - Resume From Last Session

Start a new session by loading context from the last checkpoint.

## Instructions

1. Read all context files to understand current state
2. Verify environment is working
3. Present session briefing
4. Suggest next action

## Resume Process

### 1. Load Context

Read in order:
1. `memory/constitution.md` - Project principles
2. `memory/claude-progress.md` - Recent progress
3. `memory/feature_list.json` - All features and status
4. Latest `memory/sessions/*.md` - Last session details

### 2. Environment Check

```bash
# Check git status
git status
git log --oneline -5

# Run init script if needed
./init.sh  # or init.ps1 on Windows
```

### 3. Quick Verification

Verify 1-2 passing features still work (use `/harness.verify --quick`)

### 4. Present Briefing

```markdown
# Session Briefing

## Project: {name}
{Brief description from constitution}

## Current Progress
- **Features**: {passing}/{total} ({percentage}%)
- **Last Session**: {date}
- **Last Activity**: {what was done}

## Recent Changes
{From git log}

## Environment Status
- {Server status}
- {Dependencies status}

## Suggested Focus
Based on priority and recent progress:

### Option 1 (Recommended)
**Feature {id}: {name}**
- Priority: {priority}
- Reason: {why this one next}

### Option 2
**Feature {id}: {name}**
- Priority: {priority}
- Reason: {alternative option}

## Quick Commands
- `/speckit.implement {id}` - Start implementing
- `/harness.status` - Full status dashboard
- `@Coder` - Enter full implementation mode
```

## Usage

```
/harness.resume
```
