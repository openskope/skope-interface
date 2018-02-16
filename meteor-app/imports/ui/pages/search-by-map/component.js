import { Meteor } from 'meteor/meteor';
import React from 'react';
import objectPath from 'object-path';
import moment from 'moment';
import Paper from 'material-ui/Paper';
import FullWindowLayout from '/imports/ui/layouts/full-window';
import AppbarHeader from '/imports/ui/components/appbar';
import SpatialFilter from '/imports/ui/components/searchkit-spatial-filter';
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

import DataTemporalRangeFilter from './filter-components/data-temporal-range-filter';
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
      title="Discover Paleoenvironmental Data or Models"
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
            title="Variables"
            field="variables.name.raw"
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

          <RefinementListFilter
            id="status"
            title="Status"
            field="status"
            operator="OR"
            orderKey="_term"
            orderDirection="asc"
            size={5}
          />

          <SpatialFilter
            id="location"
            className="spatial-filter"
            title="Point of Interest"
            fields={['region.geometry']}
          />

          <DataTemporalRangeFilter
            id="timespan"
            fields={[
              'timespan.period',
            ]}
            relation="contains"
            min={moment('0000', 'YYYY').toDate()}
            max={moment().toDate()}
            resolution="month"
            title="Timespan"
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
