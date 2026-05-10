import ParallaxBackground from './ParallaxBackground.js';

// WorldBuilder creates stage visuals from config so GameScene stays reusable.
// Adding or moving world objects should be a data change in stages.js.
export default class WorldBuilder {
  constructor(scene) {
    this.scene = scene;
    this.parallaxBackground = new ParallaxBackground(scene);
    this.generatedForegroundKeys = new Set([
      'bench',
      'station_crates',
      'railway_signal',
      'chai_stall'
    ]);
  }

  build(stageConfig, gameHeight) {
    this.createBackground(stageConfig, gameHeight);
    this.createNpcAnimations();
    const ambientObjects = this.createAmbientObjects(stageConfig.ambientObjects ?? [], stageConfig);
    const npcs = this.createNpcPlaceholders(stageConfig.npcs ?? []);
    const quizTriggers = this.createQuizTriggers(stageConfig.quizTriggers ?? [], ambientObjects);
    const platforms = this.createPlatforms(stageConfig.platforms ?? []);
    this.createStageLabel(stageConfig.displayName);

    return {
      ambientObjects,
      npcs,
      quizTriggers,
      platforms,
      parallaxBackground: this.parallaxBackground
    };
  }

  createBackground(stageConfig, gameHeight) {
    if (stageConfig.backgroundLayers?.length > 0) {
      this.parallaxBackground.build(stageConfig.backgroundLayers, stageConfig.worldWidth, gameHeight);
      return null;
    }

    if (!this.scene.textures.exists(stageConfig.backgroundKey)) {
      console.warn(`WorldBuilder: missing background texture "${stageConfig.backgroundKey}".`);
      // This warm fallback keeps early layouts playable even before final art
      // files exist in the asset manifest.
      return this.scene.add.rectangle(
        stageConfig.worldWidth / 2,
        gameHeight / 2,
        stageConfig.worldWidth,
        gameHeight,
        0xd7a15f
      )
        .setDepth(0);
    }

    return this.scene.add
      .image(0, 0, stageConfig.backgroundKey)
      .setOrigin(0)
      .setDisplaySize(stageConfig.worldWidth, gameHeight)
      .setDepth(0);
  }

  createPlatforms(platforms) {
    // Platforms are temporary static terrain pieces for traversal testing.
    // Static bodies do not move, which makes them stable ground.
    return platforms.map((platformConfig) => {
      const platform = this.scene.add
        .rectangle(
          platformConfig.x,
          platformConfig.y,
          platformConfig.width,
          platformConfig.height,
          0x5b8f55
        )
        .setOrigin(0.5);

      this.scene.physics.add.existing(platform, true);

      return platform;
    });
  }

  createAmbientObjects(objects, stageConfig) {
    // Ambient objects are decorative only. They deliberately do not receive
    // Arcade Physics bodies, so the player can walk past station props.
    return objects
      .filter((objectConfig) => this.shouldRenderAmbientObject(objectConfig, stageConfig))
      .map((objectConfig) => {
        const ambientObject = this.createVisualObject(objectConfig, 0xd9a441);

        // Depth 1 keeps decorative station props above the background but
        // below gameplay characters.
        ambientObject.setDepth(1);
        ambientObject.setData('configKey', objectConfig.key);

        return ambientObject;
      });
  }

  createQuizTriggers(triggerConfigs, ambientObjects) {
    // Quiz triggers are invisible Arcade bodies. Their position and size come
    // from stages.js, so future stages can tune them without changing code.
    return triggerConfigs
      .map((triggerConfig) => this.createQuizTrigger(triggerConfig, ambientObjects))
      .filter(Boolean);
  }

  createQuizTrigger(triggerConfig, ambientObjects) {
    const anchor = this.resolveTriggerAnchor(triggerConfig, ambientObjects);
    const triggerWidth = triggerConfig.width;
    const triggerHeight = triggerConfig.height;

    if (!anchor || !triggerConfig.quizId || !triggerWidth || !triggerHeight) {
      console.warn(`WorldBuilder: invalid quiz trigger "${triggerConfig.key ?? 'unknown'}".`);
      return null;
    }

    const trigger = this.scene.add.zone(anchor.x, anchor.y, triggerWidth, triggerHeight)
      .setOrigin(0.5, 1);

    // The trigger is invisible; only the overlap matters.
    this.scene.physics.add.existing(trigger, true);
    // Zones need an explicit body size so Arcade overlap matches the configured
    // rectangle exactly.
    trigger.body.setSize(triggerWidth, triggerHeight);
    trigger.body.updateFromGameObject();
    trigger.setData('type', 'quizTrigger');
    trigger.setData('quizId', triggerConfig.quizId);
    trigger.setData('key', triggerConfig.key);
    trigger.quizId = triggerConfig.quizId;
    trigger.setDepth(1);

    return trigger;
  }

