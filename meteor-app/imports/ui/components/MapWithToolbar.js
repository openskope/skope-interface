import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

import {
  Toolbar,
  ToolbarGroup,
  ToolbarTitle,
} from 'material-ui/Toolbar';

import {
  dataSpatialBoundaryFillColor,
  mapToolbarStyles,
  presentationProjection,
  maxMapZoomLevel,
  minMapZoomLevel,
} from '/imports/ui/consts';

import {
  buildGeoJsonWithGeometry,
} from '/imports/ui/helpers';

import ToggleButton from '/imports/ui/components/ToggleButton';

import MapView from '/imports/ui/components/mapview';

export default
class MapWithToolbar extends React.Component {

  static propTypes = {
    id: PropTypes.string.isRequired,
    // @type {Array<{name: string, IconClass: Icon, [drawingType: string]}>}
    selectionTools: PropTypes.arrayOf(PropTypes.object),
    defaultExtent: PropTypes.arrayOf(PropTypes.number),
    geometryOfFocus: PropTypes.object,
    updateGeometryOfFocus: PropTypes.func.isRequired,
    projection: PropTypes.string,
    children: PropTypes.any,
  };

  static defaultProps = {
    selectionTools: [],
    defaultExtent: null,
    geometryOfFocus: null,
    projection: presentationProjection,
    children: null,
  };

  constructor (props) {
    super(props);

    const defaultSelectionTool = props.selectionTools[0] || { name: '' };

    this._mapView = null;

    this.state = {
      activeSelectionToolName: defaultSelectionTool.name,
      activeDrawingType: defaultSelectionTool.drawingType,
      freehandDrawing: defaultSelectionTool.freehandDrawing,
    };
  }

  componentDidMount () {
    this.connectMap();
  }

  shouldComponentUpdate (nextProps, nextState) {
    return ![
      _.isEqual(nextProps, this.props),
      _.isEqual(nextState, this.state),
    ].every(Boolean);
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

  onStartDrawingNewFocusGeometry = () => {
    this.clearFocusFeatureDrawing();
  };

  onDrawNewFocusFeature = (olEvent) => {
    const olGeometry = olEvent.feature.getGeometry();
    const jsonGeometry = this._focusGeometryDrawingLayer.writeGeometryObject(olGeometry);

    // Report new focus geometry.
    this.props.updateGeometryOfFocus(jsonGeometry);

    this.clearFocusFeatureDrawing();
  };

  setSelectionToolActive (tool) {
    this.setState({
      activeSelectionToolName: tool.name,
      activeDrawingType: tool.drawingType,
      freehandDrawing: tool.freehandDrawing,
    });

    // If the new tool can't draw, don't clear existing features.
    if (tool.drawingType) {
      // Setting focus gemoetry to null should load the default focus geometry.
      this.props.updateGeometryOfFocus(null);
      this.clearFocusFeatureDrawing();
    }
  }

  isSelectionToolActive (tool) {
    return this.state.activeSelectionToolName === tool.name;
  }

  clearFocusFeatureDrawing () {
    if (this._focusGeometryDrawingLayer) {
      this._focusGeometryDrawingLayer.clearFeatures();
    }
  }

  connectMap () {
    if (this._mapView && this._mapView.map) {
      //! Workaround to set max zoom without `web-gis-components` supporting it.
      this._mapView.map.olMap_.getView().setMaxZoom(maxMapZoomLevel);
      this._mapView.map.olMap_.getView().setMinZoom(minMapZoomLevel);
    }

    // Restrict to have at most 1 feature in the layer.
    if (this._focusGeometryDrawingInteraction) {
      this._focusGeometryDrawingInteraction.addEventListener('drawstart', this.onStartDrawingNewFocusGeometry);
    }
    // When a new box is drawn, update the viewing extent.
    if (this._focusGeometryDrawingLayer) {
      this._focusGeometryDrawingLayer.addEventListener('addfeature', this.onDrawNewFocusFeature);
    }
  }

  disconnectMap () {
    if (this._focusGeometryDrawingInteraction) {
      this._focusGeometryDrawingInteraction.removeEventListener('drawstart', this.onStartDrawingNewFocusGeometry);
    }
    if (this._focusGeometryDrawingLayer) {
      this._focusGeometryDrawingLayer.removeEventListener('addfeature', this.onDrawNewFocusFeature);
    }
  }

  render () {
    const {
      id,
      selectionTools,

      defaultExtent,

      geometryOfFocus,
      projection,
      children,
    } = this.props;
    const {
      activeDrawingType,
      freehandDrawing,
    } = this.state;

    const focusBoundaryGeoJson = buildGeoJsonWithGeometry(geometryOfFocus);
    const focusBoundaryGeoJsonString = focusBoundaryGeoJson && JSON.stringify(focusBoundaryGeoJson);

    return (
      <div
        id={id}
      >
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
          <ToolbarGroup className="toggle-button-group">
            {selectionTools.map((item, index, list) => {
              const notFirstItem = index > 0;
              const notLastItem = index < (list.length - 1);
              const isActive = this.isSelectionToolActive(item);

              return (
                <ToggleButton
                  key={item.name}
                  className="toggle-button-group__item selection-tool-button"
                  icon={<item.IconClass style={mapToolbarStyles.toggleButton.icon} />}
                  defaultZDepth={0}
                  zDepthWhenToggled={0}
                  toggled={isActive}
                  onToggle={(event, toggled) => toggled && this.setSelectionToolActive(item)}
                  style={{
                    // Tweak border radius so items look as if they were connected.
                    ...(notFirstItem && {
                      borderTopLeftRadius: 0,
                      borderBottomLeftRadius: 0,
                    }),
                    ...(notLastItem && {
                      borderTopRightRadius: 0,
                      borderBottomRightRadius: 0,
                    }),
                  }}
                  buttonStyle={{
                    ...(isActive ? {
                      boxShadow: [
                        // Use stronger inset shadow when active.
                        'rgba(0, 0, 0, 0.8) 0px 0px 1px 0px inset',
                        'rgba(0, 0, 0, 0.1) 0px 0px 0.5em 1px inset',
                      ],
                    } : {
                      boxShadow: [
                        'rgba(0, 0, 0, 0.2) 0px 0px 0px 0.5px inset',
                      ],
                      // Make the color weaker when not active.
                      color: 'rgba(0, 0, 0, 0.5)',
                    }),
                  }}
                />
              );
            })}
          </ToolbarGroup>
        </Toolbar>

        <MapView
          className="map"
          basemap="arcgis"
          projection={projection}
          extent={defaultExtent}
          style={{
            '--aspect-ratio': '4/3',
          }}
          ref={(ref) => this._mapView = ref}
        >
          {children}
          {focusBoundaryGeoJsonString && (
            <map-layer-geojson
              id={`${id}__focus-geometry-display-layer`}
              style={{
                fill: dataSpatialBoundaryFillColor,
              }}
              src-json={focusBoundaryGeoJsonString}
            />
          )}
          <map-layer-vector
            id={`${id}__focus-geometry-drawing-layer`}
            ref={(ref) => this._focusGeometryDrawingLayer = ref}
          />
          <map-interaction-defaults />
          <map-interaction-draw
            disabled={activeDrawingType ? null : 'disabled'}
            source={`${id}__focus-geometry-drawing-layer`}
            type={activeDrawingType}
            freehand={freehandDrawing}
            ref={(ref) => this._focusGeometryDrawingInteraction = ref}
          />
          <map-control-defaults />
        </MapView>
      </div>
    );
  }
}
