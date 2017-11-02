import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import MenuItem from 'material-ui/MenuItem';
import FlatButton from 'material-ui/FlatButton';
import Menu from 'material-ui/Menu';
import Popover from 'material-ui/Popover';
import Divider from 'material-ui/Divider';
import React from 'react';

export default class TextMenu extends React.Component {
  constructor(props) {
    super(props);

    this.state = { open: [] };
    this.data = this.props.data;
    for (let i = 0; i < this.data.length; i += 1) {
      this.state.open.push(false);
    }
    this.numberOfElements = 0;
  }

  handleTouchTap(id, event) {
    // This prevents ghost click.
    event.preventDefault();

    this.setState({
      open: this.state.open.map((value, i) => (i === id ? true : value)),
      anchorEl: event.currentTarget,
    });
  }

  handleRequestClose(id) {
    console.log("asdasd");
    this.setState({
      open: this.state.open.map((value, i) => (i === id ? false : value)),
    });
  }

  convertRecursiveMenuItems(arrayOfItems, level) {
    if (arrayOfItems==null)
	return (null);

    return (arrayOfItems.map((
      (o,j) => {
         let element = null;
         if(o.type == 'menuitem') {
           element = (<MenuItem primaryText={o.label} key={'menuitem' + this.numberOfElements} onClick={o.onClick}/>);
         } else if(o.type == 'menuitem-group') {
           let children = this.convertRecursiveMenuItems(o.items, level+1);
           element = (<MenuItem primaryText={o.label} key={'menuitem' + this.numberOfElements} menuItems={children}/ >);
         } else if(o.type == 'separator') {
           element = (<Divider key={'divider' + this.numberOfElements}/>);
         }
         this.numberOfElements += 1;
         return element;
       }
    )));
  }

  render() {
    const reactComponents = [];

    for (let i = 0; i < this.data.length; i += 1) {
      reactComponents.push(
        <FlatButton
          onClick={this.handleTouchTap.bind(this, i)}
          label={this.data[i].label}
          key={'button' + i}
          backgroundColor={'#f7f5e7'}
        />);
      this.numberOfElements += 1;
      reactComponents.push(
        <Popover
          open={this.state.open[i]}
          anchorEl={this.state.anchorEl}
          anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
          targetOrigin={{ horizontal: 'left', vertical: 'top' }}
          onRequestClose={this.handleRequestClose.bind(this, i)}
          onMouseLeave={this.handleRequestClose.bind(this,i)}
          key={'popover'+ (this.numberOfElements++)}
        >
          <Menu>
            {
              this.convertRecursiveMenuItems(this.data[i].items, 0)
            }
          </Menu>
        </Popover>
       );
    } // for

    return (
      <MuiThemeProvider>
        <div>
          {reactComponents}
        </div>
      </MuiThemeProvider>
    );
  }
}
