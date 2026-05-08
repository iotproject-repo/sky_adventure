import Phaser from 'phaser';
import BootScene from '../scenes/BootScene.js';
import PreloadScene from '../scenes/PreloadScene.js';
import MenuScene from '../scenes/MenuScene.js';
import GameScene from '../scenes/GameScene.js';
import DialogueScene from '../scenes/DialogueScene.js';
import QuizScene from '../scenes/QuizScene.js';

// Shared Phaser configuration for the whole game.
// Phaser reads this object once when new Phaser.Game() is created.
const gameConfig = {
  type: Phaser.AUTO,
  parent: 'game',
  width: 1280,
  height: 720,
  backgroundColor: '#000000',
  pixelArt: true,
  roundPixels: true,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: {
        y: 800
      },
      debug: false
    }
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  scene: [BootScene, PreloadScene, MenuScene, GameScene, DialogueScene, QuizScene]
};

export default gameConfig;
