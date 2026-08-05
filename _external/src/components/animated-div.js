import React, { PureComponent } from "react";
import { isSameKeyframe } from "../lib/keyframe-utils";
import { WeightedArray } from "../lib/weighted-array";
import { point, pointName } from "../lib/point-utils";
import { DEFAULTS } from "../lib/const";
import "./animated-div.css";

const DEFAULT_KEYFRAME = {
  animation: {
    duration: DEFAULTS.ANIMATION.DURATION,
    delay: DEFAULTS.ANIMATION.DELAY,
  },
};

class AnimatedDiv extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      //showDebugInfo: true,
      resetCount: 0,
      keyframeIndex: 0,
    };

    this.resetCache();
    this.computeMaxKeyframe();
    this.computeCellWeights(this.getCurrentKeyframe());
  }

  componentDidMount = () => {
    this.keyframeTimeoutHandle =
      this.createKeyframeTimer() || this.keyframeTimeoutHandle;
  };

  componentWillUnmount = () => {
    clearTimeout(this.keyframeTimeoutHandle);
  };

  componentDidUpdate(prevProps, prevState) {
    const areSameKeyframes = (keyframes1, keyframes2) => {
      if (keyframes1.length !== keyframes2.length) {
        return false;
      }

      for (let i = 0; i < keyframes1.length; i++) {
        if (!isSameKeyframe(keyframes1[i], keyframes2[i])) {
          return false;
        }
      }

      return true;
    };

    if (
      prevProps.paused !== this.props.paused ||
      !areSameKeyframes(prevProps.keyframes, this.props.keyframes)
    ) {
      clearTimeout(this.keyframeTimeoutHandle);

      this.computeMaxKeyframe();
      this.startFromKeyframe(0);
    }
  }

  resetCache = () => {
    this.cache = {
      cellCount: {},
    };
  };

  createKeyframeTimer = () => {
    if (this.props.paused) return;

    if (this.props.onKeyframe) {
      this.props.onKeyframe(this.state.keyframeIndex);
    }

    if (this.state.keyframeIndex + 1 < this.getKeyframes().length) {
      return setTimeout(() => {
        this.startFromKeyframe(this.state.keyframeIndex + 1);
      }, this.getAnimationStartTime(this.getCurrentKeyframe(1)) - this.getAnimationStartTime(this.getCurrentKeyframe()));
    } else {
      return setTimeout(() => {
        if (this.props.repeat) {
          this.startFromKeyframe(0);
        }
      }, this.maxKeyframe - this.getAnimationStartTime(this.getCurrentKeyframe()));
    }
  };

  startFromKeyframe = (keyframeIndex) => {
    const isReset = keyframeIndex === 0;

    clearTimeout(this.keyframeTimeoutHandle);

    this.setState(
      (prevState) => {
        if (isReset) {
          this.resetCache();
        }
        this.computeCellWeights(this.getKeyframes()[keyframeIndex]);

        return {
          keyframeIndex,
          resetCount: prevState.resetCount + (isReset ? 1 : 0),
        };
      },
      () => {
        this.keyframeTimeoutHandle =
          this.createKeyframeTimer() || this.keyframeTimeoutHandle;
      }
    );
  };

  computeMaxKeyframe = () => {
    const keyframes = this.getKeyframes();

    let animEndKeyframe;
    let maxKeyframe = 0;

    for (let i = 0; i < keyframes.length; i++) {
      animEndKeyframe = this.getAnimationEndTime(keyframes[i]);
      maxKeyframe = Math.max(maxKeyframe, animEndKeyframe);
    }

    this.maxKeyframe = maxKeyframe;
  };

  computeCellWeights = (keyframe) => {
    const cellCount = this.getCellCount(keyframe);
    const originFunc = this.getOriginFunc(keyframe);
    const weightFunc = this.getWeightFunc(keyframe);
    const invertWeights = this.getInvertWeights(keyframe);
    const uniqueWeights = this.getUniqueWeights(keyframe);
    const normalizeWeights = this.getNormalizeWeights(keyframe);
    const weightCacheIsInvalid =
      this.cache.cellCount.x !== cellCount.x ||
      this.cache.cellCount.y !== cellCount.y ||
      this.cache.originFunc !== originFunc ||
      this.cache.weightFunc !== weightFunc ||
      this.cache.invertWeights !== invertWeights ||
      this.cache.uniqueWeights !== uniqueWeights ||
      this.cache.normalizeWeights !== normalizeWeights;

    if (weightCacheIsInvalid) {
      this.cellWeights = WeightedArray.getCellWeights(
        cellCount,
        originFunc(cellCount),
        weightFunc
      );

      if (invertWeights) {
        this.cellWeights = WeightedArray.invertAllCells(this.cellWeights);
      }

      if (uniqueWeights) {
        this.cellWeights = WeightedArray.makeCellsUnique(this.cellWeights);
      }

      if (normalizeWeights) {
        this.cellWeights = WeightedArray.normalizeCells(this.cellWeights);
      }

      this.cache.cellCount.x = cellCount.x;
      this.cache.cellCount.y = cellCount.y;
      this.cache.originFunc = originFunc;
      this.cache.weightFunc = weightFunc;
      this.cache.invertWeights = invertWeights;
      this.cache.uniqueWeights = uniqueWeights;
      this.cache.normalizeWeights = normalizeWeights;
      this.cache.backgroundImage = this.getBackgroundImage(keyframe);
    }
  };

  getCellCount = (keyframe) => {
    return point(
      (keyframe &&
        keyframe.pattern &&
        keyframe.pattern.cellCount &&
        keyframe.pattern.cellCount.x) ||
        this.cache.cellCount.x ||
        DEFAULTS.PATTERN.CELL_COUNT.COLS,
      (keyframe &&
        keyframe.pattern &&
        keyframe.pattern.cellCount &&
        keyframe.pattern.cellCount.y) ||
        this.cache.cellCount.y ||
        DEFAULTS.PATTERN.CELL_COUNT.ROWS
    );
  };

  getBackgroundImage = (keyframe) => {
    return (
      (keyframe && keyframe.pattern && keyframe.pattern.backgroundImage) ||
      this.cache.backgroundImage
    );
  };

  getInvertWeights = (keyframe) => {
    return (
      (keyframe && keyframe.pattern && keyframe.pattern.invertWeights) ||
      this.cache.invertWeights
    );
  };

  getUniqueWeights = (keyframe) => {
    return (
      (keyframe && keyframe.pattern && keyframe.pattern.uniqueWeights) ||
      this.cache.uniqueWeights
    );
  };

  getNormalizeWeights = (keyframe) => {
    return (
      (keyframe && keyframe.pattern && keyframe.pattern.normalizeWeights) ||
      this.cache.normalizeWeights
    );
  };

  getWeightFunc = (keyframe) => {
    return (
      (keyframe && keyframe.pattern && keyframe.pattern.weightFunc) ||
      this.cache.weightFunc ||
      DEFAULTS.PATTERN.WEIGHT_FUNC
    );
  };

  getOriginFunc = (keyframe) => {
    return (
      (keyframe && keyframe.pattern && keyframe.pattern.originFunc) ||
      this.cache.originFunc ||
      DEFAULTS.PATTERN.ORIGIN_FUNC
    );
  };

  getAnimationName = (keyframe, col, row) => {
    const getAuxName = (name) => {
      return name.startsWith("alt-") ? name.slice(4) : "alt-" + name;
    };

    const name =
      (keyframe && keyframe.animation && keyframe.animation.name) ||
      DEFAULTS.ANIMATION.NAME;

    return this.props.paused ? getAuxName(name) : name;
  };

  getAnimationStartTime = (keyframe) => {
    return (keyframe && keyframe.startTime) || 0;
  };

  getAnimationEndTime = (keyframe) => {
    return (
      this.getAnimationStartTime(keyframe) +
      this.getAnimationDuration(keyframe) +
      this.getAnimationDelay(keyframe) * 100
    );
  };

  getAnimationDuration = (keyframe) => {
    return (
      (keyframe && keyframe.animation && keyframe.animation.duration) ||
      DEFAULTS.ANIMATION.DURATION
    );
  };

  getAnimationDelay = (keyframe) => {
    return (
      (keyframe && keyframe.animation && keyframe.animation.delay) ||
      DEFAULTS.ANIMATION.DELAY
    );
  };

  getAnimationTimingFunction = (keyframe) => {
    return (
      (keyframe && keyframe.animation && keyframe.animation.timingFunction) ||
      DEFAULTS.ANIMATION.TIMING_FUNCTION
    );
  };

  getAnimationDirection = (keyframe) => {
    return this.isAnimationReversed(keyframe) ? "reverse" : "normal";
  };

  getAnimationFillMode = (keyframe) => {
    return this.isAnimationReversed(keyframe) ? "forwards" : "both";
  };

  getKeyframes = () => {
    return this.props.keyframes || [DEFAULT_KEYFRAME];
  };

  getCurrentKeyframe = (offset = 0) => {
    return (
      this.getKeyframes()[this.state.keyframeIndex + offset] || DEFAULT_KEYFRAME
    );
  };

  getBaseStyle = (col, row) => {
    const keyframe = this.getCurrentKeyframe();
    const cellCount = this.getCellCount(keyframe);
    const zIndex = Math.floor((1 - this.cellWeights[row][col]) * 100);
    const backgroundImage = this.getBackgroundImage(keyframe);
    const bkgStyle = backgroundImage
      ? { backgroundImage }
      : {
          backgroundColor: this.getCellContent(col, row)
            ? "transparent"
            : "currentColor",
        };
    const baseStyle = {
      backgroundPosition: `${(100 / (cellCount.x - 1)) * col}% ${
        (100 / (cellCount.y - 1)) * row
      }%`,
      backgroundSize: `${100 * cellCount.x}% ${100 * cellCount.y}%`,
      width: `${100 / cellCount.x}%`,
      height: `${100 / cellCount.y}%`,
      zIndex: `${zIndex}`,
    };

    return { ...bkgStyle, ...baseStyle };
  };

  getExtendedStyle = (col, row) => {
    let style;

    if (this.props.highlightOrigin && this.isOrigin(col, row)) {
      style = {
        opacity: "1",
      };
    } else {
      const keyframe = this.getCurrentKeyframe();
      const animationName = this.getAnimationName(keyframe, col, row);
      const animationDelay = this.getAnimationDelay(keyframe);
      const animationDuration = this.getAnimationDuration(keyframe);
      const animationTimingFunction = this.getAnimationTimingFunction(keyframe);
      const animationDirection = this.getAnimationDirection(keyframe);
      const animationFillMode = this.getAnimationFillMode(keyframe);
      const cellWeight = this.cellWeights[row][col];

      if (this.props.paused) {
        style = {
          animationName,
          animationDuration: `${animationDuration}ms`,
          animationTimingFunction,
          animationDelay: `${(
            animationDuration *
            (0 - cellWeight)
          ).toFixed()}ms`,
          animationIterationCount: 1,
          animationFillMode: "both",
          animationPlayState: `paused`,
        };
      } else {
        style = {
          animationName,
          animationDuration: `${animationDuration}ms`,
          animationTimingFunction,
          animationDelay: `${(
            animationDelay *
            (1 - cellWeight) *
            100
          ).toFixed()}ms`,
          animationIterationCount: 1,
          animationDirection,
          animationFillMode,
        };
      }
    }
    /*
    if (col === 0 && row === 0) {
      console.log(style);
    }
*/
    return style;
  };

  getCellStyle = (col, row) => {
    const style = {
      ...this.getBaseStyle(col, row),
      ...this.getExtendedStyle(col, row),
    };

    return style;
  };

  getMainClasses = () => {
    const base = "animated-div";
    const fitToChildren =
      this.props.children && this.props.fitToChildren ? "fit-children" : "";

    return base + " " + fitToChildren;
  };

  getCellClasses = (col, row) => {
    if (this.props.highlightOrigin && this.isOrigin(col, row)) {
      return "cell origin";
    }

    return "cell";
  };

  getCellContent = (col, row) => {
    const keyframe = this.getCurrentKeyframe();

    return (
      keyframe &&
      keyframe.pattern &&
      keyframe.pattern.cellContent &&
      keyframe.pattern.cellContent[pointName(col, row)]
    );
  };

  getDebugInfo = (col, row) => {
    if (this.state.showDebugInfo) {
      const animationDelayWeight = this.cellWeights[row][col];

      return (
        <div className="desc">{animationDelayWeight.toFixed(2).toString()}</div>
      );
    }
  };

  isOrigin = (col, row) => {
    const keyframe = this.getCurrentKeyframe();
    const originFunc = this.getOriginFunc(keyframe);
    const origin = originFunc(this.getCellCount(keyframe));

    return origin.x === col && origin.y === row;
  };

  isAnimationReversed = (keyframe) => {
    return keyframe && keyframe.animation && keyframe.animation.reverse;
  };

  renderCells = () => {
    if (this.cellWeights) {
      return (
        <div className="cells">
          {this.cellWeights.map((y, row) =>
            this.cellWeights[row].map((x, col) => (
              <div
                key={pointName(col, row)}
                className={this.getCellClasses(col, row)}
                style={this.getCellStyle(col, row)}
              >
                {this.getCellContent(col, row)}
                {this.getDebugInfo(col, row)}
              </div>
            ))
          )}
        </div>
      );
    }
  };

  render() {
    //console.log("render");

    return (
      <div className={this.getMainClasses()}>
        {this.props.children}
        {this.renderCells()}
      </div>
    );
  }
}

export default AnimatedDiv;
