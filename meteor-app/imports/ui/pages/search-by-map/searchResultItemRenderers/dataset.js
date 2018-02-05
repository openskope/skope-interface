import React from 'react';
import objectPath from 'object-path';
import moment from 'moment';
import geojsonExtent from 'geojson-extent';
import {
  Card,
  CardActions,
  CardTitle,
  CardText,
} from 'material-ui/Card';
import {
  Toolbar,
  ToolbarGroup,
} from 'material-ui/Toolbar';
import * as colors from 'material-ui/styles/colors';
import IconButton from 'material-ui/IconButton';
import MapView from '/imports/ui/components/mapview';
import DownloadIcon from 'material-ui/svg-icons/file/cloud-download';
import MapIcon from 'material-ui/svg-icons/maps/map';
import ChartIcon from 'material-ui/svg-icons/editor/multiline-chart';
import InfoIcon from 'material-ui/svg-icons/action/info';
import ModelIcon from 'material-ui/svg-icons/action/build';
import OpenIcon from 'material-ui/svg-icons/action/open-in-new';

import {
  absoluteUrl,
  buildGeoJsonWithGeometry,
  getPrecisionByResolution,
  getDateRangeStringAtPrecision,
  MarkDownRenderer,
} from '/imports/ui/helpers';

import {
  defaultPropTypes,
  bemBlockName,
  renderCardWithDivier,
  DialogButton,
} from './shared';

export default
class SearchResultItem extends React.PureComponent {
  static propTypes = defaultPropTypes;

  static SlimToolbar = (props) => (
    <Toolbar
      noGutter
      {...props}
      style={{
        background: 'transparent',
        height: '36px',
        padding: 0,
        margin: 0,
      }}
    >{props.children}</Toolbar>
  );

  renderAvailableFeatures = () => {
    const {
      result: {
        _source: {
          title,
          information: informationField,
          overlayService,
          downloadService,
          analyticService,
          modelService,
        },
      },
    } = this.props;

    // List of available features to be displayed as small feature icons.
    const availableFeatures = [
      {
        featureName: 'Information',
        isAvailable: Boolean(informationField),
        IconComponent: InfoIcon,
        featureDetail: informationField && informationField.markdown,
      },
      {
        featureName: 'Download',
        isAvailable: Boolean(downloadService),
        IconComponent: DownloadIcon,
        featureDetail: downloadService && downloadService.markdown,
      },
      {
        featureName: 'Map',
        isAvailable: Boolean(overlayService),
        IconComponent: MapIcon,
        featureDetail: overlayService && overlayService.markdown,
      },
      {
        featureName: 'Charts',
        isAvailable: Boolean(analyticService),
        IconComponent: ChartIcon,
        featureDetail: analyticService && analyticService.markdown,
      },
      {
        featureName: 'Model',
        isAvailable: Boolean(modelService),
        IconComponent: ModelIcon,
        featureDetail: modelService && modelService.markdown,
      },
    ];

    return availableFeatures.map(({
      featureName,
      isAvailable,
      IconComponent,
      featureDetail,
    }, index) => (
      <DialogButton
        key={index}
        buttonComponent={(
          <IconButton
            disabled={!isAvailable}
            tooltip={isAvailable ? `${featureName} available` : `${featureName} unavailable`}
          >
            <IconComponent
              color={isAvailable ? colors.green500 : colors.grey300}
            />
          </IconButton>
        )}
        dialogProps={{
          title: `${title} > ${featureName}`,
          children: (
            <MarkDownRenderer
              value={featureDetail}
            />
          ),
        }}
      />
    ));
  };

  renderCard = () => {
    const {
      result: {
        _id,
        _source: {
          title,
          description: descriptionMarkDown,
          revised: revisionDate,
          timespan,
          region,
        },
      },
    } = this.props;

    const boundaryGeometry = objectPath.get(region, 'geometry');
    const boundaryGeoJson = boundaryGeometry && buildGeoJsonWithGeometry(boundaryGeometry);
    const boundaryGeoJsonString = boundaryGeoJson && JSON.stringify(boundaryGeoJson);
    const boundaryExtent = boundaryGeoJson && geojsonExtent(boundaryGeoJson);

    const workspacePageUrl = absoluteUrl('/workspace', null, { dataset: _id });
    const revisionDateString = moment(revisionDate).format('YYYY-MM-DD');
    const subtitleItems = [
      `Revised: ${revisionDateString}`,
    ];

    const timespanResolution = objectPath.get(timespan, 'resolution');

    if (timespanResolution) {
      const timespanPrecision = getPrecisionByResolution(timespanResolution);
      const timespanStart = objectPath.get(timespan, 'period.gte');
      const timespanEnd = objectPath.get(timespan, 'period.lte');
      const timespanString = getDateRangeStringAtPrecision(timespanPrecision, timespanStart, timespanEnd);

      if (timespanString) {
        subtitleItems.push(`Timespan: ${timespanString}`);
      }
    }

    const subtitle = subtitleItems.join('; ');

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
        zDepth={0}
      >
        <CardText
          className="search-result-item__content"
          style={{
            // Eliminate the default padding from `CardText`.
            padding: 0,
          }}
        >
          <CardTitle
            className="search-result-item__title"
            title={title}
            titleStyle={{
              fontSize: '1.2em',
              lineHeight: '1.45em',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
            subtitle={subtitle}
            subtitleStyle={{
              fontSize: '1em',
            }}
            style={{
              // Eliminate the default padding from `CardTitle`.
              padding: 0,
            }}
          />
          <div
            className="search-result-item__thumbnail"
            style={{
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

          <MarkDownRenderer
            className="search-result-item__description"
            value={descriptionMarkDown}
          />

          <IconButton
            className="search-result-item__open-button"
            tooltip="Open"
            href={workspacePageUrl}
            target="_blank"
          >
            <OpenIcon color={colors.blue500} />
          </IconButton>
        </CardText>

        <CardActions>
          <SearchResultItem.SlimToolbar
            className="search-result-item__toolbar"
          >
            <ToolbarGroup>
              {this.renderAvailableFeatures()}
            </ToolbarGroup>
          </SearchResultItem.SlimToolbar>
        </CardActions>
      </Card>
    );
  };

  render = () => renderCardWithDivier({
    className: bemBlockName,
    cardRenderer: this.renderCard,
  });
}
