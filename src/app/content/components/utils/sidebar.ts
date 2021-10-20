import { connect } from 'react-redux';
import { FlattenSimpleInterpolation } from 'styled-components';
import { css } from 'styled-components/macro';
import theme from '../../../theme';
import { AppState } from '../../../types';
import * as searchSelectors from '../../search/selectors';
import * as contentSelectors from '../../selectors';
import { State } from '../../types';

export const areSidebarsOpenConnector = connect((state: AppState) => ({
  isSearchOpen: searchSelectors.searchResultsOpen(state),
  isTocOpen: contentSelectors.tocOpen(state),
}));

export const styleWhenSidebarClosed = (closedStyle: FlattenSimpleInterpolation) => css`
  ${(props: {isTocOpen: State['tocOpen']}) => props.isTocOpen === null && theme.breakpoints.mobile(closedStyle)}
  ${(props: {isTocOpen: State['tocOpen']}) => props.isTocOpen === false && closedStyle}
`;
