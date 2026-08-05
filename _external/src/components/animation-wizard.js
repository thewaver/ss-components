import React, { PureComponent } from "react";
import {
  CellWeightFuncGroupSelector,
  CellWeightFuncSelector,
  CellOriginFuncSelector,
  CellAnimNameGroupSelector,
  CellAnimNameSelector,
} from "./animated-div-selector";
import AnimatedDivCustomizer from "./animated-div-customizer";
import StepSelector from "./step-selector";
import { point } from "../lib/point-utils";
import { scrollToPos } from "../lib/scroll-utils";
import { splitCamelCase } from "../lib/utils";
import "./animation-wizard.css";
import { WeightFunc } from "../lib/weight-func";

const STEP_TITLES = {
  PATTERN: 0,
  ORIGIN: 1,
  ANIMATION: 2,
  SETTINGS: 3,
};

const STEP_TITLES_AS_ARRAY = Object.keys(STEP_TITLES);

const STEP_DESCRIPTIONS = [
  <div className="desc">
    <span className="line">
      A pattern determines the order of animation for a specific cell by giving
      it a weight between <b>0.0</b> and <b>1.0</b>
    </span>
    <span className="line">
      This weight is later multiplied by a base delay to create complex effects
    </span>
    <span className="line">
      Some types can be specialized further after the initial selection
    </span>
  </div>,

  <div className="desc">
    <span className="line">
      The point of origin determines wich point the pattern is generated from
    </span>
    <span className="line">
      Certain patterns can remain the same under different points of origin
    </span>
    <span className="line-i">
      for instance, if all cells in a row all start animating at the same time
      it does not matter if the point of origin is <b>left</b> or <b>right</b>
    </span>
    <span className="line">You can also choose to invert the cell order</span>
  </div>,

  <div className="desc">
    <span className="line">
      The type of animation determines the visual effect applied to the cells
    </span>
    <span className="line">
      Some types can be specialized further after the initial selection
    </span>
    <span className="line-i">
      for isntance, <b>elastic</b> has multiple direction options
    </span>
    <span className="line">
      Each cell is animated individually using a native CSS keyframes animation
    </span>
  </div>,

  <div className="desc">
    <span className="line">
      Duration determines how long the cell animation takes from start to
      finish, excluding delay
    </span>
    <span className="line">
      Delay determines how long the cell waits before it starts animating. This
      value is multiplied by the cell's weight
    </span>
    <span className="line">
      Unique weights ensures no 2 cells have the same weight
    </span>
    <span className="line">
      Normalized weights spreads the weight of all cells evenly
    </span>
  </div>,
];

