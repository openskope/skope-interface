import React from 'react';
import Paper from 'material-ui/Paper';
import {
  List,
} from 'material-ui/List';

import {
  DatasetDownloadIcon,
  PanToolIcon,
  BoxToolIcon,
} from '/imports/ui/consts';

import {
  MarkDownRenderer,
} from '/imports/ui/helpers';

import TabComponent from '../../TabComponent';

export default
class DownloadTab extends TabComponent {
  static tabName = 'download';
  static tabIcon = DatasetDownloadIcon;
  static tabLabel = 'Download';
  static requiredProps = [
    'downloadService',
  ];

  static selectionTools = [
    {
      name: 'pan',
      IconClass: PanToolIcon,
      title: 'Pan tool',
    },
    {
      name: 'rectangle',
      IconClass: BoxToolIcon,
      title: 'Rectangle tool',
      drawingType: 'Box',
      freehandDrawing: true,
    },
  ];

  render () {
    const {
      downloadService: downloadField,
      workspace: {
        renderVariableList,
        renderTemporalControls,
        renderFocusBoundaryMap,
      },
    } = this.props;

    return (
      <div className="dataset__download-tab">
        <Paper
          className="download__controls"
          zDepth={1}
        >
          <List>
            {renderVariableList({})}
            {renderTemporalControls({})}
            {renderFocusBoundaryMap({
              selectionTools: DownloadTab.selectionTools,
            })}
          </List>
        </Paper>
        <Paper
          className="download__markdown"
          zDepth={1}
        >
          <MarkDownRenderer
            value={downloadField.markdown}
          />
        </Paper>
      </div>
    );
  }
}
