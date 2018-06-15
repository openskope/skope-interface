import React from 'react';
import {
  parse as parseUrl,
  format as formatUrl,
} from 'url';
import {
  parse as parseQueryString,
  stringify as stringifyQueryString,
} from 'querystring';

import {
  fillTemplateString,
} from '/imports/ui/helpers';

/**
 * @param {Object} layer
 * @param {string} layer.url
 * @param {Object} layer.legendStyle
 * @param {Object} fillers
 * @returns {ReactElement}
 */
export
const wms = (layer, fillers) => {
  const urlParse = parseUrl(layer.url);
  const queryParse = parseQueryString(urlParse.query, '&', '=');
  const layersString = queryParse.layers;

  if (!layersString) {
    return null;
  }

  const layerNames = String.prototype.split.call(layersString, ',').map((s) => String.prototype.trim.call(s));
  const nameOfFirstLayer = layerNames[0];

  if (!nameOfFirstLayer) {
    return null;
  }

  const legendUrl = formatUrl({
    protocol: urlParse.protocol,
    host: urlParse.host,
    pathname: urlParse.pathname,
    query: {
      REQUEST: 'GetLegendGraphic',
      VERSION: '1.0.0',
      FORMAT: 'image/png',
      LAYER: fillTemplateString(nameOfFirstLayer, fillers),
      LEGEND_OPTIONS: stringifyQueryString({
        layout: 'vertical',
        dx: 10,
      }, ';', ':'),
    },
  });

  return (
    <div
      slot="bottom-dock"
      style={layer.legendStyle}
    >
      <img
        alt="legend"
        src={legendUrl}
        style={{
          verticalAlign: 'bottom',
        }}
      />
    </div>
  );
};