  resolveTriggerAnchor(triggerConfig, ambientObjects) {
    if (Number.isFinite(triggerConfig.x) && Number.isFinite(triggerConfig.y)) {
      return {
        x: triggerConfig.x,
        y: triggerConfig.y
      };
    }

    const target = ambientObjects.find((object) => object.getData?.('configKey') === triggerConfig.targetObjectKey);

    if (!target) {
      return null;
    }

    return {
      x: target.x + (triggerConfig.offsetX ?? 0),
      y: target.y + (triggerConfig.offsetY ?? 0),
      width: target.displayWidth,
      height: target.displayHeight
    };
  }

  shouldRenderAmbientObject(objectConfig, stageConfig) {
    // Rendering is data-driven: if an object is listed in the stage config, it
    // should appear unless a later config flag explicitly disables it.
    return objectConfig.visible !== false;
  }

  createNpcPlaceholders(npcs) {
    // NPC placeholders use static Arcade Physics bodies. Static bodies stay in
    // place and are a good fit for characters who only need to be detected.
    return npcs.map((npcConfig) => {
      if (npcConfig.key === 'inspector' && this.scene.textures.exists('npc_inspector')) {
        return this.createInspectorNpc(npcConfig);
      }

      if ((npcConfig.key.startsWith('npc_tea_worker') || npcConfig.key.startsWith('npc_monk')) && (this.scene.textures.exists(npcConfig.key) || this.scene.textures.exists(`${npcConfig.key}_idle`))) {
        return this.createTeaWorkerNpc(npcConfig);
      }

      return this.createGenericNpc(npcConfig);
    });
  }

  createGenericNpc(npcConfig) {
    const textureKey = this.resolveNpcTextureKey(npcConfig);
    const animationKey = this.resolveNpcAnimationKey(npcConfig);

    console.log('NPC placeholder object type', {
      key: npcConfig.key,
      textureKey,
      objectType: 'StaticSprite'
    });

    const npc = this.scene.physics.add.staticSprite(npcConfig.x, npcConfig.y + 8, textureKey);

    npc.setOrigin(0.5, 1);
    npc.setDisplaySize(npcConfig.width, npcConfig.height);
    npc.refreshBody();
    this.configureNpcInteraction(npc, npcConfig);
    this.playNpcIdleAnimation(npc, animationKey);

    return npc;
  }

  resolveNpcTextureKey(npcConfig) {
    if (this.scene.textures.exists(npcConfig.key)) {
      return npcConfig.key;
    }

    if (npcConfig.key === 'npc_monk' && this.scene.textures.exists('npc_monk_idle')) {
      return 'npc_monk_idle';
    }

    return this.createGeneratedNpcTexture(npcConfig);
  }

  resolveNpcAnimationKey(npcConfig) {
    if (npcConfig.key === 'npc_inspector' || 
        npcConfig.key === 'npc_tea_worker_idle' || 
        npcConfig.key === 'npc_tea_worker_talk' ||
        npcConfig.key === 'npc_monk_idle' ||
        npcConfig.key === 'npc_monk_talk' ||
        npcConfig.key === 'npc_mountain_guide_idle' ||
        npcConfig.key === 'npc_mountain_guide_talk') {
      return npcConfig.key;
    }

    if (npcConfig.key === 'npc_monk') {
      return 'npc_monk_idle';
    }

    return `${npcConfig.key}_idle`;
  }

