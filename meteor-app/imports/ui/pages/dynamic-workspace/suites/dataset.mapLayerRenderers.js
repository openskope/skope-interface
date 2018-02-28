import React from 'react';

import {
  fillTemplateString,
} from '/imports/ui/helpers';

/**
 * @param {Object} layer
 * @param {string} layer.id
 * @param {string} layer.title
 * @param {string} layer.url
 * @param {Array.<number>} layer.extent
 * @param {boolean} layer.visible
 * @param {number} layer.opacity
 * @param {Object} fillers
 * @returns {ReactElement}
 */
export
const wms = (layer, fillers) => {
  return (
    <map-layer-twms
      key={layer.id}
      name={layer.title}
      projection="EPSG:4326"
      extent={layer.extent}
      invisible={layer.visible ? null : 'invisible'}
      opacity={layer.opacity}
      url={fillTemplateString(layer.url, fillers)}
      server-type="geoserver"
    />
  );
};
