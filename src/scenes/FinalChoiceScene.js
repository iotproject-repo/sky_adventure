import Phaser from 'phaser';

export default class FinalChoiceScene extends Phaser.Scene {
  constructor() {
    super('FinalChoiceScene');
  }

  create() {
    const { width, height } = this.scale;

    this.add.rectangle(0, 0, width, height, 0x000000, 0.8)
      .setOrigin(0);

    this.add.text(width / 2, 200,
      'Journey Complete',
      {
        fontFamily: 'Arial, sans-serif',
        fontSize: '48px',
        color: '#ffffff'
      }
    ).setOrigin(0.5);

    const restartText = this.add.text(width / 2, 350,
      'Restart Journey',
      {
        fontFamily: 'Arial, sans-serif',
        fontSize: '32px',
        color: '#ffffaa'
      }
    )
    .setOrigin(0.5)
    .setInteractive({ useHandCursor: true });

    const quitText = this.add.text(width / 2, 450,
      'Quit Game',
      {
        fontFamily: 'Arial, sans-serif',
        fontSize: '32px',
        color: '#ffaaaa'
      }
    )
    .setOrigin(0.5)
    .setInteractive({ useHandCursor: true });

    restartText.on('pointerdown', () => {
      this.scene.stop('GameScene');
      this.scene.stop('FinalChoiceScene');

      this.scene.start('GameScene', {
        stageId: 'stage_1_njp'
      });
    });

    quitText.on('pointerdown', () => {
      this.scene.stop('GameScene');
      this.scene.start('GameOverScene');
    });

    // Hover effects for better feedback
    [restartText, quitText].forEach(text => {
      text.on('pointerover', () => text.setScale(1.1));
      text.on('pointerout', () => text.setScale(1));
    });
  }
}