class AnimationWizard extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      cellCount: point(null, null),
      selectionStepIndex: 0,
    };
  }

  handleWeightFuncGroupSelection = (item, index) => {
    const keys = Object.keys(item);
    const groupName = Object.keys(WeightFunc)[index];

    this.setState(
      (prevState) => {
        if (keys.length === 1) {
          return {
            weightFuncGroupName: groupName,
            weightFunc: item[keys[0]],
            selectionStepIndex: prevState.selectionStepIndex + 1,
          };
        } else {
          return {
            weightFuncGroupName: groupName,
            weightFuncGroup: item,
            selectionStepIndex: prevState.selectionStepIndex,
          };
        }
      },
      () => {
        scrollToPos(0, window, true);
      }
    );
  };

  handleWeightFuncSelection = (item) => {
    this.setState(
      (prevState) => ({
        weightFunc: item,
        selectionStepIndex: prevState.selectionStepIndex + 1,
      }),
      () => {
        scrollToPos(0, window, true);
      }
    );
  };

  handleOriginSelection = (item) => {
    this.setState(
      (prevState) => ({
        originFunc: item,
        selectionStepIndex: prevState.selectionStepIndex + 1,
      }),
      () => {
        scrollToPos(0, window, true);
      }
    );
  };

  handleAnimNameGroupSelection = (item, index) => {
    const keys = Object.keys(item);
    const groupName = Object.keys(WeightFunc)[index];

    this.setState(
      (prevState) => {
        if (keys.length === 1) {
          return {
            animationNameGroupName: groupName,
            animationName: item[keys[0]],
            selectionStepIndex: prevState.selectionStepIndex + 1,
          };
        } else {
          return {
            animationNameGroupName: groupName,
            animationNameGroup: item,
            selectionStepIndex: prevState.selectionStepIndex,
          };
        }
      },
      () => {
        scrollToPos(0, window, true);
      }
    );
  };

  handleAnimNameSelection = (item) => {
    this.setState(
      (prevState) => ({
        animationName: item,
        selectionStepIndex: prevState.selectionStepIndex + 1,
      }),
      () => {
        scrollToPos(0, window, true);
      }
    );
  };

  handleSelectorTitleClick = (index) => {
    this.setState({
      selectionStepIndex: index,
      weightFuncGroup: null,
      animationNameGroup: null,
    });
  };

  handleCellCountXChange = (x) => {
    this.setState((prevState) => ({
      cellCount: point(x, prevState.cellCount.y),
    }));
  };

  handleCellCountYChange = (y) => {
    this.setState((prevState) => ({
      cellCount: point(prevState.cellCount.x, y),
    }));
  };

  handleAnimationDurationChange = (duration) => {
    this.setState({
      animationDuration: duration,
    });
  };

  handleAnimationDelayChange = (delay) => {
    this.setState({
      animationDelay: delay,
    });
  };

  handleAnimationTimingFunctionChange = (func) => {
    this.setState({
      animationTimingFunction: func,
    });
  };

  handleInvertChange = (v) => {
    this.setState({
      invertWeights: v,
    });
  };

  handleUniqueChange = (v) => {
    this.setState({
      uniqueWeights: v,
    });
  };

  handleNormalizeChange = (v) => {
    this.setState({
      normalizeWeights: v,
    });
  };

  renderCurrentStep = () => {
    switch (this.state.selectionStepIndex) {
      case STEP_TITLES.PATTERN:
        if (this.state.weightFuncGroup) {
          return (
            <CellWeightFuncSelector
              weightFuncGroup={this.state.weightFuncGroup}
              onSelection={this.handleWeightFuncSelection}
            ></CellWeightFuncSelector>
          );
        } else {
          return (
            <CellWeightFuncGroupSelector
              onSelection={this.handleWeightFuncGroupSelection}
            ></CellWeightFuncGroupSelector>
          );
        }
      case STEP_TITLES.ORIGIN:
        return (
          <CellOriginFuncSelector
            keyframes={[
              {
                pattern: {
                  weightFunc: this.state.weightFunc,
                },
              },
            ]}
            onSelection={this.handleOriginSelection}
          ></CellOriginFuncSelector>
        );
      case STEP_TITLES.ANIMATION:
        if (this.state.animationNameGroup) {
          return (
            <CellAnimNameSelector
              keyframes={[
                {
                  pattern: {
                    weightFunc: this.state.weightFunc,
                    originFunc: this.state.originFunc,
                  },
                },
              ]}
              animationNameGroup={this.state.animationNameGroup}
              onSelection={this.handleAnimNameSelection}
            ></CellAnimNameSelector>
          );
        } else {
          return (
            <CellAnimNameGroupSelector
              keyframes={[
                {
                  pattern: {
                    weightFunc: this.state.weightFunc,
                    originFunc: this.state.originFunc,
                  },
                },
              ]}
              onSelection={this.handleAnimNameGroupSelection}
            ></CellAnimNameGroupSelector>
          );
        }
      case STEP_TITLES.SETTINGS:
        return (
          <AnimatedDivCustomizer
            keyframes={[
              {
                pattern: {
                  cellCount: this.state.cellCount,
                  weightFunc: this.state.weightFunc,
                  originFunc: this.state.originFunc,
                  invertWeights: this.state.invertWeights,
                  uniqueWeights: this.state.uniqueWeights,
                  normalizeWeights: this.state.normalizeWeights,
                },
                animation: {
                  name: this.state.animationName,
                  duration: this.state.animationDuration,
                  delay: this.state.animationDelay,
                  timingFunction: this.state.animationTimingFunction,
                },
              },
            ]}
            weightFuncGroupName={this.state.weightFuncGroupName}
            animationNameGroupName={this.state.animationNameGroupName}
            onCellCountXChange={this.handleCellCountXChange}
            onCellCountYChange={this.handleCellCountYChange}
            onAnimationDurationChange={this.handleAnimationDurationChange}
            onAnimationDelayChange={this.handleAnimationDelayChange}
            onAnimationTimingFunctionChange={
              this.handleAnimationTimingFunctionChange
            }
            onInvertChange={this.handleInvertChange}
            onUniqueChange={this.handleUniqueChange}
            onNormalizeChange={this.handleNormalizeChange}
          ></AnimatedDivCustomizer>
        );
      default:
        return;
    }
  };

  render() {
    return (
      <div className="animation-wizard">
        <StepSelector
          titles={STEP_TITLES_AS_ARRAY}
          values={[
            this.state.weightFunc &&
              splitCamelCase(this.state.weightFuncGroupName) +
                " " +
                splitCamelCase(this.state.weightFunc.name),
            this.state.originFunc && splitCamelCase(this.state.originFunc.name),
            this.state.animationName,
          ]}
          descriptions={STEP_DESCRIPTIONS}
          current={this.state.selectionStepIndex}
          onTitleClick={this.handleSelectorTitleClick}
        ></StepSelector>
        {this.renderCurrentStep()}
      </div>
    );
  }
}

export default AnimationWizard;
