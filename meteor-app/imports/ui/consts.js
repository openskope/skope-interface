/**
 * Define UI constants here.
 */
/* eslint camelcase: "off" */

import { Meteor } from 'meteor/meteor';
import objectPath from 'object-path';
import url from 'url';

import {
  appSettings,
} from '/package.json';

import globalTheme from '/imports/ui/styling/muiTheme';

import InfoIcon from 'material-ui/svg-icons/action/info';
import DownloadIcon from 'material-ui/svg-icons/file/cloud-download';
import MapIcon from 'material-ui/svg-icons/maps/map';
import ChartIcon from 'material-ui/svg-icons/editor/multiline-chart';
import BuildIcon from 'material-ui/svg-icons/action/build';
import MergeIcon from 'material-ui/svg-icons/editor/merge-type';
import HandIcon from 'material-ui/svg-icons/action/pan-tool';
import PinIcon from 'material-ui/svg-icons/action/room';
import CropIcon from 'material-ui/svg-icons/image/crop-landscape';

/**
 * The email address used for receiving contacts. If undefined, contact feature will not be available.
 * @type {string}
 */
export const contactEmail = objectPath.get(Meteor.settings, 'public.contactEmail');

/**
 * The url of the user guide webpage. If undefined, user guide feature will not be available.
 * @type {string}
 */
export const userGuideUrl = objectPath.get(Meteor.settings, 'public.userGuideUrl');

/**
 * Whether or not to display the beta sign.
 * @type {boolean}
 */
export const showBetaSign = objectPath.get(Meteor.settings, 'public.showBetaSign', false);

/**
 * Elastic endpoint for the client side.
 * If endpoint is not found in settings, use default localhost elastic.
 * @type {string}
 */
export const clientElasticEndpoint = url.resolve(Meteor.absoluteUrl(), objectPath.get(Meteor.settings, 'public.elasticEndpoint', 'http://localhost:9200/'));

/**
 * @type {boolean}
 */
export const _debug_logSearchKitQueries = objectPath.get(Meteor.settings, 'public.searchpage.logSearchKitQueries', false);

/**
 * @type {boolean}
 */
export const _debug_logSearchKitQueryResults = objectPath.get(Meteor.settings, 'public.searchpage.logSearchKitQueryResults', false);

/**
 * How many result items to display per page on search page.
 * @type {number}
 */
export const searchPageResultCountPerPage = objectPath.get(Meteor.settings, 'public.searchpage.resultsPerPage', 3);

/**
 * @type {boolean}
 */
export const searchPageRenderSearchResultItemsWithUnknownType = objectPath.get(Meteor.settings, 'public.renderSearchResultItemsWithUnknownType', false);

/**
 * @type {boolean}
 */
export const searchPageRenderInvalidSearchResultItems = objectPath.get(Meteor.settings, 'public.renderInvalidSearchResultItems', false);

/**
 * The projection used to present spatial data (in maps).
 * @type {ol.ProjectionLike}
 */
export const presentationProjection = objectPath.get(Meteor.settings, 'public.presentationProjection', 'EPSG:4326');

/**
 * Color used to fill the spatial boundary of available data.
 * @type {ColorString}
 */
export const dataSpatialBoundaryFillColor = objectPath.get(Meteor.settings, 'public.dataSpatialBoundaryFillColor', 'rgba(255, 255, 255, 0.5)');

/**
 * Whether or not to show the data uncertainty by default (if available).
 * @type {boolean}
 */
export const dataChartShowUncertaintyByDefault = objectPath.get(Meteor.settings, 'public.dataChartShowUncertaintyByDefault', false);

/**
 * @type {number}
 */
export const maxMapZoomLevel = objectPath.get(Meteor.settings, 'public.maxMapZoomLevel', 18);
/**
 * @type {number}
 */
export const minMapZoomLevel = objectPath.get(Meteor.settings, 'public.minMapZoomLevel', 3);

/**
 * @type {Array.<{name: string, title: string, type: string, url: string}>}
 */
export const baseMaps = objectPath.get(Meteor.settings, 'public.baseMaps', []);

export const DatasetInfoIcon = InfoIcon;
export const DatasetDownloadIcon = DownloadIcon;
export const DatasetMapIcon = MapIcon;
export const DatasetChartIcon = ChartIcon;
export const DatasetModelIcon = BuildIcon;
export const DatasetProvenanceIcon = MergeIcon;

export const PanToolIcon = HandIcon;
export const PointToolIcon = PinIcon;
export const BoxToolIcon = CropIcon;

export const appbarStyles = {
  textColor: objectPath.get(appSettings, 'appBarTextColor', 'currentColor'),
  backgroundColor: objectPath.get(appSettings, 'appBarBackgroundColor', 'transparent'),
  logoColor: objectPath.get(appSettings, 'appBarLogoColor', 'currentColor'),
};

export
const mapToolbarStyles = {
  root: {
    padding: '0px 0.75em',
  },
  title: {
    fontSize: '1em',
  },
  toggleButton: {
    root: {
      margin: '0 1px 0 0',
      minWidth: false,
      width: '2.5em',
      color: globalTheme.palette.disabledColor,
      transition: false,
    },
    active: {
      backgroundColor: globalTheme.palette.toggleButtonActiveBackgroundColor,
      color: globalTheme.palette.textColor,
    },
    icon: {
      height: '1.25em',
      width: '1.25em',
      color: 'inherit',
      fill: 'currentColor',
      transition: false,
    },
    button: {
      height: '1.875em',
      lineHeight: '1.875em',
      backgroundColor: 'inherit',
      color: 'inherit',
      transition: false,
    },
    overlay: {
      height: '100%',
    },
  },
};
