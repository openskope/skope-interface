import React from 'react';
import {
  Tab,
} from 'material-ui/Tabs';
import Paper from 'material-ui/Paper';

import {
  DatasetModelIcon,
} from '/imports/ui/consts';

import {
  MarkDownRenderer,
} from '/imports/ui/helpers';

import SubComponentClass from './SubComponentClass';

export default
class ModelTab extends SubComponentClass {
  render () {
    const {
      modelService: modelField,
    } = this.props;

    if (!modelField) {
      return null;
    }

    return (
      <Tab
        label={this.component.renderTabLabel({
          IconComponent: DatasetModelIcon,
          label: 'Model',
        })}
        value="model"
      >
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
      </Tab>
    );
  }
}
