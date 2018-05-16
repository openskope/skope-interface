import React from 'react';
import ReactDOMServer from 'react-dom/server';
import {
  mount as reactMount,
  withOptions,
} from '@xch/react-mounter';
import {
  Provider,
} from 'react-redux';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';

import globalStore from '/imports/ui/redux-store';
import globalTheme from '/imports/ui/styling/muiTheme';
import TopHelmet from '/imports/ui/top-helmet';

// Create a custom mounter that uses a custom root element.
const myReactMount = withOptions({
  rootId: 'skope-app',
}, reactMount);

/**
 * Helper function to incorporate `Provider` into react mounter.
 * @param  {Object} store - Global store from Redux.
 * @param  {React.Component} ComponentClass - Same as the first argument to `mount`.
 * @param  {Object} props - Same as the second argument to `mount`.
 * @return {*}
 */
export
const mountWithStore = (store, ComponentClass, props) => myReactMount(Provider, {
  store,
  children: <ComponentClass {...props} />,
});

/**
 * A even more simplified version of `mountWithStore` that by default uses the global store.
 * It also applies the default Material UI theme.
 * It also inserts some header elements with the helmet.
 * @param  {React.Component} ComponentClass - Same as the first argument to `mount`.
 * @param  {Object} props - Same as the second argument to `mount`.
 * @return {*}
 */
export
const mount =
(
  ComponentClass,
  {
    store = globalStore,
    muiTheme = globalTheme,
    ...props
  },
) => mountWithStore(store, MuiThemeProvider, {
  muiTheme,
  children: (
    <React.Fragment>
      <TopHelmet />
      <ComponentClass {...props} />
    </React.Fragment>
  ),
});

/**
 * Wrap `MuiThemeProvider` around `ReactDOMServer.renderToStaticMarkup`
 * in case `reactElement` is a `material-ui` component. 
 */
export
const renderToStaticMarkup =
(reactElement) => ReactDOMServer.renderToStaticMarkup(
  <MuiThemeProvider muiTheme={globalTheme}>{reactElement}</MuiThemeProvider>
);
