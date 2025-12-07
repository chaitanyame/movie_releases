# setup-project.ps1 - Initialize a new project with the Harness framework
# Part of Agent Harness Framework

param(
    [string]$ProjectName = (Split-Path -Leaf (Get-Location))
)

Write-Host "🚀 Setting up Agent Harness Framework..." -ForegroundColor Cyan
Write-Host ""
Write-Host "Project: $ProjectName"
Write-Host ""

# Create directory structure
Write-Host "📁 Creating directory structure..." -ForegroundColor Cyan

$Directories = @(
    ".github\agents",
    ".github\prompts",
    ".github\instructions",
    "memory\state",
    "memory\context",
    "memory\sessions",
    "specs",
    "templates\commands",
    "templates\docs",
    "scripts\bash",
    "scripts\powershell",
    ".vscode"
)

foreach ($dir in $Directories) {
    New-Item -ItemType Directory -Force -Path $dir | Out-Null
}
Write-Host "✓ Directories created" -ForegroundColor Green

# Create VS Code settings
if (-not (Test-Path ".vscode\settings.json")) {
    @'
{
    "chat.promptFiles": true,
    "github.copilot.chat.codeGeneration.useInstructionFiles": true,
    "chat.commandCenter.enabled": true
}
'@ | Out-File -FilePath ".vscode\settings.json" -Encoding utf8
    Write-Host "✓ VS Code settings created" -ForegroundColor Green
}

# Create basic constitution if not exists
if (-not (Test-Path "memory\constitution.md")) {
    @"
# $ProjectName Constitution

## Vision
{Define the project vision}

## Core Principles
1. Quality over speed - production-ready code
2. Incremental progress - one feature at a time
3. Documentation is mandatory - explain decisions
4. Test before commit - verify everything works

## Technical Standards
- **Language**: {primary language}
- **Framework**: {frameworks}
- **Style Guide**: {coding standards}

## Quality Gates
- [ ] All tests pass
- [ ] No linting errors
- [ ] Documentation updated
- [ ] Changes committed

## File Conventions
- Use descriptive names
- Follow language conventions
- Keep files focused and small

## Testing Strategy
{Define testing approach}

## Documentation Requirements
- README for new features
- Inline comments for complex logic
- API documentation for public interfaces
"@ | Out-File -FilePath "memory\constitution.md" -Encoding utf8
    Write-Host "✓ Constitution template created" -ForegroundColor Green
}

# Create empty feature list if not exists
if (-not (Test-Path "memory\feature_list.json")) {
    @"
{
  "name": "$ProjectName",
  "description": "Feature list for $ProjectName",
  "version": "1.0.0",
  "features": []
}
"@ | Out-File -FilePath "memory\feature_list.json" -Encoding utf8
    Write-Host "✓ Feature list created" -ForegroundColor Green
}

# Create progress notes if not exists
$today = Get-Date -Format "yyyy-MM-dd"
if (-not (Test-Path "memory\claude-progress.md")) {
    @"
# Progress Notes

## Current Status
- Features: 0/0 passing
- Last session: Not started

## Session History

### $today - Initial Setup
- Created project structure
- Ready for @Initializer or /speckit.constitution

## Next Steps
1. Define project constitution with /speckit.constitution
2. Create specifications with /speckit.specify
3. Generate plan with /speckit.plan
4. Create tasks with /speckit.tasks
5. Generate feature list with /harness.generate
6. Start implementation with @Coder

## Notes
{Add session notes here}
"@ | Out-File -FilePath "memory\claude-progress.md" -Encoding utf8
    Write-Host "✓ Progress notes created" -ForegroundColor Green
}

# Create init script
if (-not (Test-Path "init.ps1")) {
    @'
# init.ps1 - Environment setup script
# Run this at the start of each session

Write-Host "🔧 Initializing environment..." -ForegroundColor Cyan

# Add project-specific setup here:
# - Start servers
# - Install dependencies
# - Set environment variables

Write-Host "✅ Environment ready" -ForegroundColor Green
'@ | Out-File -FilePath "init.ps1" -Encoding utf8
    Write-Host "✓ init.ps1 created" -ForegroundColor Green
}

# Initialize git if not already
if (-not (Test-Path ".git")) {
    git init
    Write-Host "✓ Git repository initialized" -ForegroundColor Green
}

Write-Host ""
Write-Host "✅ Project setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:"
Write-Host "  1. Edit memory\constitution.md with your project principles"
Write-Host "  2. Run /speckit.specify to create feature specifications"
Write-Host "  3. Run /speckit.plan to create implementation plan"
Write-Host "  4. Run /speckit.tasks to generate task list"
Write-Host "  5. Run /harness.generate to create feature_list.json"
Write-Host "  6. Use @Coder to implement features incrementally"
