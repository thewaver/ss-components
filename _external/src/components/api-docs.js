import React, { Fragment, PureComponent } from "react";
import { WeightFunc } from "../lib/weight-func";
import { OriginFunc } from "../lib/origin-func";
import { ZoneFunc } from "../lib/zone-func";
import { scrollToElement } from "../lib/scroll-utils";
import Prism from "prismjs";
import "prismjs/components/prism-jsx";
import "./api-docs.css";

const ANIMATED_DIV = [
  {
    title: "keyframes",
    prototype: "[{ startTime, pattern, animation }]",
    desc: [
      <span className="line">
        A keyframe determines which pattern and animation are used at a specific
        point in time
      </span>,
    ],
    attribs: [
      {
        title: "startTime",
        prototype: "int",
        desc: [
          <span className="line">
            Delay in ms before applying the pattern or starting the animation
          </span>,
          <span className="line">
            Defaults to <b>0</b>
          </span>,
        ],
      },
      {
        title: "pattern",
        prototype:
          "{ cellCount, weightFunc, originFunc, invertWeights, uniqueWeights, normalizeWeights }",
        desc: [
          <span className="line">
            A pattern object holds information on the order of animation for
            each cell
          </span>,
          <span className="line">
            This order is determined by giving each cell a weight between{" "}
            <b>0.0</b> and <b>1.0</b>
          </span>,
          <span className="line">
            That weight is later multiplied by a base delay defined inside the
            animation object to create effects
          </span>,
          <span className="line">
            When left unset, any attribute of a pattern will first default to
            the value set on the pattern of any previous keyframe
          </span>,
        ],
        attribs: [
          {
            title: "cellCount",
            prototype: "{ x: int, y: int }",
            desc: [
              <span className="line">
                Horizontal and Vertical number of cells
              </span>,
            ],
          },
          {
            title: "backgroundImage",
            prototype: "string",
            desc: [
              <span className="line">CSS background-image string</span>,
              <span className="line">
                Supports urls, gradients and any other descriptors supported
                natively by the CSS property
              </span>,
              <span className="line">
                Defaults to <b>null</b>, using{" "}
                <b>background-color: currentColor</b> instead
              </span>,
            ],
          },
          {
            title: "weightFunc",
            prototype:
              "function (currentPoint: { x: int, y: int }, origin: { x: int, y: int }, arraySize: { x: int, y: int }): float [0..1]",
            desc: [
              <span className="line">
                Used to calculate a cell's weight - must return a <b>float</b>{" "}
                between <b>0.0</b> and <b>1.0</b>
              </span>,
              <span className="line">
                Defaults to <b>WeightFunction.Random.Default</b>
              </span>,
            ],
          },
          {
            title: "originFunc",
            prototype:
              "function (arraySize: { x: int, y: int }): { x: int [0..arraySize.x], y: int [0..arraySize.y] }",
            desc: [
              <span className="line">
                Used to calculate the point of origin - must return an{" "}
                <b>{"{ x: int, y: int }"}</b> object where <b>x</b> and <b>y</b>{" "}
                must be an integer between <b>0</b> and the corresponding
                dimension of <b>arraySize - 1</b>
              </span>,
              <span className="line">
                Defaults to <b>OriginFunc.Center</b>
              </span>,
            ],
          },
          {
            title: "invertWeights",
            prototype: "bool",
            desc: [
              <span className="line">Invert cell weights</span>,
              <span className="line">
                This means <b>weight</b> becomes <b>1 - weight</b>
              </span>,
              <span className="line">
                Defaults to <b>false</b>
              </span>,
            ],
          },
          {
            title: "uniqueWeights",
            prototype: "bool",
            desc: [
              <span className="line">Make all cell weights unique</span>,
              <span className="line">
                For isntance, <b>[0, .2, .3, .4, .4, 1]</b> becomes{" "}
                <b>[0, .2, .3, .35, .4, 1]</b>
              </span>,
              <span className="line">
                Defaults to <b>false</b>
              </span>,
            ],
          },
          {
            title: "normalizeWeights",
            prototype: "bool",
            desc: [
              <span className="line">Normalize all cell weights</span>,
              <span className="line">
                For isntance, <b>[0, .2, .3, .4, .4, 1]</b> becomes{" "}
                <b>[0, .25, .5, .75, .75, 1]</b>
              </span>,
              <span className="line">
                Defaults to <b>false</b>
              </span>,
            ],
          },
        ],
      },
      {
        title: "animation",
        prototype: "{ name, duration, delay, timingFunction, reverse }",
        desc: [
          <span className="line">
            An animation object holds the data relevant to the CSS property of
            the same name
          </span>,
          <span className="line">
            This includes: name, duration, delay, etc
          </span>,
        ],
        attribs: [
          {
            title: "name",
            prototype: "string",
            desc: [
              <span className="line">
                Used to determine the animation name that is used by a specific
                cell - must match an included CSS keyframes animation label
              </span>,
              <span className="line">
                Defaults to <b>AnimNames.ZoomIn.Default</b>
              </span>,
            ],
          },
          {
            title: "duration",
            prototype: "int",
            desc: [
              <span className="line">
                How long an individual cell's animation takes to finish after it
                begins, in ms
              </span>,
              <span className="line">
                Defaults to <b>500</b>
              </span>,
            ],
          },
          {
            title: "delay",
            prototype: "int",
            desc: [
              <span className="line">
                The base delay before an individual cell begins animating, in ms
              </span>,
              <span className="line">
                <b>Total delay = cell base delay * cell weight * 100</b>
              </span>,
              <span className="line">
                Defaults to <b>15</b>
              </span>,
            ],
          },
          {
            title: "timingFunction",
            prototype:
              '"linear" | "ease" | "ease-in" | "ease-out" | "ease-in-out"',
            desc: [
              <span className="line">Standard CSS timing function</span>,
              <span className="line">
                Defaults to <b>"linear"</b>
              </span>,
            ],
          },
          {
            title: "reverse",
            prototype: "bool",
            desc: [
              <span className="line">
                If <b>true</b>, animation is played backwards instead of
                forwards
              </span>,
              <span className="line">
                Defaults to <b>false</b>
              </span>,
            ],
          },
        ],
      },
    ],
  },
  {
    title: "repeat",
    prototype: "bool",
    desc: [
      <span className="line">
        Repeat all keyframes once the last one finishes playing
      </span>,
      <span className="line">
        Defaults to <b>false</b>
      </span>,
    ],
  },
  {
    title: "fitToChildren",
    prototype: "bool",
    desc: [
      <span className="line">
        Fit self to the size of the provided child content
      </span>,
      <span className="line">
        If <b>false</b>, will take <b>100%</b> of the parent container's size
      </span>,
      <span className="line">
        Defaults to <b>false</b>
      </span>,
    ],
  },
  {
    title: "onKeyframe",
    prototype: "function (keyframeIndex: int)",
    desc: [
      <span className="line">
        Callback for when a specific keyframe is hit
      </span>,
    ],
  },
];

