import Phaser from 'phaser';
import StageManager from '../systems/StageManager.js';
import InputManager from '../systems/InputManager.js';
import PlayerController from '../systems/PlayerController.js';
import WorldBuilder from '../systems/WorldBuilder.js';
import InteractionSystem from '../systems/InteractionSystem.js';
import QuizManager from '../systems/QuizManager.js';

// GameScene is reusable: every stage is built from config data instead of
// separate stage-specific scene classes.
export default class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');

    // Named handlers make it possible to clean shared listeners on shutdown.
    this.handleNpcInteracted = this.handleNpcInteracted.bind(this);
    this.handleQuizClosed = this.handleQuizClosed.bind(this);
    this.handleDialogueClosed = this.handleDialogueClosed.bind(this);
    this.handleStageComplete = this.handleStageComplete.bind(this);
    this.handleSceneShutdown = this.handleSceneShutdown.bind(this);
  }

  init(data) {
    // Scene data is how MenuScene tells GameScene which stage to build.
    this.stageId = data.stageId;

    // Persistent systems live for the lifetime of this GameScene instance.
    // They should survive a future stage rebuild instead of being recreated
    // every time the world changes.
    this.stageManager = new StageManager();
    this.inputManager = null;
    this.quizManager = null;

    // Rebuildable world objects belong to the currently loaded stage.
    // A future cleanupCurrentStage() implementation will destroy these before
    // buildStage() creates the next stage's world.
    this.stageConfig = null;
    this.player = null;
    this.playerController = null;
    this.worldBuilder = null;
    this.stageWorld = null;
    this.interactionSystem = null;
    this.ground = null;
    this.quizPrompt = null;
    this.activeQuizTrigger = null;
    this.stageDisplayObjects = [];
    this.stageColliders = [];
    this.stageOverlaps = [];

    // Overlay state tracks temporary UI scenes that pause GameScene.
    this.dialogueActive = false;
    this.quizActive = false;

    // Transition-related state prevents duplicate fades or inputs while the
    // stage-complete flow is running.
    this.isTransitioning = false;
    this.stageTransitionStarted = false;

    // Scene lifecycle cleanup is separate from stage cleanup. This removes
    // shared event listeners only when GameScene itself shuts down.
    this.hasShutdown = false;
  }

  preload() {
    // Stage assets are loaded earlier by PreloadScene through the manifest.
    // Do not hardcode asset paths here.
  }

  create() {
    this.stageConfig = this.getStageConfig();

    if (!this.stageConfig) {
      this.scene.start('MenuScene');
      return;
    }

    this.inputManager = new InputManager(this);
    this.quizManager = new QuizManager(this.cache.json.get('quizData') ?? {});
    this.registerInteractionEvents();
    this.registerSceneEvents();
    this.buildStage(this.stageConfig);
  }

  update(time, delta) {
    if (this.isTransitioning) {
      return;
    }

    // update() runs every frame; movement is delegated to the controller.
    this.playerController?.update(delta);
    this.interactionSystem?.update();
    this.updateQuizPrompt();
    this.stageWorld?.parallaxBackground?.update();
  }

  getStageConfig() {
    if (!this.stageId) {
      console.warn('GameScene: no stageId was provided. Falling back to first stage.');
      return this.stageManager.getCurrentStage();
    }

    this.stageManager.setActiveStage(this.stageId);
    return this.stageManager.getCurrentStage();
  }

  getGameHeight() {
    return Number(this.game.config.height) || this.scale.height;
  }

  buildStage(stageConfig) {
    // Everything created after this point is considered owned by the current
    // stage and can be destroyed by cleanupCurrentStage() before rebuilding.
    const existingChildren = new Set(this.children.list);

    this.stageConfig = stageConfig;
    const gameHeight = this.getGameHeight();

    this.physics.world.setBounds(0, 0, stageConfig.worldWidth, gameHeight);
    this.worldBuilder = new WorldBuilder(this);
    this.stageWorld = this.worldBuilder.build(stageConfig, gameHeight);
    this.ground = this.createTemporaryGround(stageConfig.worldWidth, gameHeight);
    this.createPlayer(gameHeight);
    // A collider blocks bodies from passing through each other.
    // An overlap would only detect contact and would not stop falling.
    this.stageColliders.push(this.physics.add.collider(this.player, this.ground));
    this.stageColliders.push(this.physics.add.collider(this.player, this.stageWorld.platforms));
    this.playerController = new PlayerController(this.player, this.inputManager);
    this.interactionSystem = new InteractionSystem(this, this.player, this.inputManager, this.stageWorld.npcs);
    this.quizPrompt = this.createQuizPrompt();
    this.activeQuizTrigger = null;
    this.quizActive = false;
    this.setupQuizTriggers();
    this.setupCamera(stageConfig.worldWidth, gameHeight);
    this.stageDisplayObjects = this.children.list.filter((child) => !existingChildren.has(child));
  }

  cleanupCurrentStage() {
    // Destroy stage-owned physics relationships first so old bodies cannot
    // keep colliding or overlapping after their display objects are gone.
    this.stageOverlaps.forEach((overlap) => overlap?.destroy?.());
    this.stageColliders.forEach((collider) => collider?.destroy?.());
    this.stageOverlaps = [];
    this.stageColliders = [];

    this.cameras.main.stopFollow();

    // Destroy every display object created during buildStage(), including
    // nested container children, NPCs, quiz zones, prompts, background, and the
    // player. Phaser removes matching physics bodies as those objects die.
    this.stageDisplayObjects.forEach((object) => {
      if (object?.scene) {
        object.destroy?.();
      }
    });
    this.stageDisplayObjects = [];

    this.player = null;
    this.playerController = null;
    this.worldBuilder = null;
    this.stageWorld = null;
    this.interactionSystem = null;
    this.ground = null;
    this.quizPrompt = null;
    this.activeQuizTrigger = null;
    this.quizActive = false;
  }

  createTemporaryGround(worldWidth, gameHeight) {
    // Physics bodies give gravity something to collide with, even before final
    // terrain systems exist.
    const ground = this.add.rectangle(worldWidth / 2, gameHeight - 24, worldWidth, 48, 0x3c6e47);

    this.physics.add.existing(ground, true);

    return ground;
  }

  createPlayer(gameHeight) {
    this.createPlayerAnimations();

    // Place Tenzing near the left side of the stage. The y value lines up the
    // bottom of the 64x96 sprite with the top of the temporary ground.
    this.player = this.physics.add.sprite(200, gameHeight - 48, 'char_tenzing_idle');
    this.player.setOrigin(0.5, 1);
    this.player.setDisplaySize(64, 96);
    // Depth 12 keeps Tenzing in front of the Inspector when they overlap,
    // while still staying above decorative foreground objects.
    this.player.setDepth(12);
    this.player.body.setBounce(0);
    this.player.body.setMaxVelocity(420, 700);
    this.player.body.setCollideWorldBounds(true);

    // Start the idle loop immediately so the character feels alive even before
    // movement, dialogue, and interaction art are implemented.
    this.player.anims.play('player_idle');
  }

  createQuizPrompt() {
    // This temporary prompt lives in world space above the configured quiz
    // trigger, so the marker follows the stall as the camera scrolls.
    return this.add
      .text(this.scale.width / 2, this.scale.height - 96, 'Press E', {
        fontFamily: 'Arial, sans-serif',
        fontSize: '22px',
        color: '#2d1a0d',
        backgroundColor: '#f3cc75',
        padding: {
          left: 14,
          right: 14,
          top: 8,
          bottom: 8
        }
      })
      .setOrigin(0.5)
      .setScrollFactor(1)
      .setDepth(20)
      .setVisible(false);
  }

  setupQuizTriggers() {
    // Quiz triggers are configured in stages.js and detected with Arcade
    // overlap. This keeps the quiz start location data-driven.
    this.stageWorld?.quizTriggers?.forEach((trigger) => {
      const overlap = this.physics.add.overlap(this.player, trigger, () => {
        this.activeQuizTrigger = trigger;
      });

      this.stageOverlaps.push(overlap);
    });
  }

  updateQuizPrompt() {
    if (this.quizActive) {
      this.quizPrompt.setVisible(false);
      return;
    }

    // The overlap callback marks the trigger, and this direct bounds check
    // keeps the prompt stable on the next frame while the player remains there.
    const trigger = this.findOverlappingQuizTrigger();

    if (!trigger) {
      this.activeQuizTrigger = null;
      this.quizPrompt.setVisible(false);
      return;
    }

    this.activeQuizTrigger = trigger;
    // Keep the prompt near the stall so the player understands what this area
    // does without needing extra UI or tutorial text.
    this.quizPrompt.setPosition(trigger.x, Math.max(64, trigger.body.top - 24));
    this.quizPrompt.setVisible(true);

    if (this.inputManager.justPressed('interact')) {
      this.requestQuizOpen(trigger);
    }
  }

  findOverlappingQuizTrigger() {
    return this.stageWorld?.quizTriggers?.find((trigger) => this.isPlayerOverTrigger(trigger)) ?? null;
  }

  isPlayerOverTrigger(trigger) {
    if (!this.player?.body || !trigger?.body) {
      return false;
    }

    const playerBounds = this.getBodyBounds(this.player.body);
    const triggerBounds = this.getBodyBounds(trigger.body);

    return Phaser.Geom.Intersects.RectangleToRectangle(playerBounds, triggerBounds);
  }

  getBodyBounds(body) {
    // Phaser 3.90 body.getBounds() expects a target object. Reading the body
    // edges directly is clearer for this simple overlap check.
    return new Phaser.Geom.Rectangle(
      body.left,
      body.top,
      body.right - body.left,
      body.bottom - body.top
    );
  }

  requestQuizOpen(trigger) {
    if (this.isTransitioning || this.quizActive || !trigger?.quizId) {
      return;
    }

    const quiz = this.quizManager?.getQuiz(trigger.quizId);

    if (!quiz) {
      return;
    }

    this.quizActive = true;
    this.quizPrompt.setVisible(false);
    this.playerController?.setEnabled(false);
    this.interactionSystem?.setEnabled(false);
    this.isTransitioning = true;

    // Launch overlay scenes after the current frame's input/update work ends.
    // This prevents update-loop transition recursion and repeated launches.
    this.time.delayedCall(0, () => {
      this.openQuizScene(quiz);
    });
  }

  openQuizScene(quiz) {
    if (!this.sys.isActive() || !this.quizActive) {
      return;
    }

    // The quiz scene emits a close event when the answer flow ends. That keeps
    // the stage scene simple and lets quiz logic live in QuizScene.
    this.game.events.emit('quiz-opened', {
      quiz,
      stageId: this.stageId
    });

    this.scene.launch('QuizScene', {
      quiz,
      stageId: this.stageId
    });
    this.scene.pause();
  }

  createPlayerAnimations() {
    // Create animations once. Phaser keeps animations globally, so scenes can
    // restart without trying to register the same key again.
    if (!this.anims.exists('player_idle')) {
      this.anims.create({
        key: 'player_idle',
        frames: this.anims.generateFrameNumbers('char_tenzing_idle', {
          start: 0,
          end: 3
        }),
        frameRate: 4,
        repeat: -1
      });
    }

    if (!this.anims.exists('player_walk')) {
      this.anims.create({
        key: 'player_walk',
        frames: this.anims.generateFrameNumbers('char_tenzing_walk', {
          start: 0,
          end: 7
        }),
        frameRate: 10,
        repeat: -1
      });
    }

    if (!this.anims.exists('player_jump')) {
      this.anims.create({
        key: 'player_jump',
        frames: this.anims.generateFrameNumbers('char_tenzing_jump', {
          start: 0,
          end: 2
        }),
        frameRate: 6,
        repeat: 0
      });
    }
  }

  setupCamera(worldWidth, gameHeight) {
    // The camera smoothly follows the player with lerp values below 1.
    this.cameras.main.setBounds(0, 0, worldWidth, gameHeight);
    // A deadzone lets the player move slightly before the camera follows,
    // which feels more cinematic and less rigid.
    this.cameras.main.setDeadzone(260, 150);
    this.cameras.main.startFollow(this.player, true, 0.08, 0.08);
    this.cameras.main.setLerp(0.08, 0.08);
  }

  registerInteractionEvents() {
    // Interactions emit events so future DialogueScene or QuizScene can plug in
    // without rewriting NPC detection.
    this.events.on('npc-interacted', this.handleNpcInteracted, this);
  }

  registerSceneEvents() {
    // Shared game events need cleanup so a restarted GameScene does not keep
    // old listeners alive in the background.
    this.game.events.on('quiz-closed', this.handleQuizClosed, this);
    this.game.events.on('dialogue-closed', this.handleDialogueClosed, this);
    this.game.events.on('stage-complete', this.handleStageComplete, this);

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.handleSceneShutdown);
    this.events.once(Phaser.Scenes.Events.DESTROY, this.handleSceneShutdown);
  }

  handleNpcInteracted(interactionData) {
    this.requestDialogueOpen(interactionData);
  }

  requestDialogueOpen(interactionData) {
    if (
      this.isTransitioning ||
      this.dialogueActive ||
      interactionData?.type !== 'npc' ||
      !interactionData.dialogueId
    ) {
      return;
    }

    this.dialogueActive = true;
    // Phaser events keep the scenes decoupled: GameScene only listens for a
    // close event and does not reach into DialogueScene internals.
    this.stopPlayerForDialogue();
    this.interactionSystem?.setEnabled(false);
    this.isTransitioning = true;

    // Defer the launch so update-originated interaction events cannot start a
    // scene inside the same update pass.
    this.time.delayedCall(0, () => {
      this.openDialogueScene(interactionData.dialogueId);
    });
  }

  openDialogueScene(dialogueId) {
    if (!this.sys.isActive() || !this.dialogueActive) {
      return;
    }

    this.game.events.emit('dialogue-opened', {
      dialogueId
    });

    this.scene.launch('DialogueScene', {
      dialogueId
    });
    this.scene.pause();
  }

  handleQuizClosed(payload) {
    if (payload?.stageId !== this.stageId) {
      return;
    }

    if (payload?.correct) {
      this.emitStageComplete();
    }

    this.quizActive = false;
    this.isTransitioning = this.stageTransitionStarted;
    this.activeQuizTrigger = null;
    this.playerController?.setEnabled(true);
    this.interactionSystem?.setEnabled(true);
    this.scene.resume();
  }

  emitStageComplete() {
    const currentStage = this.stageManager.getCurrentStage();
    const currentStageId = currentStage?.id ?? this.stageManager.getCurrentStageId();
    const nextStageId = this.stageManager.getNextStageId();

    console.log('GameScene: current stage', currentStageId);
    console.log('GameScene: next stage', nextStageId);
    console.log('GameScene: emitting stage-complete');

    this.game.events.emit('stage-complete', {
      currentStageId,
      nextStageId
    });
  }

  handleStageComplete() {
    if (this.stageTransitionStarted) {
      return;
    }

    this.stageTransitionStarted = true;
    this.isTransitioning = true;
    this.playerController?.setEnabled(false);
    this.interactionSystem?.setEnabled(false);

    this.cameras.main.once('camerafadeoutcomplete', () => {
      console.log('Transition ready for next stage');
      this.cleanupCurrentStage();

      const nextStageConfig = this.stageManager.advanceToNextStage();

      if (!nextStageConfig) {
        return;
      }

      this.stageId = nextStageConfig.id;
      this.stageTransitionStarted = false;
      this.isTransitioning = false;
      this.buildStage(nextStageConfig);
      this.cameras.main.fadeIn(500);
    });
    this.cameras.main.fadeOut(500);
  }

  handleDialogueClosed(payload) {
    if (!payload?.dialogueId || !this.dialogueActive) {
      return;
    }

    this.dialogueActive = false;
    this.isTransitioning = false;
    this.interactionSystem?.setEnabled(true);
    this.scene.resume();
  }

  handleSceneShutdown() {
    if (this.hasShutdown) {
      return;
    }

    this.hasShutdown = true;
    // Remove shared listeners so a later restart starts from a clean slate.
    this.game.events.off('quiz-closed', this.handleQuizClosed, this);
    this.game.events.off('dialogue-closed', this.handleDialogueClosed, this);
    this.game.events.off('stage-complete', this.handleStageComplete, this);
    this.events.off('npc-interacted', this.handleNpcInteracted, this);
  }

  stopPlayerForDialogue() {
    if (!this.player?.body) {
      return;
    }

    this.player.body.setVelocity(0, 0);
  }
}
