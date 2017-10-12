/**
 * This reducer is used when entering a new page.
 */
import { FlowRouter } from 'meteor/ostrio:flow-router-extra';
import { Meteor } from 'meteor/meteor';

const getNavInfo = (navInfo, { path }) => {
  let newNavInfo = [];
  let pathLevels = path.split('/').map((v) => v.trim());

  // Pop off the top level (which is always "").
  pathLevels.shift();

  // Get rid of empty ones.
  pathLevels = pathLevels.filter((v) => v.length > 0);

  if (pathLevels.length > 0) {
    const currPathLevels = [''];

    newNavInfo = [
      {
        label: 'SKOPE',
        url: Meteor.absoluteUrl(),
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

  return newNavInfo;
};

const getHelpUrlForPage = (helpUrl, { path }) => {
  return `${path}/help`;
};

export const PAGE_ENTRY = (state, action) => ({
  ...state,

  path: action.path,

  // Close drawer.
  drawer: {
    ...state.drawer,

    isOpen: false,
  },

  navInfo: getNavInfo(state.navInfo, action),
  helpUrl: getHelpUrlForPage(state.helpUrl, action),
});
