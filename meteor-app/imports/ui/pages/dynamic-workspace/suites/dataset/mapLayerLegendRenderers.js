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
 * @param {Object} fillers
 * @returns {ReactElement}
 */
export
const wms = (layer, fillers) => {
  const urlParse = parseUrl(layer.url);
  const queryParse = parseQueryString(urlParse.query, '&', '=');
  const layerNames = queryParse.layers.split(',').map((s) => String.prototype.trim.call(s));
  const nameOfFirstLayer = layerNames[0];
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
      style={{
        position: 'absolute',
        bottom: '0.5em',
        left: '0.5em',
      }}
    >
      <img
        alt="legend"
        src={legendUrl}
      />
    </div>
  );
};
