import Phaser from 'phaser';

// UIScene will display HUD elements above the GameScene.
export default class UIScene extends Phaser.Scene {
  constructor() {
    super('UIScene');
  }

  preload() {
    // TODO: Load UI assets through the manifest.
  }

  create() {
    // TODO: Listen for game events and update HUD later.
  }

  update() {
    // TODO: Keep UI update work lightweight.
  }
}