  createGeneratedNpcTexture(npcConfig) {
    const textureKey = `generated_npc_${npcConfig.key}`;

    if (this.scene.textures.exists(textureKey)) {
      return textureKey;
    }

    const graphics = this.scene.add.graphics();
    const width = Math.max(npcConfig.width, 1);
    const height = Math.max(npcConfig.height, 1);
    const bodyWidth = width * 0.5;
    const centerX = width / 2;
    const bottomY = height;

    graphics.fillStyle(0xd9a066, 1);
    graphics.fillCircle(centerX, height * 0.2, width * 0.2);
    graphics.fillStyle(0x5f6cff, 1);
    graphics.fillRoundedRect(centerX - bodyWidth / 2, height * 0.34, bodyWidth, height * 0.38, 4);
    graphics.fillStyle(0x253047, 1);
    graphics.fillRect(centerX - bodyWidth * 0.38, height * 0.7, bodyWidth * 0.28, height * 0.25);
    graphics.fillRect(centerX + bodyWidth * 0.1, height * 0.7, bodyWidth * 0.28, height * 0.25);
    graphics.fillStyle(0x1a1a1a, 1);
    graphics.fillRect(centerX - bodyWidth * 0.45, bottomY - 8, bodyWidth * 0.32, 8);
    graphics.fillRect(centerX + bodyWidth * 0.13, bottomY - 8, bodyWidth * 0.32, 8);

    graphics.generateTexture(textureKey, width, height);
    graphics.destroy();

    return textureKey;
  }

  createNpcAnimations() {
    // Animations are registered once. Phaser shares animation keys across
    // scenes, so this guard prevents duplicate-key warnings on scene restart.
    this.createNpcIdleAnimation('npc_inspector', 'npc_inspector_idle');
    this.createNpcIdleAnimation('tea_worker', 'tea_worker_idle', 0);
    this.createNpcIdleAnimation('npc_tea_worker_idle', 'npc_tea_worker_idle', 3);
    this.createNpcIdleAnimation('npc_tea_worker_talk', 'npc_tea_worker_talk', 3);
    this.createNpcIdleAnimation('boatman', 'boatman_idle');
    this.createNpcIdleAnimation('boatman_rowing', 'boatman_rowing_idle');
    this.createNpcIdleAnimation('old_traveler', 'old_traveler_idle');
    this.createNpcIdleAnimation('old_traveler_basket', 'old_traveler_basket_idle');
    this.createNpcIdleAnimation('npc_monk_idle', 'npc_monk_idle', 3);
    this.createNpcIdleAnimation('npc_monk_talk', 'npc_monk_talk', 3);
    this.createNpcIdleAnimation('npc_mountain_guide_idle', 'npc_mountain_guide_idle', 3);
    this.createNpcIdleAnimation('npc_mountain_guide_talk', 'npc_mountain_guide_talk', 3);
  }

  createNpcIdleAnimation(textureKey, animationKey, endFrame = 3) {
    if (!this.scene.textures.exists(textureKey) || this.scene.anims.exists(animationKey)) {
      return;
    }

    this.scene.anims.create({
      key: animationKey,
      frames: this.scene.anims.generateFrameNumbers(textureKey, {
        start: 0,
        end: endFrame
      }),
      frameRate: 3,
      repeat: -1
    });
  }

  createInspectorNpc(npcConfig) {
    // NPC placement and dialogue data come from stages.js. The sprite art is
    // chosen here so config can stay focused on level layout.
    // A small downward offset keeps the inspector's feet planted on the
    // ground instead of hovering a few pixels above it.
    const npc = this.scene.physics.add.staticSprite(npcConfig.x, npcConfig.y + 8, 'npc_inspector');

    npc.setOrigin(0.5, 1);
    npc.setDisplaySize(npcConfig.width, npcConfig.height);
    npc.refreshBody();
    // Inspector sits above the player and decorative props, which keeps the
    // NPC readable during gameplay and interactions.
    this.configureNpcInteraction(npc, npcConfig);
    npc.anims.play('npc_inspector_idle');

    return npc;
  }

  createTeaWorkerNpc(npcConfig) {
    const textureKey = this.resolveNpcTextureKey(npcConfig);
    const npc = this.scene.physics.add.sprite(npcConfig.x, npcConfig.y + 8, textureKey);

    npc.setOrigin(0.5, 1);
    npc.setDisplaySize(npcConfig.width, npcConfig.height);
    npc.setImmovable(true);
    npc.body.setAllowGravity(false);
    this.configureNpcInteraction(npc, npcConfig);
    this.playNpcIdleAnimation(npc, npcConfig.key);

    return npc;
  }

  configureNpcInteraction(npc, npcConfig) {
    npc.setDepth(11);
    npc.setData('type', 'npc');
    npc.setData('dialogueId', npcConfig.dialogueId);
    npc.type = 'npc';
    npc.dialogueId = npcConfig.dialogueId;
    npc.interaction = {
      type: npc.type,
      key: npcConfig.key,
      dialogueId: npc.dialogueId,
      range: npcConfig.interactionRange ?? 120
    };
  }

