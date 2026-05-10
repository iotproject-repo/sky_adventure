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
      { key: 'inspector', x: 1620, y: 663, width: 64, height: 112, dialogueId: 'dialogue_inspector' },
      { key: 'tea_worker', x: 2485, y: 659, width: 64, height: 96 }
    ],
    ambientObjects: [
      { key: 'station_entrance', x: 360, y: stage1GroundY, width: 280, height: 190 },
      { key: 'railway_sign_njp', x: 650, y: 540, width: 210, height: 72 },
      { key: 'bench', x: 820, y: stage1GroundY, width: 170, height: 64 },
      { key: 'station_crates', x: 980, y: stage1GroundY, width: 130, height: 86 },
      { key: 'station_crates', x: 1111, y: 655, width: 130, height: 86 },
      { key: 'station_clutter', x: 1430, y: stage1GroundY, width: 190, height: 88 },
      { key: 'railway_signal', x: 1860, y: stage1GroundY, width: 80, height: 180 },
      { key: 'chai_stall', x: 2581, y: 688, width: 320, height: 240 },
      { key: 'distant_tracks', x: 2260, y: 684, width: 620, height: 42 },
      { key: 'station_crates', x: 2276, y: 659, width: 150, height: 92 }
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
      { key: 'boatman', x: 2346, y: 598, width: 96, height: 96, dialogueId: 'dialogue_boatman' },
      { key: 'boatman_rowing', x: 2954, y: 638, width: 96, height: 96 }
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
      { key: 'old_traveler', x: 1176, y: 616, width: 96, height: 96, dialogueId: 'dialogue_old_traveler' },
      { key: 'old_traveler_basket', x: 2574, y: 618, width: 96, height: 96 }
    ],
    ambientObjects: [
      { key: 'prayer_banner', x: 1098, y: 588, width: 340, height: 180 },
      { key: 'direction_sign', x: 2778, y: 600, width: 140, height: 130 }
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
      { key: 'npc_tea_worker_talk', x: 3150, y: 624, width: 92, height: 128 }
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
    backgroundLayers: [],
    worldWidth: 2200,
    npcs: [
      { key: 'npc_monk_idle', x: 880, y: 602, width: 64, height: 96, dialogueId: 'dialogue_monk_stage5' },
      { key: 'npc_monk_idle', x: 1582, y: 613, width: 64, height: 96 }
    ],
    ambientObjects: [
      { key: 'obj_prayer_wheel', x: 1220, y: 500, width: 88, height: 120 },
      { key: 'obj_prayer_wheel', x: 1360, y: 500, width: 88, height: 120 },
      { key: 'obj_prayer_wheel', x: 1500, y: 500, width: 88, height: 120 },
      { key: 'obj_buddha_statue', x: 1000, y: 597, width: 140, height: 160 },
      { key: 'obj_momo_stall', x: 1993, y: 626, width: 240, height: 240 }
    ],
    platforms: [],
    quizTriggers: [
      {
        key: 'quiz_trigger_ghoom_momo',
        quizId: 'quiz_ghoom_stage5',
        targetObjectKey: 'obj_momo_stall',
        width: 280,
        height: 200,
        offsetX: 0,
        offsetY: 0
      }
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
    backgroundLayers: [],
    worldWidth: 2600,
    npcs: [
      {
        key: 'npc_mountain_guide_idle',
        x: 1244,
        y: 621,
        width: 64,
        height: 96,
        dialogueId: 'dialogue_guide_trail'
      }
    ],
    ambientObjects: [],
    platforms: [],
    quizTriggers: [
      {
        key: 'quiz_trigger_sandakphu_trail',
        quizId: 'quiz_sandakphu_trail',
        x: 2100,
        y: 580,
        width: 200,
        height: 200
      }
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
    backgroundLayers: [],
    worldWidth: 2400,
    npcs: [
      {
        key: 'npc_wise_traveler_idle',
        x: 1196,
        y: 643,
        width: 64,
        height: 96,
        dialogueId: 'DIALOG_STAGE_7_SUMMIT'
      }
    ],
    ambientObjects: [],
    platforms: [],
    quizTriggers: [
      {
        key: 'quiz_trigger_summit_signpost',
        quizId: 'FINAL_CHALLENGE',
        x: 2150,
        y: 560,
        width: 200,
        height: 200
      }
    ],
    fxLayers: ['fog', 'snow', 'light_rays'],
    nextStageId: null,
    musicKey: 'mus_sandakphu_summit',
    ambientKey: null
  }
];

export default stages;
