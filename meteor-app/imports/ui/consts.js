/**
 * Define UI constants here.
 */

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

export const rangeMin = 1;
export const rangeMax = 2000;

export const dataSpatialBoundaryFillColor = 'rgba(255, 255, 255, 0.5)';

export const DatasetInfoIcon = InfoIcon;
export const DatasetDownloadIcon = DownloadIcon;
export const DatasetMapIcon = MapIcon;
export const DatasetChartIcon = ChartIcon;
export const DatasetModelIcon = BuildIcon;
export const DatasetProvenanceIcon = MergeIcon;

export const PanToolIcon = HandIcon;
export const PointToolIcon = PinIcon;
export const BoxToolIcon = CropIcon;

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
