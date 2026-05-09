// Stages are data-driven so the future reusable GameScene can render any stage
// from config instead of hardcoding stage-specific branches.
const stage1GroundY = 648;
const playerGroundY = 696;

const stages = [
  {
    id: 'stage_1_njp',
    displayName: 'NJP Station',
    stageNumber: 1,
    backgroundKey: 'bg_njp',
    backgroundLayers: [],
    worldWidth: 3200,
    npcs: [
      { key: 'inspector', x: 1120, y: stage1GroundY, width: 64, height: 112, dialogueId: 'dialogue_inspector' },
      { key: 'tea_worker', x: 2870, y: stage1GroundY, width: 64, height: 96 }
    ],
    ambientObjects: [
      { key: 'station_entrance', x: 360, y: stage1GroundY, width: 280, height: 190 },
      { key: 'railway_sign_njp', x: 650, y: 540, width: 210, height: 72 },
      { key: 'bench', x: 820, y: stage1GroundY, width: 170, height: 64 },
      { key: 'station_crates', x: 980, y: stage1GroundY, width: 130, height: 86 },
      { key: 'station_clutter', x: 1430, y: stage1GroundY, width: 190, height: 88 },
      { key: 'railway_signal', x: 1860, y: stage1GroundY, width: 80, height: 180 },
      { key: 'chai_stall', x: 2750, y: stage1GroundY, width: 320, height: 240 },
      { key: 'distant_tracks', x: 2260, y: 684, width: 620, height: 42 },
      { key: 'station_crates', x: 2660, y: stage1GroundY, width: 150, height: 92 }
    ],
    platforms: [],
    quizTriggers: [
      {
        key: 'quiz_trigger_njp_chai',
        quizId: 'quiz_njp',
        targetObjectKey: 'chai_stall',
        width: 310,
        height: 220,
        offsetX: 0,
        offsetY: 48
      }
    ],
    fxLayers: [],
    nextStageId: 'stage_2_mirik',
    musicKey: 'mus_njp',
    ambientKey: 'amb_njp'
  },
  {
    id: 'stage_2_mirik',
    displayName: 'Mirik Lake',
    stageNumber: 2,
    backgroundKey: 'bg_mirik',
    backgroundLayers: [],
    worldWidth: 3400,
    npcs: [
      { key: 'boatman', x: 1750, y: stage1GroundY, width: 96, height: 96, dialogueId: 'dialogue_boatman' },
      { key: 'boatman_rowing', x: 2850, y: stage1GroundY, width: 96, height: 96 }
    ],
    ambientObjects: [
      { key: 'boat', x: 2050, y: 560, width: 260, height: 120 },
      { key: 'mirik_tea_stall', x: 3050, y: stage1GroundY, width: 220, height: 260 }
    ],
    platforms: [],
    quizTriggers: [
      { key: 'quiz_trigger_mirik', quizId: 'quiz_mirik', x: 3120, y: playerGroundY, width: 280, height: 200 }
    ],
    fxLayers: ['lake_shimmer'],
    nextStageId: 'stage_3_rohini',
    musicKey: 'mus_mirik',
    ambientKey: 'amb_mirik'
  },
  {
    id: 'stage_3_rohini',
    displayName: 'Rohini Road',
    stageNumber: 3,
    backgroundKey: 'bg_rohini',
    backgroundLayers: [],
    worldWidth: 3600,
    npcs: [
      { key: 'old_traveler', x: 1200, y: stage1GroundY, width: 96, height: 96, dialogueId: 'dialogue_old_traveler' },
      { key: 'old_traveler_basket', x: 2350, y: stage1GroundY, width: 96, height: 96 }
    ],
    ambientObjects: [
      { key: 'prayer_banner', x: 1140, y: 515, width: 340, height: 180 },
      { key: 'direction_sign', x: 2500, y: playerGroundY, width: 140, height: 130 }
    ],
    platforms: [],
    quizTriggers: [
      { key: 'quiz_trigger_rohini', quizId: 'quiz_rohini', x: 2500, y: playerGroundY, width: 260, height: 200 }
    ],
    fxLayers: ['fog', 'light_rays'],
    nextStageId: 'stage_4_darjeeling',
    musicKey: 'mus_rohini',
    ambientKey: 'amb_rohini'
  },
  {
    id: 'stage_4_darjeeling',
    displayName: 'Darjeeling',
    stageNumber: 4,
    backgroundKey: 'bg_darjeeling',
    backgroundLayers: [],
    worldWidth: 4200,
    npcs: [
      { key: 'npc_tea_worker_idle', x: 1450, y: 624, width: 92, height: 128, dialogueId: 'dialogue_darjeeling_tea_worker' },
      { key: 'npc_tea_worker_talk', x: 3150, y: 624, width: 92, height: 128, dialogueId: 'dialogue_darjeeling_tea_worker' }
    ],
    ambientObjects: [
      { key: 'obj_momo_stall', x: 3330, y: 640, width: 240, height: 240 }
    ],
    platforms: [],
    quizTriggers: [
      { key: 'quiz_trigger_darjeeling', quizId: 'quiz_darjeeling_stage4', x: 3360, y: playerGroundY, width: 280, height: 200 }
    ],
    fxLayers: ['fog'],
    nextStageId: 'stage_5_ghoom',
    musicKey: 'mus_darjeeling',
    ambientKey: 'amb_darjeeling'
  },
  {
    id: 'stage_5_ghoom',
    displayName: 'Ghoom Monastery',
    stageNumber: 5,
    backgroundKey: 'bg_ghoom',
    backgroundLayers: [
      { key: 'bg_ghoom_sky', scrollFactor: 0.15 },
      { key: 'bg_ghoom_mountains', scrollFactor: 0.35 },
      { key: 'bg_ghoom_foreground', scrollFactor: 0.7 }
    ],
    worldWidth: 3300,
    npcs: [
      { key: 'monk', x: 900, y: 624, width: 56, height: 96, dialogueId: 'dialogue_monk' }
    ],
    ambientObjects: [
      { key: 'buddha_statue', x: 560, y: 628, width: 140, height: 160 },
      { key: 'prayer_wheel', x: 1360, y: 648, width: 88, height: 120 },
      { key: 'prayer_flags', x: 1900, y: 520, width: 220, height: 72 },
      { key: 'signpost', x: 2640, y: 648, width: 72, height: 120 }
    ],
    platforms: [
      { x: 720, y: 540, width: 220, height: 28 },
      { x: 1160, y: 455, width: 180, height: 28 },
      { x: 1700, y: 520, width: 240, height: 28 },
      { x: 2360, y: 465, width: 220, height: 28 }
    ],
    quizTriggers: [
      { key: 'quiz_trigger_ghoom', quizId: 'quiz_ghoom', x: 1360, y: 696, width: 240, height: 200 }
    ],
    fxLayers: ['fog', 'light_rays'],
    nextStageId: 'stage_6_sandakphu_trail',
    musicKey: 'mus_ghoom',
    ambientKey: 'amb_ghoom'
  },
  {
    id: 'stage_6_sandakphu_trail',
    displayName: 'Sandakphu Trail',
    stageNumber: 6,
    backgroundKey: 'bg_sandakphu_trail',
    backgroundLayers: [
      { key: 'bg_sandakphu_trail_sky', scrollFactor: 0.15 },
      { key: 'bg_sandakphu_trail_mountains', scrollFactor: 0.35 },
      { key: 'bg_sandakphu_trail_foreground', scrollFactor: 0.7 }
    ],
    worldWidth: 3600,
    npcs: [
      { key: 'guide', x: 860, y: 624, width: 56, height: 96, dialogueId: 'dialogue_guide_trail' }
    ],
    ambientObjects: [
      { key: 'bridge', x: 680, y: 660, width: 260, height: 80 },
      { key: 'prayer_flags', x: 1480, y: 520, width: 220, height: 72 },
      { key: 'signpost', x: 2320, y: 648, width: 72, height: 120 },
      { key: 'prayer_wheel', x: 3040, y: 648, width: 88, height: 120 }
    ],
    platforms: [
      { x: 820, y: 535, width: 230, height: 28 },
      { x: 1360, y: 450, width: 190, height: 28 },
      { x: 1980, y: 520, width: 240, height: 28 },
      { x: 2720, y: 455, width: 220, height: 28 }
    ],
    quizTriggers: [
      { key: 'quiz_trigger_sandakphu_trail', quizId: 'quiz_sandakphu_trail', x: 2320, y: 696, width: 260, height: 200 }
    ],
    fxLayers: ['fog', 'snow'],
    nextStageId: 'stage_7_sandakphu_summit',
    musicKey: 'mus_sandakphu_trail',
    ambientKey: 'amb_sandakphu_trail'
  },
  {
    id: 'stage_7_sandakphu_summit',
    displayName: 'Sandakphu Summit',
    stageNumber: 7,
    backgroundKey: 'bg_sandakphu_summit',
    backgroundLayers: [
      { key: 'bg_sandakphu_summit_sky', scrollFactor: 0.15 },
      { key: 'bg_sandakphu_summit_mountains', scrollFactor: 0.35 },
      { key: 'bg_sandakphu_summit_foreground', scrollFactor: 0.7 }
    ],
    worldWidth: 3200,
    npcs: [
      { key: 'guide', x: 800, y: 624, width: 56, height: 96, dialogueId: 'dialogue_guide_summit' }
    ],
    ambientObjects: [
      { key: 'prayer_flags', x: 720, y: 520, width: 220, height: 72 },
      { key: 'signpost', x: 1680, y: 648, width: 72, height: 120 },
      { key: 'buddha_statue', x: 2500, y: 628, width: 140, height: 160 }
    ],
    platforms: [
      { x: 760, y: 535, width: 220, height: 28 },
      { x: 1220, y: 455, width: 180, height: 28 },
      { x: 1780, y: 520, width: 240, height: 28 },
      { x: 2440, y: 465, width: 220, height: 28 }
    ],
    quizTriggers: [
      { key: 'quiz_trigger_sandakphu_summit', quizId: 'quiz_sandakphu_summit', x: 1680, y: 696, width: 260, height: 200 }
    ],
    fxLayers: ['snow', 'light_rays'],
    nextStageId: null,
    musicKey: 'mus_sandakphu_summit',
    ambientKey: 'amb_sandakphu_summit'
  }
];

export default stages;
