import Phaser from 'phaser';
import QuizManager from '../systems/QuizManager.js';

// QuizScene handles the small answer flow while keeping stage code separate.
export default class QuizScene extends Phaser.Scene {
  constructor() {
    super('QuizScene');
  }

  init(data) {
    this.quizId = data.quizId ?? data.quiz?.quizId ?? null;
    this.stageId = data.stageId ?? null;
    this.quiz = data.quiz ?? null;
    this.quizManager = null;
    this.selectedIndex = 0;
    this.answerButtons = [];
    this.resultHandled = false;
    this.hasShutdown = false;
    this.handleSceneShutdown = this.handleSceneShutdown.bind(this);
  }

  create() {
    this.quizManager = new QuizManager(this.cache.json.get('quizData') ?? {});
    this.quiz = this.quiz ?? this.quizManager.getQuiz(this.quizId);

    if (!this.quiz) {
      this.closeQuiz(false, null);
      return;
    }

    this.createLayout();
    this.bindInput();
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.handleSceneShutdown);
    this.events.once(Phaser.Scenes.Events.DESTROY, this.handleSceneShutdown);
  }

  createLayout() {
    const { width, height } = this.scale;

    // The placeholder quiz UI is deliberately simple and text-first so the
    // underlying data flow can be tested before any visual polish is added.
    this.add.rectangle(width / 2, height / 2, width - 180, 340, 0x000000, 0.88);

    this.add
      .text(width / 2, height / 2 - 130, this.quiz.title, {
        fontFamily: 'Arial, sans-serif',
        fontSize: '30px',
        color: '#ffffff'
      })
      .setOrigin(0.5);

    this.add
      .text(width / 2, height / 2 - 80, this.quiz.question, {
        fontFamily: 'Arial, sans-serif',
        fontSize: '24px',
        color: '#ffffff',
        wordWrap: {
          width: width - 260
        }
      })
      .setOrigin(0.5);

    this.add
      .text(width / 2, height / 2 + 120, 'Use 1-3 or UP/DOWN to select, ENTER/E to answer', {
        fontFamily: 'Arial, sans-serif',
        fontSize: '18px',
        color: '#ffffff'
      })
      .setOrigin(0.5);

    this.answerButtons = this.quiz.options.map((option, index) => {
      const y = height / 2 - 20 + index * 44;
      const button = this.add
        .text(width / 2, y, `${index + 1}. ${option.label}`, {
          fontFamily: 'Arial, sans-serif',
          fontSize: '22px',
          color: '#ffffff',
          backgroundColor: '#1d1d1d',
          padding: {
            left: 14,
            right: 14,
            top: 8,
            bottom: 8
          }
        })
        .setOrigin(0.5);

      return button;
    });

    this.updateSelection();
  }

  bindInput() {
    // Keyboard-only selection keeps the flow simple and easy to test.
    this.input.keyboard.on('keydown-UP', this.moveSelectionUp, this);
    this.input.keyboard.on('keydown-DOWN', this.moveSelectionDown, this);
    this.input.keyboard.on('keydown-ONE', this.selectFirstAnswer, this);
    this.input.keyboard.on('keydown-TWO', this.selectSecondAnswer, this);
    this.input.keyboard.on('keydown-THREE', this.selectThirdAnswer, this);
    this.input.keyboard.on('keydown-ENTER', this.confirmSelection, this);
    this.input.keyboard.on('keydown-E', this.confirmSelection, this);
  }

  selectFirstAnswer() {
    this.selectAnswer(0);
  }

  selectSecondAnswer() {
    this.selectAnswer(1);
  }

  selectThirdAnswer() {
    this.selectAnswer(2);
  }

  moveSelectionUp(event) {
    if (event?.repeat) {
      return;
    }

    if (!this.quiz?.options?.length) {
      return;
    }

    this.selectedIndex = Phaser.Math.Wrap(this.selectedIndex - 1, 0, this.quiz.options.length);
    this.updateSelection();
  }

  moveSelectionDown(event) {
    if (event?.repeat) {
      return;
    }

    if (!this.quiz?.options?.length) {
      return;
    }

    this.selectedIndex = Phaser.Math.Wrap(this.selectedIndex + 1, 0, this.quiz.options.length);
    this.updateSelection();
  }

  selectAnswer(index) {
    if (!this.quiz?.options?.[index]) {
      return;
    }

    this.selectedIndex = index;
    this.updateSelection();
  }

  updateSelection() {
    this.answerButtons.forEach((button, index) => {
      const selected = index === this.selectedIndex;
      button.setColor(selected ? '#111111' : '#ffffff');
      button.setBackgroundColor(selected ? '#f3cc75' : '#1d1d1d');
    });
  }

  confirmSelection(event) {
    if (event?.repeat || this.resultHandled) {
      return;
    }

    if (!this.quiz?.options?.length) {
      return;
    }

    const chosenOption = this.quiz.options[this.selectedIndex];
    const isCorrect = Boolean(chosenOption?.correct);

    this.game.events.emit('quiz-result', {
      stageId: this.stageId,
      quizId: this.quiz.quizId,
      selectedIndex: this.selectedIndex,
      selectedLabel: chosenOption?.label ?? '',
      correct: isCorrect
    });

    this.closeQuiz(isCorrect, chosenOption);
  }

  closeQuiz(correct, selectedOption) {
    if (this.resultHandled) {
      return;
    }

    this.resultHandled = true;
    this.cleanupInput();

    this.game.events.emit('quiz-closed', {
      quizId: this.quiz?.quizId ?? this.quizId,
      stageId: this.stageId,
      correct,
      selectedLabel: selectedOption?.label ?? ''
    });

    this.scene.stop();
  }

  handleSceneShutdown() {
    if (this.hasShutdown) {
      return;
    }

    this.hasShutdown = true;
    // If the scene closes early, clear keyboard listeners so they cannot leak
    // into MenuScene or a later GameScene restart.
    this.cleanupInput();
  }

  cleanupInput() {
    this.input?.keyboard?.off('keydown-UP', this.moveSelectionUp, this);
    this.input?.keyboard?.off('keydown-DOWN', this.moveSelectionDown, this);
    this.input?.keyboard?.off('keydown-ONE', this.selectFirstAnswer, this);
    this.input?.keyboard?.off('keydown-TWO', this.selectSecondAnswer, this);
    this.input?.keyboard?.off('keydown-THREE', this.selectThirdAnswer, this);
    this.input?.keyboard?.off('keydown-ENTER', this.confirmSelection, this);
    this.input?.keyboard?.off('keydown-E', this.confirmSelection, this);
  }
}
