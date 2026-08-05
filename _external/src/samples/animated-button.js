import React, { Component } from "react";
import AnimatedDiv from "../components/animated-div";
import { WeightFunc } from "../lib/weight-func";
import { OriginFunc } from "../lib/origin-func";
import { AnimNames } from "../lib/animation-utils";
import { point } from "../lib/point-utils";
import "./animated-button.css";

const DURATION = 100;
const DELAY = 5;
const TOTAL_DURATION = DURATION + DELAY * 100;
const CELL_SIZE = 12;

const BASE_KEYFRAMES = [
  {
    pattern: {
      weightFunc: WeightFunc.Zigzag.Column,
      originFunc: OriginFunc.BottomLeft,
    },
    animation: {
      name: AnimNames.ZoomIn.Default,
      duration: DURATION,
      delay: DELAY,
    },
  },
  {
    startTime: TOTAL_DURATION,
    pattern: {
      weightFunc: WeightFunc.Random.Default,
    },
    animation: {
      name: AnimNames.FadeIn.Linear,
      duration: DURATION,
      delay: DELAY,
      reverse: true,
    },
  },
];

const EXTRA_KEYFRAMES = [
  {
    startTime: TOTAL_DURATION * 5,
    animation: {
      name: "alt-" + AnimNames.FadeIn.Linear,
      duration: DURATION,
      delay: DELAY,
    },
  },
  {
    startTime: TOTAL_DURATION * 6,
    pattern: {
      weightFunc: WeightFunc.Zigzag.Column,
    },
    animation: {
      name: "alt-" + AnimNames.ZoomIn.Default,
      duration: DURATION,
      delay: DELAY,
      reverse: true,
    },
  },
];

class AnimatedButton extends Component {
  constructor(props) {
    super(props);

    this.state = {
      showChildren: false,
      init: false,
    };
  }

  componentDidMount() {
    this.setState({
      init: true,
    });
  }

  handleKeyframe = (index, resetCount) => {
    this.setState({
      showChildren: index >= 1 && index <= 2,
    });
  };

  renderChildren = () => {
    return (
      <button
        className={this.props.className || "button"}
        onClick={this.state.showChildren ? this.props.onClick : null}
        style={{ opacity: this.state.showChildren ? 1 : 0 }}
      >
        {this.props.children}
      </button>
    );
  };

  renderAnimatedDiv = () => {
    if (this.state.init) {
      const size = this.refs.container.getBoundingClientRect();
      const cellCount = point(
        Math.round(size.width / CELL_SIZE),
        Math.round(size.height / CELL_SIZE)
      );
      const keyframes = this.props.repeat
        ? [...BASE_KEYFRAMES, ...EXTRA_KEYFRAMES]
        : [...BASE_KEYFRAMES];

      keyframes[0].pattern.cellCount = cellCount;

      return (
        <AnimatedDiv
          keyframes={keyframes}
          repeat={this.props.repeat}
          fitToChildren={true}
          onKeyframe={this.handleKeyframe}
        >
          {this.renderChildren()}
        </AnimatedDiv>
      );
    }

    return this.renderChildren();
  };

  render() {
    return (
      <div className="animated-button" ref="container">
        {this.renderAnimatedDiv()}
      </div>
    );
  }
}

export default AnimatedButton;
