import React, { PureComponent } from "react";
import AnimatedDiv from "./animated-div";
import CodePanel from "./code-panel";
import ModalController from "./modal-controller";
import AnimatedButton from "../samples/animated-button";
import { TimingFunc } from "../lib/animation-utils";
import { DefaultGetter as DG } from "../lib/default-getter";
import { getTotalDuration } from "../lib/keyframe-utils";
import { DEFAULTS, LABELS } from "../lib/const";
import "./animated-div-customizer.css";

const PATTERN = `const pattern = {
  cellCount: { x: %CELL_COUNT_X%, y: %CELL_COUNT_Y% },
  weightFunc: WeightFunc.%WEIGHT_FUNC_GROUP%.%WEIGHT_FUNC%,
  originFunc: OriginFunc.%ORIGIN_FUNC%,
  invertWeights: %INVERT_WEIGHTS%,
  uniqueWeights: %UNIQUE_WEIGHTS%,
  normalizeWeights: %NORMALIZE_WEIGHTS%
};`;

const ANIMATION = `const animation = {
  name: "%NAME_FUNC%",
  duration: %DURATION%,
  delay: %DELAY%,
  timingFunction: "%TIMING_FUNCTION%"
};`;

const ELEMENT = `<AnimatedDiv
  keyframes={[{
    pattern,
    animation
  }]}
></AnimatedDiv>`;

class AnimatedDivCustomizer extends PureComponent {
  getFirstKeyframe = () => {
    if (this.props.keyframes && this.props.keyframes.length > 0) {
      return this.props.keyframes[0];
    }
  };

  getModalContent = () => {
    const keyframe = this.props.keyframes[0];
    const cellCount = DG.cellCount(keyframe);

    let pattern = PATTERN;
    pattern = pattern.replace("%CELL_COUNT_X%", cellCount.x);
    pattern = pattern.replace("%CELL_COUNT_Y%", cellCount.y);
    pattern = pattern.replace(
      "%WEIGHT_FUNC_GROUP%",
      this.props.weightFuncGroupName
    );
    pattern = pattern.replace("%WEIGHT_FUNC%", DG.weightFunc(keyframe).name);
    pattern = pattern.replace("%ORIGIN_FUNC%", DG.originFunc(keyframe).name);
    pattern = pattern.replace(
      "%INVERT_WEIGHTS%",
      DG.invertWeights(keyframe) ? "true" : "false"
    );
    pattern = pattern.replace(
      "%UNIQUE_WEIGHTS%",
      DG.uniqueWeights(keyframe) ? "true" : "false"
    );
    pattern = pattern.replace(
      "%NORMALIZE_WEIGHTS%",
      DG.normalizeWeights(keyframe) ? "true" : "false"
    );

    let animation = ANIMATION;
    animation = animation.replace("%NAME_FUNC%", DG.animationName(keyframe));
    animation = animation.replace("%DURATION%", DG.animationDuration(keyframe));
    animation = animation.replace("%DELAY%", DG.animationDelay(keyframe));
    animation = animation.replace(
      "%TIMING_FUNCTION%",
      DG.animationTimingFunction(keyframe)
    );

    return (
      <div className="code-preview">
        <CodePanel snippets={[pattern, animation, ELEMENT]}></CodePanel>
      </div>
    );
  };

  handleCellCountXChange = (e) => {
    if (this.props.onCellCountXChange) {
      this.props.onCellCountXChange(Number(e.target.value));
    }
  };

  handleCellCountYChange = (e) => {
    if (this.props.onCellCountYChange) {
      this.props.onCellCountYChange(Number(e.target.value));
    }
  };

  handleAnimationDurationChange = (e) => {
    if (this.props.onAnimationDurationChange) {
      this.props.onAnimationDurationChange(Number(e.target.value));
    }
  };

  handleAnimationDelayChange = (e) => {
    if (this.props.onAnimationDelayChange) {
      this.props.onAnimationDelayChange(Number(e.target.value));
    }
  };

  handleAnimationTimingFunctionChange = (e) => {
    if (this.props.onAnimationTimingFunctionChange) {
      this.props.onAnimationTimingFunctionChange(e.target.value);
    }
  };

