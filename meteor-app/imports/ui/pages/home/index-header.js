/*
 * Home page.
 */

import React from 'react';
import { FlowRouter } from 'meteor/ostrio:flow-router-extra';
import TextMenu from '/imports/ui/components/textmenu';

export function IndexHeader() {
  const dataVar = [];
  const itemsArr = [{ type: 'menuitem', label: 'SKOPE NSF Proposal' },
                  { type: 'menuitem', label: 'SKOPE Prototype' },
                  { type: 'menuitem', label: 'Stories' }];
  dataVar.push({ type: 'menu', label: 'What is SKOPE?', items: itemsArr });

  const itemsArr2 = [
    { type: 'menuitem', label: 'FedData', onClick: () => { FlowRouter.go('/imports/ui/components/hahahahaha'); } },
    { type: 'menuitem', label: 'PaleoCAR', onClick: () => { FlowRouter.go('/imports/ui/components/hahahahaha'); } },
    { type: 'menuitem', label: 'Risk Landscapes', onClick: () => { FlowRouter.go('/imports/ui/components/hahahahaha'); } },
    { type: 'menuitem', label: 'SKOPE Prototype', onClick: () => { FlowRouter.go('/imports/ui/components/hahahahaha'); } },
    { type: 'menuitem', label: 'Web Resources', onClick: () => { FlowRouter.go('/imports/ui/components/hahahahaha'); } },
  ];
  dataVar.push({ type: 'menu', label: 'Environmental Data', items: itemsArr2 });
  const itemsArr3 = [
    { type: 'menuitem', label: 'YesWorkflow', onClick: () => { FlowRouter.go('/imports/ui/components/hahahahaha'); } },
  ];
  dataVar.push({ type: 'menu', label: 'Provenance', items: itemsArr3 });
  dataVar.push({ type: 'menu', label: 'Data Integration' });
  const itemsArr4 = [
    { type: 'menuitem', label: "Prototype User's Guide", onClick: () => { FlowRouter.go('/imports/ui/components/hahahahaha'); } },
    { type: 'menuitem', label: 'Run SKOPE Prototype', onClick: () => { FlowRouter.go('/imports/ui/components/hahahahaha'); } },
  ];
  dataVar.push({ type: 'menu', label: 'SKOPE Prototype', items: itemsArr4 });
  const itemsArr5 = [
    { type: 'menuitem', label: 'Publications', onClick: () => { FlowRouter.go('/imports/ui/components/hahahahaha'); } },
    { type: 'menuitem', label: 'Presentations', onClick: () => { FlowRouter.go('/imports/ui/components/hahahahaha'); } },
    { type: 'menuitem', label: 'SKOPE Prototype', onClick: () => { FlowRouter.go('/imports/ui/components/hahahahaha'); } },
    { type: 'menuitem', label: 'YesWorkflow', onClick: () => { FlowRouter.go('/imports/ui/components/hahahahaha'); } },
  ];
  dataVar.push({ type: 'menu', label: 'Products', items: itemsArr5 });
  dataVar.push({ type: 'menu', label: 'SKOPE Team' });

  const styleVar = { textMenuStyle: { margin: '0px', border: '0px', backgroundColor: 'rgb(247, 245, 231)', textAlign: 'center' } };

  const imageStyle = {
    background: 'url(https://www.openskope.org/wp-content/uploads/2015/03/cropped-grissno2ce4.jpg) no-repeat scroll top',
    height: '230px',
    border: '0px',
    margin: '0px',
    padding: '0px 0px 0px 0px',
  };

  const h1Style = {
    fontFamily: 'Bitter, Georgia, serif',
    color: '#ac0404',
    fontWeight: 'bold',
    fontSize: '60px',
    lineHeight: '1',
    margin: '0px',
    padding: '58px 40px 10px',
  };

  const h2Style = {
    font: '300 italic 24px "Source Sans Pro", Helvetica, sans-serif',
    color: '#960028',
    margin: '0',
    padding: '0px 40px',
  };

  return (
    <div>
      <div style={imageStyle}>
        <h1 style={h1Style}>SKOPE</h1>
        <h2 style={h2Style}>Synthesizing Knowledge of Past Environments</h2>
      </div>
      <TextMenu style={styleVar} data={dataVar} />
    </div>
  );
}
