/* global HTMLMapLayerVector */

import React from 'react';
import objectPath from 'object-path';
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
import OpenIcon from 'material-ui/svg-icons/action/open-in-new';

import {
  dataSpatialBoundaryFillColor,
  DatasetInfoIcon,
  DatasetDownloadIcon,
  DatasetMapIcon,
  DatasetChartIcon,
  DatasetModelIcon,
  DatasetProvenanceIcon,
  presentationProjection,
} from '/imports/ui/consts';

import {
  absoluteUrl,
  buildGeoJsonWithGeometry,
  MarkDownRenderer,
} from '/imports/ui/helpers';

import {
  defaultPropTypes,
  defaultProps,
  bemBlockName,
  renderCardWithDivier,
  DialogButton,
} from './shared';

export default
class SearchResultItem extends React.PureComponent {
  static propTypes = {
    ...defaultPropTypes,
  };

  static defaultProps = {
    ...defaultProps,
  };

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
        IconComponent: DatasetInfoIcon,
        featureDetail: informationField && informationField.markdown,
      },
      {
        featureName: 'Download',
        isAvailable: Boolean(downloadService),
        IconComponent: DatasetDownloadIcon,
        featureDetail: downloadService && downloadService.markdown,
      },
      {
        featureName: 'Map',
        isAvailable: Boolean(overlayService),
        IconComponent: DatasetMapIcon,
        featureDetail: overlayService && overlayService.markdown,
      },
      {
        featureName: 'Charts',
        isAvailable: Boolean(analyticService),
        IconComponent: DatasetChartIcon,
        featureDetail: analyticService && analyticService.markdown,
      },
      {
        featureName: 'Model',
        isAvailable: Boolean(modelService),
        IconComponent: DatasetModelIcon,
        featureDetail: modelService && modelService.markdown,
      },
      {
        featureName: 'Provenance',
        isAvailable: false,
        IconComponent: DatasetProvenanceIcon,
        featureDetail: '',
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
      routing,
      result: {
        _source: datasetSourceData,
      },
    } = this.props;

    const datasetId = objectPath.get(datasetSourceData, 'skopeid', '');
    const datasetTitle = objectPath.get(datasetSourceData, 'title', '');
    const geometryOfDataBoundary = objectPath.get(datasetSourceData, 'region.geometry', null);
    const geoJsonOfDataBoundary = geometryOfDataBoundary && buildGeoJsonWithGeometry(geometryOfDataBoundary);
    const geoJsonStringOfDataBoundary = geoJsonOfDataBoundary && JSON.stringify(geoJsonOfDataBoundary);
    // If `extents` is specified in source, trust that. Otherwise try to calculate from boundary shape.
    const boundaryExtentFromDocument = objectPath.get(datasetSourceData, 'region.extents', null);
    const extentOfDataBoundary = boundaryExtentFromDocument
      // Extent coordinates stored in the document are strings instead of numbers.
      ? (boundaryExtentFromDocument.map((s) => parseFloat(s)))
      : (geometryOfDataBoundary && HTMLMapLayerVector.getExtentFromGeometry(geometryOfDataBoundary, HTMLMapLayerVector.IOProjection));
    const datasetRegionName = objectPath.get(datasetSourceData, 'region.name', '');
    const datasetTimespanName = objectPath.get(datasetSourceData, 'timespan.name', '');
    const datasetDescriptionMarkdown = objectPath.get(datasetSourceData, 'description', '');

    const workspacePageUrl = absoluteUrl('/workspace', null, {
      dataset: datasetId,
      q: ((obj) => (obj ? JSON.stringify(obj) : null))(objectPath.get(routing, 'queryParams', null)),
    });
    const subtitle = ((items) => items.filter(Boolean).join(' | '))([
      datasetRegionName,
      datasetTimespanName,
    ]);

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
            title={(
              <a
                href={workspacePageUrl}
              >{datasetTitle}</a>
            )}
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
          <a
            className="search-result-item__thumbnail"
            href={workspacePageUrl}
            style={{
              backgroundImage: 'url(//www.openskope.org/wp-content/uploads/2016/02/ScreenShot001.bmp)',
              backgroundSize: 'cover',
              backgroundRepeat: 'no-repeat',
            }}
          >{geoJsonOfDataBoundary && (
            <MapView
              basemap="arcgis"
              projection={presentationProjection}
              extent={extentOfDataBoundary}
              style={{
                width: '100%',
                height: '100%',
              }}
            >
              <map-layer-geojson
                style={{
                  fill: dataSpatialBoundaryFillColor,
                }}
                src-json={geoJsonStringOfDataBoundary}
              />
            </MapView>
          )}</a>

          <MarkDownRenderer
            className="search-result-item__description"
            value={datasetDescriptionMarkdown}
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
