import React from 'react';
import {
  Tab,
} from 'material-ui/Tabs';
import Paper from 'material-ui/Paper';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import {
  Toolbar,
  ToolbarGroup,
} from 'material-ui/Toolbar';
import RaisedButton from 'material-ui/RaisedButton';

import {
  DatasetChartIcon,
} from '/imports/ui/consts';

import {
  absoluteUrl,
} from '/imports/ui/helpers';

import MapView from '/imports/ui/components/mapview';

export
/**
 * @param {Object} props
 */
function getInitialState (/* props */) {
  return {
    // ID of the selected analytics.
    activeAnalyticsId: null,
  };
}

function onChangeActiveAnalytics (event, index, value) {
  this.setState({
    activeAnalyticsId: value,
  });
}

export
/**
 * @param {Object} props
 * @param {Object} state
 * @param {Object} ctx - Context object (`this`)
 */
const render = (props, state, ctx) => {
  const {
    analyticService: analyticsField,
    analytics,
  } = props;

  if (!(analyticsField && analytics)) {
    return null;
  }

  const boundaryGeoJson = ctx.getDatasetBoundaryGeoJson();
  const boundaryGeoJsonString = boundaryGeoJson && JSON.stringify(boundaryGeoJson);
  const boundaryExtent = ctx.getDatasetExtent();

  return (
    <Tab
      label={ctx.renderTabLabel({
        IconComponent: DatasetChartIcon,
        label: 'Analytics',
      })}
      value="analytics"
    >
      <div className="dataset__analytics-tab">
        <Paper
          className="analytics__controls"
          zDepth={1}
        >
          <SelectField
            floatingLabelText="Variable"
            floatingLabelFixed={false}
            value={state.activeAnalyticsId}
            onChange={(event, index, value) => onChangeActiveAnalytics.call(ctx, event, index, value)}
            style={{
              width: '100%',
            }}
            floatingLabelStyle={{
              color: props.muiTheme.palette.primary1Color,
            }}
          >
            <MenuItem
              value={null}
              primaryText=""
              style={{
                display: 'none',
              }}
            />
            {analytics.map(({ name }, index) => {
              return (
                <MenuItem
                  key={index}
                  value={index}
                  primaryText={name}
                />
              );
            })}
          </SelectField>

          <div className="map-and-toolbar">
            <Toolbar>
              <ToolbarGroup>
                <RaisedButton
                  label="Point"
                  style={{
                    margin: '0 2px',
                  }}
                />
                <RaisedButton
                  label="Rectangle"
                  style={{
                    margin: '0 2px',
                  }}
                />
                <RaisedButton
                  label="Polygon"
                  style={{
                    margin: '0 2px',
                  }}
                />
              </ToolbarGroup>
            </Toolbar>
            <MapView
              className="map"
              basemap="osm"
              projection="EPSG:4326"
              extent={boundaryExtent}
            >
              {boundaryGeoJsonString && (
                <map-layer-geojson src-json={boundaryGeoJsonString} />
              )}
            </MapView>
          </div>
        </Paper>
        <Paper
          className="analytics__charts"
          zDepth={0}
          style={{
            backgroundImage: `url(${absoluteUrl('/img/charts-example.png')})`,
            backgroundRepeat: 'no-repeat',
            backgroundSize: 'cover',
          }}
        />
      </div>
    </Tab>
  );
};
