# /harness.verify - Verify Passing Features

Run verification on all features marked as passing to ensure they still work.

## Instructions

1. Read `memory/feature_list.json` to find all `passes: true` features
2. For each passing feature, verify the steps still work
3. Report any regressions

## Verification Process

For each feature with `passes: true`:

1. **Read the steps** for that feature
2. **Execute verification** based on step type:
   - UI steps: Check component exists and renders
   - API steps: Make test request
   - Logic steps: Run related tests
   - File steps: Verify file exists with expected content

3. **Record result**:
   - ✅ Still passing
   - ❌ Regression found

## Output Format

```markdown
# Verification Report

## Summary
- **Features Verified**: {count}
- **Still Passing**: {count}
- **Regressions Found**: {count}

## Results

### ✅ Verified Passing
- Feature 1: {name}
- Feature 3: {name}

### ❌ Regressions Found
- **Feature 2: {name}**
  - Step failed: "{step description}"
  - Error: {error message}
  - Suggested fix: {recommendation}

## Actions Required
{If regressions found, list fixes needed before continuing}
```

## On Regression

If a regression is found:
1. Update `feature_list.json`: set `passes: false`
2. Document in `memory/claude-progress.md`
3. Prioritize fixing before new features

## Usage

```
/harness.verify
/harness.verify --quick   # Verify 2-3 random passing features
```
