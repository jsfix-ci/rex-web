import { createSelector } from 'reselect';
import * as parentSelectors from '../selectors';
import {
  countTotalHighlights,
  countUniqueKeyTermHighlights,
  filterTreeForHits,
  getFormattedSearchResults,
  getKeyTermResults,
  getNonKeyTermResults,
  getSearchResultsForPage,
  matchKeyTermHit,
} from './utils';

export const localState = createSelector(
  parentSelectors.localState,
  (parentState) => parentState.search
);

export const searchResultsOpen = createSelector(
  localState,
  (state) => !!state.query && state.sidebarOpen
);

export const hasResults = createSelector(
  localState,
  (state) => !!state.results
);

export const query = createSelector(
  localState,
  (state) => state.query
);

export const selectedResult = createSelector(
  localState,
  (state) => state.selectedResult
);

export const hits = createSelector(
  localState,
  (state) => state.results ? state.results.hits.hits : null
);

const getRawResults = createSelector(
  localState,
  (state) => state.results
);

const nonKTHits = createSelector(
  getRawResults,
  (rawResults) => rawResults ? rawResults.hits.hits.filter((hit) => !matchKeyTermHit(hit)) : null
);

const keyTermHits = createSelector(
  getRawResults,
  (rawResults) => rawResults ? rawResults.hits.hits.filter(matchKeyTermHit) : null
);

export const totalHits = createSelector(
  nonKTHits,
  (hitsOrNull) => hitsOrNull ? countTotalHighlights(hitsOrNull) : null
);

export const totalHitsKeyTerms = createSelector(
  keyTermHits,
  (keyTermHitsOrNull) => keyTermHitsOrNull ? countUniqueKeyTermHighlights(keyTermHitsOrNull) : null
);

const keyTermResults = createSelector(
  getRawResults,
  parentSelectors.book,
  (rawResults, book) => rawResults && book ? getKeyTermResults(rawResults) : null
);

export const sortedKeyTermHits = createSelector(
  keyTermResults,
  parentSelectors.book,
  (selectedResults, book) => selectedResults && book ? filterTreeForHits(book.tree, selectedResults) : null
);

export const results = createSelector(
  getRawResults,
  parentSelectors.book,
  (rawResults, book) => rawResults && book ? getFormattedSearchResults(book.tree, rawResults) : null
);

const rawNonKTResults = createSelector(
  getRawResults,
  (rawResults) => rawResults ? getNonKeyTermResults(rawResults) : null
);

export const nonKTResults = createSelector(
  rawNonKTResults,
  parentSelectors.book,
  (selectedResults, book) => selectedResults && book ? getFormattedSearchResults(book.tree, selectedResults) : null
);

export const mobileToolbarOpen = createSelector(
  localState,
  (state) => state.mobileToolbarOpen
);

export const currentPageResults = createSelector(
  getRawResults,
  parentSelectors.page,
  (rawResults, page) => rawResults && page ? getSearchResultsForPage(page, rawResults) : []
);
