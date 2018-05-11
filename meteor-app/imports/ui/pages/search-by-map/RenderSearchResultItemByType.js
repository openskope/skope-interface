import React from 'react';
import {
  connect,
} from 'react-redux';
import objectPath from 'object-path';

import {
  searchPageRenderSearchResultItemsWithUnknownType as renderSearchResultItemsWithUnknownType,
  searchPageRenderInvalidSearchResultItems as renderInvalidSearchResultItems,
} from '/imports/ui/consts';

import * as searchResultItemRenderers from './searchResultItemRenderers';

import UnknownTypeRenderer from './searchResultItemRenderers/unknown';

const resultTypeFieldPath = 'result._source.type';

const Component = (props) => {
  const resultItemType = objectPath.get(props, resultTypeFieldPath);

  if (!resultItemType) {
    if (renderInvalidSearchResultItems) {
      //! Use a dedicated component to show an invalid data error.
      return React.createElement(UnknownTypeRenderer, props);
    }

    return null;
  }

  const rendererName = `SEARCH_RESULT_ITEM__${resultItemType.toUpperCase()}`;

  if (!(rendererName in searchResultItemRenderers)) {
    if (renderSearchResultItemsWithUnknownType) {
      return React.createElement(UnknownTypeRenderer, props);
    }

    return null;
  }

  const Renderer = searchResultItemRenderers[rendererName];

  return React.createElement(Renderer, props);
};

export default
connect(
  // mapStateToProps
  (state) => ({
    // Search state in url. Items can use attach this to links so the link target can navigate back.
    routing: state.routing,
  }),
  null,
)(Component);
