import stages from '../config/stages.js';

// StageManager keeps progression config-driven by reading stage data from
// stages.js instead of embedding stage order rules in scene code.
// Using nextStageId means the order lives in config, not in hardcoded
// "if stage 1 then stage 2" logic.
export default class StageManager {
  constructor(stageConfig = stages) {
    this.stages = stageConfig;
    this.currentStageId = this.stages[0]?.id ?? null;
  }

  getStageById(stageId) {
    const stage = this.stages.find((entry) => entry.id === stageId);

    if (!stage) {
      console.warn(`StageManager: stage not found for id "${stageId}".`);
      return null;
    }

    return stage;
  }

  getCurrentStage() {
    if (!this.currentStageId) {
      return null;
    }

    return this.getStageById(this.currentStageId);
  }

  getCurrentStageId() {
    return this.currentStageId;
  }

  getNextStageId() {
    const currentStage = this.getCurrentStage();

    if (!currentStage || !currentStage.nextStageId) {
      return null;
    }

    const nextStage = this.getStageById(currentStage.nextStageId);
    return nextStage ? nextStage.id : null;
  }

  advanceToNextStage() {
    const nextStageId = this.getNextStageId();

    if (!nextStageId) {
      return null;
    }

    this.currentStageId = nextStageId;
    return this.getCurrentStage();
  }

  reset() {
    this.currentStageId = this.stages[0]?.id ?? null;
    return this.getCurrentStage();
  }

  // Backward-compatible helpers for existing scene code.
  getFirstStage() {
    return this.stages[0] ?? null;
  }

  setActiveStage(stageId) {
    const stage = this.getStageById(stageId);
    if (!stage) {
      return null;
    }
    this.currentStageId = stage.id;
    return this.getCurrentStage();
  }

  getActiveStage() {
    return this.getCurrentStage();
  }
}
