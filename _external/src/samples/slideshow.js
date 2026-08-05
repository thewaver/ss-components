import React, { Component } from "react";
import AnimatedDiv from "../components/animated-div";
import { AnimNames } from "../lib/animation-utils";
import { WeightFunc } from "../lib/weight-func";
import { DEFAULTS } from "../lib/const";
import "./slideshow.css";

const BKGS = [
  require("../assets/img1.jpg").default,
  require("../assets/img2.jpg").default,
];

class Slideshow extends Component {
  constructor(props) {
    super(props);

    this.state = {
      currentBkg: 0,
    };

    this.bkgs = BKGS;
  }

  getNextBkgIndex = (currentBkg) => {
    return currentBkg + 1 >= this.bkgs.length ? 0 : currentBkg + 1;
  };

  handleKeyframe = (index) => {
    if (index === 2) {
      this.setState((prevState) => ({
        currentBkg: this.getNextBkgIndex(prevState.currentBkg),
      }));
    }
  };

  render() {
    return (
      <div className="slideshow">
        <AnimatedDiv
          keyframes={[
            {
              pattern: {
                backgroundImage:
                  "url(" +
                  this.bkgs[this.getNextBkgIndex(this.state.currentBkg)] +
                  ")",
                weightFunc: WeightFunc.Radar.Single,
              },
              animation: {
                name: AnimNames.Skew.Clockwise,
              },
            },
            {
              startTime: DEFAULTS.ANIMATION.END_KEYFRAME,
              animation: {
                name: "none",
                reverse: true,
              },
            },
            {
              startTime: DEFAULTS.ANIMATION.END_KEYFRAME * 2,
              animation: {
                name: "none",
                reverse: true,
              },
            },
          ]}
          fitToChildren={true}
          onKeyframe={this.handleKeyframe}
        >
          <img src={this.bkgs[this.state.currentBkg]} alt=""></img>
        </AnimatedDiv>
      </div>
    );
  }
}

export default Slideshow;
