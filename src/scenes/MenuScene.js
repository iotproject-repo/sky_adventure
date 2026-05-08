import Phaser from 'phaser';
import StageManager from '../systems/StageManager.js';

// MenuScene is the first player-facing entry screen.
export default class MenuScene extends Phaser.Scene {
  constructor() {
    super('MenuScene');

    // Keep the start handler named so we can reuse it for keyboard and touch.
    this.handleStartInput = this.handleStartInput.bind(this);
  }

  preload() {
    // Menu assets should be loaded by PreloadScene through the manifest later.
  }

  create() {
    // create() runs once when this scene starts.
    this.isStarting = false;
    const { width, height } = this.scale;

    this.add
      .text(width / 2, height / 2 - 70, 'Toy Train to The Clouds', {
        fontFamily: 'Arial, sans-serif',
        fontSize: '48px',
        color: '#ffffff'
      })
      .setOrigin(0.5);

    this.add
      .text(width / 2, height / 2 + 20, 'Press SPACE or TAP to Start', {
        fontFamily: 'Arial, sans-serif',
        fontSize: '28px',
        color: '#ffffff'
      })
      .setOrigin(0.5);

    // SPACE and tap should do the same thing, but only the first input wins.
    this.input.keyboard.once('keydown-SPACE', this.handleStartInput);

    this.input.once('pointerdown', this.handleStartInput);
  }

  update() {
    // update() runs every frame while the menu is active.
    // No menu animation or gameplay logic is needed yet.
  }

  startGamePlaceholder() {
    if (this.isStarting) {
      return;
    }

    this.isStarting = true;

    // Starting from config keeps the future GameScene reusable for every stage.
    const stageManager = new StageManager();
    const firstStage = stageManager.getFirstStage();

    if (!firstStage) {
      return;
    }

    this.scene.start('GameScene', {
      stageId: firstStage.id
    });
  }

  handleStartInput() {
    // This guard keeps a quick SPACE press from racing the pointer handler.
    this.startGamePlaceholder();
  }
}
