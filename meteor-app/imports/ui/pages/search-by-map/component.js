import React from 'react';
import PropTypes from 'prop-types';
import Paper from 'material-ui/Paper';
import FullWindowLayout from '/imports/ui/layouts/full-window';
import AppbarHeader from '/imports/ui/components/appbar';
import SpatialFilter from '/imports/ui/components/searchkit-spatial-filter';
import FlatButton from 'material-ui/FlatButton';
import moment from 'moment';

import {
  SearchkitManager,
  SearchkitProvider,
  Pagination,
  RefinementListFilter,
  RangeFilter,
  DynamicRangeFilter,
  ActionBar,
  ActionBarRow,
  HitsStats,
  SelectedFilters,
  ResetFilters,
  Hits,
  NoHits,
} from 'searchkit';

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

  constructor (props) {
    super(props);

    console.log('props', props);
  }

  renderHeader = () => (
    <AppbarHeader
      onClickHelpButton={() => alert('Show help for search page.')}
    />
  );

  renderBody = () => {
    console.log('renderBody', this.props.searchResult);
    return (
      <div className="page-search">
        <Paper className="page-search__search">
          <div className="page-search__search__inner">
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

            <SpatialFilter
              className="spatial-filter"
              title="Point of Interest"
            />

            {
              this.props.searchResult
              ? (
                <RangeFilter
                  id="data-temporal-range"
                  field="StartDate"
                  title="Start Date"
                  min={this.props.searchResult.aggregations['data-temporal-min-start'].value}
                  max={this.props.searchResult.aggregations['data-temporal-max-start'].value}
                  rangeFormatter={(timestamp) => moment(parseInt(timestamp, 10)).format('YYYY-MM-DD')}
                  showHistogram
                />
              )
              : null
            }

            <DynamicRangeFilter
              id="enddate-range"
              field="EndDate"
              title="End Date"
              rangeFormatter={(timestamp) => moment(parseInt(timestamp, 10)).format('YYYY-MM-DD')}
            />
          </div>
        </Paper>
        <div className="page-search__result">
          <PropPrinter results={this.props.searchResult} />
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
  };

  render = () => (
    <FullWindowLayout
      header={this.renderHeader()}
      body={this.renderBody()}
    />
  );
}
