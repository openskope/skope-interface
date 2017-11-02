/*
 * Home page.
 */

import React from 'react';
import IconMenu from 'material-ui/IconMenu';
import MenuItem from 'material-ui/MenuItem';
import IconButton from 'material-ui/IconButton';
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert';
import { FlowRouter } from 'meteor/ostrio:flow-router-extra';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import TextMenu from '/imports/ui/components/textmenu';

export function IndexHeader(props) {
  var dataVar = [];
  var itemsArr = [{type: 'menuitem', label:'SKOPE NSF Proposal'}, 
                  {type: 'menuitem', label:'SKOPE Prototype'},
                  {type: 'menuitem', label:'Stories'}];
  dataVar.push({type: 'menu', label:'What is SKOPE?', items:itemsArr});

  function someFunction() {
    FlowRouter.go('/imports/ui/components/appbar.js');
  }

  var itemsArr2 = [
    {type: 'menuitem', label: 'FedData', onClick: () => {FlowRouter.go('/imports/ui/components/hahahahaha');}},
    {type: 'menuitem', label: 'PaleoCAR', onClick: () => {FlowRouter.go('/imports/ui/components/hahahahaha');}},
    {type: 'menuitem', label: 'Risk Landscapes', onClick: () => {FlowRouter.go('/imports/ui/components/hahahahaha');}},
    {type: 'menuitem', label: 'SKOPE Prototype', onClick: () => {FlowRouter.go('/imports/ui/components/hahahahaha');}},
    {type: 'menuitem', label: 'Web Resources', onClick: () => {FlowRouter.go('/imports/ui/components/hahahahaha');}},
  ];
  dataVar.push({type:'menu', label:'Environmental Data', items:itemsArr2});
  var itemsArr3 = [
    {type: 'menuitem', label: 'YesWorkflow', onClick: () => {FlowRouter.go('/imports/ui/components/hahahahaha');}},
  ];
  dataVar.push({type:'menu', label:'Provenance', items:itemsArr3});
  dataVar.push({type:'menu', label:'Data Integration'});
  var itemsArr4 = [
    {type: 'menuitem', label: "Prototype User's Guide", onClick: () => {FlowRouter.go('/imports/ui/components/hahahahaha');}},
    {type: 'menuitem', label: 'Run SKOPE Prototype', onClick: () => {FlowRouter.go('/imports/ui/components/hahahahaha');}},
  ];
  dataVar.push({type:'menu', label:'SKOPE Prototype', items:itemsArr4});
  var itemsArr5 = [
    {type: 'menuitem', label: "Publications", onClick: () => {FlowRouter.go('/imports/ui/components/hahahahaha');}},
    {type: 'menuitem', label: "Presentations", onClick: () => {FlowRouter.go('/imports/ui/components/hahahahaha');}},
    {type: 'menuitem', label: 'SKOPE Prototype', onClick: () => {FlowRouter.go('/imports/ui/components/hahahahaha');}},
    {type: 'menuitem', label: 'YesWorkflow', onClick: () => {FlowRouter.go('/imports/ui/components/hahahahaha');}},
  ];
  dataVar.push({type:'menu', label:'Products', items:itemsArr5});
  dataVar.push({type:'menu', label:'SKOPE Team'});
  return (<TextMenu data={dataVar}/>);

/*  return (
  <MuiThemeProvider>
  <div>
    <IconMenu
      iconButtonElement={<IconButton><p>Some text here</p></IconButton>}
      anchorOrigin={{horizontal: 'left', vertical: 'top'}}
      targetOrigin={{horizontal: 'left', vertical: 'top'}}
    >
      <MenuItem primaryText="Refresh" />
      <MenuItem primaryText="Send feedback" />
      <MenuItem primaryText="Settings" />
      <MenuItem primaryText="Help" />
      <MenuItem primaryText="Sign out" />
    </IconMenu>
    <IconMenu
      iconButtonElement={<IconButton><MoreVertIcon /></IconButton>}
      anchorOrigin={{horizontal: 'left', vertical: 'bottom'}}
      targetOrigin={{horizontal: 'left', vertical: 'bottom'}}
    >
      <MenuItem primaryText="Refresh" />
      <MenuItem primaryText="Send feedback" />
      <MenuItem primaryText="Settings" />
      <MenuItem primaryText="Help" />
      <MenuItem primaryText="Sign out" />
    </IconMenu>
    <IconMenu
      iconButtonElement={<IconButton><MoreVertIcon /></IconButton>}
      anchorOrigin={{horizontal: 'right', vertical: 'bottom'}}
      targetOrigin={{horizontal: 'right', vertical: 'bottom'}}
    >
      <MenuItem primaryText="Refresh" />
      <MenuItem primaryText="Send feedback" />
      <MenuItem primaryText="Settings" />
      <MenuItem primaryText="Help" />
      <MenuItem primaryText="Sign out" />
    </IconMenu>
    <IconMenu
      iconButtonElement={<IconButton><MoreVertIcon /></IconButton>}
      anchorOrigin={{horizontal: 'right', vertical: 'top'}}
      targetOrigin={{horizontal: 'right', vertical: 'top'}}
    >
      <MenuItem primaryText="Refresh" />
      <MenuItem primaryText="Send feedback" />
      <MenuItem primaryText="Settings" />
      <MenuItem primaryText="Help" />
      <MenuItem primaryText="Sign out" />
    </IconMenu>
  </div>
  </MuiThemeProvider>); */
};
