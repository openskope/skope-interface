import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

import {
  Tabs,
  Tab,
} from 'material-ui/Tabs';
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
      resizeData: {},
    };
  }

  get resizeData () {
    return this.state.resizeData;
  }

  onTabChange = (nextTabValue) => this.setState({
    activeTab: nextTabValue,
  });

  onResizeHandleMouseDown = (event) => {
    if (event.button !== 0 || this.resizeData.tracking) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    const handleElement = event.currentTarget;

    window.addEventListener('mousemove', this.onWindowMouseMove);
    window.addEventListener('mouseup', this.onWindowMouseUp);

    this.setState({
      resizeData: {
        startWidth: this._sidebarElement.clientWidth,
        startCursorScreenX: event.screenX,
        maxWidth: this._rootElement.clientWidth - handleElement.offsetWidth - this.state.contentMinWidth,
        tracking: true,
      },
    });
  };

  onWindowMouseMove = (event) => {
    const {
      tracking,
      startCursorScreenX,
      startWidth,
      maxWidth,
    } = this.resizeData;

    if (tracking) {
      const cursorScreenXDelta = event.screenX - startCursorScreenX;
      const newWidth = Math.max(
        Math.min(startWidth + cursorScreenXDelta, maxWidth),
        0
      );

      this.setState({
        sidebarWidth: newWidth,
      });
    }
  };

  onWindowMouseUp = (event) => {
    const {
      tracking,
    } = this.resizeData;

    window.removeEventListener('mousemove', this.onWindowMouseMove);
    window.removeEventListener('mouseup', this.onWindowMouseUp);

    if (tracking) {
      this.setState({
        sidebarWidth: this._sidebarElement.clientWidth,
        resizeData: {
          tracking: false,
        },
      });
    }
  };

  render = () => (
    <div
      className="main-section"
      ref={(ref) => this._rootElement = ref}
    >
      <aside
        className="side-panel"
        ref={(ref) => this._sidebarElement = ref}
        style={{
          width: this.state.sidebarWidth,
          minWidth: this.state.sidebarMinWidth,
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
      </aside>

      <div
        className="resize-handle--x"
        data-target="aside"
        onMouseDown={this.onResizeHandleMouseDown}
      ></div>

      <main
        className="main-content"
        style={{
          backgroundColor: 'white',
        }}
      >
        Hello
      </main>
    </div>
  );
}
