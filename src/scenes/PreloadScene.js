import Phaser from 'phaser';
import { registerManifestAssets } from '../utils/loaders/registerManifestAssets.js';

// PreloadScene prepares asset loading before the menu appears.
export default class PreloadScene extends Phaser.Scene {
  constructor() {
    super('PreloadScene');
  }

  preload() {
    // Phase 1: load only the manifest file.
    // All game assets must be listed in public/data/asset_manifest.json.
    this.load.json('assetManifest', 'data/asset_manifest.json');
  }

  create() {
    // create() runs once after Phase 1 finishes.
    const { width, height } = this.scale;
    const barWidth = 420;
    const barHeight = 24;
    const barX = (width - barWidth) / 2;
    const barY = height / 2 + 42;
    const graphics = this.add.graphics();

    this.add
      .text(width / 2, height / 2 - 24, 'Loading Assets...', {
        fontFamily: 'Arial, sans-serif',
        fontSize: '32px',
        color: '#ffffff'
      })
      .setOrigin(0.5);

    graphics.lineStyle(2, 0xffffff, 1);
    graphics.strokeRect(barX, barY, barWidth, barHeight);
    graphics.fillStyle(0xffffff, 1);
    graphics.fillRect(barX + 4, barY + 4, barWidth - 8, barHeight - 8);

    // Phase 2: queue assets from the parsed manifest.
    // Phaser needs load.start() because these files are queued after preload().
    const manifest = this.cache.json.get('assetManifest') ?? {};

    const queuedAssetCount = registerManifestAssets(this, manifest);

    this.load.once('complete', () => {
      this.scene.start('MenuScene');
    });

    if (queuedAssetCount === 0) {
      this.time.delayedCall(300, () => {
        this.scene.start('MenuScene');
      });

      return;
    }

    this.load.start();
  }

  update() {
    // update() runs every frame while this scene is active.
    // Real loading progress can update the graphics here later if needed.
  }
}
