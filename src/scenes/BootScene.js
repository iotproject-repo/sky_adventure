import Phaser from 'phaser';

// BootScene is the first scene Phaser runs.
// Use it for safe startup checks before asset loading begins.
export default class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  preload() {
    // No assets are loaded here.
    // Asset loading belongs in PreloadScene and must stay manifest-driven.
  }

  create() {
    // create() runs once after preload() finishes.
    const { width, height } = this.scale;

    this.add
      .text(width / 2, height / 2, 'Booting Toy Train to The Clouds...', {
        fontFamily: 'Arial, sans-serif',
        fontSize: '32px',
        color: '#ffffff'
      })
      .setOrigin(0.5);

    this.scene.start('PreloadScene');
  }

  update() {
    // update() runs every frame while this scene is active.
    // BootScene transitions immediately, so no frame logic is needed.
  }
}
