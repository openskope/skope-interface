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
  const descriptionHtml = marked(value, markedOptions);

  return (
    <div
      {...props}
      dangerouslySetInnerHTML={{ __html: descriptionHtml }}
    />
  );
};
