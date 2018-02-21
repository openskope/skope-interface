import React from 'react';
import {
  Tab,
} from 'material-ui/Tabs';
import Paper from 'material-ui/Paper';

import {
  DatasetDownloadIcon,
} from '/imports/ui/consts';

import {
  MarkDownRenderer,
} from '/imports/ui/helpers';

import SubComponentClass from './SubComponentClass';

export default
class DownloadTab extends SubComponentClass {
  render () {
    const {
      downloadService: downloadField,
    } = this.props;

    if (!downloadField) {
      return null;
    }

    return (
      <Tab
        label={this.component.renderTabLabel({
          IconComponent: DatasetDownloadIcon,
          label: 'Download',
        })}
        value="download"
      >
        <div className="dataset__download-tab">
          <Paper
            className="download__markdown"
            zDepth={1}
          >
            <MarkDownRenderer
              value={downloadField.markdown}
            />
          </Paper>
        </div>
      </Tab>
    );
  }
}
