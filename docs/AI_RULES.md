# AI Rules

## Project Rules

- Follow `CLAUDE.md` and keep architecture aligned with it.
- Do not invent completed progress.
- Do not overwrite existing files without checking first.
- Do not add gameplay unless the current task asks for it.
- Do not add inventory or collectible systems.
- Do not hardcode stage-specific behavior into scenes.
- Use ES modules only.

## Coding Style

- Keep files small and focused.
- Add beginner-friendly comments where they clarify intent.
- Prefer TODO comments for future work instead of unfinished hidden logic.
- Use manifest-driven asset loading.
- Use events for scene communication.

## Before Editing

- Check the current file contents.
- Identify the smallest safe change.
- Preserve unrelated user work.

## After Editing

- Run a relevant build or syntax check when available.
- Report any permission, dependency, or tooling blocker.
- Update docs only with real changes.
