import React from 'react';
import Badge from 'material-ui/Badge';
import OpenIcon from 'material-ui/svg-icons/action/open-in-new';

/**
 * @param  {Object} props
 * @param  {string} props.href
 * @param  {string} props.title
 * @param  {string} props.text
 * @param  {boolean} props.noBadge
 * @return {ReactElement}
 */
export default
({
  href = '',
  title = '',
  text = '',
  noBadge = false,
  ...props
}) => {
  const linkElement = (
    <a
      {...props}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      title={title}
    >{text}</a>
  );

  if (noBadge) {
    return linkElement;
  }

  return (
    <Badge
      badgeContent={<OpenIcon />}
      badgeStyle={{
        fontSize: '1em',
        // Here the `em` is based on the fontSize above.
        height: '1em',
        width: '1em',
        color: 'inherit',
      }}
      style={{
        color: 'inherit',
        padding: '0.3em 1.2em 0 0',
      }}
    >{linkElement}</Badge>
  );
};
