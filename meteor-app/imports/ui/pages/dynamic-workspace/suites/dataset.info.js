import React from 'react';
import Paper from 'material-ui/Paper';

import {
  DatasetInfoIcon,
} from '/imports/ui/consts';

import {
  MarkDownRenderer,
} from '/imports/ui/helpers';

import MapView from '/imports/ui/components/mapview';

import TabComponentClass from './TabComponentClass';

export default
class InfoTab extends TabComponentClass {
  static tabIcon = DatasetInfoIcon;
  static tabLabel = 'Info';
  static requiredProps = [
    'information',
  ];

  renderBody () {
    const {
      information: informationField,
    } = this.props;

    const boundaryGeoJson = this.component.boundaryGeoJson;
    const boundaryGeoJsonString = boundaryGeoJson && JSON.stringify(boundaryGeoJson);
    const boundaryExtent = this.component.extent;

    return (
      <div className="dataset__info-tab">
        <Paper
          className="info__markdown"
          zDepth={1}
        >
          <MarkDownRenderer
            value={informationField.markdown}
          />
        </Paper>

        <Paper
          className="info__map"
          zDepth={0}
        >
          <MapView
            basemap="arcgis"
            projection="EPSG:4326"
            extent={boundaryExtent}
            style={{
              height: '100%',
              width: '100%',
            }}
          >
            {boundaryGeoJsonString && (
              <map-layer-geojson src-json={boundaryGeoJsonString} />
            )}
          </MapView>
        </Paper>
      </div>
    );
  }
}
