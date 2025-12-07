# /speckit.constitution - Create Project Constitution

Create or update a project constitution that defines the core principles and standards for this project.

## Instructions

1. Analyze the current workspace to understand the project type and context
2. Create a `memory/constitution.md` file with:
   - **Project Vision**: What this project aims to achieve
   - **Core Principles**: Guiding values for all decisions
   - **Technical Standards**: Languages, frameworks, coding standards
   - **Libraries**: Preferred libraries (or use framework defaults)
   - **Quality Gates**: What must pass before work is considered done
   - **File Conventions**: Naming, structure, organization rules
   - **Testing Strategy**: How code should be tested
   - **Documentation Requirements**: What must be documented

3. If a constitution already exists, review and update it based on any new context

## Library Configuration

Ask the user if they have specific library preferences. If not specified, framework defaults apply:

| Category | TypeScript Default | Python Default |
|----------|-------------------|----------------|
| UI Testing | Playwright | Playwright |
| HTTP Client | fetch (native) | requests |
| API Framework | Express | FastAPI |
| Validation | Zod | Pydantic |

See `.github/instructions/libraries.instructions.md` for complete defaults.

## Output Format

```markdown
# {Project Name} Constitution

## Vision
{Clear statement of project goals}

## Core Principles
1. {Principle 1}
2. {Principle 2}
...

## Technical Standards
- **Language**: {primary language}
- **Framework**: {frameworks used}
- **Style Guide**: {coding standards}

## Libraries

### Specified Libraries
| Category | Library | Reason |
|----------|---------|--------|
| UI Testing | {Playwright or user choice} | {reason if overriding default} |
| HTTP Client | {default or user choice} | {reason if overriding default} |
| {other categories} | | |

### Use Framework Defaults For
- {list categories using defaults}

## Quality Gates
- [ ] All tests pass
- [ ] No linting errors
- [ ] Documentation updated
- [ ] Code reviewed

## File Conventions
- {convention 1}
- {convention 2}

## Testing Strategy
{How and what to test}

## Documentation Requirements
{What must be documented}
```

## Important

The constitution is a living document that guides all agents. Read it before significant work.
