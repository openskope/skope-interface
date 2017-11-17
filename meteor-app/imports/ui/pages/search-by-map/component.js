import React from 'react';
import PropTypes from 'prop-types';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import customTheme from '/imports/ui/styling/muiTheme';
import {
  Card,
  CardActions,
  CardHeader,
  CardText,
} from 'material-ui/Card';
import Paper from 'material-ui/Paper';
import SpatialFilter from '/imports/ui/components/searchkit-spatial-filter';
import TextField from 'material-ui/TextField';
import FlatButton from 'material-ui/FlatButton';
import Chip from 'material-ui/Chip';
import moment from 'moment';

import {
  SearchkitManager,
  SearchkitProvider,
  Pagination,
  RefinementListFilter,
  DynamicRangeFilter,
  ActionBar,
  ActionBarRow,
  HitsStats,
  SelectedFilters,
  ResetFilters,
  Hits,
  NoHits,
} from 'searchkit';

class SearchResultItem extends React.PureComponent {

  static getDateRange (start, end) {
    if (!start && !end) {
      return '';
    }

    return [start, end]
    .map((s) => (s && moment(s).format('YYYY-MM-DD')) || '')
    .join(' - ');
  }

  render () {
    const {
      result: {
        _source: {
          Title,
          Creator,
          CreationDate,
          // Status,
          Rating,
          // ResultTypes,
          StartDate,
          EndDate,
          // Inputs,
          // Info,
          // Reference,
        },
      },
    } = this.props;

    return (
      <Card className="search-result-item">
        <CardHeader
          title={Title}
          subtitle={this.constructor.getDateRange(StartDate, EndDate)}
        />
        <CardText className="search-result-item__content">
          <div
            className="search-result-item__thumbnail"
            style={{
              backgroundImage: 'url(//www.openskope.org/wp-content/uploads/2016/02/ScreenShot001.bmp)',
              backgroundSize: 'cover',
              backgroundRepeat: 'no-repeat',
            }}
          />
          <div className="search-result-item__metadata">
            <TextField
              className="search-result-item__metadata__major"
              floatingLabelText="Creator"
              value={Creator}
              style={{
                width: 'auto',
              }}
            />
            <TextField
              className="search-result-item__metadata__major"
              floatingLabelText="Date"
              value={moment(CreationDate).format('YYYY-MM-DD')}
              style={{
                width: 'auto',
              }}
            />
            <TextField
              className="search-result-item__metadata__major"
              floatingLabelText="Rating"
              value={Rating}
              style={{
                width: 'auto',
              }}
            />
            <p className="search-result-item__metadata__description">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec mattis pretium massa. Aliquam erat volutpat. Nulla facilisi. Donec vulputate interdum sollicitudin. Nunc lacinia auctor quam sed pellentesque. Aliquam dui mauris, mattis quis lacus id, pellentesque lobortis odio.</p>
          </div>
        </CardText>
        <CardActions>
          <FlatButton label="Examine" />
          <FlatButton label="Download" />
        </CardActions>
      </Card>
    );
  }
}

/**
 * Expect the value input to be in the form of `<min> - <max>`.
 * `min` and `max` are both timestamps in milliseconds.
 * @type   {Function}
 * @param  {String} labelValue
 * @return {String}
 */
const DynamicDateRangeFormatter =
(labelValue) => labelValue
.split(' - ')
.map((timeString) => parseInt(timeString, 10))
.map((timestamp) => moment(timestamp).format('YYYY-MM-DD'))
.join(' - ');

const LabelValueFormatters = {
  'Start Date': DynamicDateRangeFormatter,
  'End Date': DynamicDateRangeFormatter,
};

class FilterItem extends React.PureComponent {
  static propTypes = {
    bemBlocks: PropTypes.object.isRequired,
    filterId: PropTypes.string.isRequired,
    labelKey: PropTypes.string.isRequired,
    labelValue: PropTypes.string.isRequired,
    removeFilter: PropTypes.func.isRequired,
  };

  static formatLabel = (labelKey, labelValue) => {
    if (!(labelKey in LabelValueFormatters)) {
      return labelValue;
    }

    const formattedLabelValue = LabelValueFormatters[labelKey](labelValue);

    return formattedLabelValue
    ? `${labelKey}: ${formattedLabelValue}`
    : labelKey;
  };

  render () {
    const {
      bemBlocks,
      filterId,
      labelKey,
      labelValue,
      removeFilter,
    } = this.props;

    const containerClassName =
    bemBlocks.option()
    .mix(bemBlocks.container('item'))
    .mix(`selected-filter--${filterId}`)
    .toString();
    const formattedLabel = this.constructor.formatLabel(labelKey, labelValue);

    return (
      <div
        className={containerClassName}
        style={{
          background: 'transparent',
          padding: 0,
        }}
      >
        <Chip
          onRequestDelete={removeFilter}
        >
          <div className={bemBlocks.option('name')}>{formattedLabel}</div>
        </Chip>
      </div>
    );
  }
}

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
    // SearchKit Manager instance.
    searchkit: PropTypes.instanceOf(SearchkitManager),
  };

  render () {
    const {
      searchkit,
    } = this.props;

    return (
      <SearchkitProvider searchkit={searchkit}>
        <MuiThemeProvider muiTheme={customTheme}>
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

                <DynamicRangeFilter
                  id="startdate-range"
                  field="StartDate"
                  title="Start Date"
                  rangeFormatter={(timestamp) => moment(timestamp).format('YYYY-MM-DD')}
                />
                <DynamicRangeFilter
                  id="enddate-range"
                  field="EndDate"
                  title="End Date"
                  rangeFormatter={(timestamp) => moment(timestamp).format('YYYY-MM-DD')}
                />
              </div>
            </Paper>
            <div className="page-search__result">
              <ActionBar>
                <ActionBarRow>
                  <HitsStats />
                </ActionBarRow>

                <ActionBarRow>
                  <SelectedFilters
                    mod="selected-filters"
                    itemComponent={FilterItem}
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
        </MuiThemeProvider>
      </SearchkitProvider>
    );
  }
}
