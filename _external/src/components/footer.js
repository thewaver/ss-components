import React, { PureComponent } from "react";
import "./footer.css";

class Footer extends PureComponent {
  render() {
    return (
      <div className="footer">
        <span>
          Developed by{" "}
          <a
            href="https://www.linkedin.com/in/luis-santos-09461531/"
            target="_blank"
            rel="noreferrer"
          >
            Luis Santos
          </a>
          . Responsiveness coming soon.
        </span>
      </div>
    );
  }
}

export default Footer;
