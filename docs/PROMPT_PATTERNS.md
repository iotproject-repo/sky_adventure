# Prompt Patterns

## Purpose

Use these templates to keep AI-assisted development focused and safe.

## Feature Prompt

```text
Implement only:
- 

Do not implement:
- 

Architecture rules:
- Use one reusable GameScene.
- Keep assets manifest-driven.
- Use events for scene communication.
- Do not add inventory or collectibles.

Output:
- List changed files.
- Mention verification performed.
```

## Refactor Prompt

```text
Refactor only:
- 

Keep behavior unchanged.
Do not add new gameplay.
Preserve existing public APIs unless a change is required.
```

## Review Prompt

```text
Review these changes for:
- Bugs
- Architecture violations
- Missing tests or verification
- Accidental gameplay or hardcoded stage logic

Return findings first, ordered by severity.
```

## Documentation Prompt

```text
Update documentation only for completed work.
Do not describe planned work as finished.
Keep wording clear for beginners and future AI assistants.
```
