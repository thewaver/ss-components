import React, { PureComponent } from "react";
import BigO from "../samples/big-o";
import AnimatedButton from "../samples/animated-button";
import Slideshow from "../samples/slideshow";
import "./gallery.css";

const ITEMS = [
  {
    title: "Big O",
    content: (
      <div className="g-big-o-anchor">
        <BigO></BigO>
      </div>
    ),
  },
  {
    title: "Animated Button",
    content: (
      <div className="g-animated-buttons">
        <AnimatedButton repeat={true}>click me</AnimatedButton>
        <AnimatedButton repeat={true}>no, click me</AnimatedButton>
        <AnimatedButton repeat={true}>no, me, me, ME!</AnimatedButton>
      </div>
    ),
  },
  {
    title: "Slideshow",
    content: (
      <div className="g-slideshow">
        <Slideshow></Slideshow>
      </div>
    ),
  },
];

class Gallery extends PureComponent {
  render() {
    return (
      <div className="gallery">
        <div className="title">Components</div>
        <div className="section">
          {ITEMS.map((item, index) => (
            <div className="item" key={`GI${index}`}>
              <div className="content">{item.content}</div>
              <div className="label">{item.title}</div>
            </div>
          ))}
        </div>
        <div className="title">Pages</div>
        <div className="subtitle">{"(none available yet)"}</div>
      </div>
    );
  }
}

export default Gallery;
