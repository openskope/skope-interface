import React from 'react';
import marked from 'marked';

/**
 * This is a utility component for debugging purposes.
 * It prints all the props passed to it.
 */
export
const PropPrinter = (props) => <pre>{JSON.stringify(props, null, 2)}</pre>;

/**
 * @param {Object} props
 * @param {string} props.value
 * @param {Object} props.markedOptions - Options passed to marked.
 *                 See documentation at https://www.npmjs.com/package/marked.
 * @param {*} props.* - Anything else is passed to the root element.
 */
export
const MarkDownRenderer = ({
  value,
  markedOptions = {},
  ...props
}) => {
  //! Make sure all the dangerous tags are sanitized.
  
  let markdownHtml = '';

  try {
    markdownHtml = marked(value, markedOptions);
  } catch (error) {
    return (
      <div
        {...props}
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
      dangerouslySetInnerHTML={{ __html: markdownHtml }}
    />
  );
};