  handleInvertChange = (e) => {
    if (this.props.onInvertChange) {
      this.props.onInvertChange(e.target.checked);
    }
  };

  handleUniqueChange = (e) => {
    if (this.props.onUniqueChange) {
      this.props.onUniqueChange(e.target.checked);
    }
  };

  handleNormalizeChange = (e) => {
    if (this.props.onNormalizeChange) {
      this.props.onNormalizeChange(e.target.checked);
    }
  };

  render() {
    const firstKeyframe = this.getFirstKeyframe();
    const endKeyframe = {
      startTime: getTotalDuration(this.props.keyframes),
      animation: {
        name: "none",
        duration: DEFAULTS.ANIMATION.DURATION,
        delay: DEFAULTS.ANIMATION.DELAY,
        reverse: true,
      },
    };

    return (
      <div className="animated-div-customizer">
        <div className="preview">
          <div className="animation">
            <AnimatedDiv
              keyframes={[...this.props.keyframes, endKeyframe]}
              repeat={true}
            ></AnimatedDiv>
          </div>
        </div>
        <div className="settings-panel-wrapper">
          <div className="settings-panel">
            <div className="input-with-label">
              <div className="label">cell count</div>
              <div className="multi-input">
                <input
                  className="input"
                  type="number"
                  min="3"
                  max="21"
                  step="2"
                  value={DG.cellCount(firstKeyframe).x}
                  onChange={this.handleCellCountXChange}
                />
                <div className="multiplier">*</div>
                <input
                  className="input"
                  type="number"
                  min="3"
                  max="21"
                  step="2"
                  value={DG.cellCount(firstKeyframe).y}
                  onChange={this.handleCellCountYChange}
                />
              </div>
            </div>
            <div className="input-with-label">
              <div className="label">animation duration (ms)</div>
              <input
                className="input"
                type="number"
                min="50"
                max="5000"
                step="50"
                value={DG.animationDuration(firstKeyframe)}
                onChange={this.handleAnimationDurationChange}
              />
            </div>
            <div className="input-with-label">
              <div className="label">animation delay (ms)</div>
              <input
                className="input"
                type="number"
                min="5"
                max="100"
                step="5"
                value={DG.animationDelay(firstKeyframe)}
                onChange={this.handleAnimationDelayChange}
              />
            </div>
            <div className="input-with-label">
              <div className="label">animation delay (ms)</div>
              <div className="select-div">
                <select
                  className="select"
                  value={DG.animationTimingFunction(firstKeyframe)}
                  onChange={this.handleAnimationTimingFunctionChange}
                >
                  {TimingFunc.map((item, index) => (
                    <option className="option" key={`TF${index}`}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="checkboxes-div">
              <div className="checkbox-div">
                <input
                  className="checkbox"
                  type="checkbox"
                  id="invert"
                  checked={DG.invertWeights(firstKeyframe)}
                  onChange={this.handleInvertChange}
                />
                <label className="label" htmlFor="invert">
                  Invert cell weights
                </label>
              </div>
              <div className="checkbox-div">
                <input
                  className="checkbox"
                  type="checkbox"
                  id="unique"
                  checked={DG.uniqueWeights(firstKeyframe)}
                  onChange={this.handleUniqueChange}
                />
                <label className="label" htmlFor="unique">
                  Unique cell weights
                </label>
              </div>
              <div className="checkbox-div">
                <input
                  className="checkbox"
                  type="checkbox"
                  id="normalize"
                  checked={DG.normalizeWeights(firstKeyframe)}
                  onChange={this.handleNormalizeChange}
                />
                <label className="label" htmlFor="normalize">
                  Normalize cell weights
                </label>
              </div>
            </div>
            <ModalController modalContent={this.getModalContent()}>
              <AnimatedButton className="button full-width">
                <i className="fas fa-code icon"></i>
                {LABELS.GET_CODE}
              </AnimatedButton>
            </ModalController>
          </div>
        </div>
      </div>
    );
  }
}

export default AnimatedDivCustomizer;
