import Phaser from 'phaser';

// InputManager keeps input checks in one place.
// Touch controls can be added here later without changing GameScene movement code.
export default class InputManager {
  constructor(scene) {
    this.scene = scene;
    this.keys = this.createKeyboardMap(scene);
  }

  isDown(action) {
    const mappedKeys = this.keys[action] ?? [];

    return mappedKeys.some((key) => key.isDown);
  }

  justPressed(action) {
    const mappedKeys = this.keys[action] ?? [];

    return mappedKeys.some((key) => Phaser.Input.Keyboard.JustDown(key));
  }

  createKeyboardMap(scene) {
    const cursors = scene.input.keyboard.createCursorKeys();
    const letterKeys = scene.input.keyboard.addKeys({
      a: Phaser.Input.Keyboard.KeyCodes.A,
      d: Phaser.Input.Keyboard.KeyCodes.D,
      e: Phaser.Input.Keyboard.KeyCodes.E
    });

    return {
      left: [cursors.left, letterKeys.a],
      right: [cursors.right, letterKeys.d],
      jump: [cursors.space, cursors.up],
      // Interact is action-based so future touch controls can map here too.
      interact: [letterKeys.e]
    };
  }
}
