# Git Workflow & Commit Guidelines

## 1. Conventional Commits
All commits must follow the Conventional Commits specification:
- `feat:` A new feature or audit capability
- `fix:` A bug fix in scoring or parsing logic
- `test:` Adding tests or benchmark fixtures
- `docs:` Documentation or pitch updates
- `refactor:` Code restructuring without changing behavior
- `perf:` Performance improvements
- `ci:` GitHub Actions or deployment configuration

## 2. Atomic Changes
- Keep commits cohesive and logically self-contained.
- Do not mix cosmetic formatting with core heuristic modifications.

## 3. Pre-Commit Verification
Never commit broken code or failing tests. Verify using:
```bash
python3 scripts/verify.py
```
