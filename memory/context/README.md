# Memory Context

This directory stores persisted context, summaries, and reference information that agents can use across sessions.

## Purpose

Context files help agents:
- Remember important decisions and rationale
- Access summaries of large codebases or documents
- Maintain project knowledge over time

## File Types

### Project Context
- `project-overview.md` - High-level project description
- `architecture.md` - System architecture decisions
- `conventions.md` - Coding conventions and patterns

### Domain Knowledge
- `domain-glossary.md` - Domain-specific terminology
- `business-rules.md` - Business logic documentation

### Agent-Specific Context
- `{agent}-knowledge.md` - Agent-accumulated knowledge

## Usage

Agents should:
1. Check for relevant context before starting work
2. Update context when learning new project information
3. Reference context files in handoffs

## Maintenance

Context files should be:
- Updated when significant project changes occur
- Reviewed periodically for accuracy
- Kept concise (summarize, don't dump)
