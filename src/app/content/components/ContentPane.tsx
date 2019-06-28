import React from 'react';
import { connect } from 'react-redux';
import styled, { css } from 'styled-components/macro';
import MobileScrollLock from '../../components/MobileScrollLock';
import theme from '../../theme';
import { Dispatch } from '../../types';
import { closeToc } from '../actions';
import { State } from '../types';
import {
  bookBannerDesktopMiniHeight,
  sidebarDesktopWidth,
  sidebarMobileWidth,
  sidebarTransitionTime,
  toolbarDesktopHeight
} from './constants';
import { isOpenConnector, styleWhenSidebarClosed } from './utils/sidebar';

// tslint:disable-next-line:variable-name
const Wrapper = styled.div<{isOpen: State['tocOpen']}>`
  @media screen {
    flex: 1;
    width: 100%;
    overflow: visible;
    transition: margin-left ${sidebarTransitionTime}ms;
    ${styleWhenSidebarClosed(css`
      margin-left: -${sidebarDesktopWidth}rem;
    `)}

    ${theme.breakpoints.mobile(css`
      margin-left: -${sidebarMobileWidth}rem;
    `)}

    /*
      the following rule should not match anything with display: table
      additionally, it does not work for .os-table even though those divs have display: block
    */
    *:target:not(figure):not(table):not(.os-figure)\
    :not(.os-table):not(.equation):not([data-type="equation"]) {
      // allow clicks on elements behind the ::before
      pointer-events: none !important;

      ::before {
        // make this a valid target for scrolling to
        content: " ";

        // inline-block is required to not break paragraphs around inline elements
        display: inline-block;

        // the extra 2 rem are required for inline elements to display properly
        margin-top: -${bookBannerDesktopMiniHeight + toolbarDesktopHeight + 2}rem;
        height: ${bookBannerDesktopMiniHeight + toolbarDesktopHeight + 2}rem;

        // probably not necessary, since the content is just a blank space, but just in case...
        visibility: hidden;
      }
    }

    /*
      the following rules should match everything with display: table and .os-table but not <table>
      <table>s do not scroll properly no matter what, so instead we move their ids to the .os-tables
      to avoid changing the target's margin-top, each rule has a height that exceeds its margin-top
      by an amount that should be equal to the normal value of its elements' margin-top and they
      must be kept in sync if the elements' margin-top changes
    */

    // margin-top: 0
    figure:target, .equation:target, [data-type="equation"]:target {
      margin-top: -${bookBannerDesktopMiniHeight + toolbarDesktopHeight}rem !important;

      pointer-events: none !important;

      ::before {
        content: " ";

        // inline-block adds a small space above elements that would otherwise touch the navbar
        display: inline-block;

        height: ${bookBannerDesktopMiniHeight + toolbarDesktopHeight}rem;

        visibility: hidden;
      }
    }

    // margin-top: 1.5rem (browser says 20px but 20/14rem is too short; 1.5rem is just right)
    .os-table:target {
      margin-top: -${bookBannerDesktopMiniHeight + toolbarDesktopHeight}rem !important;

      pointer-events: none !important;

      ::before {
        content: " ";

        // inline-block adds a small space above elements that would otherwise touch the navbar
        display: inline-block;

        height: ${bookBannerDesktopMiniHeight + toolbarDesktopHeight + 1.5}rem;

        visibility: hidden;
      }
    }

    // margin-top: 3rem
    .os-figure:target {
      margin-top: -${bookBannerDesktopMiniHeight + toolbarDesktopHeight}rem !important;

      pointer-events: none !important;

      ::before {
        content: " ";

        // inline-block adds a small space above elements that would otherwise touch the navbar
        display: inline-block;

        height: ${bookBannerDesktopMiniHeight + toolbarDesktopHeight + 3}rem;

        visibility: hidden;
      }
    }
  }
`;

interface Props {
  isOpen: State['tocOpen'];
  onClick: () => void;
}

// tslint:disable-next-line:variable-name
const ContentPane: React.SFC<Props> = ({isOpen, onClick, children}) => <Wrapper isOpen={isOpen}>
  {isOpen && <MobileScrollLock onClick={onClick} />}
  {children}
</Wrapper>;

const dispatchConnector = connect(
  () => ({}),
  (dispatch: Dispatch) => ({
    onClick: () => dispatch(closeToc()),
  })
);

export default isOpenConnector(dispatchConnector(ContentPane));