  playNpcIdleAnimation(npc, animationKey) {
    if (!this.scene.anims.exists(animationKey)) {
      return;
    }

    npc.anims.play(animationKey);
  }

  createVisualObject(config, fallbackColor) {
    if (this.scene.textures.exists(config.key)) {
      // Real art uses the same x/y/width/height values as placeholders, so
      // layout tuning can happen entirely in stages.js.
      return this.scene.add
        .image(config.x, config.y, config.key)
        .setOrigin(0.5, 1)
        .setDisplaySize(config.width, config.height);
    }

    if (this.generatedForegroundKeys.has(config.key)) {
      return this.createGeneratedForegroundImage(config);
    }

    console.warn(`WorldBuilder: missing texture "${config.key}". Using placeholder.`);

    return this.createPlaceholderObject(config, fallbackColor);
  }

  createGeneratedForegroundImage(config) {
    const textureKey = `generated_${config.key}`;

    if (!this.scene.textures.exists(textureKey)) {
      this.generateForegroundTexture(textureKey, config);
    }

    // setOrigin(0.5, 1) pins the bottom center of the prop to its configured
    // x/y point, which keeps benches, crates, signals, and stalls grounded.
    return this.scene.add
      .image(config.x, config.y, textureKey)
      .setOrigin(0.5, 1)
      .setDisplaySize(config.width, config.height)
      .setDepth(1);
  }

  generateForegroundTexture(textureKey, config) {
    // These lightweight generated textures stand in for final object art while
    // still letting the stage render with regular this.add.image() calls.
    const graphics = this.scene.add.graphics();
    const width = Math.max(config.width, 1);
    const height = Math.max(config.height, 1);

    graphics.clear();

    switch (config.key) {
      case 'bench':
        this.drawBenchTexture(graphics, width, height);
        break;
      case 'station_crates':
        this.drawCratesTexture(graphics, width, height);
        break;
      case 'railway_signal':
        this.drawRailwaySignalTexture(graphics, width, height);
        break;
      case 'chai_stall':
        this.drawChaiStallTexture(graphics, width, height);
        break;
      default:
        this.drawGenericForegroundTexture(graphics, width, height);
        break;
    }

    graphics.generateTexture(textureKey, width, height);
    graphics.destroy();
  }

  createPlaceholderObject(config, fallbackColor) {
    // A container lets us build game-like placeholder props from basic shapes.
    // The container's x/y still comes from stages.js, so placement remains
    // data-driven even while art is temporary.
    const placeholder = this.scene.add.container(config.x, config.y);

    placeholder.setSize(config.width, config.height);

    switch (config.key) {
      case 'inspector':
        this.buildInspectorPlaceholder(placeholder, config);
        break;
      case 'station_entrance':
        this.buildStationEntrancePlaceholder(placeholder, config);
        break;
      case 'railway_sign_njp':
        this.buildRailwaySignPlaceholder(placeholder, config);
        break;
      case 'bench':
        this.buildBenchPlaceholder(placeholder, config);
        break;
      case 'station_crates':
        this.buildCratesPlaceholder(placeholder, config);
        break;
      case 'station_clutter':
        this.buildStationClutterPlaceholder(placeholder, config);
        break;
      case 'railway_signal':
        this.buildRailwaySignalPlaceholder(placeholder, config);
        break;
      case 'distant_tracks':
        this.buildTracksPlaceholder(placeholder, config);
        break;
      case 'chai_stall':
        this.buildChaiStallPlaceholder(placeholder, config);
        break;
      default:
        this.buildGenericPlaceholder(placeholder, config, fallbackColor);
        break;
    }

    return placeholder;
  }

  addRect(parent, x, y, width, height, color, alpha = 1) {
    const rect = this.scene.add.rectangle(x, y, width, height, color, alpha);

    parent.add(rect);

    return rect;
  }

  addCircle(parent, x, y, radius, color, alpha = 1) {
    const circle = this.scene.add.circle(x, y, radius, color, alpha);

    parent.add(circle);

    return circle;
  }

  addLabel(parent, text, x, y, fontSize = '14px') {
    const label = this.scene.add
      .text(x, y, text, {
        fontFamily: 'Arial, sans-serif',
        fontSize,
        color: '#2d1a0d'
      })
      .setOrigin(0.5);

    parent.add(label);

    return label;
  }

