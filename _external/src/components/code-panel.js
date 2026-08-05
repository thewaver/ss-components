import React, { PureComponent } from "react";
import Prism from "prismjs";
import "prismjs/components/prism-jsx";
import "./code-panel.css";

class CodePanel extends PureComponent {
  componentDidMount() {
    Prism.highlightAll();
  }

  render() {
    return (
      <div className="code-panel">
        {this.props.snippets.map((item, index) => (
          <pre className="snippet" key={"CSK_" + index}>
            <code className="language-jsx">{item}</code>
          </pre>
        ))}
      </div>
    );
  }
}

export default CodePanel;
