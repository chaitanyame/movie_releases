# /speckit.specify - Create Feature Specification

Create a detailed specification for a new feature. This command automatically:
1. Determines the next feature number (001, 002, 003...)
2. Creates a semantic branch name from your description
3. Creates the `specs/{branch-name}/` directory structure

## Usage

```
/speckit.specify Real-time chat system with message history
```

## Instructions

### Step 1: Determine Feature Number
```bash
# Scan existing spec directories to find next number
ls -d specs/[0-9][0-9][0-9]-* 2>/dev/null | sort | tail -1
```
- If no specs exist, use `001`
- Otherwise, increment the highest number

### Step 2: Create Branch Name
- Format: `{NNN}-{semantic-name}`
- Example: `003-real-time-chat`
- Extract key words from user's feature description
- Use lowercase, hyphenated

### Step 3: Create Branch and Directory
```bash
# Create and switch to feature branch
git checkout -b {NNN}-{semantic-name}

# Create spec directory
mkdir -p specs/{NNN}-{semantic-name}
```

### Step 4: Gather Requirements
- Read `memory/constitution.md` to understand project principles
- Ask clarifying questions if needed

### Step 5: Create Specification
- Create `specs/{NNN}-{semantic-name}/spec.md` using template below

## Specification Template

```markdown
# {Feature Name} Specification

## Overview
{Brief description of what this feature does}

## User Stories
- As a {user type}, I want {goal} so that {benefit}

## Requirements

### Functional Requirements
1. {Requirement 1}
2. {Requirement 2}

### Non-Functional Requirements
- **Performance**: {expectations}
- **Security**: {considerations}
- **Accessibility**: {requirements}

## Technical Design

### Architecture
{How this fits into the overall system}

### Data Model
{Any data structures or schemas}

### API/Interface
{Public interfaces this feature exposes}

### Dependencies
{What this feature depends on}

## Acceptance Criteria
- [ ] {Criterion 1}
- [ ] {Criterion 2}

## Edge Cases
- {Edge case 1}: {how to handle}
- {Edge case 2}: {how to handle}

## Testing Strategy
{How this feature should be tested}

## Open Questions
- {Question 1}
- {Question 2}
```

## Output

After running this command:
1. ✅ New branch created: `{NNN}-{feature-name}`
2. ✅ Directory created: `specs/{NNN}-{feature-name}/`
3. ✅ Specification created: `specs/{NNN}-{feature-name}/spec.md`

Report to user:
```
Created feature branch: 003-real-time-chat
Created specification: specs/003-real-time-chat/spec.md

Next steps:
1. /speckit.plan - Create implementation plan
2. /speckit.tasks - Generate task list
3. /harness.generate - Convert to feature_list.json
4. @Coder - Implement features on this branch
```

## Example

```
User: /speckit.specify Photo album organizer with tagging

Agent:
1. Scans specs/ → finds 002-* is highest
2. Creates branch: 003-photo-album-organizer
3. Creates: specs/003-photo-album-organizer/spec.md
4. All subsequent work happens on this branch
```
