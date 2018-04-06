import React from 'react';
import PropTypes from 'prop-types';
import {
  SearchkitComponent,
  FilterBasedAccessor,
  ObjectState,
  Panel,
} from 'searchkit';
import MapView from '/imports/ui/components/mapview';

/**
 * The `SpatialAccessor` is only responsible for wrapping the query value in a `geo_shape` filter.
 * It is up to whatever using this accessor to build a proper shape query (like a point or a polygon).
 * This accessor also supports filtering on multiple fields.
 */
class SpatialAccessor extends FilterBasedAccessor {
  /**
   * @param {Object} shapeAndRelation
   * @param {Object} queryOptions
   * @param {Array.<string>} queryOptions.fields
   * @return {Object}
   */
  static shapeQueryBuilder = (shapeAndRelation, queryOptions) => {
    return {
      bool: {
        filter: queryOptions.fields.map((fieldName) => ({
          geo_shape: {
            [fieldName]: shapeAndRelation,
          },
        })),
      },
    };
  };

  constructor (key, options) {
    super(key, options.id);

    this.state = new ObjectState();
    this.options = options;
    this.options.fields = this.options.fields || [];
  }

  fromQueryObject (ob) {
    super.fromQueryObject(ob);

    if (this.options.onQueryStateChange) {
      this.options.onQueryStateChange();
    }
  }

  /**
   * @param {Object} oldState - This for some reason is the entire state in SearchKit.
   */
  onStateChange (oldState) {
    const ownOldState = oldState[this.key];
    const ownState = this.state.getValue();
    const ownStateChanged = ownOldState !== ownState;

    if (ownStateChanged && this.options.onQueryStateChange) {
      this.options.onQueryStateChange();
    }
  }

  buildSharedQuery (query) {
    const shapeAndRelation = this.getQueryShape();

    if (shapeAndRelation) {
      let newQuery = query;

      const shapeQuery = SpatialAccessor.shapeQueryBuilder(
        shapeAndRelation,
        {
          fields: this.options.fields,
        },
      );

      newQuery = newQuery.addQuery(shapeQuery);

      newQuery = newQuery.addSelectedFilter({
        name: this.options.title,
        value: '',
        id: this.key,
        remove: () => this.clearQueryShape(),
      });

      return newQuery;
    }

    return query;
  }

  setQueryShape ({
    shape,
    relation,
  }) {
    this.state = this.state.setValue({
      shape,
      relation,
    });
  }

  /**
   * @return {{shape: Object, relation: string}|null}
   */
  getQueryShape () {
    if (!this.state.hasValue()) {
      return null;
    }

    return this.state.getValue();
  }

  clearQueryShape () {
    this.state = this.state.clear();
  }
}

export default
class SpatialFilter extends SearchkitComponent {

  static defaultProps = {
    id: 'poi',
    mod: 'sk-spatial-filter',
    subtitle: '',
  };

  static propTypes = {
    ...SearchkitComponent.propTypes,

    title: PropTypes.string.isRequired,
    subtitle: PropTypes.string,
    id: PropTypes.string,
    fields: PropTypes.arrayOf(PropTypes.string),
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
      title,
      fields,
    } = this.props;

    return new SpatialAccessor(
      id,
      {
        title,
        fields,
        onQueryStateChange: () => {
          if (!this.unmounted) {
            this.setState({
              selectedPoint: this.getSelectedPoint(),
            });
          }
        },
      },
    );
  }

  /**
   * This function needs to build a proper point query.
   * The query should search for all items containing the given point.
   * @param {Array.<number>} pointCoords
   */
  buildPointQuery = (pointCoords) => ({
    shape: {
      type: 'Point',
      coordinates: pointCoords,
    },
    relation: 'contains',
  });

  /**
   * @return {Array.<number>|null}
   */
  getSelectedPoint () {
    const shapeAndRelation = this.accessor.getQueryShape();

    if (!shapeAndRelation) {
      return null;
    }

    if (shapeAndRelation.shape.type === 'Point') {
      return shapeAndRelation.shape.coordinates;
    }

    return null;
  }

  /**
   * @param {Array.<number>|null} pointCoords
   */
  setPointQuery (pointCoords) {
    if (!pointCoords) {
      this.accessor.clearQueryShape();
    } else {
      this.accessor.setQueryShape(this.buildPointQuery(pointCoords));
    }

    this.searchkit.performSearch();
  }

  _mapOnClick = (event) => {
    event.preventDefault();

    const selectedPoint = event.latLongCoordinate || null;

    this.setPointQuery(selectedPoint);
  }

  render () {
    const {
      title,
      subtitle,
      className,
    } = this.props;
    const {
      selectedPoint,
     } = this.state;

    return (
      <Panel
        title={title}
      >
        {subtitle && (
          <div
            style={{
              fontSize: '0.8em',
            }}
          >{subtitle}</div>
        )}
        <MapView
          className={className}
          basemap="arcgis"
          center="-12107625, 4495720"
          zoom="5"
          onClick={this._mapOnClick}
          onContextMenu={this._mapOnClick}
          style={{
            '--aspect-ratio': '4/3',
          }}
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
