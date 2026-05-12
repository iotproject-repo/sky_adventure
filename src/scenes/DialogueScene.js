import Phaser from 'phaser';

// DialogueScene stays separate from GameScene so story UI can be reused without
// mixing narrative code into movement, world-building, or stage logic.
export default class DialogueScene extends Phaser.Scene {
  constructor() {
    super('DialogueScene');

    this.handleSceneShutdown = this.handleSceneShutdown.bind(this);
  }

  init(data) {
    // GameScene launches this scene with { dialogueId }.
    this.dialogueId = data.dialogueId;
    this.dialogue = null;
    this.currentLineIndex = 0;
    this.currentText = '';
    this.visibleText = '';
    this.isTyping = false;
    this.typewriterEvent = null;
    this.closeHandled = false;
    this.hasShutdown = false;
  }

  preload() {
    // dialogueData is loaded by PreloadScene through the manifest.
    // Dialogue text should live in JSON, not in scene code.
  }

  create() {
    this.dialogue = this.getDialogue();
    this.createDialoguePanel();
    this.bindAdvanceInput();
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.handleSceneShutdown);
    this.events.once(Phaser.Scenes.Events.DESTROY, this.handleSceneShutdown);
    this.showCurrentLine();
  }

  update() {
    // Dialogue advances from keyboard events, not from update(), so scene
    // transitions cannot recurse through the frame loop.
  }

  getDialogue() {
    const dialogueData = this.cache.json.get('dialogueData') ?? {};
    const dialogue = dialogueData[this.dialogueId];

    if (!dialogue) {
      console.warn(`DialogueScene: missing dialogue "${this.dialogueId}".`);
      return {
        speaker: 'Unknown',
        lines: ['...']
      };
    }

    return dialogue;
  }

  createDialoguePanel() {
    const { width, height } = this.scale;

    this.add.rectangle(width / 2, height - 125, width - 120, 200, 0x000000, 0.78);

    this.speakerText = this.add.text(90, height - 210, '', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '26px',
      color: '#ffffff'
    });

    this.lineText = this.add.text(90, height - 165, '', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '24px',
      color: '#ffffff',
      wordWrap: {
        width: width - 180
      }
    });

    this.advanceText = this.add
      .text(width - 90, height - 60, 'E / SPACE', {
        fontFamily: 'Arial, sans-serif',
        fontSize: '18px',
        color: '#ffffff'
      })
      .setOrigin(1, 0.5);
  }

  showCurrentLine() {
    const lineData = this.dialogue.lines[this.currentLineIndex];
    let speaker = this.dialogue.speaker;
    let text = '';

    if (typeof lineData === 'string') {
      text = lineData;
    } else if (lineData && typeof lineData === 'object') {
      speaker = lineData.speaker ?? speaker;
      text = lineData.text ?? '';
    }

    this.speakerText.setText(speaker);
    this.currentText = text;
    this.visibleText = '';
    this.lineText.setText('');
    this.startTypewriter();
  }

  startTypewriter() {
    this.isTyping = true;
    this.typewriterEvent?.remove(false);

    if (!this.currentText.length) {
      this.finishTyping();
      return;
    }

    // A small delayed loop keeps the text readable and cinematic without
    // adding a large animation system.
    this.typewriterEvent = this.time.addEvent({
      delay: 24,
      loop: true,
      callback: () => {
        this.visibleText = this.currentText.slice(0, this.visibleText.length + 1);
        this.lineText.setText(this.visibleText);

        if (this.visibleText.length >= this.currentText.length) {
          this.finishTyping();
        }
      }
    });
  }

  finishTyping() {
    this.isTyping = false;
    this.typewriterEvent?.remove(false);
    this.typewriterEvent = null;
    this.lineText.setText(this.currentText);
  }

  bindAdvanceInput() {
    // The input is shared with gameplay, so this scene handles advance locally.
    this.input.keyboard.on('keydown-E', this.requestAdvance, this);
    this.input.keyboard.on('keydown-SPACE', this.requestAdvance, this);
  }

  requestAdvance(event) {
    if (event?.repeat) {
      return;
    }

    this.handleAdvance();
  }

  handleAdvance() {
    if (this.isTyping) {
      this.finishTyping();
      return;
    }

    this.currentLineIndex += 1;

    if (this.currentLineIndex >= this.dialogue.lines.length) {
      this.closeDialogue();
      return;
    }

    this.showCurrentLine();
  }

  closeDialogue() {
    if (this.closeHandled) {
      return;
    }

    this.closeHandled = true;
    this.cleanupInputAndTimers();

    this.game.events.emit('dialogue-closed', {
      dialogueId: this.dialogueId
    });

    this.scene.stop();
  }

  cleanupInputAndTimers() {
    this.input?.keyboard?.off('keydown-E', this.requestAdvance, this);
    this.input?.keyboard?.off('keydown-SPACE', this.requestAdvance, this);
    this.typewriterEvent?.remove(false);
    this.typewriterEvent = null;
  }

  handleSceneShutdown() {
    if (this.hasShutdown) {
      return;
    }

    this.hasShutdown = true;
    this.cleanupInputAndTimers();
  }
}
