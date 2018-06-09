import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import geojsonExtent from 'geojson-extent';
import {
  Card,
  CardActions,
  CardHeader,
  CardText,
} from 'material-ui/Card';
import TextField from 'material-ui/TextField';
import FlatButton from 'material-ui/FlatButton';
import MapView from '/imports/ui/components/mapview';

import {
  presentationProjection,
} from '/imports/ui/consts';

import {
  absoluteUrl,
} from '/imports/ui/helpers';

export default class SearchResultItem extends React.PureComponent {

  static propTypes = {
    result: PropTypes.shape({
      _id: PropTypes.string.isRequired,
      _source: PropTypes.object.isRequired,
    }).isRequired,
  };

  static getDateRange (start, end) {
    if (!start && !end) {
      return '';
    }

    return [start, end]
    .map((s) => (s && moment(s).format('YYYY-MM-DD')) || '')
    .join(' - ');
  }

  static buildGeoJsonWithGeometry (geometry) {
    return {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: {},
          geometry,
        },
      ],
    };
  }

  render () {
    const {
      result: {
        _id,
        _source: {
          Title,
          Creator,
          CreationDate,
          // Status,
          Rating,
          // ResultTypes,
          StartDate,
          EndDate,
          // Inputs,
          // Info,
          // Reference,
          Area,
        },
      },
    } = this.props;

    const geoJsonOfDataBoundary = Area && this.constructor.buildGeoJsonWithGeometry(Area);
    const geoJsonStringOfDataBoundary = geoJsonOfDataBoundary && JSON.stringify(geoJsonOfDataBoundary);
    const extentOfDataBoundary = geojsonExtent(geoJsonOfDataBoundary);

    return (
      <Card className="search-result-item">
        <CardHeader
          title={Title}
          subtitle={this.constructor.getDateRange(StartDate, EndDate)}
        />
        <CardText className="search-result-item__content">
          <div
            className="search-result-item__thumbnail"
            style={{
              backgroundImage: 'url(//www.openskope.org/wp-content/uploads/2016/02/ScreenShot001.bmp)',
              backgroundSize: 'cover',
              backgroundRepeat: 'no-repeat',
            }}
          >{geoJsonOfDataBoundary && (
            <MapView
              basemap="osm"
              projection={presentationProjection}
              extent={extentOfDataBoundary}
              style={{
                width: '100%',
                height: '100%',
              }}
            ><map-layer-geojson src-json={geoJsonStringOfDataBoundary} /></MapView>
          )}</div>
          <div className="search-result-item__metadata">
            <TextField
              className="search-result-item__metadata__major"
              floatingLabelText="Creator"
              value={Creator}
              style={{
                width: 'auto',
              }}
            />
            <TextField
              className="search-result-item__metadata__major"
              floatingLabelText="Date"
              value={moment(CreationDate).format('YYYY-MM-DD')}
              style={{
                width: 'auto',
              }}
            />
            <TextField
              className="search-result-item__metadata__major"
              floatingLabelText="Rating"
              value={Rating}
              style={{
                width: 'auto',
              }}
            />
            <p className="search-result-item__metadata__description">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec mattis pretium massa. Aliquam erat volutpat. Nulla facilisi. Donec vulputate interdum sollicitudin. Nunc lacinia auctor quam sed pellentesque. Aliquam dui mauris, mattis quis lacus id, pellentesque lobortis odio.</p>
          </div>
        </CardText>
        <CardActions>
          <FlatButton label="Examine" href={absoluteUrl('/workspace', null, { dataset: _id })} target="_blank" />
          <FlatButton label="Download" />
        </CardActions>
      </Card>
    );
  }
}
