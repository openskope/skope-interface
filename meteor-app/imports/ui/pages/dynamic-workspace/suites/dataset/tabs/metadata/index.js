import React from 'react';
import Paper from 'material-ui/Paper';

import {
  MarkDownRenderer,
} from '/imports/ui/helpers';

import TabComponent from '../../TabComponent';

export default
class MetadataTab extends TabComponent {
  static tabName = 'metadata';
  static tabIcon = null;
  static tabLabel = 'Metadata';
  static requiredProps = [
    'metadata',
  ];

  render () {
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
