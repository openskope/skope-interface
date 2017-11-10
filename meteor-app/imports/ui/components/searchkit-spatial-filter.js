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
      selectedPoint: null,
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
          if (!this.unmounted && this.state.selectedPoint) {
            this.setState({
              selectedPoint: null,
            });
          }
        },
      },
    );
  }

  getValue () {
    return this.state.selectedPoint || this.getAccessorValue();
  }

  getAccessorValue () {
    return this.accessor.state.getValue() || null;
  }

  searchQuery (query) {
    const shouldResetOtherState = false;

    this.accessor.setQueryString(query, shouldResetOtherState);

    this.searchkit.performSearch();
  }

  _mapOnClick = (event) => {
    event.preventDefault();

    const selectedPoint = event.latLongCoordinate || null;

    this.setState({
      selectedPoint,
    });

    this.searchQuery(selectedPoint);
  }

  render () {
    const selectedPoint = this.getValue();
    const {
      className,
    } = this.props;

    return (
      <MapView
        className={className}
        basemap="osm"
        center="-12107625, 4495720"
        zoom="5"
        onClick={this._mapOnClick}
        onContextMenu={this._mapOnClick}
        ref={(ref) => this._mapview = ref}
      >
        <map-layer-singlepoint
          invisible={!selectedPoint ? 'invisible' : null}
          latitude={selectedPoint ? selectedPoint[1] : 0}
          longitude={selectedPoint ? selectedPoint[0] : 0}
        />

        <map-control-defaults />
        <map-interaction-defaults />
        <map-control-simple-layer-list />
      </MapView>
    );
  }
}