const UTILS = [
  {
    title: "keyframe-utils",
    prototype: null,
    desc: [
      <span className="line">
        A set of helper functions to assist with the manipulation of the
        keyframe object
      </span>,
    ],
    attribs: [
      {
        title: "getRandomKeyframes",
        prototype:
          "function (duration: int, delay: int, count: int, options = {}): [{}]",
        desc: [
          <span className="line">
            Returns an array of <b>keyframe</b> objects of <b>count</b> size
          </span>,
          <span className="line">
            The <b>duration</b> and <b>delay</b> of animation is shared between
            all keyframs
          </span>,
          <span className="line">
            <b>weightFunc</b>, <b>originFunc</b> and <b>animationName</b> will
            be randomized, unless defaults are specified as part of the{" "}
            <b>opts</b> object
          </span>,
        ],
      },
      {
        title: "getTotalDuration",
        prototype: "function (keyframes: [{}]): int",
        desc: [
          <span className="line">
            Returns the total duration in ms of all animations in an array of{" "}
            <b>keyframe</b> objects of <b>count</b> size
          </span>,
        ],
      },
      {
        title: "isSameKeyframe",
        prototype: "function (keyframe1: {}, keyframe2: {}): bool",
        desc: [
          <span className="line">
            Returns whether two <b>keyframe</b> objects are equivalent in value
            - but not memory address
          </span>,
        ],
      },
    ],
  },
  {
    title: "point-utils",
    prototype: null,
    desc: [
      <span className="line">
        A set of helper functions to assist with the manipulation of the{" "}
        <b>{"{ x: int, y: int }"}</b> objects
      </span>,
    ],
    attribs: [
      {
        title: "point",
        prototype: "function (x: int, y: int): { x: int, y: int }",
        desc: [
          <span className="line">
            Used to map 2 int values into an <b>{"{ x: int, y: int }"}</b>{" "}
            object
          </span>,
        ],
      },
      {
        title: "boundPoint",
        prototype:
          "function (basePoint: { x: int, y: int }, maxPoint: { x: int, y: int }): { x: int, y: int }",
        desc: [
          <span className="line">
            Returns an <b>{"{ x: int, y: int }"}</b> object which is bound
            between <b>0</b> and the respective dimensions of <b>maxPoint</b>
          </span>,
        ],
      },
      {
        title: "pointName",
        prototype: "function (x: int, y: int): string",
        desc: [
          <span className="line">
            Returns a named point from an <b>{"{ x: int, y: int }"}</b> object -
            useful for creating keys out of points for mapping or direct
            comparison
          </span>,
        ],
      },
      {
        title: "getMaxDist",
        prototype:
          "function (point1: { x: int, y: int }, size: { x: int, y: int }): { x: int, y: int }",
        desc: [
          <span className="line">
            Returns the maximum distance between an{" "}
            <b>{"{ x: int, y: int }"}</b> object and <b>0</b> or the respective
            dimensions of <b>size</b>
          </span>,
        ],
      },
      {
        title: "getDistFromPoint",
        prototype:
          "function (point1: { x: int, y: int }, point2: { x: int, y: int }): { x: int, y: int }",
        desc: [
          <span className="line">
            Returns the absolute distance between two{" "}
            <b>{"{ x: int, y: int }"}</b> objects
          </span>,
        ],
      },
    ],
  },
];

