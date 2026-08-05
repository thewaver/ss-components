import React, { PureComponent } from "react";
import Prism from "prismjs";
import "prismjs/components/prism-jsx";
import AnimatedDiv from "./animated-div";
import AnimatedButton from "../samples/animated-button";
import { WeightFunc } from "../lib/weight-func";
import { point } from "../lib/point-utils";
import { DEFAULTS, LABELS } from "../lib/const";
import "./tutorial.css";

const SAMPLE_CODE_PATTERN = `const pattern = {
  cellCount: { x: 7, y: 7 },
  backgroundImage: null,
  weightFunc: WeightFunc.Random.Default,
  originFunc: OriginFunc.Center,
  invertWeights: false,
  uniqueWeights: false,
  normalizeWeights: false
};`;

const SAMPLE_CODE_ANIMATION = `const animation = {
  name: AnimNames.ZoomIn.Default,
  duration: 500,
  delay: 15,
  timingFunction: "linear",
  reverse: false
};`;

const SAMPLE_CODE_ELEMENT = `<AnimatedDiv
  keyframes={[{
    startTime: 0,
    pattern,
    animation,
  }]}
  repeat={false}
  fitToChildren={false}
  onKeyframe={null}
>
  {/* wrapped children */}
</AnimatedDiv>`;

class Tutorial extends PureComponent {
  componentDidMount() {
    Prism.highlightAll();
  }

  handleGalleryClick = () => {
    if (this.props.onGalleryClick) {
      this.props.onGalleryClick();
    }
  };

  handleWizardClick = () => {
    if (this.props.onWizardClick) {
      this.props.onWizardClick();
    }
  };

  handleAPIDocsClick = () => {
    if (this.props.onAPIDocsClick) {
      this.props.onAPIDocsClick();
    }
  };

  render() {
    return (
      <div className="tutorial">
        <div className="title">How it works</div>
        <div className="steps">
          <div className="step-row">
            <div className="step">
              <div className="image">
                <AnimatedDiv
                  keyframes={[
                    {
                      pattern: {
                        cellCount: point(5, 5),
                        weightFunc: () => {
                          return 0.8;
                        },
                      },
                    },
                  ]}
                  paused={true}
                ></AnimatedDiv>
              </div>
              <div className="info">
                <div className="title">1. Array</div>
                <div className="desc">
                  <span className="line">
                    Animos works by splitting an HTML &lt;div&gt; into an array
                    of individual cells
                  </span>
                </div>
              </div>
            </div>

            <div className="step">
              <div className="image">
                <AnimatedDiv
                  keyframes={[
                    {
                      pattern: {
                        cellCount: point(5, 5),
                        weightFunc: WeightFunc.Checkered.Default,
                      },
                    },
                  ]}
                  paused={true}
                ></AnimatedDiv>
              </div>
              <div className="info">
                <div className="title">2. Pattern</div>
                <div className="desc">
                  <span className="line">
                    Each cell is then given a weight between <b>0.0</b> and{" "}
                    <b>1.0</b>
                  </span>
                  <span className="line">
                    This weight is later multiplied by a base delay to create a
                    pattern
                  </span>
                </div>
              </div>
            </div>

            <div className="step">
              <div className="image">
                <AnimatedDiv
                  keyframes={[
                    {
                      pattern: {
                        cellCount: point(5, 5),
                        weightFunc: WeightFunc.Checkered.Default,
                      },
                    },
                    {
                      startTime: DEFAULTS.ANIMATION.END_KEYFRAME,
                      animation: {
                        name: "alt-" + DEFAULTS.ANIMATION.NAME,
                        reverse: true,
                      },
                    },
                  ]}
                  repeat={true}
                ></AnimatedDiv>
              </div>
              <div className="info">
                <div className="title">3. Animation</div>
                <div className="desc">
                  <span className="line">
                    Cells are then mapped into different zones that determine
                    the CSS keyframes animation name that is applied to that
                    cell
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="title">How to use</div>
        <div className="subtitle">
          {"(all shown values are the defaults that will be used by omission)"}
        </div>
        <div className="subtitle">
          for further details, check the{" "}
          <button className="ghost-button" onClick={this.handleAPIDocsClick}>
            API Docs
          </button>
        </div>
        <div className="steps">
          <div className="full step">
            <pre>
              <code className="language-jsx">
                npm install -s animos // not yet hosted
              </code>
            </pre>
          </div>
          <div className="full step">
            <pre>
              <code className="language-jsx">
                import AnimatedDiv from 'animos/animated-div';
              </code>
            </pre>
          </div>
          <div className="step-row">
            <div className="step">
              <pre>
                <code className="language-jsx">{SAMPLE_CODE_PATTERN}</code>
              </pre>
            </div>
            <div className="step">
              <pre>
                <code className="language-jsx">{SAMPLE_CODE_ANIMATION}</code>
              </pre>
            </div>
            <div className="step">
              <pre>
                <code className="language-jsx">{SAMPLE_CODE_ELEMENT}</code>
              </pre>
            </div>
          </div>
        </div>

        <div className="buttons">
          <AnimatedButton className="button" onClick={this.handleWizardClick}>
            <i className="fas fa-tools icon"></i>
            {LABELS.WIZARD}
          </AnimatedButton>
          <AnimatedButton className="button" onClick={this.handleGalleryClick}>
            <i className="fas fa-images icon"></i>
            {LABELS.GALLERY}
          </AnimatedButton>
        </div>
      </div>
    );
  }
}

export default Tutorial;
