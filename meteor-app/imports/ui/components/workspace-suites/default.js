import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

import {
  Tabs,
  Tab,
} from 'material-ui/Tabs';
import Paper from 'material-ui/Paper';
import LayerList from '/imports/ui/components/layerlist';
import Charts from '/imports/ui/components/workspace-charts-embedded-wrapper';
import {
  Toolbar,
  ToolbarGroup,
  ToolbarSeparator,
  ToolbarTitle,
} from 'material-ui/Toolbar';
import TextField from 'material-ui/TextField';
import IconButton from 'material-ui/IconButton';
import LeftArrowIcon from 'material-ui/svg-icons/hardware/keyboard-arrow-left';
import RightArrowIcon from 'material-ui/svg-icons/hardware/keyboard-arrow-right';
import PlayIcon from 'material-ui/svg-icons/av/play-arrow';
// import PauseIcon from 'material-ui/svg-icons/av/pause';

import {
  HorizontalResizer,
} from '/imports/ui/components/resizer';
import MapView from '/imports/ui/components/mapview';

import {
  clampFilterValue,
} from '/imports/ui/helpers';

export default class Component extends React.Component {

  static propTypes = {

  };

  constructor (props) {
    super(props);

    //! Move these state to Redux store.
    this.state = {
      activeTab: 'info',
      sidebarWidth: 400,
      sidebarMinWidth: 400,
      contentMinWidth: 400,
    };
  }

  setSidebarWidth = (newWidth) => {
    this.setState({
      sidebarWidth: newWidth,
    });
  };

  onTabChange = (nextTabValue) => this.setState({
    activeTab: nextTabValue,
  });

  render = ({
    dataExtent = [-118.67431640625, 33.91208674157048, -109.88525390625, 42.92087580407048],
  } = this.props) => (
    <div
      className="main-section"
      ref={(ref) => this._rootElement = ref}
    >
      <Paper
        transitionEnabled={false}
        className="side-panel"
        ref={(ref) => this._sidebarElement = ref}
        style={{
          width: this.state.sidebarWidth,
        }}
      >
        <Tabs
          contentContainerClassName="side-panel__content"
          value={this.state.activeTab}
          onChange={this.onTabChange}
        >
          <Tab
            label="Info"
            value="info"
          >
            <div className="side-panel__section">
              <p>Status</p>
              <p>Description: general description about this dataset. For environmental data this description is provided by domain experts, for model results it is provide by model configuration time.</p>
              <p>Download link(s)</p>
            </div>
          </Tab>

          <Tab
            label="Layers"
            value="layers"
          >
            <LayerList
              className="side-panel__section"
              layers={[]}
            />
          </Tab>

          <Tab
            label="Graphs"
            value="graphs"
          >
            <Charts
              dataSectionClassName="side-panel__section"
            />
          </Tab>

          <Tab
            label="Metadata"
            value="metadata"
          >
            <div className="side-panel__section">
              <h2>Metadata</h2>
              <p>
                This is the metadata tab.
              </p>
            </div>
          </Tab>
        </Tabs>
      </Paper>

      <HorizontalResizer
        targetCurrentWidth={() => this.state.sidebarWidth}
        targetMinWidth={() => this.state.sidebarMinWidth}
        targetMaxWidth={() => this._rootElement.clientWidth - this.state.contentMinWidth}
        targetWidthOnChange={this.setSidebarWidth}
      />

      <Paper
        transitionEnabled={false}
        className="main-content"
        style={{
          backgroundColor: 'white',
        }}
      >
        {this.state.activeTab === 'info' && (
          <MapView
            basemap="osm"
            projection="EPSG:4326"
            extent={dataExtent}
            style={{
              height: '100%',
              width: '100%',
            }}
          >
          </MapView>
        )}
      </Paper>
    </div>
  );
}
