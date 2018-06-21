import React from 'react';
import Paper from 'material-ui/Paper';

import {
  DatasetInfoIcon,
  presentationProjection,
} from '/imports/ui/consts';

import {
  MarkDownRenderer,
} from '/imports/ui/helpers';

import MapView from '/imports/ui/components/mapview';

import TabComponent from '../../TabComponent';

export default
class InfoTab extends TabComponent {
  static tabName = 'info';
  static tabIcon = DatasetInfoIcon;
  static tabLabel = 'Info';
  static requiredProps = [
    'information',
  ];

  render () {
    const {
      information: informationField,
      workspace: {
        extentOfDataBoundary,
        renderBoundaryOverlay,
      },
    } = this.props;
    const contentMarkdown = informationField.markdown;

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
            extent={extentOfDataBoundary}
            style={{
              height: '100%',
              width: '100%',
            }}
          >
            {renderBoundaryOverlay()}
            <map-control-mouse-position slot="right-dock" />
          </MapView>
        </Paper>
      </div>
    );
  }
}
