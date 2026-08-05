import React, { PureComponent } from "react";
import AnimatedButton from "../samples/animated-button";
import BigO from "../samples/big-o";
import { LABELS } from "../lib/const";
import "./header.css";

const APP_DESC =
  "Create stunning particle animations with ease! Imagination is your limit. Also web technologies - they can limit you too...";

class Header extends PureComponent {
  getClassNames = () => {
    return `header ${this.props.compact ? "small" : "large"}`;
  };

  render() {
    return (
      <div className={this.getClassNames()}>
        <div className="menu">
          <div className="title-and-subtitle">
            <div className="title">
              <div className="chars">ANIM</div>
              <div className="space">{<BigO></BigO>}</div>
              <div className="chars">S</div>
            </div>
            <span className="subtitle">
              Developed by{" "}
              <a
                href="https://www.linkedin.com/in/luis-santos-09461531/"
                target="_blank"
                rel="noreferrer"
              >
                Luis Santos
              </a>
            </span>
          </div>
          <div className="flex-space"></div>
          <div className="menu-item">
            <button className="ghost-button" onClick={this.props.onWizardClick}>
              {LABELS.WIZARD}
            </button>
          </div>
          <div className="menu-item">
            <button
              className="ghost-button"
              onClick={this.props.onGalleryClick}
            >
              {LABELS.GALLERY}
            </button>
          </div>
          <div className="menu-item">
            <button
              className="ghost-button"
              onClick={this.props.onTutorialClick}
            >
              {LABELS.TUTORIAL}
            </button>
          </div>
          <div className="menu-item">
            <button
              className="ghost-button"
              onClick={this.props.onAPIDocsClick}
            >
              {LABELS.API_DOCS}
            </button>
          </div>
        </div>
        <div className="content">
          <div className="desc">{APP_DESC}</div>
          <div className="buttons">
            <AnimatedButton
              className="button"
              onClick={this.props.onWizardClick}
            >
              <i className="fas fa-tools icon"></i>
              <br />
              {LABELS.WIZARD}
            </AnimatedButton>
            <AnimatedButton
              className="button"
              onClick={this.props.onGalleryClick}
            >
              <i className="fas fa-images icon"></i>
              <br />
              {LABELS.GALLERY}
            </AnimatedButton>
            <AnimatedButton
              className="button"
              onClick={this.props.onTutorialClick}
            >
              <i className="fas fa-graduation-cap icon"></i>
              <br />
              {LABELS.TUTORIAL}
            </AnimatedButton>
            <AnimatedButton
              className="button"
              onClick={this.props.onAPIDocsClick}
            >
              <i className="fas fa-book icon"></i>
              <br />
              {LABELS.API_DOCS}
            </AnimatedButton>
          </div>
        </div>
      </div>
    );
  }
}

export default Header;
