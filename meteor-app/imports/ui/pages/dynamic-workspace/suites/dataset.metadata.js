import React from 'react';
import Paper from 'material-ui/Paper';

import {
  MarkDownRenderer,
} from '/imports/ui/helpers';

import TabComponentClass from './TabComponentClass';

export default
class MetadataTab extends TabComponentClass {
  static tabName = 'metadata';
  static tabIcon = null;
  static tabLabel = 'Metadata';
  static requiredProps = [
    'metadata',
  ];

  renderBody () {
    const {
      metadata: metadataField,
    } = this.props;

    return (
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
    );
  }
}
