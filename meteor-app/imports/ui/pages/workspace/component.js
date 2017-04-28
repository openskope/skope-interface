import { FlowRouter } from "meteor/kadira:flow-router";
import React from "react";

export default class Page_Workspace extends React.Component {
  constructor (props) {
    super(props);

    this._bound_rangeFilterOnChange = this._rangeFilterOnChange.bind(this);
  }

  _rangeFilterOnChange (event) {
    const target = event.currentTarget;
    const {
      updateFilterValue,
    } = this.props;

    updateFilterValue(target.value);
  }

  render () {
    const {
      data,
      filterMin,
      filterMax,
      filterValue,
    } = this.props;

    return (
      <div className="page--workspace">
        <fieldset className="section_filter">
          <legend>Filters</legend>
          <div className="filter-row">
            <label>FilterValue: </label>
            <input
              className="layout_fill"
              type="range"
              min={filterMin}
              max={filterMax}
              step="1"
              value={filterValue}
              onChange={this._bound_rangeFilterOnChange}
            />
          </div>
        </fieldset>
        <map-view id="demo-map" basemap="osm" center="-10997148, 4569099" style={{width: "100%"}}>
          <map-layer-geojson
            name="example-geojson"
            src-json={JSON.stringify(data)}
            src-projection="EPSG:4326"
            projection="EPSG:3857"
          ></map-layer-geojson>
        </map-view>
      </div>
    );
  }
}
