import React from 'react';
import marked from 'marked';
import classNames from '@xch/class-names';

import SafeLink from '/imports/ui/components/SafeLink';

import {
  renderToStaticMarkup,
} from './react';

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
    />
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
