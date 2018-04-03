import React from 'react';
import PropTypes from 'prop-types';
import Divider from 'material-ui/Divider';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';

export
const bemBlockName = 'search-result-item';

export
const renderCardWithDivier = ({
  dividerStyle,
  cardRenderer,
  ...props
}) => {
  return (
    <div
      {...props}
    >
      <Divider
        style={{
          marginBottom: '10px',
          ...dividerStyle,
        }}
      />
      {cardRenderer()}
    </div>
  );
};

export
const defaultPropTypes = {
  routing: PropTypes.object,
  result: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    _source: PropTypes.object.isRequired,
  }).isRequired,
};

export
const defaultProps = {
  routing: null,
};

export
class DialogButton extends React.Component {
  static propTypes = {
    buttonComponent: PropTypes.object,
    buttonProps: PropTypes.object,
    dialogProps: PropTypes.object,
    dialogOnOpen: PropTypes.func,
    dialogOnClose: PropTypes.func,
  };

  static defaultProps = {
    buttonComponent: null,
    buttonProps: null,
    dialogProps: null,
    dialogOnOpen: null,
    dialogOnClose: null,
  };

  constructor (props) {
    super(props);

    this.state = {
      isOpen: false,
    };
  }

  handleOpen = () => {
    if (this.props.dialogOnOpen) {
      this.props.dialogOnOpen();
    }

    this.setState({
      isOpen: true,
    });
  };

  handleClose = () => {
    if (this.props.dialogOnClose) {
      this.props.dialogOnClose();
    }

    this.setState({
      isOpen: false,
    });
  };

  render () {
    const ButtonComponent = this.props.buttonComponent ? this.props.buttonComponent.type : FlatButton;
    const buttonProps = {
      ...(this.props.buttonComponent && this.props.buttonComponent.props),
      ...this.props.buttonProps,
    };

    const {
      children: buttonChildren,
      ...buttonPropsWithoutChildren
    } = buttonProps;

    // Because returning a fragment or an array is not supported,
    // have to stuff the `Dialog` component inside the button.
    return (
      <ButtonComponent
        {...buttonPropsWithoutChildren}
        onClick={this.handleOpen}
      >
        {buttonChildren}
        <Dialog
          autoDetectWindowHeight
          autoScrollBodyContent
          modal={false}
          actions={[
            <FlatButton
              label="Close"
              primary
              onClick={this.handleClose}
            />,
          ]}
          {...this.props.dialogProps}
          open={this.state.isOpen}
          onRequestClose={this.handleClose}
        />
      </ButtonComponent>
    );
  }
}
