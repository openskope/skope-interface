import React from 'react';
import PropTypes from 'prop-types';
import {
  SearchkitComponent,
  QueryAccessor,
} from 'searchkit';
import MapView from '/imports/ui/components/mapview';

export default class SpatialFilter extends SearchkitComponent {

  static defaultProps = {
    id: 'q',
    mod: 'sk-search-box',
  };

  static propTypes = {
    ...SearchkitComponent.propTypes,

    id: PropTypes.string,
    queryBuilder: PropTypes.func,
    queryFields: PropTypes.arrayOf(PropTypes.string),
    queryOptions: PropTypes.object,
    prefixQueryFields: PropTypes.arrayOf(PropTypes.string),
    prefixQueryOptions: PropTypes.object,
    mod: PropTypes.string,
  };

  constructor (props) {
    super(props);

    this.state = {
      inspectPointSelected: false,
      inspectPointCoordinate: [0, 0],
    };
  }

  defineBEMBlocks = () => ({
    container: this.props.mod,
  })

  defineAccessor () {
    const {
      id,
      prefixQueryFields,
      queryFields,
      queryBuilder,
      queryOptions,
      prefixQueryOptions,
    } = this.props;

    return new QueryAccessor(
      id,
      {
        prefixQueryFields,
        prefixQueryOptions: {
          ...prefixQueryOptions,
        },
        queryFields: queryFields || ['_all'],
        queryOptions: {
          ...queryOptions,
        },
        queryBuilder,
        onQueryStateChange: () => {
          if (!this.unmounted && this.state.inspectPointSelected) {
            this.setState({
              inspectPointSelected: false,
              inspectPointCoordinate: [0, 0],
            });
          }
        },
      },
    );
  }

  searchQuery (query) {
    const shouldResetOtherState = false;

    this.accessor.setQueryString(query, shouldResetOtherState);

    this.searchkit.performSearch();
  }

  _mapOnClick = (event) => {
    let inspectPointSelected = false;
    let inspectPointCoordinate = [0, 0];

    if (event.latLongCoordinate) {
      inspectPointSelected = true;
      inspectPointCoordinate = event.latLongCoordinate;
    }

    this.setState({
      inspectPointSelected,
      inspectPointCoordinate,
    });

    this.searchQuery(inspectPointCoordinate);
  }

  render () {
    const {
      inspectPointSelected,
      inspectPointCoordinate,
    } = this.state;

    return (
      <MapView
        className="map-wrapper"
        basemap="osm"
        center="-12107625, 4495720"
        zoom="5"
        onClick={this._mapOnClick}
        ref={(ref) => this._mapview = ref}
      >
        <map-layer-singlepoint
          invisible={!inspectPointSelected ? 'invisible' : null}
          latitude={inspectPointCoordinate[1]}
          longitude={inspectPointCoordinate[0]}
        />

        <map-control-defaults />
        <map-interaction-defaults />
        <map-control-simple-layer-list />
      </MapView>
    );
  }
}
