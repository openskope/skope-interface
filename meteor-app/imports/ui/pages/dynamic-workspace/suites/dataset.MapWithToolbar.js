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
    boundaryGeometry: PropTypes.object.isRequired,
    focusGeometry: PropTypes.object,
    getExtentFromGeometry: PropTypes.func.isRequired,
    updateFocusGeometry: PropTypes.func.isRequired,
    children: PropTypes.any.isRequired,
  };

  static defaultProps = {
    selectionTools: [],
    focusGeometry: null,
  };

  constructor (props) {
    super(props);

    const defaultSelectionTool = props.selectionTools[0] || { name: '' };

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
    this.props.updateFocusGeometry(jsonGeometry);

    this.clearFocusFeatureDrawing();
  };

  setSelectionToolActive (tool) {
    this.setState({
      activeSelectionToolName: tool.name,
      activeDrawingType: tool.drawingType,
      freehandDrawing: tool.freehandDrawing,
    });

    // Setting focus gemoetry to null should load the default focus geometry.
    this.props.updateFocusGeometry(null);

    // If the new tool can't draw, don't clear existing features.
    if (tool.drawingType) {
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
      boundaryGeometry,
      focusGeometry,
      getExtentFromGeometry,
      children,
    } = this.props;
    const {
      activeDrawingType,
      freehandDrawing,
    } = this.state;

    const boundaryExtent = getExtentFromGeometry(boundaryGeometry);
    const boundaryGeoJson = buildGeoJsonWithGeometry(boundaryGeometry);
    const boundaryGeoJsonString = boundaryGeoJson && JSON.stringify(boundaryGeoJson);
    const focusBoundaryGeoJson = buildGeoJsonWithGeometry(focusGeometry);
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
          <ToolbarGroup>
            {selectionTools.map((item) => (
              <ToggleButton
                key={item.name}
                className="selection-tool-button"
                icon={<item.IconClass style={mapToolbarStyles.toggleButton.icon} />}
                defaultZDepth={1}
                toggled={this.isSelectionToolActive(item)}
                onToggle={(event, toggled) => toggled && this.setSelectionToolActive(item)}
              />
            ))}
          </ToolbarGroup>
        </Toolbar>

        <MapView
          className="map"
          basemap="arcgis"
          projection="EPSG:4326"
          extent={boundaryExtent}
          style={{
            '--aspect-ratio': '4/3',
          }}
        >
          {children}
          {boundaryGeoJsonString && (
            <map-layer-geojson
              id={`${id}__boundary-geometry-display-layer`}
              style={{
                strokeColor: 'red',
              }}
              src-json={boundaryGeoJsonString}
            />
          )}
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
