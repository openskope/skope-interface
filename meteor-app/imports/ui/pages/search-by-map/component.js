import { Meteor } from 'meteor/meteor';
import React from 'react';
import objectPath from 'object-path';
import Paper from 'material-ui/Paper';
import FullWindowLayout from '/imports/ui/layouts/full-window';
import AppbarHeader from '/imports/ui/components/appbar';
import SpatialFilter from '/imports/ui/components/searchkit-spatial-filter';
import FlatButton from 'material-ui/FlatButton';

import {
  Pagination,
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

import DataTemporalRangeFilter from '/imports/ui/components/searchpage-filters/data-temporal-range-filter';
import SelectedFilterItem from './SelectedFilterItem';
import RenderSearchResultItemByType from './RenderSearchResultItemByType';

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

const resultsPerPage = objectPath.get(Meteor.settings, 'public.searchpage.resultsPerPage', 3);

export default class SearchPage extends React.Component {

  static propTypes = {
    //! Add prop types here.
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
            fields={['Area']}
          />

          <DataTemporalRangeFilter
            id="temporal-range"
            fields={[
              'StartDate',
              'EndDate',
            ]}
            title="Year Range"
            min={0}
            max={(new Date()).getUTCFullYear()}
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
        <ActionBar>
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
            <ResetFilters component={ResetFilterButton} />
          </ActionBarRow>
        </ActionBar>

        <Hits
          mod="sk-hits-grid"
          hitsPerPage={resultsPerPage}
          itemComponent={RenderSearchResultItemByType}
        />
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
