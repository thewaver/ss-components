import React, { PureComponent } from "react";
import AnimatedDiv from "./animated-div";
import { AnimNames } from "../lib/animation-utils";
import { OriginFunc } from "../lib/origin-func";
import { WeightFunc } from "../lib/weight-func";
import {
  replaceKeyframePatternProps,
  replaceKeyframeAnimationProps,
} from "../lib/keyframe-utils";
import { splitCamelCase } from "../lib/utils";
import "./animated-div-selector.css";

class AnimatedDivSelector extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      visibleItemCount: 0,
      activeItemIndex: -1,
    };
  }

  componentDidMount() {
    this.itemTimerHandle = this.createItemTimer();
  }

  componentWillUnmount = () => {
    clearTimeout(this.itemTimerHandle);
  };

  createItemTimer = () => {
    return setTimeout(
      () =>
        this.setState(
          (prevState) => ({
            visibleItemCount: prevState.visibleItemCount + 1,
          }),
          () => {
            if (this.state.visibleItemCount < this.getItemArray().length) {
              this.itemTimerHandle = this.createItemTimer();
            }
          }
        ),
      10
    );
  };

  getClassNames = (index) => {
    const base = "labeled-animated-div";
    const extra =
      index < this.state.visibleItemCount &&
      this.state.activeItemIndex === index
        ? "selected"
        : "unselected";

    return `${base} ${extra}`;
  };

  getItemName = (item, index) => {
    return splitCamelCase(item);
  };

  handleClick = (e, item, index) => {
    this.setState(
      {
        activeItemIndex: index,
      },
      () => {
        if (this.props.onSelection) {
          this.props.onSelection(this.getReturnItem(item, index), index);
        }
      }
    );
  };

  handleMouseEnter = (e, item, index) => {
    if (this.state.activeItemIndex === index) return;

    this.setState({
      activeItemIndex: index,
    });
  };

  handleMouseLeave = (e, item, index) => {
    if (this.state.activeItemIndex !== index) return;

    this.setState({
      activeItemIndex: -1,
    });
  };

  isPaused = (index) => {
    return index !== this.state.activeItemIndex;
  };

  renderLabelledItem = (item, index) => {
    if (index < this.state.visibleItemCount) {
      return (
        <div
          key={`AD${index}`}
          className={this.getClassNames(index)}
          onClick={(e) => this.handleClick(e, item, index)}
          onMouseOver={(e) => this.handleMouseEnter(e, item, index)}
          onMouseLeave={(e) => this.handleMouseLeave(e, item, index)}
        >
          <div className="item">{this.renderItem(item, index)}</div>
          <div className="label">{this.getItemName(item, index)}</div>
        </div>
      );
    }

    return (
      <div
        key={`AD${index}`}
        className={this.getClassNames(index)}
        style={{ animation: "none" }}
      >
        <div className="item"></div>
        <div className="label"></div>
      </div>
    );
  };

  render() {
    const itemArray = this.getItemArray();

    return (
      <div className="animated-div-selector">
        {itemArray.map((item, index) => this.renderLabelledItem(item, index))}
      </div>
    );
  }
}

export class CellWeightFuncGroupSelector extends AnimatedDivSelector {
  getItemArray = () => {
    return Object.keys(WeightFunc);
  };

  getReturnItem = (item, index) => {
    return WeightFunc[item];
  };

  renderItem = (item, index) => {
    const returnItem = this.getReturnItem(item, index);
    const def = Object.keys(returnItem)[0];
    const weightFunc = returnItem[def];
    const newKeyframes = replaceKeyframePatternProps(
      this.props.keyframes,
      this.props.keyframeIndex,
      { weightFunc }
    );

    return (
      <AnimatedDiv
        keyframes={newKeyframes}
        keyframeIndex={this.props.keyframeIndex}
        paused={this.isPaused(index)}
      ></AnimatedDiv>
    );
  };
}

export class CellWeightFuncSelector extends AnimatedDivSelector {
  getItemArray = () => {
    return Object.keys(this.props.weightFuncGroup);
  };

  getReturnItem = (item, index) => {
    return this.props.weightFuncGroup[item];
  };

  renderItem = (item, index) => {
    const weightFunc = this.getReturnItem(item, index);
    const newKeyframes = replaceKeyframePatternProps(
      this.props.keyframes,
      this.props.keyframeIndex,
      { weightFunc }
    );

    return (
      <AnimatedDiv
        keyframes={newKeyframes}
        keyframeIndex={this.props.keyframeIndex}
        paused={this.isPaused(index)}
      ></AnimatedDiv>
    );
  };
}

export class CellOriginFuncSelector extends AnimatedDivSelector {
  getItemName = (item, index) => {
    return splitCamelCase(item);
  };

  getItemArray = () => {
    return Object.keys(OriginFunc);
  };

  getReturnItem = (item, index) => {
    return OriginFunc[item];
  };

  renderItem = (item, index) => {
    const originFunc = this.getReturnItem(item, index);
    const newKeyframes = replaceKeyframePatternProps(
      this.props.keyframes,
      this.props.keyframeIndex,
      { originFunc }
    );

    return (
      <AnimatedDiv
        keyframes={newKeyframes}
        keyframeIndex={this.props.keyframeIndex}
        highlightOrigin={true}
        paused={this.isPaused(index)}
      ></AnimatedDiv>
    );
  };
}

export class CellAnimNameGroupSelector extends AnimatedDivSelector {
  getItemArray = () => {
    return Object.keys(AnimNames);
  };

  getReturnItem = (item, index) => {
    return AnimNames[item];
  };

  renderItem = (item, index) => {
    const returnItem = this.getReturnItem(item, index);
    const def = Object.keys(returnItem)[0];
    const name = returnItem[def];
    const newKeyframes = replaceKeyframeAnimationProps(
      this.props.keyframes,
      this.props.keyframeIndex,
      { name }
    );

    return (
      <AnimatedDiv
        keyframes={newKeyframes}
        keyframeIndex={this.props.keyframeIndex}
        paused={this.isPaused(index)}
      ></AnimatedDiv>
    );
  };
}

export class CellAnimNameSelector extends AnimatedDivSelector {
  getItemArray = () => {
    return Object.keys(this.props.animationNameGroup);
  };

  getReturnItem = (item, index) => {
    return this.props.animationNameGroup[item];
  };

  renderItem = (item, index) => {
    const name = this.getReturnItem(item, index);
    const newKeyframes = replaceKeyframeAnimationProps(
      this.props.keyframes,
      this.props.keyframeIndex,
      { name }
    );

    return (
      <AnimatedDiv
        keyframes={newKeyframes}
        keyframeIndex={this.props.keyframeIndex}
        paused={this.isPaused(index)}
      ></AnimatedDiv>
    );
  };
}
