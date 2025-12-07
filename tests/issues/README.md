# Issue Regression Tests

This directory contains regression tests for bugs fixed via the issue tracking system.

## Naming Convention

```
I{id}-{description}.spec.ts
```

Example: `I001-login-button-mobile.spec.ts`

## Purpose

When a bug is fixed, a regression test is created here to:
1. Reproduce the bug (test fails before fix)
2. Verify the fix (test passes after fix)
3. Prevent regression (test continues to pass in future)

## TDD Enforcement

For bugs (category: "bug"), this test is **mandatory**:

```
┌────────────────────────────────────────────────────────────────┐
│  □ Create test: tests/issues/I{id}-{desc}.spec.ts             │
│  □ Run test → verify FAILS (reproduces bug)                   │
│  □ Fix the bug                                                 │
│  □ Run test → verify PASSES                                    │
│  □ Update issues.json:                                         │
│    - regression_test_file: "tests/issues/..."                 │
│    - test_fails_before: true                                  │
│    - test_passes_after: true                                  │
│    - status: "closed"                                         │
└────────────────────────────────────────────────────────────────┘
```

## Template

See `templates/tests/issue.spec.template.ts` for the recommended test structure.
