import React, { PureComponent } from "react";
import AnimatedDiv from "./animated-div";
import { DefaultGetter as DG } from "../lib/default-getter";
import { getRandomKeyframes } from "../lib/keyframe-utils";
import "./random-animated-div.css";

class RandomAnimatedDiv extends PureComponent {
  constructor(props) {
    super(props);

    this.computeRandomKeyframes();
  }

  componentDidUpdate(prevProps, prevState) {
    if (JSON.stringify(this.props) !== JSON.stringify(prevProps)) {
      this.computeRandomKeyframes();
    }
  }

  computeRandomKeyframes = () => {
    this.randomKeyframes = getRandomKeyframes(
      DG.animationDuration(),
      DG.animationDelay(),
      this.getCount(),
      this.props.options
    );
  };

  getCount = () => {
    return this.props.count || 20;
  };

  render() {
    return (
      <div className="random-animated-div">
        <AnimatedDiv
          keyframes={this.randomKeyframes}
          repeat={true}
        ></AnimatedDiv>
      </div>
    );
  }
}

export default RandomAnimatedDiv;
