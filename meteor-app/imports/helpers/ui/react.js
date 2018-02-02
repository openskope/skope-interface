import React from 'react';
import ReactDOMServer from 'react-dom/server';
import {
  mount as reactMount,
} from 'react-mounter';
import {
  Provider,
} from 'react-redux';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';

import globalStore from '/imports/ui/redux-store';
import globalTheme from '/imports/ui/styling/muiTheme';

/**
 * Helper function to incorporate `Provider` into react mounter.
 * @param  {Object} store - Global store from Redux.
 * @param  {React.Component} ComponentClass - Same as the first argument to `mount`.
 * @param  {Object} props - Same as the second argument to `mount`.
 * @return {*}
 */
export
const mountWithStore = (store, ComponentClass, props) => reactMount(Provider, {
  store,
  children: <ComponentClass {...props} />,
});

/**
 * A even more simplified version of `mountWithStore` that by default uses the global store.
 * It also applies the default Material UI theme.
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
  children: <ComponentClass {...props} />,
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
