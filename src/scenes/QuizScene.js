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
    this.isFinalChallenge = data.isFinalChallenge ?? false;
    this.quizManager = null;
    this.currentQuestionIndex = 0;
    this.selectedIndex = 0;
    this.answerButtons = [];
    this.questionText = null;
    this.resultHandled = false;
    this.hasShutdown = false;
    this.handleSceneShutdown = this.handleSceneShutdown.bind(this);
  }

  create() {
    this.quizManager = new QuizManager(this.cache.json.get('quizData') ?? {});
    this.quiz = this.quiz ?? this.quizManager.getQuiz(this.quizId);

    if (!this.quiz || !this.quiz.questions?.length) {
      this.closeQuiz(false, null);
      return;
    }

    this.createLayout();
    this.bindInput();
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.handleSceneShutdown);
    this.events.once(Phaser.Scenes.Events.DESTROY, this.handleSceneShutdown);
    this.showQuestion(0);
  }

  createLayout() {
    const { width, height } = this.scale;

    this.add.rectangle(width / 2, height / 2, width - 180, 340, 0x000000, 0.88);

    this.titleText = this.add
      .text(width / 2, height / 2 - 130, this.quiz.title, {
        fontFamily: 'Arial, sans-serif',
        fontSize: '30px',
        color: '#ffffff'
      })
      .setOrigin(0.5);

    this.questionText = this.add
      .text(width / 2, height / 2 - 80, '', {
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
  }

  showQuestion(index) {
    const questionData = this.quiz.questions[index];
    if (!questionData) return;

    this.currentQuestionIndex = index;
    this.selectedIndex = 0;
    this.questionText.setText(questionData.question);

    // Clear old buttons
    this.answerButtons.forEach(btn => btn.destroy());
    this.answerButtons = [];

    const { width, height } = this.scale;
    this.answerButtons = questionData.options.map((option, i) => {
      const y = height / 2 - 20 + i * 44;
      const button = this.add
        .text(width / 2, y, `${i + 1}. ${option.label}`, {
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

    const options = this.quiz.questions[this.currentQuestionIndex]?.options;
    if (!options?.length) {
      return;
    }

    this.selectedIndex = Phaser.Math.Wrap(this.selectedIndex - 1, 0, options.length);
    this.updateSelection();
  }

  moveSelectionDown(event) {
    if (event?.repeat) {
      return;
    }

    const options = this.quiz.questions[this.currentQuestionIndex]?.options;
    if (!options?.length) {
      return;
    }

    this.selectedIndex = Phaser.Math.Wrap(this.selectedIndex + 1, 0, options.length);
    this.updateSelection();
  }

  selectAnswer(index) {
    const options = this.quiz.questions[this.currentQuestionIndex]?.options;
    if (!options?.[index]) {
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

    const options = this.quiz.questions[this.currentQuestionIndex]?.options;
    if (!options?.length) {
      return;
    }

    const chosenOption = options[this.selectedIndex];
    const isCorrect = Boolean(chosenOption?.correct);

    if (isCorrect) {
      if (this.currentQuestionIndex + 1 < this.quiz.questions.length) {
        this.showQuestion(this.currentQuestionIndex + 1);
        return;
      }
    }

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

    if (this.isFinalChallenge) {
      this.game.events.emit('final-challenge-complete', {
        passed: correct,
        score: this.currentQuestionIndex + (correct ? 1 : 0) // Simple score
      });
    }

    this.game.events.emit('quiz-closed', {
      quizId: this.quiz?.quizId ?? this.quizId,
      stageId: this.stageId,
      correct,
      isFinalChallenge: this.isFinalChallenge,
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
