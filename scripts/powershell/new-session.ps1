# new-session.ps1 - Start a new implementation session
# Part of Agent Harness Framework

Write-Host "🔄 Starting new session..." -ForegroundColor Cyan
Write-Host ""

# Check if we're in the right directory
if (-not (Test-Path "memory\feature_list.json")) {
    Write-Host "❌ Error: memory\feature_list.json not found" -ForegroundColor Red
    Write-Host "   Make sure you're in the project root directory"
    exit 1
}

# Get current date for session log
$SessionDate = Get-Date -Format "yyyy-MM-dd-HH-mm"
$SessionFile = "memory\sessions\$SessionDate.md"

# Show current progress
Write-Host "📊 Current Progress:" -ForegroundColor Cyan
try {
    $features = Get-Content "memory\feature_list.json" | ConvertFrom-Json
    $total = $features.features.Count
    $passing = ($features.features | Where-Object { $_.passes -eq $true }).Count
    Write-Host "   Features: $passing/$total passing"
} catch {
    Write-Host "   (unable to parse feature list)"
}
Write-Host ""

# Show recent git history
Write-Host "📝 Recent commits:" -ForegroundColor Cyan
try {
    git log --oneline -5 2>$null
} catch {
    Write-Host "   (no git history)"
}
Write-Host ""

# Check for uncommitted changes
$gitStatus = git status --porcelain 2>$null
if ($gitStatus) {
    Write-Host "⚠️  Uncommitted changes detected:" -ForegroundColor Yellow
    git status --short
    Write-Host ""
}

# Run init script if it exists
if (Test-Path "init.ps1") {
    Write-Host "🔧 Running init.ps1..." -ForegroundColor Cyan
    . .\init.ps1
    Write-Host ""
}

# Get current branch and last commit
$branch = try { git branch --show-current 2>$null } catch { "unknown" }
$lastCommit = try { git log --oneline -1 2>$null } catch { "none" }

# Create session log
$sessionContent = @"
# Session Log: $(Get-Date -Format "yyyy-MM-dd HH:mm")

## Session Goal
{Define what you want to accomplish}

## Starting State
- Features: {X/Y} passing
- Branch: $branch
- Last commit: $lastCommit

## Accomplishments
- {To be filled during session}

## Commits Made
- {To be filled during session}

## Issues Encountered
- {To be filled during session}

## Session End State
- Features: {X/Y} passing
- Environment: {running/stopped}
- Uncommitted changes: {yes/no}

## Next Session Should
1. {First priority}
2. {Second priority}
"@

$sessionContent | Out-File -FilePath $SessionFile -Encoding utf8

Write-Host "📄 Session log created: $SessionFile" -ForegroundColor Green
Write-Host ""
Write-Host "✅ Ready for implementation!" -ForegroundColor Green
Write-Host ""
Write-Host "Quick reference:"
Write-Host "  /harness.status     - View feature progress"
Write-Host "  /harness.verify     - Verify passing features"
Write-Host "  /speckit.implement  - Implement a feature"
Write-Host "  /harness.checkpoint - Save progress before ending"
Write-Host "  @Coder              - Full implementation mode"
