import React from 'react';
import Paper from 'material-ui/Paper';

import {
  dataSpatialBoundaryFillColor,
  DatasetInfoIcon,
  presentationProjection,
} from '/imports/ui/consts';

import {
  MarkDownRenderer,
} from '/imports/ui/helpers';

import MapView from '/imports/ui/components/mapview';

import TabBaseClass from '../BaseClass';

class InfoTabContent extends React.Component {
  render () {
    const {
      boundaryExtent,
      boundaryGeoJsonString,
      contentMarkdown,
    } = this.props;

    return (
      <div className="dataset__info-tab">
        <Paper
          className="info__markdown"
          zDepth={1}
        >
          <MarkDownRenderer
            value={contentMarkdown}
          />
        </Paper>

        <Paper
          className="info__map"
          zDepth={0}
        >
          <MapView
            basemap="arcgis"
            projection={presentationProjection}
            extent={boundaryExtent}
            style={{
              height: '100%',
              width: '100%',
            }}
          >
            {boundaryGeoJsonString && (
              <map-layer-geojson
                style={{
                  fill: dataSpatialBoundaryFillColor,
                }}
                src-json={boundaryGeoJsonString}
                src-projection="EPSG:4326"
              />
            )}
          </MapView>
        </Paper>
      </div>
    );
  }
}

export default
class InfoTab extends TabBaseClass {
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

    return (
      <InfoTabContent
        boundaryExtent={this.component.extent}
        boundaryGeoJsonString={boundaryGeoJsonString}
        contentMarkdown={informationField.markdown}
      />
    );
  }
}
