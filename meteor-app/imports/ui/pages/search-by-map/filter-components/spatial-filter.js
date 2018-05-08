import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import {
  SearchkitComponent,
  FilterBasedAccessor,
  ObjectState,
  Panel,
} from 'searchkit';
import {
  Toolbar,
  ToolbarGroup,
  ToolbarTitle,
} from 'material-ui/Toolbar';
import RaisedButton from 'material-ui/RaisedButton';
import MapView from '/imports/ui/components/mapview';

import {
  dataSpatialBoundaryFillColor,
  mapToolbarStyles,
  PanToolIcon,
  BoxToolIcon,
} from '/imports/ui/consts';

import {
  buildGeoJsonWithGeometry,
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
    projection: PropTypes.string,
    defaultExtent: PropTypes.arrayOf(PropTypes.number),
    mod: PropTypes.string,
  };

  static defaultProps = {
    ...SearchkitComponent.defaultProps,
    projection: 'EPSG:4326',
    defaultExtent: null,
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

    this._mapview = null;
    this._searchBoundaryDrawingLayer = null;
    this._searchBoundaryDrawingInteraction = null;

    const defaultSelectionTool = SpatialFilter.selectionTools[0];

    this.state = {
      /**
       * Make sure all the coordinates here are in EPSG:4326 (lat-long).
       * @type {Object}
       */
      filterGeometry: null,
      // @type {string}
      activeSelectionToolName: defaultSelectionTool.name,
      // @type {string|null}
      activeDrawingType: defaultSelectionTool.drawingType,
    };

    // This vector layer element is used to help handle vector data.
    this._utilVectorLayerElement = (() => {
      const element = document.createElement('map-layer-vector');

      element.srcProjection = 'EPSG:4326';
      element.projection = 'EPSG:4326';

      return element;
    })();
  }

  componentDidMount () {
    this.connectMap();
  }

  componentWillUpdate () {
    this.disconnectMap();
  }

  componentDidUpdate () {
    this.connectMap();
  }

  componentWillUnmount () {
    this.disconnectMap();
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

              this.focusMapOnGeometry(geometryWithNumbers);
            }
          }
        },
      },
    );
  }

  onStartDrawingNewSearchBoundary = () => {
    this.clearSearchBoundaryFeatureDrawing();
  };

  onDrawNewSearchBoundaryFeature = (olEvent) => {
    const olGeometry = olEvent.feature.getGeometry();
    const jsonGeometry = this._utilVectorLayerElement.writeGeometryObject(olGeometry);

    this.setGeometryQuery(jsonGeometry);

    this.clearSearchBoundaryFeatureDrawing();
  };

  clearSearchBoundaryFeatureDrawing () {
    if (this._searchBoundaryDrawingLayer) {
      this._searchBoundaryDrawingLayer.clearFeatures();
    }
  }

  /**
   * @param {Object} geometry
   * @param {number} zoomFactor
   */
  focusMapOnGeometry (geometry, zoomFactor = 1.1) {
    if (!(this._mapview && this._mapview.map && this._utilVectorLayerElement)) {
      return;
    }

    const olGeometry = this._utilVectorLayerElement.readGeometryObject(geometry);

    olGeometry.scale(zoomFactor);

    this._mapview.map.extent = olGeometry.getExtent();
  }

  connectMap () {
    // Restrict to have at most 1 feature in the layer.
    if (this._searchBoundaryDrawingInteraction) {
      this._searchBoundaryDrawingInteraction.addEventListener('drawstart', this.onStartDrawingNewSearchBoundary);
    }
    // When a new box is drawn, update the viewing extent.
    if (this._searchBoundaryDrawingLayer) {
      this._searchBoundaryDrawingLayer.addEventListener('addfeature', this.onDrawNewSearchBoundaryFeature);
    }
  }

  disconnectMap () {
    if (this._searchBoundaryDrawingInteraction) {
      this._searchBoundaryDrawingInteraction.removeEventListener('drawstart', this.onStartDrawingNewSearchBoundary);
    }
    if (this._searchBoundaryDrawingLayer) {
      this._searchBoundaryDrawingLayer.removeEventListener('addfeature', this.onDrawNewSearchBoundaryFeature);
    }
  }

  /**
   * This function needs to build a proper geometry query.
   * The query should search for all items containing the given geometry.
   * @param {Array.<number>} pointCoords
   */
  buildGeometryQuery = (geometry) => ({
    shape: geometry,
    relation: 'contains',
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

  setSelectionToolActive (tool) {
    this.setState({
      activeSelectionToolName: tool.name,
      activeDrawingType: tool.drawingType,
    });

    // If the new tool can't draw, don't clear existing features.
    if (tool.drawingType) {
      this.accessor.clearQueryShape();

      _.defer(() => {
        this.searchkit.performSearch();
      });
    }
  }

  isSelectionToolActive (tool) {
    return this.state.activeSelectionToolName === tool.name;
  }

  render () {
    const {
      title,
      subtitle,
      className,
      projection,
      defaultExtent,
    } = this.props;
    const {
      filterGeometry,
      activeDrawingType,
    } = this.state;

    // const extent = (() => {
    //   if (!(filterGeometry && this._utilVectorLayerElement)) {
    //     return defaultExtent;
    //   }

    //   const olGeometry = this._utilVectorLayerElement.readGeometryObject(filterGeometry);

    //   olGeometry.scale(1.2);

    //   return olGeometry.getExtent();
    // })();
    const filterBoundaryGeoJson = filterGeometry && buildGeoJsonWithGeometry(filterGeometry);
    const filterBoundaryGeoJsonString = filterBoundaryGeoJson && JSON.stringify(filterBoundaryGeoJson);

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
        <Toolbar
          style={{
            ...mapToolbarStyles.root,
          }}
        >
          <ToolbarGroup>
            <ToolbarTitle
              text="Tools"
              style={{
                ...mapToolbarStyles.title,
              }}
            />
          </ToolbarGroup>
          <ToolbarGroup>
            {SpatialFilter.selectionTools.map((item) => (
              <RaisedButton
                key={item.name}
                className="selection-tool-button"
                icon={<item.IconClass style={mapToolbarStyles.toggleButton.icon} />}
                style={{
                  ...mapToolbarStyles.toggleButton.root,
                  ...(this.isSelectionToolActive(item) && mapToolbarStyles.toggleButton.active),
                }}
                buttonStyle={mapToolbarStyles.toggleButton.button}
                overlayStyle={{
                  ...mapToolbarStyles.toggleButton.overlay,
                }}
                onClick={() => this.setSelectionToolActive(item)}
              />
            ))}
          </ToolbarGroup>
        </Toolbar>
        <MapView
          className={className}
          basemap="arcgis"
          projection={projection}
          extent={defaultExtent}
          style={{
            '--aspect-ratio': '4/3',
          }}
          ref={(ref) => this._mapview = ref}
        >
          <map-layer-geojson
            invisible={!filterBoundaryGeoJsonString ? 'invisible' : null}
            style={{
              fill: dataSpatialBoundaryFillColor,
            }}
            src-json={filterBoundaryGeoJsonString}
            src-projection={projection}
          />
          <map-layer-vector
            id="search-boundary-drawing-layer"
            src-projection={projection}
            ref={(ref) => this._searchBoundaryDrawingLayer = ref}
          />

          <map-control-defaults />
          <map-interaction-draw
            disabled={activeDrawingType ? null : 'disabled'}
            source="search-boundary-drawing-layer"
            type={activeDrawingType}
            ref={(ref) => this._searchBoundaryDrawingInteraction = ref}
          />
          <map-interaction-defaults />
        </MapView>
      </Panel>
    );
  }
}
