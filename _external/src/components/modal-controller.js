import React, { PureComponent } from "react";
import "./modal-controller.css";

class Modal extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      visible: true,
    };
  }

  componentDidMount() {
    this.scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    document.addEventListener("click", this.handleClick, false);
    window.addEventListener("scroll", this.handleScroll, false);
    window.addEventListener("keyup", this.handleKeyUp, false);
  }

  componentWillUnmount() {
    document.removeEventListener("click", this.handleClick, false);
    window.removeEventListener("scroll", this.handleScroll, false);
    window.removeEventListener("keyup", this.handleKeyUp, false);
  }

  close = () => {
    this.setState({
      visible: false,
    });

    this.props.onClose();
  };

  handleClick = (e) => {
    if (
      this.props.closeOnInsideClick ||
      (this.node && !this.node.contains(e.target))
    )
      this.close();
  };

  handleScroll = (e) => {
    if (this.state.visible) {
      window.scrollTo(0, this.scrollTop);
    }
  };

  handleKeyUp = (e) => {
    if (e.keyCode === 27) {
      this.close();
    }
  };

  render() {
    if (!this.state.visible) return null;

    return (
      <div className="modal" onClick={this.handleClick}>
        <span className="close">
          CLOSE <i className="fas fa-times-circle"></i>
        </span>
        <div
          className="content"
          ref={(node) => {
            this.node = node;
          }}
        >
          {this.props.children}
        </div>
      </div>
    );
  }
}

class ModalController extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      modalVisible: false,
    };
  }

  handleModalClose = () => {
    this.setState({
      modalVisible: false,
    });
  };

  handleClick = (e) => {
    e.stopPropagation();

    if (!this.state.modalVisible) {
      this.setState({
        modalVisible: true,
      });
    }
  };

  renderModal = () => {
    if (!this.state.modalVisible) return null;

    return (
      <Modal
        onClose={this.handleModalClose}
        closeOnInsideClick={this.props.closeOnInsideClick}
      >
        {this.props.modalContent}
      </Modal>
    );
  };

  render() {
    return (
      <div className="modal-controller" onClick={this.handleClick}>
        {this.props.children}
        {this.renderModal()}
      </div>
    );
  }
}

export default ModalController;
