import Phaser from 'phaser';

// InteractionSystem finds nearby interactables and emits events.
// Future dialogue or quiz scenes can listen to these events without changing NPC code.
export default class InteractionSystem {
  constructor(scene, player, inputManager, interactables = []) {
    this.scene = scene;
    this.player = player;
    this.inputManager = inputManager;
    this.interactables = interactables;
    this.currentTarget = null;
    this.enabled = true;
    this.interactionLocked = false;
    this.prompt = this.createPrompt();
  }

  update() {
    this.updateInteractionLock();

    if (!this.enabled) {
      this.currentTarget = null;
      this.hidePrompt();
      return;
    }

    this.currentTarget = this.findClosestTarget();
    this.updatePrompt();

    if (this.currentTarget && !this.interactionLocked && this.inputManager.justPressed('interact')) {
      this.interactionLocked = true;
      this.emitInteraction(this.currentTarget);
    }
  }

  findClosestTarget() {
    if (!this.player) {
      return null;
    }

    let closestTarget = null;
    let closestDistance = Infinity;

    this.interactables.forEach((target) => {
      const metadata = this.getNpcInteractionMetadata(target);

      if (!metadata) {
        return;
      }

      const distance = Phaser.Math.Distance.Between(this.player.x, this.player.y, target.x, target.y);
      const range = metadata.range;

      if (distance <= range && distance < closestDistance) {
        closestTarget = target;
        closestDistance = distance;
      }
    });

    return closestTarget;
  }

  updatePrompt() {
    this.prompt.setVisible(Boolean(this.currentTarget));
  }

  hidePrompt() {
    this.prompt.setVisible(false);
  }

  setEnabled(enabled) {
    this.enabled = enabled;

    if (!enabled) {
      this.currentTarget = null;
      this.interactionLocked = true;
      this.hidePrompt();
    }
  }

  updateInteractionLock() {
    if (!this.inputManager.isDown('interact')) {
      this.interactionLocked = false;
    }
  }

  emitInteraction(target) {
    const metadata = this.getNpcInteractionMetadata(target);

    if (!metadata) {
      return;
    }

    const payload = {
      type: metadata.type,
      key: metadata.key,
      dialogueId: metadata.dialogueId,
      quizId: metadata.quizId,
      interactionType: metadata.interactionType
    };

    this.scene.events.emit('npc-interacted', payload);
  }

  getNpcInteractionMetadata(target) {
    const type = target?.getData?.('type') ?? target?.type;
    const dialogueId = target?.getData?.('dialogueId') ?? target?.dialogueId;
    const quizId = target?.getData?.('quizId') ?? target?.quizId;
    const interactionType = target?.getData?.('interactionType') ?? target?.interaction?.interactionType;

    if (type !== 'npc' || !dialogueId) {
      return null;
    }

    return {
      type,
      key: target.interaction?.key,
      dialogueId,
      quizId,
      interactionType,
      range: target.interaction?.range ?? 120
    };
  }

  createPrompt() {
    // The prompt is camera-fixed UI; it appears only while a target is nearby.
    return this.scene.add
      .text(this.scene.scale.width / 2, this.scene.scale.height - 96, 'Press E to interact', {
        fontFamily: 'Arial, sans-serif',
        fontSize: '24px',
        color: '#ffffff',
        backgroundColor: '#000000'
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(20)
      .setVisible(false);
  }
}