  drawBenchTexture(graphics, width, height) {
    const seatY = height * 0.55;
    const backY = height * 0.25;
    const legTop = height * 0.58;

    graphics.fillStyle(0x7a4926, 1);
    graphics.fillRoundedRect(width * 0.06, seatY, width * 0.88, height * 0.16, 4);
    graphics.fillStyle(0x9d6337, 1);
    graphics.fillRoundedRect(width * 0.1, backY, width * 0.8, height * 0.16, 4);
    graphics.fillStyle(0x3f2b1f, 1);
    graphics.fillRect(width * 0.18, legTop, width * 0.08, height * 0.36);
    graphics.fillRect(width * 0.74, legTop, width * 0.08, height * 0.36);
  }

  drawCratesTexture(graphics, width, height) {
    const leftCrate = {
      x: width * 0.08,
      y: height * 0.35,
      width: width * 0.42,
      height: height * 0.55
    };
    const rightCrate = {
      x: width * 0.46,
      y: height * 0.18,
      width: width * 0.46,
      height: height * 0.72
    };

    this.drawCrate(graphics, leftCrate, 0x9d6337);
    this.drawCrate(graphics, rightCrate, 0x7b4a28);
  }

  drawCrate(graphics, crate, color) {
    graphics.fillStyle(color, 1);
    graphics.fillRect(crate.x, crate.y, crate.width, crate.height);
    graphics.lineStyle(4, 0xbf7b42, 1);
    graphics.strokeRect(crate.x + 2, crate.y + 2, crate.width - 4, crate.height - 4);
    graphics.lineBetween(crate.x + 6, crate.y + 6, crate.x + crate.width - 6, crate.y + crate.height - 6);
    graphics.lineBetween(crate.x + crate.width - 6, crate.y + 6, crate.x + 6, crate.y + crate.height - 6);
  }

  drawRailwaySignalTexture(graphics, width, height) {
    const poleWidth = width * 0.16;
    const boxWidth = width * 0.7;
    const boxHeight = height * 0.48;
    const boxX = (width - boxWidth) / 2;
    const boxY = height * 0.08;
    const lightRadius = Math.min(width, height) * 0.13;
    const centerX = width / 2;

    graphics.fillStyle(0x3f3f3f, 1);
    graphics.fillRect(centerX - poleWidth / 2, height * 0.1, poleWidth, height * 0.9);
    graphics.fillStyle(0x263238, 1);
    graphics.fillRoundedRect(boxX, boxY, boxWidth, boxHeight, 6);
    graphics.fillStyle(0xc94c3f, 1);
    graphics.fillCircle(centerX, boxY + boxHeight * 0.22, lightRadius);
    graphics.fillStyle(0xe0b84a, 1);
    graphics.fillCircle(centerX, boxY + boxHeight * 0.5, lightRadius);
    graphics.fillStyle(0x5aa469, 1);
    graphics.fillCircle(centerX, boxY + boxHeight * 0.78, lightRadius);
  }

  drawChaiStallTexture(graphics, width, height) {
    graphics.fillStyle(0x8c2f24, 1);
    graphics.fillRoundedRect(width * 0.02, height * 0.05, width * 0.96, height * 0.24, 6);
    graphics.fillStyle(0xc8793f, 1);
    graphics.fillRect(width * 0.08, height * 0.28, width * 0.84, height * 0.62);
    graphics.fillStyle(0x3b2418, 1);
    graphics.fillRect(width * 0.16, height * 0.5, width * 0.22, height * 0.4);
    graphics.fillStyle(0xf3cc75, 1);
    graphics.fillRoundedRect(width * 0.52, height * 0.48, width * 0.32, height * 0.18, 4);
    graphics.lineStyle(3, 0x7a3f25, 1);
    graphics.strokeRect(width * 0.08, height * 0.28, width * 0.84, height * 0.62);
  }

  drawGenericForegroundTexture(graphics, width, height) {
    graphics.fillStyle(0xd9a441, 1);
    graphics.fillRoundedRect(0, 0, width, height, 6);
  }

  buildInspectorPlaceholder(parent, config) {
    const bottom = 0;
    const bodyWidth = config.width * 0.52;

    this.addCircle(parent, 0, -config.height + 18, 16, 0xd9a066);
    this.addRect(parent, 0, -config.height + 3, 42, 10, 0x26334f);
    this.addRect(parent, 0, -config.height + 36, bodyWidth, 44, 0x2f4f6f);
    this.addRect(parent, 0, -config.height + 43, bodyWidth * 0.82, 9, 0xf1c04d);
    this.addRect(parent, -11, -34, 10, 44, 0x253047);
    this.addRect(parent, 11, -34, 10, 44, 0x253047);
    this.addRect(parent, -14, bottom - 5, 15, 10, 0x1a1a1a);
    this.addRect(parent, 14, bottom - 5, 15, 10, 0x1a1a1a);
  }

