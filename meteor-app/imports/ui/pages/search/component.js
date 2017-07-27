import React from 'react';
import PropTypes from 'prop-types';
import { Button, Appbar, Divider, Container, Row, Col } from 'muicss/react';

import {
  SearchkitManager,
  SearchkitProvider,
  Pagination,
  SearchBox,
  RefinementListFilter,
  NumericRefinementListFilter,
  RangeFilter,
  LayoutResults,
  InputFilter,
  ActionBar,
  ActionBarRow,
  HitsStats,
  SelectedFilters,
  ResetFilters,
  Hits,
  NoHits,
} from 'searchkit';
import '/node_modules/searchkit/release/theme.css';

class SearchResultItem extends React.Component {
    render () {
        const {
            result: {
                _source: {
                    Dataset,
                    Title,
                    ModelName,
                    Creator,
                    Contributors,
                    CreationDate,
                    Status,
                    Rating,
                    Keywords,
                    ResultTypes,
                    StartDate,
                    EndDate,
                    Area,
                    Inputs,
                    Description,
                    Info,
                    Reference,
                    Workspace,
                    Download,
                    Create,
                },
            },
        } = this.props;

        // const _index = this.props.result._index;
        // const _type = this.props.result._type;
        // const account_number = this.props.result._source.account_number;

        return (
            // <div style={{overflow: "auto"}}>

            <div className="container">
              <div className="result-container">
                <Appbar className="appbar">
                  <div className="header">{ModelName}</div>
                  <div className="date">Run date: {CreationDate}</div>
                </Appbar>
                <div className="column">
                  <div className="column-item">
                    <img src="http://www.openskope.org/wp-content/uploads/2016/02/ScreenShot001.bmp"></img>
                  </div>
                  <div className="column-item">
                    <p><b>Creator:</b>{Creator}</p>
                    <p><b>Status:</b>{Status}</p>
                  </div>
                  <div className="column-item">
                    <p><b>Rating:</b>{Rating}</p>
                  </div>
                </div>
                <div className="button">
                  <Button className="button-item" color="primary">View Data</Button>
                  <Button className="button-item" color="primary">Download</Button>
                  <Button className="button-item" color="primary">More Information</Button>
                </div>
              </div>

                <div style={{ overflow: 'auto' }}>
                    <p>Some Result (Implement this)</p>
                    <pre>{JSON.stringify(this.props, null, 2)}</pre>
                </div>

            </div>
        );
    }
}

export default class SearchPage extends React.Component {

  static propTypes = {
    // SearchKit Manager instance.
    searchkit: PropTypes.instanceOf(SearchkitManager),
  };

  render () {
    const {
      searchkit,
      CreationDate,
    } = this.props;
      return (
          <SearchkitProvider searchkit={searchkit}>
            <div className="page--search">
              <div className="page--search__sidepanel">
                <InputFilter
                    id="category-input"
                    title="Search by Catgory"
                    placeholder="PaleoClimate"
                    searchOnChange
                    prefixQueryFields={['paleoclimate']}
                    queryFields={['paleoclimate',]}
                />
                <RefinementListFilter
                    id="modelname-list"
                    title="Model Name"
                    field="ModelName"
                    operator="OR"
                    orderKey="_term"
                    orderDirection="asc"
                    size={4}
                />
                <Divider></Divider>
                <RefinementListFilter
                    id="creator-list"
                    title="Creator"
                    field="Creator"
                    operator="OR"
                    orderKey="_term"
                    orderDirection="asc"
                    size={4}
                />
                  <Divider></Divider>
                <RefinementListFilter
                    id="creationdate-list"
                    title="Creation Date"
                    field="CreationDate"
                    operator="OR"
                    orderKey="_term"
                    orderDirection="asc"
                    size={4}
                />
                <Divider></Divider>
                <RefinementListFilter
                    id="startdate-list"
                    title="Start Date"
                    field="StartDate"
                    operator="OR"
                    orderKey="_term"
                    orderDirection="asc"
                    size={4}
                />
                  <RefinementListFilter
                      id="enddate-list"
                      title="End Date"
                      field="EndDate"
                      operator="OR"
                      orderKey="_term"
                      orderDirection="asc"
                      size={4}
                  />
                  <NumericRefinementListFilter
                  id="creationdate-refine"
                  title="Creation Date"
                  field="CreationDate"
                  options={[
                  { title: 'All' },
                  { title: 'up to 1', from: 0, to: 1 },
                  { title: '1 to 2', from: 1, to: 2 },
                  { title: '2 to 3', from: 2, to: 3 },
                  { title: '3 to 4', from: 3, to: 4 },
                  { title: '4 to 5', from: 4, to: 5 },
                  ]}
                  />
                <RefinementListFilter
                    id="status-list"
                    title="Status"
                    field="Status"
                    operator="OR"
                    orderKey="_term"
                    orderDirection="asc"
                    size={5}
                />
                <RefinementListFilter
                    id="rating-list"
                    title="Rating"
                    field="Rating"
                    operator="OR"
                    orderKey="_term"
                    orderDirection="asc"
                    size={5}
                />
                <RangeFilter
                    id="rating-range"
                    field="Rating"
                    min={0}
                    max={10}
                    showHistogram
                    title=""
                />
                <RangeFilter
                    id="creationdate-range"
                    field="CreationDate"
                    min={0}
                    max={200}
                    showHistogram
                    title="Creation Date"
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
                <RefinementListFilter
                    id="inputs-list"
                    title="Input"
                    field="Inputs"
                    operator="OR"
                    orderKey="_term"
                    orderDirection="asc"
                    size={5}
                />
              </div>

              <div className="page--search__searchpanel">

                <SearchBox
                    autofocus
                    searchOnChange
                    prefixQueryFields={['actors^1', 'type^2', 'languages', 'title^10']}
                />

                <LayoutResults>
                  <ActionBar>

                    <ActionBarRow>
                      <HitsStats />
                    </ActionBarRow>

                    <ActionBarRow>
                      <SelectedFilters />
                      <ResetFilters />
                    </ActionBarRow>

                  </ActionBar>
                  <Hits mod="sk-hits-grid" hitsPerPage={3} itemComponent={SearchResultItem} />
                  <NoHits />

                  <Pagination
                      showNumbers
                  />
                </LayoutResults>

              </div>
            </div>
          </SearchkitProvider>
      );
  }
}
