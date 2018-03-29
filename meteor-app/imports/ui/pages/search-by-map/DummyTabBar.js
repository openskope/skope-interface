import React from 'react';

import muiThemeable from 'material-ui/styles/muiThemeable';
import {
  Tabs,
  Tab,
} from 'material-ui/Tabs';

import {
  tabConstructs,
} from '/imports/ui/pages/dynamic-workspace/suites/dataset';

class DummyTabBar extends React.PureComponent {

  constructor (props) {
    super(props);

    this._tabs = Object.entries(tabConstructs)
    .reduce((acc, [id, Construct]) => {
      return {
        ...acc,
        [id]: {
          tabIcon: Construct.tabIcon,
          tabLabel: Construct.tabLabel,
          tabStyle: Construct.tabStyle,
        },
      };
    }, {});

    this._tabs.discoverTab.isTabEnabled = true;
  }

  renderTabLabel = ({
    IconComponent,
    label,
  }) => (
    <div className="tab-label">
      {IconComponent && (
        <IconComponent
          style={{
            color: 'inherit',
          }}
        />
      )}
      <span>{label}</span>
    </div>
  );

  renderTabs () {
    return Object.entries(this._tabs).map(([key, props]) => (
      <Tab
        key={key}
        className="tab-button"
        label={this.renderTabLabel({
          IconComponent: props.tabIcon,
          label: props.tabLabel,
        })}
        value={key}
        disabled={!props.isTabEnabled}
        style={{
          cursor: false,
          ...props.tabStyle,
        }}
      />
    ));
  }

  render () {
    return (
      <Tabs
        className="tabs-panel"
        contentContainerClassName="tabs-panel__content"
        value="discoverTab"
        inkBarStyle={{
          backgroundColor: this.props.muiTheme.tabs.inkBarColor,
        }}
        onChange={this.onTabChange}
      >{this.renderTabs()}</Tabs>
    );
  }
}

export default muiThemeable()(DummyTabBar);
