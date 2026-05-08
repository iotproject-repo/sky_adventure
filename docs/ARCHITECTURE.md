# Architecture

## Core Rules

- Use one reusable `GameScene` for all stages.
- Keep stage behavior data-driven through config files.
- Load assets from `public/data/asset_manifest.json`.
- Communicate between scenes through events only.
- Do not add inventory systems.
- Do not add collectible systems.
- Support keyboard and mobile input.
- Keep files small, modular, and beginner-friendly.

## Scene Flow

```text
BootScene -> PreloadScene -> MenuScene
```

Future gameplay should enter the reusable `GameScene` through a clear scene transition or event-driven flow.

## Data

- `public/data/asset_manifest.json` will define loadable assets.
- `src/config/stages.js` will define stage data.
- Dialogue and quiz data should stay in data files, not hardcoded scenes.

## Systems

Systems should be small classes that receive the dependencies they need. Avoid global state unless there is a clear project-level reason.

## Boundaries

- Scenes manage Phaser lifecycle methods.
- Systems manage focused behavior.
- Config files hold reusable data.
- Data files hold content.
