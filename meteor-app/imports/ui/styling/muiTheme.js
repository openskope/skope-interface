import getMuiTheme from 'material-ui/styles/getMuiTheme';
import {
  darken,
} from 'material-ui/utils/colorManipulator';

const palette = {
  primary1Color: '#00bcd4',
  primary2Color: '#0097a7',
  primary3Color: '#bdbdbd',
  primary4Color: '#f7f5e7',
  accent1Color: '#ff4081',
  accent2Color: '#f5f5f5',
  accent3Color: '#9e9e9e',
  textColor: 'rgba(0, 0, 0, 0.87)',
  secondaryTextColor: 'rgba(0, 0, 0, 0.54)',
  alternateTextColor: '#ffffff',
  borderColor: '#e0e0e0',
  canvasColor: '#ffffff',
  clockCircleColor: 'rgba(0, 0, 0, 0.07)',
  disabledColor: 'rgba(0, 0, 0, 0.3)',
  pickerHeaderColor: '#00bcd4',
  shadowColor: 'rgba(0, 0, 0, 1)',
  toggleButtonActiveBackgroundColor: 'rgba(0, 0, 0, 0.1)',
};

export default getMuiTheme({
  palette,
  tabs: {
    backgroundColor: palette.primary4Color,
    textColor: darken(palette.primary3Color, 0.3),
    selectedTextColor: darken(palette.accent1Color, 0.2),
    inkBarColor: darken(palette.accent1Color, 0.1),
  },
});
