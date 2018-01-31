import React from 'react';
import ReactDOM from 'react-dom';
import objectPath from 'object-path';
import moment from 'moment';
import geojsonExtent from 'geojson-extent';
import {
  Card,
  CardActions,
  CardHeader,
  CardText,
} from 'material-ui/Card';
import Avatar from 'material-ui/Avatar';
import {
  ToolbarGroup,
} from 'material-ui/Toolbar';
import FlatButton from 'material-ui/FlatButton';
import MapView from '/imports/ui/components/mapview';
import DownloadIcon from 'material-ui/svg-icons/file/cloud-download';
import MapIcon from 'material-ui/svg-icons/maps/map';
import ChartIcon from 'material-ui/svg-icons/editor/multiline-chart';
import PlaceholderIcon from 'material-ui/svg-icons/editor/insert-emoticon';
import InfoIcon from 'material-ui/svg-icons/action/info';
import ModelIcon from 'material-ui/svg-icons/action/build';

import {
  absoluteUrl,
} from '/imports/ui/helpers';

import BaseClass from './base';

export default
class SearchResultItem extends BaseClass {
  renderCard = () => {
    const {
      result: {
        _id,
        _source: {
          title,
          descriptionMD: descriptionMarkDown,
          revised: revisionDate,
          timespan,
          information: informationField,
          overlayService,
          downloadService,
          analyticService,
          modelService,
          Area,
        },
      },
    } = this.props;

    const boundaryGeoJson = Area && SearchResultItem.buildGeoJsonWithGeometry(Area);
    const boundaryGeoJsonString = boundaryGeoJson && JSON.stringify(boundaryGeoJson);
    const boundaryExtent = geojsonExtent(boundaryGeoJson);

    const workspacePageUrl = absoluteUrl('/workspace', null, { dataset: _id });
    const titleLink = (
      <a
        href={workspacePageUrl}
        target="_blank"
      >{title}</a>
    );

    const revisionDateString = moment(revisionDate).format('YYYY-MM-DD');
    const subtitleItems = [
      `Revised: ${revisionDateString}`,
    ];

    const timespanResolution = objectPath.get(timespan, 'resolution');

    if (timespanResolution) {
      const timespanPrecision = SearchResultItem.getPrecisionByResolution(timespanResolution);
      const timespanStart = objectPath.get(timespan, 'period.gte');
      const timespanEnd = objectPath.get(timespan, 'period.lte');
      const timespanString = SearchResultItem.getDateRangeStringAtPrecision(timespanPrecision, timespanStart, timespanEnd);

      if (timespanString) {
        subtitleItems.push(`Timespan: ${timespanString}`);
      }
    }

    const subtitle = subtitleItems.join('; ');

    // List of available features to be displayed as small feature icons.
    const availableFeatures = [
      {
        featureName: 'Information',
        isAvailable: Boolean(informationField),
        IconComponent: InfoIcon,
      },
      {
        featureName: 'Download',
        isAvailable: Boolean(downloadService),
        IconComponent: DownloadIcon,
      },
      {
        featureName: 'Map',
        isAvailable: Boolean(overlayService),
        IconComponent: MapIcon,
      },
      {
        featureName: 'Charts',
        isAvailable: Boolean(analyticService),
        IconComponent: ChartIcon,
      },
      {
        featureName: 'Model',
        isAvailable: Boolean(modelService),
        IconComponent: ModelIcon,
      },
    ];

    return (
      <Card
        className="search-result-item__card"
        style={{
          // Eliminate `z-index: 1` to resolve the issue of tooltips being covered.
          zIndex: false,
        }}
        containerStyle={{
          display: 'flex',
          height: '100%',
          width: '100%',
          flexDirection: 'column',
          justifyContent: 'stretch',
        }}
      >
        <CardHeader
          avatar={<Avatar icon={<PlaceholderIcon />} />}
          textStyle={{
            width: '100%',
          }}
          title={titleLink}
          titleStyle={SearchResultItem.titleStyle}
          subtitle={subtitle}
          style={{
            // Eliminate the default bottom padding from `CardHeader`.
            paddingBottom: 0,
          }}
        />
        <CardText
          className="search-result-item__content"
          style={{
            // Eliminate the default bottom padding from `CardText`.
            paddingBottom: 0,
          }}
        >
          <div
            className="search-result-item__thumbnail"
            style={{
              float: 'left',
              width: '100px',
              height: '100px',
              backgroundImage: 'url(//www.openskope.org/wp-content/uploads/2016/02/ScreenShot001.bmp)',
              backgroundSize: 'cover',
              backgroundRepeat: 'no-repeat',
            }}
          >{boundaryGeoJson && (
            <MapView
              basemap="osm"
              projection="EPSG:4326"
              extent={boundaryExtent}
              style={{
                width: '100%',
                height: '100%',
              }}
            ><map-layer-geojson src-json={boundaryGeoJsonString} /></MapView>
          )}</div>

          <SearchResultItem.MarkDownRenderer
            className="search-result-item__description"
            value={descriptionMarkDown}
          />
        </CardText>

        <CardActions>
          <SearchResultItem.SlimToolbar
            className="search-result-item__toolbar"
          >
            <ToolbarGroup>
              {SearchResultItem.renderAvailableFeatures(availableFeatures)}
            </ToolbarGroup>

            <ToolbarGroup>
              <FlatButton
                label="Examine"
                href={workspacePageUrl}
                target="_blank"
                {...SearchResultItem.actionButtonStyles}
              />
            </ToolbarGroup>
          </SearchResultItem.SlimToolbar>
        </CardActions>
      </Card>
    );
  };
}
