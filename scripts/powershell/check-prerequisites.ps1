# check-prerequisites.ps1 - Verify environment prerequisites
# Part of Agent Harness Framework

Write-Host "🔍 Checking prerequisites for Agent Harness Framework..." -ForegroundColor Cyan
Write-Host ""

$Errors = 0

# Check Git
if (Get-Command git -ErrorAction SilentlyContinue) {
    $gitVersion = git --version
    Write-Host "✓ Git installed: $gitVersion" -ForegroundColor Green
} else {
    Write-Host "✗ Git not found - required for version control" -ForegroundColor Red
    $Errors++
}

# Check VS Code
if (Get-Command code -ErrorAction SilentlyContinue) {
    Write-Host "✓ VS Code CLI available" -ForegroundColor Green
} else {
    Write-Host "⚠ VS Code CLI not in PATH (optional)" -ForegroundColor Yellow
}

# Check Node.js
if (Get-Command node -ErrorAction SilentlyContinue) {
    $nodeVersion = node --version
    Write-Host "✓ Node.js installed: $nodeVersion" -ForegroundColor Green
} else {
    Write-Host "⚠ Node.js not found (optional, needed for JS/TS projects)" -ForegroundColor Yellow
}

# Check Python
if (Get-Command python -ErrorAction SilentlyContinue) {
    $pythonVersion = python --version 2>&1
    Write-Host "✓ Python installed: $pythonVersion" -ForegroundColor Green
} else {
    Write-Host "⚠ Python not found (optional, needed for Python projects)" -ForegroundColor Yellow
}

Write-Host ""

# Check required directories
Write-Host "📁 Checking directory structure..." -ForegroundColor Cyan

$RequiredDirs = @(
    ".github\agents",
    ".github\prompts",
    ".github\instructions",
    "memory",
    "memory\state",
    "memory\context",
    "memory\sessions",
    "specs",
    "templates"
)

foreach ($dir in $RequiredDirs) {
    if (Test-Path $dir) {
        Write-Host "✓ $dir" -ForegroundColor Green
    } else {
        Write-Host "✗ $dir - missing" -ForegroundColor Red
        $Errors++
    }
}

Write-Host ""

# Check required files
Write-Host "📄 Checking required files..." -ForegroundColor Cyan

$RequiredFiles = @(
    "memory\constitution.md",
    ".github\agents\initializer.agent.md",
    ".github\agents\coder.agent.md"
)

foreach ($file in $RequiredFiles) {
    if (Test-Path $file) {
        Write-Host "✓ $file" -ForegroundColor Green
    } else {
        Write-Host "⚠ $file - not found (will be created by framework)" -ForegroundColor Yellow
    }
}

Write-Host ""

# Summary
if ($Errors -eq 0) {
    Write-Host "✅ All prerequisites met!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:"
    Write-Host "  1. Run @Initializer to set up your project"
    Write-Host "  2. Or use /speckit.constitution to create project principles"
} else {
    Write-Host "❌ Found $Errors issues that need attention" -ForegroundColor Red
    exit 1
}
