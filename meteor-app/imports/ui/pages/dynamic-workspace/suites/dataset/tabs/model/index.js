import React from 'react';
import Paper from 'material-ui/Paper';

import {
  DatasetModelIcon,
} from '/imports/ui/consts';

import {
  MarkDownRenderer,
} from '/imports/ui/helpers';

import TabComponent from '../../TabComponent';

export default
class ModelTab extends TabComponent {
  static tabName = 'model';
  static tabIcon = DatasetModelIcon;
  static tabLabel = 'Model';
  static requiredProps = [
    'modelService',
  ];

  render () {
    const {
      modelService: modelField,
    } = this.props;

    return (
      <div className="dataset__model-tab">
        <Paper
          className="model__markdown"
          zDepth={1}
        >
          <MarkDownRenderer
            value={modelField.markdown}
          />
        </Paper>
      </div>
    );
  }
}
