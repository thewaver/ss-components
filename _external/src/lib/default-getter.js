import { point } from "./point-utils";
import { DEFAULTS } from "../lib/const";

export const DefaultGetter = {
  startTime: (keyframe) => {
    return (keyframe && keyframe.startTime) || 0;
  },

  backgroundImage: (keyframe) => {
    return (
      (keyframe && keyframe.pattern && keyframe.pattern.backgroundImage) || ""
    );
  },

  cellCount: (keyframe) => {
    return point(
      (keyframe &&
        keyframe.pattern &&
        keyframe.pattern.cellCount &&
        keyframe.pattern.cellCount.x) ||
        DEFAULTS.PATTERN.CELL_COUNT.COLS,
      (keyframe &&
        keyframe.pattern &&
        keyframe.pattern.cellCount &&
        keyframe.pattern.cellCount.y) ||
        DEFAULTS.PATTERN.CELL_COUNT.ROWS
    );
  },

  weightFunc: (keyframe) => {
    return (
      (keyframe && keyframe.pattern && keyframe.pattern.weightFunc) ||
      DEFAULTS.PATTERN.WEIGHT_FUNC
    );
  },

  originFunc: (keyframe) => {
    return (
      (keyframe && keyframe.pattern && keyframe.pattern.originFunc) ||
      DEFAULTS.PATTERN.ORIGIN_FUNC
    );
  },

  invertWeights: (keyframe) => {
    return keyframe && keyframe.pattern && keyframe.pattern.invertWeights;
  },

  uniqueWeights: (keyframe) => {
    return keyframe && keyframe.pattern && keyframe.pattern.uniqueWeights;
  },

  normalizeWeights: (keyframe) => {
    return keyframe && keyframe.pattern && keyframe.pattern.normalizeWeights;
  },

  animationName: (keyframe) => {
    return (
      (keyframe && keyframe.animation && keyframe.animation.name) ||
      DEFAULTS.ANIMATION.NAME
    );
  },

  animationDuration: (keyframe) => {
    return (
      (keyframe && keyframe.animation && keyframe.animation.duration) ||
      DEFAULTS.ANIMATION.DURATION
    );
  },

  animationDelay: (keyframe) => {
    return (
      (keyframe && keyframe.animation && keyframe.animation.delay) ||
      DEFAULTS.ANIMATION.DELAY
    );
  },

  animationTimingFunction: (keyframe) => {
    return (
      (keyframe && keyframe.animation && keyframe.animation.timingFunction) ||
      DEFAULTS.ANIMATION.TIMING_FUNCTION
    );
  },

  animationReverse: (keyframe) => {
    return keyframe && keyframe.animation && keyframe.animation.reverse;
  },
};
