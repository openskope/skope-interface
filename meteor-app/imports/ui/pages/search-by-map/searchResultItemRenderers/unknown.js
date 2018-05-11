import React from 'react';
import {
  Card,
  CardHeader,
} from 'material-ui/Card';
import Avatar from 'material-ui/Avatar';
import AlertIcon from 'material-ui/svg-icons/alert/warning';

import {
  clientElasticEndpoint as elasticEndpoint,
} from '/imports/ui/consts';

import {
  absoluteUrl,
} from '/imports/ui/helpers';

import {
  defaultPropTypes,
  bemBlockName,
  renderCardWithDivier,
} from './shared';

export default
class SearchResultItem extends React.PureComponent {
  static propTypes = defaultPropTypes;

  renderCard = () => {
    const {
      result: {
        _id,
        _index,
        _type,
        _source: {
          type,
        },
      },
    } = this.props;

    const itemPath = `${_index}/${_type}/${_id}`;
    const itemUrl = absoluteUrl(`${elasticEndpoint}/${itemPath}`);
    const itemLinkElement = (
      <a
        href={itemUrl}
        target="_blank"
        rel="noopener"
      >{itemPath}</a>
    );
    const titleElement = (
      <span>Error rendering item “{itemLinkElement}”.</span>
    );
    const subtitle = `Unknown data type “${type}”.`;

    return (
      <Card
        className="search-result-item__card"
        style={{
          // Eliminate `z-index: 1` to resolve the issue of tooltips being covered.
          zIndex: false,
        }}
        containerStyle={{
          display: 'flex',
          height: '100%',
          width: '100%',
          flexDirection: 'column',
          justifyContent: 'stretch',
        }}
      >
        <CardHeader
          avatar={<Avatar icon={<AlertIcon />} />}
          textStyle={{
            width: '100%',
          }}
          title={titleElement}
          titleStyle={{
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
          subtitle={subtitle}
        />
      </Card>
    );
  };

  render = () => renderCardWithDivier({
    className: bemBlockName,
    cardRenderer: this.renderCard,
  });
}
