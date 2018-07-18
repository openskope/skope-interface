import React from 'react';

import {
  fillTemplateString,
} from '/imports/ui/helpers';

/**
 * @param {Object} layer
 * @param {string} layer.name
 * @param {string} layer.url
 * @param {Array<number>} layer.extent
 * @param {boolean} layer.visible
 * @param {number} layer.opacity
 * @param {Object} fillers
 * @returns {ReactElement}
 */
export
const wms = (layer, fillers) => {
  return (
    <map-layer-twms
      key={layer.name}
      name={layer.name}
      extent={layer.extent}
      invisible={layer.visible ? null : 'invisible'}
      opacity={layer.opacity}
      url={fillTemplateString(layer.url, fillers)}
      server-type="geoserver"
    />
  );
};

/**
 * @param {Object} layer
 * @param {string} layer.name
 * @param {string} layer.url
 * @param {Array<number>} layer.extent
 * @param {boolean} layer.visible
 * @param {number} layer.opacity
 * @param {Object} fillers
 * @returns {ReactElement}
 */
export
const xyz = (layer, fillers) => {
  return (
    <map-layer-xyz
      key={layer.name}
      name={layer.name}
      extent={layer.extent}
      invisible={layer.visible ? null : 'invisible'}
      opacity={layer.opacity}
      url={fillTemplateString(layer.url, fillers)}
    />
  );
};
