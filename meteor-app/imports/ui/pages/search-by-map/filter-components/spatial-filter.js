import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import {
  SearchkitComponent,
  FilterBasedAccessor,
  ObjectState,
  Panel,
} from 'searchkit';
import MapWithToolbar from '/imports/ui/components/MapWithToolbar';

import {
  PanToolIcon,
  BoxToolIcon,
} from '/imports/ui/consts';

import {
  stringToNumber,
} from '/imports/ui/helpers';

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
    defaultExtent: PropTypes.arrayOf(PropTypes.number),
    mod: PropTypes.string,
    // {intersects|disjoint|within|contains}
    relation: PropTypes.string,
  };

  static defaultProps = {
    ...SearchkitComponent.defaultProps,
    defaultExtent: null,
    relation: 'intersects',
  };

  static selectionTools = [
    {
      name: 'pan',
      IconClass: PanToolIcon,
      title: 'Pan tool',
    },
    {
      name: 'rectangle',
      IconClass: BoxToolIcon,
      title: 'Rectangle tool',
      drawingType: 'Box',
      freehandDrawing: true,
    },
  ];

  constructor (props) {
    super(props);

    this.state = {
      /**
       * Make sure all the coordinates here are in EPSG:4326 (lat-long).
       * @type {Object}
       */
      filterGeometry: null,
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
            const queryShape = this.accessor.getQueryShape();

            if (!queryShape) {
              this.setState({
                filterGeometry: null,
              });
            } else {
              // Coordinates must have numbers only.
              const geometryWithNumbers = stringToNumber(queryShape.shape);

              this.setState({
                filterGeometry: geometryWithNumbers,
              });
            }
          }
        },
      },
    );
  }

  /**
   * This function needs to build a proper geometry query.
   * The query should search for all items containing the given geometry.
   * @param {Array.<number>} pointCoords
   */
  buildGeometryQuery = (geometry) => ({
    shape: geometry,
    relation: this.props.relation,
  });

  /**
   * @param {Object|null} geometry
   */
  setGeometryQuery (geometry) {
    if (!geometry) {
      this.accessor.clearQueryShape();
    } else {
      this.accessor.setQueryShape(this.buildGeometryQuery(geometry));
    }

    _.defer(() => {
      this.searchkit.performSearch();
    });
  }

  render () {
    const {
      title,
      subtitle,
      className,
      defaultExtent,
    } = this.props;
    const {
      filterGeometry,
    } = this.state;

    return (
      <Panel
        title={title}
        className={className}
      >
        {subtitle && (
          <div
            style={{
              fontSize: '0.8em',
            }}
          >{subtitle}</div>
        )}
        <MapWithToolbar
          id="spatial-filter"
          selectionTools={SpatialFilter.selectionTools}
          defaultExtent={defaultExtent}
          geometryOfFocus={filterGeometry}
          updateGeometryOfFocus={(geom) => this.setGeometryQuery(geom)}
        >
          <map-control-mouse-position slot="right-dock" />
        </MapWithToolbar>
      </Panel>
    );
  }
}
