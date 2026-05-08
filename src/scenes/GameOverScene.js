import Phaser from 'phaser';

// GameOverScene will handle retry or return-to-menu flows.
export default class GameOverScene extends Phaser.Scene {
  constructor() {
    super('GameOverScene');
  }

  preload() {
    // TODO: Load game-over assets through the manifest.
  }

  create() {
    // TODO: Add retry and menu options later.
  }

  update() {
    // TODO: Add game-over input updates later.
  }
}
