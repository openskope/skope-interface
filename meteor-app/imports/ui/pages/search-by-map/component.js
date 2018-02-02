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
      <Paper
        className="page-search__search"
        zDepth={0}
      >
        <div className="page-search__search__inner">
          <SpatialFilter
            className="spatial-filter"
            title="Point of Interest"
            fields={['region.geometry']}
          />

          <DataTemporalRangeFilter
            id="temporal-range"
            fields={[
              'timespan.period.gte',
              'timespan.period.lte',
            ]}
            title="Year Range"
            min={0}
            max={(new Date()).getUTCFullYear()}
          />

          <RefinementListFilter
            id="resultTypes-list"
            title="Variables"
            field="variables.keywords"
            fieldOptions={{
              type: 'nested',
              options: {
                path: 'variables',
              },
            }}
            operator="OR"
            orderKey="_term"
            orderDirection="asc"
            size={5}
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
        />
        <NoHits />

        <Pagination
          mod="page-search__result__pagination"
          showNumbers
        />
      </Paper>
    </div>
  );

  render = () => (
    <FullWindowLayout
      header={this.renderHeader()}
      body={this.renderBody()}
    />
  );
}
