# Toy Train to The Clouds

"Toy Train to The Clouds" is a Phaser 3 adventure game that follows Tenzing on a journey through the scenic Darjeeling Himalayan Railway. Players traverse beautiful landscapes, interact with locals, and complete quizzes to learn about the region's rich culture and geography.

## Current Implemented Features

- **Reusable Stage Pipeline:** A data-driven system for defining and rendering diverse environments.
- **Manifest-Driven Asset Loading:** Centralized asset management via JSON manifests.
- **Dialogue System:** Interactive NPC conversations with branching text.
- **Quiz System:** Educational challenges triggered by world interactions.
- **Reusable NPC Pipeline:** Standardized spawning and animation system for various characters.
- **Cinematic Camera Follow:** Smooth camera tracking that highlights the parallax backgrounds.
- **Summit Stage Polish:** High-fidelity implementation of the Sandakphu Summit finale.
- **Cross-Platform Controls:** Full support for both keyboard (desktop) and touch/on-screen (mobile) inputs.

## Tech Stack

- **Phaser 3:** Core game engine for rendering and scene management.
- **JavaScript (ES6+):** Modern modular scripting.
- **Vite:** Fast development server and build tool.
- **Arcade Physics:** Simple and efficient 2D physics for player movement and collisions.

## Gameplay Loop

1. **Explore:** Navigate Tenzing across the horizontal world.
2. **Interact:** Speak with NPCs to learn about the location.
3. **Learn:** Complete world-triggered quizzes to progress.
4. **Advance:** Reach the end of the stage to transition to the next destination.

## Stage Progression

| Stage | Name | Key Feature |
| :--- | :--- | :--- |
| 1 | NJP Station | The beginning of the journey. |
| 2 | Mirik Lake | Scenic lakeside exploration. |
| 3 | Rohini Road | Winding mountain roads and fog. |
| 4 | Darjeeling | The bustling town center. |
| 5 | Ghoom Monastery | Spiritual heritage and prayer wheels. |
| 6 | Sandakphu Trail | Challenging ascent through the mist. |
| 7 | Sandakphu Summit | The cinematic finale overlooking the peaks. |

## Architecture Principles

- **Data-Driven Design:** Stages, NPCs, dialogues, and quizzes are defined in JSON and configuration files rather than hardcoded in scenes.
- **Separation of Concerns:** Systems (Input, Dialogue, Quiz, WorldBuilder) are isolated from Scene logic.
- **Reusability:** The `GameScene` serves as a generic container that builds the world based on the active stage configuration.

## Controls

### Desktop
- **Arrow Keys / WASD:** Move left, right, and jump.
- **Space:** Jump.
- **E Key:** Interact with NPCs and objects.
- **Mouse Click:** Select dialogue and quiz options.

### Mobile
- **Virtual Joystick / Buttons:** On-screen controls for movement and interaction.
- **Touch Tap:** Interface with UI elements.

## Run Locally

1. **Clone the repository.**
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Start the development server:**
   ```bash
   npm run dev
   ```
4. **Open in browser:** Navigate to `http://localhost:5173`.

## Build Instructions

To create a production-ready bundle:

```bash
npm run build
```

To preview the production build locally:

```bash
npm run preview
```

## Current Milestone Summary

The project has achieved its primary goal of a complete end-to-end journey from NJP to Sandakphu. All seven stages are fully functional with a stable reusable pipeline. The focus has recently been on polishing the summit atmosphere, refining NPC placements, and ensuring cross-platform stability.

## Repository Structure Overview

- `src/config/`: Stage and game configuration data.
- `src/scenes/`: Phaser scene definitions (Menu, Game, Dialogue, Quiz, etc.).
- `src/systems/`: Core gameplay systems (Movement, WorldBuilding, Interaction).
- `src/utils/`: Helper functions and asset loaders.
- `public/assets/`: All game media (images, spritesheets, audio).
- `public/data/`: JSON manifests for assets, dialogues, and quizzes.
- `docs/`: In-depth documentation on architecture and development rules.
