import React from 'react';
import {
  Tab,
} from 'material-ui/Tabs';
import Paper from 'material-ui/Paper';

import {
  DatasetInfoIcon,
} from '/imports/ui/consts';

import {
  MarkDownRenderer,
} from '/imports/ui/helpers';

import MapView from '/imports/ui/components/mapview';

import SubComponentClass from './SubComponentClass';

export default
class InfoTab extends SubComponentClass {
  render () {
    const {
      information: informationField,
    } = this.props;

    if (!informationField) {
      return null;
    }

    const boundaryGeoJson = this.component.boundaryGeoJson;
    const boundaryGeoJsonString = boundaryGeoJson && JSON.stringify(boundaryGeoJson);
    const boundaryExtent = this.component.extent;

    return (
      <Tab
        label={this.component.renderTabLabel({
          IconComponent: DatasetInfoIcon,
          label: 'Info',
        })}
        value="info"
      >
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
              basemap="osm"
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
      </Tab>
    );
  }
}
