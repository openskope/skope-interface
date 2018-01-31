import React from 'react';
import PropTypes from 'prop-types';
import $ from 'jquery';
import moment from 'moment';
import marked from 'marked';
import {
  Toolbar,
} from 'material-ui/Toolbar';
import Badge from 'material-ui/Badge';
import IconButton from 'material-ui/IconButton';
import CheckIcon from 'material-ui/svg-icons/navigation/check';

import {
  getDateAtPrecision,
  getClassName,
} from '/imports/ui/helpers';

export default
class SearchResultItem extends React.Component {

  static propTypes = {
    result: PropTypes.shape({
      _id: PropTypes.string.isRequired,
      _source: PropTypes.object.isRequired,
    }).isRequired,
  };

  static resolutionToPrecision = {
    year: 0,
    month: 1,
    date: 2,
    hour: 3,
    minute: 4,
    second: 5,
    millisecond: 5,
  };

  /**
   * @param {string} resolution
   */
  static getPrecisionByResolution (resolution) {
    return SearchResultItem.resolutionToPrecision[resolution];
  }

  static dateFormatForPrecisions = [
    'YYYY',
    'MMM YYYY',
    'MMM Do YYYY',
    'MMM Do YYYY, h a',
    'MMM Do YYYY, h:m a',
    'MMM Do YYYY, h:m:s a',
  ];

  /**
   * @param {Date} date
   * @param {number} precision
   */
  static getDateStringAtPrecision (date, precision) {
    if (!date) {
      return '';
    }

    const dateAtPrecision = getDateAtPrecision(date, precision);
    const dateTemplateAtPrecision = SearchResultItem.dateFormatForPrecisions[precision];

    return moment(dateAtPrecision).format(dateTemplateAtPrecision);
  }

  static getDateRangeStringAtPrecision (precision, start, end) {
    if (!start && !end) {
      return '';
    }

    return [start, end]
    .map((d) => SearchResultItem.getDateStringAtPrecision(d, precision))
    .join(' - ');
  }

  static titleStyle = {
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  };

  static inlineListGapStyle = {
    marginLeft: '3px',
    marginRight: '3px',
  };

  static toolbarItemMargins = {
    margin: '0 8px 0 0',
  };

  static toolbarItemReverseMargins = {
    margin: '0 0 0 8px',
  };

  static actionButtonStyles = {
    secondary: true,
    style: {
      ...SearchResultItem.toolbarItemReverseMargins,
    },
    labelStyle: {
      textTransform: 'none',
    },
  };

  static buildGeoJsonWithGeometry (geometry) {
    return {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: {},
          geometry,
        },
      ],
    };
  }

  static MarkDownRenderer = ({
    value,
    ...props
  }) => {
    //! Make sure all the dangerous tags are sanitized.
    const descriptionHtml = marked(value);

    return (
      <div
        {...props}
        dangerouslySetInnerHTML={{ __html: descriptionHtml }}
      />
    );
  };

  static SlimToolbar = (props) => (
    <Toolbar
      noGutter
      {...props}
      style={{
        background: 'transparent',
        height: '36px',
        padding: 0,
        margin: 0,
      }}
    >{props.children}</Toolbar>
  );

  static GreenTickmarkBadge = (props) => (
    <Badge
      badgeContent={<CheckIcon style={{ color: 'green' }} />}
      {...props}
      badgeStyle={{
        top: '4px',
        right: '4px',
        width: '18px',
        height: '18px',
        background: 'transparent',
        pointerEvents: 'none',
        ...props.badgeStyle,
      }}
      style={{
        padding: 0,
        ...props.style,
      }}
    >{props.children}</Badge>
  );

  static renderAvailableFeatures = (availableFeatures) =>
    availableFeatures.map(({
      featureName,
      IconComponent,
    }, index) => (
      <SearchResultItem.GreenTickmarkBadge
        key={`feature__${index}`}
        style={{
          ...SearchResultItem.toolbarItemMargins,
        }}
      >
        <IconButton
          tooltip={`${featureName} available`}
          // Make it look non-clickable.
          disableTouchRipple
          // Make it look non-clickable.
          style={{
            cursor: 'normal',
          }}
        >
          <IconComponent
            color="rgba(180, 180, 180, 0.8)"
          />
        </IconButton>
      </SearchResultItem.GreenTickmarkBadge>
    ));

  constructor (props) {
    super(props);

    // This stores the reference to the card element.
    this._cardElement = null;

    this.state = {
      positionBeforeExpanding: {
        top: 0,
        left: 0,
      },
      dimensionBeforeExpanding: {
        width: 0,
        height: 0,
      },
      expanded: false,
    };
  }

  onExpandChange = (expanded) => {
    if (expanded && this._cardElement) {
      // Expanding, store initial position.

      const $cardElement = $(this._cardElement);
      const positionBeforeExpanding = $cardElement.offset();
      const dimensionBeforeExpanding = {
        width: $cardElement.width(),
        height: $cardElement.height(),
      };

      this.setState({
        positionBeforeExpanding,
        dimensionBeforeExpanding,
        expanded,
      });
    } else {
      this.setState({
        expanded,
      });
    }
  };

  collapse = () => this.onExpandChange(false);

  render = () => (
    <div
      className={getClassName(
        'search-result-item',
        {
          'search-result-item--expanded': this.state.expanded,
        },
      )}
    >
      <div
        className="search-result-item__modal-mask"
        onClick={this.collapse}
      />
      {this.renderCard()}
    </div>
  );
}
