import React from 'react';
import PropTypes from 'prop-types';
import { FlowRouter } from 'meteor/ostrio:flow-router-extra';

import {
  SearchkitManager,
  SearchkitProvider,
  Pagination,
  SearchBox,
  RefinementListFilter,
  LayoutResults,
  ActionBar,
  ActionBarRow,
  HitsStats,
  SelectedFilters,
  ResetFilters,
  Hits,
  NoHits,
} from 'searchkit';

class SearchResultItem extends React.Component {
  render () {
    const {
      result: {
        _source: {
          Title,
          Creator,
          CreationDate,
          Status,
          Rating,
          ResultTypes,
          StartDate,
          EndDate,
          Inputs,
          Info,
          Reference,
        },
      },
    } = this.props;

    return (
      <div className="container">
        <div className="result-container">
          <div className="app-bar">
            <div className="header"><a href={FlowRouter.url('/workspace')}>{Title}</a></div>
            <div className="date">Creation Date: {CreationDate.substring(0, 10)}</div>
          </div>

          <div className="mdc-layout-grid">
            <div className="mdc-layout-grid__inner">
              <div className="mdc-layout-grid__cell mdc-layout-grid__cell--span-4">
                <img src="http://www.openskope.org/wp-content/uploads/2016/02/ScreenShot001.bmp" alt="" />
              </div>
              <div className="mdc-layout-grid__cell mdc-layout-grid__cell--span-8">
                <div className="content-row-1">
                  <div className="mdc-layout-grid__inner">
                    <div className="mdc-layout-grid__cell mdc-layout-grid__cell--span-4"><b>Creator</b></div>
                    <div className="mdc-layout-grid__cell mdc-layout-grid__cell--span-4"><b>Rating</b></div>
                    <div className="mdc-layout-grid__cell mdc-layout-grid__cell--span-4"><b>Status</b></div>
                  </div>
                  <div className="mdc-layout-grid__inner">
                    <div className="mdc-layout-grid__cell mdc-layout-grid__cell--span-4"><span>{Creator}</span></div>
                    <div className="mdc-layout-grid__cell mdc-layout-grid__cell--span-4"><span>{Rating}</span></div>
                    <div className="mdc-layout-grid__cell mdc-layout-grid__cell--span-4"><span>{Status}</span></div>
                  </div>
                </div>

                <div className="content-row-2">
                  <div className="mdc-layout-grid__inner">
                    <div className="mdc-layout-grid__cell mdc-layout-grid__cell--span-6"><b>Input types</b></div>
                    <div className="mdc-layout-grid__cell mdc-layout-grid__cell--span-6"><b>Result types</b></div>
                  </div>
                  <div className="mdc-layout-grid__inner">
                    <div className="mdc-layout-grid__cell mdc-layout-grid__cell--span-6">
                      {
                        Inputs !== null && Inputs.length > 0
                        ? Inputs.map((input, index) => (
                          <span key={index}>
                            <span>{Inputs[index]}</span>
                            {
                              index < Inputs.length - 1
                              ? <span className="vertical-divider">&#44;&#32;</span>
                              : null
                            }
                          </span>
                        ))
                        : 'N/A'
                      }
                    </div>
                    <div className="mdc-layout-grid__cell mdc-layout-grid__cell--span-6">
                      {
                        ResultTypes !== null && ResultTypes.length > 0
                        ? ResultTypes.map((type, index) => (
                          <span key={index}>
                            <span>{ResultTypes[index]}</span>
                            {
                              index < ResultTypes.length - 1
                              ? <span className="vertical-divider">&#44;&#32;</span>
                              : null
                            }
                          </span>
                        ))
                        : 'N/A'
                      }
                    </div>
                  </div>
                </div>

                <div className="content-row-3">
                  <div className="mdc-layout-grid__inner">
                    <div className="mdc-layout-grid__cell mdc-layout-grid__cell--span-6"><b>Start date</b></div>
                    <div className="mdc-layout-grid__cell mdc-layout-grid__cell--span-6"><b>End date</b></div>
                  </div>
                  <div className="mdc-layout-grid__inner">
                    <div className="mdc-layout-grid__cell mdc-layout-grid__cell--span-6">
                      <span>{StartDate !== null && StartDate.length > 0 ? StartDate.substring(0, 10) : 'N/A'}</span></div>
                    <div className="mdc-layout-grid__cell mdc-layout-grid__cell--span-6">
                      <span>{EndDate !== null && EndDate.length > 0 ? EndDate.substring(0, 10) : 'N/A'}</span></div>
                  </div>
                </div>

              </div>


            </div>
          </div>

          <div className="mdc-layout-grid">
            <div className="mdc-layout-grid__inner">
              <a className="mdc-layout-grid__cell mdc-layout-grid__cell--span-3" href={Info}>
                <button className="mdc-button">Information</button></a>
              <a className="mdc-layout-grid__cell mdc-layout-grid__cell--span-3" href={Reference}>
                <button className="mdc-button">Reference</button></a>
              <a className="mdc-layout-grid__cell mdc-layout-grid__cell--span-3" download="data.json">
                <button className="mdc-button">Download</button></a>
              <a className="mdc-layout-grid__cell mdc-layout-grid__cell--span-3" href={FlowRouter.url('/model')}>
                <button className="mdc-button">Create<span>Form</span></button></a>
            </div>
          </div>
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
    } = this.props;

    return (
      <SearchkitProvider searchkit={searchkit}>
        <div className="page--search">
          <div className="page--search__sidepanel">
            <RefinementListFilter
              id="modelname-list"
              title="Model"
              field="ModelName"
              operator="OR"
              orderKey="_term"
              orderDirection="asc"
              size={4}
            />
            <RefinementListFilter
              id="creator-list"
              title="Creator"
              field="Creator"
              operator="OR"
              orderKey="_term"
              orderDirection="asc"
              size={4}
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
              title="Range"
              field="Rating"
              operator="OR"
              orderKey="_term"
              orderDirection="asc"
              size={5}
            />
            <RefinementListFilter
              id="inputs-list"
              title="Inputs"
              field="Inputs"
              operator="OR"
              orderKey="_term"
              orderDirection="asc"
              size={5}
            />
            <RefinementListFilter
              id="resultTypes-list"
              title="Results"
              field="ResultTypes"
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
