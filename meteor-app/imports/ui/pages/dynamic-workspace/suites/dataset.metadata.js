import React from 'react';
import {
  Tab,
} from 'material-ui/Tabs';
import Paper from 'material-ui/Paper';

import {
  MarkDownRenderer,
} from '/imports/ui/helpers';

import SubComponentClass from './SubComponentClass';

export default
class MetadataTab extends SubComponentClass {
  render () {
    const {
      metadata: metadataField,
    } = this.props;

    if (!metadataField) {
      return null;
    }

    return (
      <Tab
        label="Metadata"
        value="metadata"
      >
        <div className="dataset__metadata-tab">
          <Paper
            className="metadata__markdown"
            zDepth={1}
          >
            <MarkDownRenderer
              value={metadataField.markdown}
            />
          </Paper>
        </div>
      </Tab>
    );
  }
}