const FUNCS = [
  {
    title: "OriginFunc",
    prototype: "function (arraySize: { x: int, y: int }): { x: int, y: int }",
    desc: [
      <span className="line">
        Used to calculate the point of origin - must return{" "}
        <b>{"{ x: int, y: int }"}</b> where <b>x</b> and <b>y</b> must be an
        integer between <b>0</b> and the corresponding dimension of{" "}
        <b>arraySize - 1</b>
      </span>,
      <span className="line">
        The following functions are bundled through <b>OriginFunc</b> for
        convenience:
      </span>,
      <div className="opts">
        {Object.keys(OriginFunc).map((item, index) => (
          <div className="opt" key={"OFK" + index}>
            {item}
          </div>
        ))}
      </div>,
    ],
  },
  {
    title: "WeightFunc",
    prototype:
      "function (currentPoint: { x: int, y: int }, origin: { x: int, y: int }, arraySize: { x: int, y: int }): float [0..1]",
    desc: [
      <span className="line">
        Used to calculate a cell's weight - must return a <b>float</b> between{" "}
        <b>0.0</b> and <b>1.0</b>
      </span>,
      <span className="line">
        The following functions are bundled through <b>WeightFunc</b> for
        convenience:
      </span>,
      <div className="opts">
        {Object.keys(WeightFunc).map((item, index) =>
          Object.keys(WeightFunc[item]).map((subItem, subIndex) => (
            <div className="opt" key={"WFK" + index + "_" + subIndex}>
              {item + "." + subItem}
            </div>
          ))
        )}
      </div>,
    ],
  },
  {
    title: "ZoneFunc",
    prototype:
      "function (currentPoint: { x: int, y: int }, origin: { x: int, y: int }, weight: float): bool",
    desc: [
      <span className="line">
        Used to identify whether a certain point is within a certain zone - must
        return a <b>bool</b>
      </span>,
      <span className="line">
        The following functions are bundled through <b>ZoneFunc</b> for
        convenience:
      </span>,
      <div className="opts">
        {Object.keys(ZoneFunc).map((item, index) => (
          <div className="opt" key={"ZFK" + index}>
            {item}
          </div>
        ))}
      </div>,
    ],
  },
];

