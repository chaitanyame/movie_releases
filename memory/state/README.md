# Memory State

This directory contains agent state checkpoints and work-in-progress data.

## File Format

State files can be JSON or Markdown:

### JSON Format (for structured data)
```json
{
  "agent": "planner",
  "timestamp": "2025-12-04T10:30:00Z",
  "task_id": "feature-001",
  "status": "in-progress",
  "checkpoint": {
    "current_step": 3,
    "total_steps": 7,
    "completed": ["step1", "step2", "step3"]
  },
  "context": {
    "files_modified": [],
    "decisions_made": []
  }
}
```

### Markdown Format (for human-readable state)
```markdown
# Task: Feature 001

## Status: In Progress

## Current Step
Working on step 3 of 7

## Completed
- [x] Step 1: Initial research
- [x] Step 2: Create plan
- [x] Step 3: Set up structure

## Next Steps
- [ ] Step 4: Implement core logic
...
```

## Naming Convention

- `{agent}-{task-id}.json` - Structured state
- `{agent}-{task-id}.md` - Narrative state
- `current-task.json` - Active task pointer

## Lifecycle

1. **Created** when an agent starts a new task
2. **Updated** at checkpoints during execution
3. **Archived** or deleted on task completion
