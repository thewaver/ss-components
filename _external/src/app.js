import React, { Component } from "react";
import AnimationWizard from "./components/animation-wizard";
import Gallery from "./components/gallery";
import Tutorial from "./components/tutorial";
import APIDocs from "./components/api-docs";
import Header from "./components/header";
import { scrollToPos } from "./lib/scroll-utils";
import "./app.css";
import "./style.css";
import "./prism.css";

const SCREENS = {
  NONE: "",
  OVERVIEW: "OVERVIEW",
  API_DOCS: "API_DOCS",
  BUILDER: "BUILDER",
  GALLERY: "GALLERY",
};

class App extends Component {
  constructor(props) {
    super(props);

    const pathName = window.location.pathname.toUpperCase().split("/")[1];
    const screen = SCREENS[pathName] ?? SCREENS.NONE;

    this.state = {
      init: screen !== SCREENS.NONE,
      screen,
    };
  }

  navigateToScreen = (screen) => {
    this.setState(
      {
        init: true,
        screen,
      },
      () => {
        window.history.pushState("", "", screen.toLowerCase());
        scrollToPos(0, window, true);
      }
    );
  };

  handleGalleryClick = () => {
    this.navigateToScreen(SCREENS.GALLERY);
  };

  handleBuilderClick = () => {
    this.navigateToScreen(SCREENS.BUILDER);
  };

  handleOverviewClick = () => {
    this.navigateToScreen(SCREENS.OVERVIEW);
  };

  handleAPIDocsClick = () => {
    this.navigateToScreen(SCREENS.API_DOCS);
  };

  renderBody = () => {
    if (this.state.init) {
      switch (this.state.screen) {
        case SCREENS.OVERVIEW:
          return (
            <Tutorial
              onTutorialClick={this.handleOverviewClick}
              onAPIDocsClick={this.handleAPIDocsClick}
              onWizardClick={this.handleBuilderClick}
              onGalleryClick={this.handleGalleryClick}
            ></Tutorial>
          );
        case SCREENS.API_DOCS:
          return <APIDocs></APIDocs>;
        case SCREENS.BUILDER:
          return <AnimationWizard></AnimationWizard>;
        case SCREENS.GALLERY:
          return <Gallery></Gallery>;
        default:
          return;
      }
    }
  };

  render() {
    return (
      <div className="app">
        <Header
          compact={this.state.init}
          onTutorialClick={this.handleOverviewClick}
          onAPIDocsClick={this.handleAPIDocsClick}
          onWizardClick={this.handleBuilderClick}
          onGalleryClick={this.handleGalleryClick}
        ></Header>
        <div
          className="body"
          style={{ display: this.state.init ? "initial" : "none" }}
        >
          {this.renderBody()}
        </div>
      </div>
    );
  }
}

export default App;
