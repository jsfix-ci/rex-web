import { createSelector } from 'reselect';
import * as parentSelectors from '../selectors';

export const localState = createSelector(
  parentSelectors.localState,
  (parentState) => parentState.navigation
);

export const locationState = createSelector(
  localState,
  (state) => state.state
);

export const pathname = createSelector(
  localState,
  (state) => state.pathname
);

export const hash = createSelector(
  localState,
  (state) => state.hash
);

export const searchQuery = createSelector(
  localState,
  (state) => state.search.includes('?search=')
    ? decodeURI(state.search.replace('?search=', ''))
    : ''
);

export const highlightId = createSelector(
  localState,
  (state) => state.search.includes('?highlight=')
    ? decodeURI(state.search.replace('?highlight=', ''))
    : ''
);

export const location = localState;
