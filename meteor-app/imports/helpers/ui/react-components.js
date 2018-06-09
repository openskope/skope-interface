import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import marked from 'marked';
import uuidv4 from 'uuid/v4';
import classNames from '@xch/class-names';

import SafeLink from '/imports/ui/components/SafeLink';

import {
  renderToStaticMarkup,
} from './react';

import {
  NOOP,
} from '../model';

/**
 * This is a utility component for debugging purposes.
 * It prints all the props passed to it.
 */
export
const PropPrinter = (props) => <pre>{JSON.stringify(props, null, 2)}</pre>;

const defaultMarkdownRenderer = new marked.Renderer();

/**
 * @param  {string} href
 * @param  {string} title
 * @param  {string} text
 * @return {string}
 */
defaultMarkdownRenderer.link = (
  href,
  title,
  text,
) => {
  return renderToStaticMarkup(
    <SafeLink
      href={href}
      title={title}
      text={text}
    />,
  );
};

/**
 * @param {Object} props
 * @param {string} props.value
 * @param {Object} props.markedOptions - Options passed to marked.
 *                 See documentation at https://www.npmjs.com/package/marked.
 * @param {*} props.* - Anything else is passed to the root element.
 */
export
const MarkDownRenderer = ({
  className: extraClassName,
  value,
  markedOptions = {
    gfm: true,
    tables: true,
    breaks: true,
    pedantic: false,
    sanitize: true,
    smartLists: true,
    smartypants: true,
    renderer: defaultMarkdownRenderer,
  },
  ...props
}) => {
  //! Make sure all the dangerous tags are sanitized.

  const className = classNames(
    'markdown',
    extraClassName,
  );
  let markdownHtml = '';

  try {
    markdownHtml = marked(value, markedOptions);
  } catch (error) {
    return (
      <div
        {...props}
        className={className}
        data-marked-error={error.message}
      >
        <div>Error when rendering markdown content: <span>{error.message}</span></div>
        <pre data-type={typeof value}>{value}</pre>
      </div>
    );
  }

  return (
    <div
      {...props}
      className={className}
      dangerouslySetInnerHTML={{ __html: markdownHtml }}
    />
  );
};

export
/**
 * This is a bad workaround for fetching data. It should be avoided at all costs.
 */
class PatheticDataRequester extends React.Component {
  static propTypes = {
    /**
     * Function that does the data fetching. Must call either `resolve` or `reject`.
     * (payload: Object, resolve: Function, reject: Function) => void
     */
    requester: PropTypes.func.isRequired,
    /**
     * Callback just before a new request is going out.
     * (payload: Object) => void
     */
    onNewRequest: PropTypes.func,
    /**
     * Callback when data is ready or updated.
     * (data: *) => void
     */
    onReady: PropTypes.func.isRequired,
    /**
     * Callback when error occured during the request.
     * (error: *) => void
     */
    onError: PropTypes.func,
    verbose: PropTypes.bool,
  };

  static defaultProps = {
    onNewRequest: NOOP,
    onError: NOOP,
    verbose: false,
  };

  constructor (props) {
    super(props);

    // @type {*} This stores the latest request ID for ignoring expired requests.
    this._lastRequestId = null;
  }

  componentDidMount () {
    // Whenever props are changed, try to update.
    this.updateData();
  }

  shouldComponentUpdate (nextProps) {
    return Object.entries(nextProps).some(([propName, propValue]) => {
      const propChanged = !_.isEqual(propValue, this.props[propName]);

      return propChanged;
    });
  }

  componentDidUpdate () {
    // Whenever props are changed, try to update.
    this.updateData();
  }

  updateData () {
    const {
      requester,
      onNewRequest,
      onReady,
      onError,
      verbose,
      ...requestPayload
    } = this.props;

    const thisRequestId = uuidv4();
    this._lastRequestId = thisRequestId;

    onNewRequest(requestPayload);

    const resolve = (data) => {
      if (thisRequestId !== this._lastRequestId) {
        verbose && console.warn(`abandon response from expired request ${thisRequestId}`); // eslint-disable-line no-unused-expressions, no-console
        return;
      }

      onReady(data);
    };
    const reject = (reason) => {
      if (thisRequestId !== this._lastRequestId) {
        verbose && console.warn(`abandon response from expired request ${thisRequestId}`); // eslint-disable-line no-unused-expressions, no-console
        return;
      }

      onError(reason);
    };

    requester(requestPayload, resolve, reject);
  }

  render = () => null;
}