  buildStationEntrancePlaceholder(parent, config) {
    this.addRect(parent, 0, -config.height / 2, config.width, config.height, 0xb85f32);
    this.addRect(parent, 0, -config.height + 24, config.width + 38, 48, 0x7a3f25);
    this.addRect(parent, 0, -70, config.width * 0.42, 140, 0x3d2a1e);
    this.addLabel(parent, 'NJP', 0, -config.height + 42, '22px');
  }

  buildRailwaySignPlaceholder(parent, config) {
    this.addRect(parent, 0, -config.height / 2, config.width, config.height, 0xf0c15a);
    this.addRect(parent, 0, -config.height / 2, config.width - 16, config.height - 16, 0x203d4a);
    this.addLabel(parent, 'NEW JALPAIGURI', 0, -config.height / 2, '15px');
    this.addRect(parent, -config.width * 0.35, 16, 12, 64, 0x5b3a22);
    this.addRect(parent, config.width * 0.35, 16, 12, 64, 0x5b3a22);
  }

  buildBenchPlaceholder(parent, config) {
    this.addRect(parent, 0, -42, config.width, 16, 0x7a4926);
    this.addRect(parent, 0, -70, config.width * 0.92, 18, 0x9d6337);
    this.addRect(parent, -config.width * 0.35, -16, 12, 34, 0x3f2b1f);
    this.addRect(parent, config.width * 0.35, -16, 12, 34, 0x3f2b1f);
  }

  buildCratesPlaceholder(parent, config) {
    this.addRect(parent, -32, -34, 58, 58, 0x9d6337);
    this.addRect(parent, 24, -43, 66, 76, 0x7b4a28);
    this.addRect(parent, 24, -43, 50, 6, 0xbf7b42);
    this.addRect(parent, -32, -34, 44, 6, 0xbf7b42);
  }

  buildStationClutterPlaceholder(parent, config) {
    this.addRect(parent, -58, -28, 62, 56, 0x70543a);
    this.addRect(parent, 12, -22, 72, 44, 0x8e6f4b);
    this.addCircle(parent, 70, -24, 22, 0x384b55);
    this.addRect(parent, 70, -8, 44, 12, 0x24323a);
  }

  buildRailwaySignalPlaceholder(parent, config) {
    this.addRect(parent, 0, -config.height / 2, 14, config.height, 0x3f3f3f);
    this.addRect(parent, 0, -config.height + 34, 56, 86, 0x263238);
    this.addCircle(parent, 0, -config.height + 14, 13, 0xc94c3f);
    this.addCircle(parent, 0, -config.height + 42, 13, 0xe0b84a);
    this.addCircle(parent, 0, -config.height + 70, 13, 0x5aa469);
  }

  buildTracksPlaceholder(parent, config) {
    this.addRect(parent, 0, -32, config.width, 8, 0x5a4a3c);
    this.addRect(parent, 0, -10, config.width, 8, 0x5a4a3c);

    for (let x = -config.width / 2 + 32; x < config.width / 2; x += 64) {
      this.addRect(parent, x, -21, 12, 38, 0x8a623d);
    }
  }

  buildChaiStallPlaceholder(parent, config) {
    this.addRect(parent, 0, -56, config.width, 112, 0xc8793f);
    this.addRect(parent, 0, -config.height + 20, config.width + 28, 40, 0x8c2f24);
    this.addRect(parent, -config.width * 0.28, -50, 42, 44, 0x3b2418);
    this.addRect(parent, config.width * 0.22, -48, 70, 34, 0xf3cc75);
    this.addLabel(parent, 'CHAI', config.width * 0.22, -49, '16px');
  }

  buildGenericPlaceholder(parent, config, fallbackColor) {
    this.addRect(parent, 0, -config.height / 2, config.width, config.height, fallbackColor);
    this.addLabel(parent, config.key, 0, -config.height / 2, '14px');
  }

  createStageLabel(displayName) {
    return this.scene.add
      .text(24, 24, displayName, {
        fontFamily: 'Arial, sans-serif',
        fontSize: '24px',
        color: '#ffffff',
        backgroundColor: '#000000'
      })
      .setScrollFactor(0)
      // UI labels sit above gameplay layers and do not affect world ordering.
      .setDepth(100);
  }
}
