import {
  Meteor,
} from 'meteor/meteor';
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
  buildGeoJsonWithGeometry,
  PatheticDataRequester,
} from '/imports/ui/helpers';

import MapView from '/imports/ui/components/mapview';

import SubComponentClass from './SubComponentClass';

// Temporary helper function. Put this somewhere else.
const getGeometryOfPoint = (point) => {
  return {
    type: 'Point',
    coordinates: [
      point.x,
      point.y,
    ],
  };
};

export default
class AnalyticsTab extends SubComponentClass {
  getInitialState () {
    return {
      // ID of the selected analytics.
      activeAnalyticsId: null,
      // Geometry of the analytics area.
      analyticsBoundaryGeometry: null,
    };
  }

  onChangeActiveAnalytics = (event, index, value) => {
    this.setState({
      activeAnalyticsId: value,
    });
  };

  onClickMap = (event) => {
    const point = {
      x: event.latLongCoordinate[0],
      y: event.latLongCoordinate[1],
    };

    console.log('point', point);

    this.setState({
      analyticsBoundaryGeometry: getGeometryOfPoint(point),
    });
  };

  requestData = (payload, resolve, reject) => {
    console.log('requestData', payload);

    if (!(payload.variableName && payload.boundaryGeometry)) {
      return;
    }

    console.log('requestData', 'requesting');

    Meteor.call('timeseries.get', payload, (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    });
  };

  onDataReady = (data) => {
    console.log('onDataReady', data);
  };

  onDataError = (reason) => {
    console.error('request error', reason);
  };

  render () {
    const {
      analyticService: analyticsField,
      analytics,
      muiTheme,
    } = this.props;
    const {
      activeAnalyticsId,
      analyticsBoundaryGeometry,
    } = this.state;

    if (!(analyticsField && analytics)) {
      return null;
    }

    const boundaryGeoJson = this.component.getDatasetBoundaryGeoJson();
    const boundaryGeoJsonString = boundaryGeoJson && JSON.stringify(boundaryGeoJson);
    const boundaryExtent = this.component.getDatasetExtent();
    const analyticsBoundaryGeoJsonString = analyticsBoundaryGeometry && JSON.stringify(buildGeoJsonWithGeometry(analyticsBoundaryGeometry));

    return (
      <Tab
        label={this.component.renderTabLabel({
          IconComponent: DatasetChartIcon,
          label: 'Analytics',
        })}
        value="analytics"
      >
        <PatheticDataRequester
          variableName={activeAnalyticsId}
          boundaryGeometry={analyticsBoundaryGeometry}
          requester={this.requestData}
          onReady={this.onDataReady}
          onError={this.onDataError}
          verbose
        />
        <div className="dataset__analytics-tab">
          <Paper
            className="analytics__controls"
            zDepth={1}
          >
            <SelectField
              floatingLabelText="Variable"
              floatingLabelFixed={false}
              value={activeAnalyticsId}
              onChange={(event, index, value) => this.onChangeActiveAnalytics(event, index, value)}
              style={{
                width: '100%',
              }}
              floatingLabelStyle={{
                color: muiTheme.palette.primary1Color,
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
                    value={name}
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
                onClick={(event) => this.onClickMap(event)}
              >
                {boundaryGeoJsonString && (
                  <map-layer-geojson src-json={boundaryGeoJsonString} />
                )}
                {analyticsBoundaryGeoJsonString && (
                  <map-layer-geojson src-json={analyticsBoundaryGeoJsonString} />
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
  }
}
