export const FETCH_BUILD_HASH = (state, action) => ({
  ...state,

  buildHash: action.hash,
});
