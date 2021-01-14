import flow from 'lodash/fp/flow';
import React from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components/macro';
import { linkStyle } from '../../components/Typography';
import { push } from '../../navigation/actions';
import * as selectNavigation from '../../navigation/selectors';
import { ScrollTarget } from '../../navigation/types';
import { createNavigationOptions } from '../../navigation/utils';
import { AppState, Dispatch } from '../../types';
import showConfirmation from '../highlights/components/utils/showConfirmation';
import {
  hasUnsavedHighlight as hasUnsavedHighlightSelector
} from '../highlights/selectors';
import { content } from '../routes';
import * as selectSearch from '../search/selectors';
import * as select from '../selectors';
import { Book } from '../types';
import { getBookPageUrlAndParams, stripIdVersion, toRelativeUrl } from '../utils';
import { isClickWithModifierKeys } from '../utils/domUtils';

interface Props {
  book: Book;
  page: {
    id: string;
    title: string;
  };
  currentBook: Book | undefined;
  onClick?: () => void;
  navigate: typeof push;
  currentPath: string;
  hasUnsavedHighlight: boolean;
  search: { query: string | null };
  scrollTarget?: ScrollTarget;
  className?: string;
  myForwardedRef: React.Ref<HTMLAnchorElement>;
  dangerouslySetInnerHTML?: any;
}

// tslint:disable-next-line:variable-name
export const ContentLink = (props: React.PropsWithChildren<Props>) => {
  const {
    book,
    page,
    currentBook,
    currentPath,
    search,
    scrollTarget,
    navigate,
    onClick,
    children,
    myForwardedRef,
    hasUnsavedHighlight,
    ...anchorProps
  } = props;
  const {url, params} = getBookPageUrlAndParams(book, page);
  const relativeUrl = toRelativeUrl(currentPath, url);
  const bookUid = stripIdVersion(book.id);

  return <a
    ref={myForwardedRef}
    onClick={async(e) => {

      if (isClickWithModifierKeys(e)) {
        return;
      }

      e.preventDefault();

      if (hasUnsavedHighlight && !await showConfirmation()) {
        return;
      }

      if (onClick) {
        onClick();
      }

      // Add options only if linking to the same book
      const options = currentBook && currentBook.id === bookUid
        ? createNavigationOptions(search, scrollTarget)
        : undefined;

      navigate({
        params,
        route: content,
        state: {
          bookUid,
          bookVersion: book.version,
          pageUid: stripIdVersion(page.id),
        },
      },
      options);
    }}
    href={relativeUrl}
    {...anchorProps}
  >{children}</a>;
};

// tslint:disable-next-line:variable-name
export const ConnectedContentLink = connect(
  (state: AppState, ownProps: {search?: { query?: string | null }}) => ({
    currentBook: select.book(state),
    currentPath: selectNavigation.pathname(state),
    hasUnsavedHighlight: hasUnsavedHighlightSelector(state),
    search: ({
      query: selectSearch.query(state),
      ...(ownProps.search ? ownProps.search : {}),
    }),
  }),
  (dispatch: Dispatch) => ({
    navigate: flow(push, dispatch),
  })
)(ContentLink);

// tslint:disable-next-line:variable-name
export const StyledContentLink = styled(ConnectedContentLink)`
  ${linkStyle}
`;

export default React.forwardRef<
  HTMLAnchorElement,
  Omit<React.ComponentProps<typeof ConnectedContentLink>, 'myForwardedRef'>
>((props, ref) =>
  <ConnectedContentLink {...props} myForwardedRef={ref} />
);
