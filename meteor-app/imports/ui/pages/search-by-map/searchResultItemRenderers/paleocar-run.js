import React from 'react';
import ReactDOM from 'react-dom';
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
import Chip from 'material-ui/Chip';
import DownloadIcon from 'material-ui/svg-icons/file/cloud-download';
import MapIcon from 'material-ui/svg-icons/maps/map';
import ChartIcon from 'material-ui/svg-icons/editor/multiline-chart';
import PieceIcon from 'material-ui/svg-icons/action/extension';
import TagIcon from 'material-ui/svg-icons/action/label';
import UpdateIcon from 'material-ui/svg-icons/action/update';

import {
  absoluteUrl,
} from '/imports/ui/helpers';

import BaseClass from './base';

//! Fake data for implementing the view.
const fakeData = {
  datasetId: 'abcdefg',
  title: 'PaleoCar Model Run - Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus ac viverra ipsum. Maecenas efficitur sodales massa id vulputate. Ut non eros sodales neque elementum suscipit in vel sapien. Vivamus ut enim neque. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Aenean mauris est, luctus vehicula turpis non, rhoncus aliquam neque. Ut quis auctor purus. Morbi pellentesque id diam in viverra. Phasellus vel accumsan erat. Nunc mollis accumsan arcu vitae laoreet. Mauris aliquam lectus arcu, nec efficitur magna fermentum vitae. Suspendisse quis erat est. Proin non ante nisi.',
  status: 'unpublished',
  runDate: new Date(2010, 6, 3),
  authors: [
    'Person A',
    'Person B',
    'Person C',
    'Person D',
  ],
  thumbnailUrl: '',
  spatialBoundary: null,
  dataTemporalRange: {
    gte: new Date(105, 5, 8),
    lt: new Date(2010, 6, 3),
  },
  dataTemporalRangePrecision: 0,
  fullDescription: `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus ac viverra ipsum. Maecenas efficitur sodales massa id vulputate. Ut non eros sodales neque elementum suscipit in vel sapien. Vivamus ut enim neque. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Aenean mauris est, luctus vehicula turpis non, rhoncus aliquam neque. Ut quis auctor purus. Morbi pellentesque id diam in viverra. Phasellus vel accumsan erat. Nunc mollis accumsan arcu vitae laoreet. Mauris aliquam lectus arcu, nec efficitur magna fermentum vitae. Suspendisse quis erat est. Proin non ante nisi.

Praesent volutpat, urna a gravida pretium, metus erat molestie neque, non venenatis massa metus ut neque. Donec sed condimentum ipsum, id fermentum urna. Nunc eu urna laoreet elit venenatis pulvinar. Curabitur at leo aliquam, fringilla orci et, ornare nunc. In consectetur commodo lorem, eu consequat dui. Vestibulum ornare id nibh eget consequat. Curabitur tempor iaculis purus vel pulvinar.

Suspendisse consequat, leo et fringilla egestas, ligula urna convallis nisl, quis finibus erat velit eu ipsum. Nullam ultricies, nisi non pretium semper, ligula augue sagittis nulla, eget mattis ex mi tristique arcu. Integer cursus purus sit amet ipsum consequat, vitae pellentesque arcu ultrices. Vivamus posuere purus ac maximus bibendum. Suspendisse molestie vel massa non ultrices. Duis a risus arcu. Vivamus nec orci erat. Aenean congue diam tincidunt massa volutpat, quis placerat quam feugiat.

In hendrerit convallis porttitor. Suspendisse gravida massa sapien, sit amet eleifend velit sollicitudin placerat. Sed nec sodales arcu. Morbi non nisl sollicitudin mi condimentum feugiat. Donec non blandit augue. Nulla placerat convallis cursus. Nullam sagittis metus sit amet nisi varius, non aliquam purus porttitor. Morbi risus lorem, aliquet nec ullamcorper at, fringilla et justo. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Morbi non ultrices ligula, gravida egestas augue. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Mauris consectetur tortor nec eros molestie, mollis egestas eros dictum. Nam consectetur eleifend velit, vitae ullamcorper libero accumsan sed. Nunc facilisis enim neque, ut vehicula leo pulvinar vel. In congue, augue nec sollicitudin varius, sapien dui pharetra metus, vel mollis quam augue ac libero. Vestibulum urna odio, elementum et libero a, dapibus placerat libero.

Nullam velit erat, accumsan sollicitudin congue vel, iaculis vitae odio. Sed non mauris aliquam lacus congue consectetur nec vitae arcu. Donec tempor gravida ex, vitae varius metus aliquet vitae. Nulla pharetra dui nec eros dapibus aliquam. Nullam convallis condimentum cursus. Vivamus a tristique nibh, vel dictum leo. Fusce lacus diam, pellentesque a ligula non, efficitur interdum quam. Mauris volutpat tristique est, vel dapibus arcu scelerisque sit amet. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas.`,
  dataTypes: [
    'Data Type A',
    'Data Type B',
    'Data Type C',
  ],
  keywords: [
    'Keyword A',
    'Keyword B',
    'Keyword C',
    'Keyword D',
    'Keyword E',
  ],
  metadata: {
    foo: 1,
    bar: 2,
    par: 3,
  },
};

