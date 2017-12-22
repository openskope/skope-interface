import React from 'react';
import PropTypes from 'prop-types';
import Paper from 'material-ui/Paper';
import FullWindowLayout from '/imports/ui/layouts/full-window';
import AppbarHeader from '/imports/ui/components/appbar';
import SpatialFilter from '/imports/ui/components/searchkit-spatial-filter';
import FlatButton from 'material-ui/FlatButton';
import moment from 'moment';

import {
  Pagination,
  RefinementListFilter,
  RangeFilter,
  ActionBar,
  ActionBarRow,
  HitsStats,
  SelectedFilters,
  ResetFilters,
  Hits,
  NoHits,
} from 'searchkit';

import DataTemporalRangeFilter from '/imports/ui/components/searchpage-filters/data-temporal-range-filter';

import {
  PropPrinter,
} from '/imports/ui/helpers';

import SelectedFilterItem from './SelectedFilterItem';
import SearchResultItem from './SearchResultItem';

const ResetFilterButton = ({
  hasFilters,
  resetFilters,
}) => (
  <FlatButton
    label="Reset Filter"
    secondary
    onClick={resetFilters}
    disabled={!hasFilters}
  />
);

export default class SearchPage extends React.Component {

  static propTypes = {
    //!
  };

  renderHeader = () => (
    <AppbarHeader
      onClickHelpButton={() => alert('Show help for search page.')}
    />
  );

  renderBody = () => (
    <div className="page-search">
      <Paper className="page-search__search">
        <div className="page-search__search__inner">
          <SpatialFilter
            className="spatial-filter"
            title="Point of Interest"
          />

          <DataTemporalRangeFilter
            id="temporal-range"
            fields={[
              'StartDate',
              'EndDate',
            ]}
            title="Date Range"
            min={1000 * 60 * 60 * 24 * (365 * 30 + 8)}
            max={Date.now()}
            interval={1000 * 60 * 60 * 24}
            rangeFormatter={(timestamp) => moment(parseInt(timestamp, 10)).format('YYYY-MM-DD')}
            showHistogram
          />

          <RefinementListFilter
            id="resultTypes-list"
            title="Result Types"
            field="ResultTypes"
            operator="OR"
            orderKey="_term"
            orderDirection="asc"
            size={5}
          />

          <div className="layout-filler" />
        </div>
      </Paper>
      <div className="page-search__result">
        <PropPrinter results={this.props.searchResult && this.props.searchResult.aggregations} />
        <ActionBar>
          <ActionBarRow>
            <HitsStats />
          </ActionBarRow>

          <ActionBarRow>
            <SelectedFilters
              mod="selected-filters"
              itemComponent={SelectedFilterItem}
            />
            <ResetFilters component={ResetFilterButton} />
          </ActionBarRow>
        </ActionBar>

        <Hits mod="sk-hits-grid" hitsPerPage={3} itemComponent={SearchResultItem} />
        <NoHits />

        <Pagination
          showNumbers
        />
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
