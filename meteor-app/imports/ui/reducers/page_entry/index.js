/**
 * This reducer is used when entering a new page.
 */
import { FlowRouter } from 'meteor/kadira:flow-router';

const getNavInfo = (state, { path }) => {
  let navInfo = [];
  let pathLevels = path.split('/').map(v => v.trim());

  // Pop off the top level (which is always "").
  pathLevels.shift();

  // Get rid of empty ones.
  pathLevels = pathLevels.filter(v => v.length > 0);

  if (pathLevels.length > 0) {
    const currPathLevels = [''];

    navInfo = [
      {
        label: 'SKOPE',
        url: FlowRouter.url('/'),
      },
      ...(pathLevels.map((v) => {
        currPathLevels.push(v);
        return {
          label: v.charAt(0).toUpperCase() + v.slice(1),
          url: FlowRouter.url(currPathLevels.join('/')),
        };
      })),
    ];
  }

  return navInfo;
};

export const PAGE_ENTRY = (state, action) => ({
  ...state,
  navInfo: getNavInfo(state, action),
});