export default
class SearchResultItem extends BaseClass {
  renderCard = () => {
    const {
      result: {
        _id,
        _source: {
          Area,
        },
      },
    } = this.props;

    const boundaryGeoJson = Area && SearchResultItem.buildGeoJsonWithGeometry(Area);
    const boundaryGeoJsonString = boundaryGeoJson && JSON.stringify(boundaryGeoJson);
    const boundaryExtent = geojsonExtent(boundaryGeoJson);

    const {
      title,
      status,
      runDate,
      dataTemporalRange,
      dataTemporalRangePrecision,
      fullDescription,
      dataTypes,
      keywords,
    } = fakeData;

    const workspacePageUrl = absoluteUrl('/workspace', null, { dataset: _id });
    const titleLink = (
      <a
        href={workspacePageUrl}
        target="_blank"
      >{title}</a>
    );

    const subtitle = `Status: ${status}`;

    const runInfos = [
      {
        title: 'Model',
        value: 'PaleoCAR',
      },
      {
        title: 'Version',
        value: '1.1',
      },
      {
        title: 'Run Date',
        value: moment(runDate).format('MMM Do YYYY, h:m:s a'),
      },
      {
        title: 'Start Date',
        value: SearchResultItem.getDateStringAtPrecision(dataTemporalRange.gte, dataTemporalRangePrecision),
      },
      {
        title: 'End Date',
        value: SearchResultItem.getDateStringAtPrecision(dataTemporalRange.lt, dataTemporalRangePrecision),
      },
    ];

    // List of available features to be displayed as small feature icons.
    const availableFeatures = [
      {
        featureName: 'Download',
        IconComponent: DownloadIcon,
      },
      {
        featureName: 'Map',
        IconComponent: MapIcon,
      },
      {
        featureName: 'Charts',
        IconComponent: ChartIcon,
      },
    ];

    return (
      <Card
        className="search-result-item__card"
        expanded={this.state.expanded}
        onExpandChange={this.onExpandChange}
        style={{
          // Eliminate `z-index: 1` to resolve the issue of tooltips being covered.
          zIndex: false,
          ...this.state.positionBeforeExpanding,
          ...(this.state.expanded && this.state.dimensionBeforeExpanding),
        }}
        containerStyle={{
          display: 'flex',
          height: '100%',
          width: '100%',
          flexDirection: 'column',
          justifyContent: 'stretch',
        }}
        ref={(ref) => this._cardElement = ref && ReactDOM.findDOMNode(ref)}
      >
        <CardHeader
          avatar={<Avatar icon={<UpdateIcon />} />}
          textStyle={{
            width: '100%',
          }}
          title={titleLink}
          titleStyle={SearchResultItem.titleStyle}
          subtitle={subtitle}
          showExpandableButton
          style={{
            // Eliminate the default bottom padding from `CardHeader`.
            paddingBottom: 0,
          }}
        />

        <CardText
          expandable
          className="search-result-item__content"
          style={{
            flex: '1 1 0',
            // Eliminate the default bottom padding from `CardText`.
            paddingBottom: 0,
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'flex-start',
            overflow: 'auto',
          }}
        >
          <div
            className="search-result-item__left-column"
            style={{
              flex: '0 0 auto',
              paddingRight: '15px',
            }}
          >
            <div
              className="search-result-item__thumbnail"
              style={{
                width: '200px',
                height: '200px',
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
          </div>

          <div
            className="search-result-item__right-column"
            style={{
              flex: '1 1 0',
            }}
          >
            <div className="info-wrapper">
              <label
                className="info-wrapper__title"
              >Description</label>
              <SearchResultItem.DescriptionRenderer
                className="info-wrapper__content search-result-item__description"
                value={fullDescription}
              />
            </div>

            <div className="info-wrapper">
              <label
                className="info-wrapper__title"
              >Datatypes</label>
              <div
                className="info-wrapper__content search-result-item__datatype-list"
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  flexWrap: 'wrap',
                }}
              >
                {dataTypes.map((str, i) => (
                  <Chip
                    key={i}
                    className="search-result-item__datatype-item"
                    style={{
                      ...SearchResultItem.inlineListGapStyle,
                    }}
                  >
                    <Avatar icon={<PieceIcon />} />
                    {str}
                  </Chip>
                ))}
              </div>
            </div>

            <div className="info-wrapper">
              <label
                className="info-wrapper__title"
              >Keywords</label>
              <div
                className="info-wrapper__content search-result-item__keyword-list"
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  flexWrap: 'wrap',
                }}
              >
                {keywords.map((str, i) => (
                  <Chip
                    key={i}
                    className="search-result-item__keyword-item"
                    style={{
                      ...SearchResultItem.inlineListGapStyle,
                    }}
                  >
                    <Avatar icon={<TagIcon />} />
                    {str}
                  </Chip>
                ))}
              </div>
            </div>

            <div className="info-wrapper search-result-item__run-info">
              {runInfos.map((item, index) => (
                <div
                  key={index}
                  className="info-wrapper"
                >
                  <label
                    className="info-wrapper__title"
                  >{item.title}</label>
                  <div
                    className="info-wrapper__content"
                  >{item.value}</div>
                </div>
              ))}
            </div>
          </div>
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
