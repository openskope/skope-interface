import React from 'react';
import PropTypes from 'prop-types';
import {
  SearchkitComponent,
  QueryAccessor,
  Panel,
} from 'searchkit';
import MapView from '/imports/ui/components/mapview';

export default class SpatialFilter extends SearchkitComponent {

  static defaultProps = {
    id: 'coord',
    mod: 'sk-spatial-filter',
  };

  static propTypes = {
    ...SearchkitComponent.propTypes,

    title: PropTypes.string.isRequired,
    id: PropTypes.string,
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
        queryBuilder: (query, queryOptions) => {
          return {
            bool: {
              must: {
                match_all: {},
              },
              filter: {
                geo_shape: {
                  location: {
                    shape: {
                      type: 'Point',
                      coordinates: query,
                    },
                    relation: 'contains',
                  },
                },
              },
            },
          };
        },
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
      title,
      className,
    } = this.props;

    return (
      <Panel
        title={title}
      >
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
        </MapView>
      </Panel>
    );
  }
}
