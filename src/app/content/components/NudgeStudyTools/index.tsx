import { HTMLElement } from '@openstax/types/lib.dom';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import { useAnalyticsEvent } from '../../../../helpers/analytics';
import { useMatchMobileQuery } from '../../../reactUtils';
import { assertDocument } from '../../../utils';
import { closeNudgeStudyTools, openNudgeStudyTools } from '../../actions';
import { showNudgeStudyTools } from '../../selectors';
import { hasStudyGuides as hasStudyGuidesSelector } from '../../studyGuides/selectors';
import arrowDesktop from './assets/arrowDesktop.svg';
import arrowMobile from './assets/arrowMobile.svg';
import {
  NudgeArrow,
  NudgeBackground,
  NudgeCloseButton,
  NudgeCloseIcon,
  NudgeContent,
  NudgeContentWrapper,
  NudgeHeading,
  NudgeSpotlight,
  NudgeText,
  NudgeWrapper,
} from './styles';
import {
  setNudgeStudyToolsCookies,
  shouldDisplayNudgeStudyTools,
  useIncrementPageCounter,
  usePositions,
} from './utils';

// tslint:disable-next-line: variable-name
const NudgeStudyTools = () => {
  const document = assertDocument();
  const wrapperRef = React.useRef<HTMLElement>(null);
  const isMobile = useMatchMobileQuery();
  const positions = usePositions(isMobile);
  const dispatch = useDispatch();

  React.useEffect(() => {
    if (positions) {
      document.body.style.overflow = 'hidden';
    }
    return () => { document.body.style.overflow = null; };
    // document will not change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [positions]);

  React.useEffect(() => {
    const element = wrapperRef.current;
    if (positions && element) {
     element.focus();
    }
  }, [wrapperRef, positions]);

  if (!positions) { return null; }

  return <NudgeWrapper data-analytics-region='Nudge Study Tools'>
    <NudgeArrow
      src={isMobile ? arrowMobile : arrowDesktop}
      alt=''
      top={positions.arrowTopOffset}
      left={positions.arrowLeft}
    />
    <NudgeCloseButton
      tabIndex={2}
      top={positions.closeButtonTopOffset}
      left={positions.closeButtonLeft}
      onClick={() => dispatch(closeNudgeStudyTools())}
      data-analytics-label='close'
    >
      <NudgeCloseIcon />
    </NudgeCloseButton>
    <FormattedMessage id='i18n:nudge:study-tools:aria-label'>
      {(msg: string) => <NudgeContentWrapper
        ref={wrapperRef}
        tabIndex={1}
        aria-label={msg}
        top={positions.contentWrapperTopOffset}
        right={positions.contentWrapperRight}
      >
        <NudgeContent>
          <NudgeHeading />
          <NudgeText />
        </NudgeContent>
      </NudgeContentWrapper>}
    </FormattedMessage>
    <NudgeBackground>
      <NudgeSpotlight
        top={positions.spotlightTopOffset}
        left={positions.spotlightLeftOffset}
        height={positions.spotlightHeight}
        width={positions.spotlightWidth}
      />
    </NudgeBackground>
  </NudgeWrapper>;
};

// Do not render <NudgeStudyTools/> if it is hidden so scroll listener is not attached
// to the DOM and do not render if document or window is undefined which may happen for prerendering.
// tslint:disable-next-line: variable-name
const NoopForPrerenderingAndForHiddenState = () => {
  const hasStudyGuides = useSelector(hasStudyGuidesSelector);
  const show = useSelector(showNudgeStudyTools);
  const trackOpen = useAnalyticsEvent('openNudgeStudyTools');
  const dispatch = useDispatch();
  const counter = useIncrementPageCounter();

  React.useEffect(() => {
    if (
      show === null
      && hasStudyGuides
      && shouldDisplayNudgeStudyTools()
    ) {
      setNudgeStudyToolsCookies();
      trackOpen();
      dispatch(openNudgeStudyTools());
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show, counter, hasStudyGuides]);

  if (!show ) {
    return null;
  }

  return <NudgeStudyTools />;
};

export default NoopForPrerenderingAndForHiddenState;