const SECTIONS = [
  {
    title: "AnimatedDiv Component",
    items: ANIMATED_DIV,
  },
  {
    title: "utility functions",
    items: UTILS,
  },
  {
    title: "collections",
    items: FUNCS,
  },
];

class APIDocs extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      itemKey: "ECK_0_0",
    };
  }

  componentDidMount() {
    Prism.highlightAll();
  }

  handleCodeItemPreviewClick = (e) => {
    const elementId = e.target.getAttribute("href");
    const scrollContainer = document.getElementById("extended-api-docs");

    e.preventDefault();

    this.setState(
      {
        itemKey: elementId,
      },
      () => {
        Prism.highlightAll();
        scrollToElement(elementId, scrollContainer);
      }
    );
  };

  handleCodeItemClick = (e) => {
    const elementId = e.target.getAttribute("id");

    this.setState(
      {
        itemKey: elementId,
      },
      () => {
        Prism.highlightAll();
      }
    );
  };

  renderCodeItemPreview = (item, index, keyPrefix, titlePrefix) => {
    const itemKey = keyPrefix + "_" + index;
    const itemTitle = titlePrefix + item.title;
    const isCurrent = this.state.itemKey === "ECK" + itemKey;

    return (
      <div className="item" key={"CPK" + itemKey}>
        <a
          className={isCurrent ? "title current" : "title"}
          href={"ECK" + itemKey}
          onClick={this.handleCodeItemPreviewClick}
        >
          {itemTitle}
        </a>
        {item.attribs &&
          item.attribs.map((attrItem, attrIndex) =>
            this.renderCodeItemPreview(
              attrItem,
              attrIndex,
              itemKey,
              titlePrefix + "\t"
            )
          )}
      </div>
    );
  };

  renderCodeItem = (item, index, keyPrefix, titlePrefix) => {
    const itemKey = keyPrefix + "_" + index;
    const itemTitle = titlePrefix + item.title;

    const renderPrototype = () => {
      if (item.prototype) {
        return (
          <div className="code-box">
            <pre>
              <code className="language-javascript">{item.prototype}</code>
            </pre>
          </div>
        );
      }
    };

    const renderDesc = () => {
      if (item.desc) {
        return (
          <div className="desc">
            {(item.desc &&
              item.desc.map((descItem, descIndex) => (
                <Fragment key={"ECDK" + itemKey + "_" + descIndex}>
                  {descItem}
                </Fragment>
              ))) ||
              "No description"}
          </div>
        );
      }
    };

    const renderSelf = (itemKey) => {
      if (this.state.itemKey === itemKey) {
        return (
          <div className="info current" id={itemKey}>
            <div className="title">
              {titlePrefix}
              <b>{item.title}</b>
            </div>
            {renderPrototype()}
            {renderDesc()}
          </div>
        );
      }

      return (
        <div className="info" id={itemKey} onClick={this.handleCodeItemClick}>
          <div className="title">
            {titlePrefix}
            <b>{item.title}</b>
            <div className="flex-space"></div>
            <i className="fas fa-caret-down"></i>
          </div>
        </div>
      );
    };

    return (
      <div className="item" key={"ECK" + itemKey}>
        {renderSelf("ECK" + itemKey)}
        {item.attribs &&
          item.attribs.map((attrItem, attrIndex) =>
            this.renderCodeItem(attrItem, attrIndex, itemKey, itemTitle + ".")
          )}
      </div>
    );
  };

  render() {
    return (
      <div className="api-docs">
        <div className="preview column">
          {SECTIONS.map((sItem, sIndex) => (
            <div className="section" key={"PSK" + sIndex}>
              <div className="title">{sItem.title}</div>
              {sItem.items.map((item, index) =>
                this.renderCodeItemPreview(item, index, "_" + sIndex, "")
              )}
            </div>
          ))}
        </div>
        <div className="extended column" id="extended-api-docs">
          {SECTIONS.map((sItem, sIndex) => (
            <div className="section" key={"ESK" + sIndex}>
              {sItem.items.map((item, index) =>
                this.renderCodeItem(item, index, "_" + sIndex, "")
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }
}

export default APIDocs;
