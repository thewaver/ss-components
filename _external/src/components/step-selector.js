import React, { PureComponent } from "react";
import "./step-selector.css";

class StepSelector extends PureComponent {
  getStepClassNames = (index) => {
    const current = this.props.current || 0;

    return (
      "step " +
      (index === current ? "current " : "") +
      (index < current ? "done " : "")
    );
  };

  handleTitleClick = (index) => {
    const current = this.props.current || 0;

    if (this.props.onTitleClick && index <= current) {
      this.props.onTitleClick(index);
    }
  };

  render() {
    return (
      <div className="step-selector">
        {this.props.titles.map((item, index) => (
          <div className={this.getStepClassNames(index)} key={`SSI${index}`}>
            <div className="title" onClick={() => this.handleTitleClick(index)}>
              {item} <b>{this.props.values && this.props.values[index]}</b>
            </div>
            {this.props.descriptions[index]}
          </div>
        ))}
      </div>
    );
  }
}

export default StepSelector;
