import React from 'react';
import ReactDOMServer from 'react-dom/server';
import marked from 'marked';

import {
  getClassName,
} from './dom';

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
  return ReactDOMServer.renderToStaticMarkup(
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      title={title}
    >{text}</a>
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
    renderer: defaultMarkdownRenderer,
  },
  ...props
}) => {
  //! Make sure all the dangerous tags are sanitized.

  const className = getClassName(
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
