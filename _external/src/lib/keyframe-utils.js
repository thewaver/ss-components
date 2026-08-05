import { getRandomValue } from "./utils";
import { AnimNames } from "./animation-utils";
import { DefaultGetter as DG } from "./default-getter";
import { OriginFunc } from "./origin-func";
import { WeightFunc } from "./weight-func";

export const getRandomKeyframes = (duration, delay, count, options = {}) => {
  const keyframeIncrement = duration + delay * 100;

  let weightFunc;
  let originFunc;
  let group;
  let name;
  let startTime = 0;
  let keyframes = [];

  for (let i = 0; i < count; i++) {
    group = options.weightFuncGroup || getRandomValue(WeightFunc);
    weightFunc = options.weightFunc || getRandomValue(group);
    originFunc = options.originFunc || getRandomValue(OriginFunc);
    group = options.animationNameGroup || getRandomValue(AnimNames);
    name = options.animationName || getRandomValue(group);
    name = (i % 2 === 1 ? "alt-" : "") + name;

    keyframes.push({
      startTime,
      pattern: {
        weightFunc,
        originFunc,
      },
      animation: {
        name,
        duration,
        delay,
        reverse: i % 2 === 1,
      },
    });

    startTime += keyframeIncrement;
  }

  return keyframes;
};

export const getTotalDuration = (keyframes) => {
  let endKeyframe;
  let maxKeyframe = 0;

  for (let i = 0; i < keyframes.length; i++) {
    endKeyframe =
      DG.startTime(keyframes[i]) +
      DG.animationDuration(keyframes[i]) +
      DG.animationDelay(keyframes[i]) * 100;
    maxKeyframe = Math.max(maxKeyframe, endKeyframe);
  }

  return maxKeyframe;
};

const replaceKeyframeProps = (keyframes, keyframeIndex, objKey, newProps) => {
  let newKeyframes = { ...keyframes };
  let newKeyframe = { ...newKeyframes[keyframeIndex] };
  let newObj = { ...newKeyframe[objKey] };

  Object.keys(newProps).forEach((item) => {
    newObj[item] = newProps[item];
  });

  newKeyframe[objKey] = newObj;
  newKeyframes[keyframeIndex] = newKeyframe;

  return newKeyframes;
};

export const replaceKeyframeAnimationProps = (
  keyframes,
  keyframeIndex,
  newProps
) => {
  return replaceKeyframeProps(
    keyframes,
    keyframeIndex || 0,
    "animation",
    newProps
  );
};

export const replaceKeyframePatternProps = (
  keyframes,
  keyframeIndex,
  newProps
) => {
  return replaceKeyframeProps(
    keyframes,
    keyframeIndex || 0,
    "pattern",
    newProps
  );
};

export const isSameKeyframe = (k1, k2) => {
  if (DG.backgroundImage(k1) !== DG.backgroundImage(k2)) return false;
  if (DG.startTime(k1) !== DG.startTime(k2)) return false;
  if (DG.weightFunc(k1) !== DG.weightFunc(k2)) return false;
  if (DG.originFunc(k1) !== DG.originFunc(k2)) return false;
  if (DG.invertWeights(k1) !== DG.invertWeights(k2)) return false;
  if (DG.uniqueWeights(k1) !== DG.uniqueWeights(k2)) return false;
  if (DG.normalizeWeights(k1) !== DG.normalizeWeights(k2)) return false;
  if (DG.animationName(k1) !== DG.animationName(k2)) return false;
  if (DG.animationDuration(k1) !== DG.animationDuration(k2)) return false;
  if (DG.animationDelay(k1) !== DG.animationDelay(k2)) return false;
  if (DG.animationTimingFunction(k1) !== DG.animationTimingFunction(k2))
    return false;
  if (DG.animationReverse(k1) !== DG.animationReverse(k2)) return false;

  const cc1 = DG.cellCount(k1);
  const cc2 = DG.cellCount(k2);

  if (cc1.x !== cc2.x || cc1.y !== cc2.y) return false;

  return true;
};
