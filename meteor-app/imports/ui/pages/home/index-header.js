/*
 * Home page.
 */

import React from 'react';
import TextMenu from '/imports/ui/components/textmenu';

export function IndexHeader() {
  const itemsArr = [{ type: 'menuitem', label: 'SKOPE NSF Proposal', onClick: () => { window.location.href = 'https://www.openskope.org/skope-nsf-proposal'; }, id: '1' },
                  { type: 'menuitem', label: 'SKOPE Prototype', onClick: () => { window.location.href = 'https://www.openskope.org/skope-prototype'; }, id: '2' },
                  { type: 'menuitem', label: 'Stories', onClick: () => { window.location.href = 'https://www.openskope.org/sample-questions-of-the-sort-skope-plans-to-address'; }, id: '3' }];
  const itemsArr2 = [
    { type: 'menuitem', label: 'FedData', onClick: () => { window.location.href = 'https://www.openskope.org/feddata'; }, id: '4' },
    { type: 'menuitem', label: 'PaleoCAR', onClick: () => { window.location.href = 'https://www.openskope.org/paleoenvironmental-reconstruction-paleocar'; }, id: '5' },
    { type: 'menuitem', label: 'Risk Landscapes', onClick: () => { window.location.href = 'https://www.openskope.org/risk-landscapes'; }, id: '6' },
    { type: 'menuitem', label: 'SKOPE Prototype', onClick: () => { window.location.href = 'https://www.openskope.org/skope-prototype'; }, id: '7' },
    { type: 'menuitem', label: 'Web Resources', onClick: () => { window.location.href = 'https://www.openskope.org/skope-prototype'; }, id: '8' },
  ];
  const itemsArr3 = [
    { type: 'menuitem', label: 'YesWorkflow', onClick: () => { window.location.href = 'https://www.openskope.org/yesworkflow'; }, id: '9' },
  ];
  const itemsArr4 = [
    { type: 'menuitem', label: "Prototype User's Guide", onClick: () => { window.location.href = 'https://www.openskope.org/skope-prototype-users-guide'; }, id: '10' },
    { type: 'menuitem', label: 'Run SKOPE Prototype', onClick: () => { window.location.href = 'http://demo.openskope.org/browse/'; }, id: '11' },
  ];
  const itemsArr5 = [
    { type: 'menuitem', label: 'Publications', onClick: () => { window.location.href = 'http://demo.openskope.org/browse/'; }, id: '12' },
    { type: 'menuitem', label: 'Presentations', onClick: () => { window.location.href = 'https://www.openskope.org/presentations'; }, id: '13' },
    { type: 'menuitem', label: 'SKOPE Prototype', onClick: () => { window.location.href = 'https://www.openskope.org/presentations'; }, id: '14' },
    { type: 'menuitem', label: 'YesWorkflow', onClick: () => { window.location.href = 'https://www.openskope.org/yesworkflow'; }, id: '15' },
  ];

  const dataVar = [
    { type: 'menu', label: 'What is SKOPE?', items: itemsArr },
    { type: 'menu', label: 'Environmental Data', items: itemsArr2 },
    { type: 'menu', label: 'Provenance', items: itemsArr3 },
    { type: 'menu', label: 'Data Integration', onClick: () => { window.location.href = 'https://www.openskope.org/data-integration'; } },
    { type: 'menu', label: 'SKOPE Prototype', items: itemsArr4 },
    { type: 'menu', label: 'Products', items: itemsArr5 },
    { type: 'menu', label: 'SKOPE Team', onClick: () => { window.location.href = 'https://www.openskope.org/data-integration'; } },
  ];

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
