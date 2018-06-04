import React from 'react';
import moment from 'moment';
import Paper from 'material-ui/Paper';
import FullWindowLayout from '/imports/ui/layouts/full-window';
import AppbarHeader from '/imports/ui/components/appbar';
import FlatButton from 'material-ui/FlatButton';

import {
  Pagination,
  SearchBox,
  RefinementListFilter,
  SortingSelector,
  ActionBar,
  ActionBarRow,
  HitsStats,
  SelectedFilters,
  ResetFilters,
  Hits,
  NoHits,
} from 'searchkit';

import {
  searchPageResultCountPerPage as resultsPerPage,
} from '/imports/ui/consts';

import SpatialFilter from './filter-components/spatial-filter';
import DataTemporalRangeFilter from './filter-components/data-temporal-range-filter';
import SelectedFilterItem from './SelectedFilterItem';
import RenderSearchResultItemByType from './RenderSearchResultItemByType';

import DummyTabBar from './DummyTabBar';

const ResetFilterButton = ({
  bemBlock,
  hasFilters,
  resetFilters,
  translate, // Not used. If included in `props` React will complain.
  clearAllLabel, // Not used. If included in `props` React will complain.
  ...props
}) => (
  <span
    {...props}
    className={bemBlock().state({
      disabled: !hasFilters,
    })}
  >
    <FlatButton
      label="Reset Filter"
      secondary
      onClick={resetFilters}
      disabled={!hasFilters}
    />
  </span>
);

export default class SearchPage extends React.Component {

  static propTypes = {
    //! Add prop types here.
  };

  renderHeader = () => (
    <AppbarHeader
      title="Discover Paleoenvironmental Data or Models"
    />
  );

  renderBody = () => (
    <div className="page-search">
      <div className="the-dummy-tabbar">
        <DummyTabBar />
      </div>
      <div className="not-the-dummy-tabbar">
        <Paper
          className="page-search__search"
          zDepth={0}
        >
          <div className="page-search__search__inner">
            <SearchBox
              queryFields={[
                'title^6',
                'descriptionMD^3',
                'dataTypes^2',
                'information.markdown',
              ]}
            />

            <RefinementListFilter
              id="variables"
              title="Variable Classes"
              field="variables.class.raw"
              fieldOptions={{
                type: 'nested',
                options: {
                  path: 'variables',
                },
              }}
              operator="OR"
              orderKey="_key"
              orderDirection="asc"
              size={5}
            />

            <RefinementListFilter
              id="status"
              title="Status"
              field="status"
              operator="OR"
              orderKey="_key"
              orderDirection="asc"
              size={5}
            />

            <DataTemporalRangeFilter
              id="timespan"
              fields={[
                'timespan.period',
              ]}
              relation="intersects"
              min={moment('0001', 'YYYY').toDate()}
              max={moment().toDate()}
              title="Time Period"
            />

            <SpatialFilter
              id="location"
              title="Geographic Area"
              subtitle="Click to filter datasets overlapping your area of interest."
              fields={['region.geometry']}
              defaultExtent={[-130.58488296266117, 16.545175776537654, -72.57707046266117, 59.963144526537654]}
            />

            <div className="layout-filler" />
          </div>
        </Paper>
        <Paper
          className="page-search__result"
          zDepth={3}
        >
          <ActionBar
            className="page-search__action-bar"
          >
            <ActionBarRow>
              <HitsStats />
              <SortingSelector
                options={[
                  // { label: 'Relevance', field: '_score', order: 'desc', defaultOption: true },
                  { label: 'Latest Releases', field: 'revised', order: 'desc', defaultOption: true },
                  { label: 'Earliest Releases', field: 'revised', order: 'asc' },
                ]}
              />
            </ActionBarRow>

            <ActionBarRow>
              <SelectedFilters
                mod="selected-filters"
                itemComponent={SelectedFilterItem}
              />
              <ResetFilters
                mod="page-search__reset-button"
                component={ResetFilterButton}
                options={{
                  query: true,
                  filter: true,
                  pagination: false,
                }}
              />
            </ActionBarRow>
          </ActionBar>

          <Hits
            mod="page-search__result__list"
            hitsPerPage={resultsPerPage}
            itemComponent={RenderSearchResultItemByType}
            scrollTo=".page-search__result"
            // Passing extra props doesn't expose them to item component.
          />
          <NoHits />

          <Pagination
            mod="page-search__result__pagination"
            showNumbers
          />
        </Paper>
      </div>
    </div>
  );

  render = () => (
    <FullWindowLayout
      header={this.renderHeader()}
      body={this.renderBody()}
    />
  );
}
