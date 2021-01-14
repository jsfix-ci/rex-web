import React from 'react';
import { FormattedMessage } from 'react-intl';
import { connect, useSelector } from 'react-redux';
import styled from 'styled-components/macro';
import HighlightsIcon from '../../../../assets/HighlightsIcon';
import { useAnalyticsEvent } from '../../../../helpers/analytics';
import { AppState, Dispatch } from '../../../types';
import { openMyHighlights as openMyHighlightsAction } from '../../highlights/actions';
import * as selectors from '../../highlights/selectors';
import { practiceQuestionsEnabled as practiceQuestionsEnabledSelector } from '../../practiceQuestions/selectors';
import { toolbarIconStyles } from './iconStyles';
import { PlainButton, toolbarDefaultButton, toolbarDefaultText } from './styled';

interface Props {
  openMyHighlights: () => void;
  myHighlightsOpen?: boolean;
}

// tslint:disable-next-line:variable-name
const MyHighlightsWrapper = styled(PlainButton)`
  ${toolbarDefaultButton}
  height: auto;
  ${(props: { practiceQuestionsEnabled: boolean }) => {
    if (props.practiceQuestionsEnabled) { return `margin-right: 0;`; }
  }}

  > svg {
    ${toolbarIconStyles}
  }
`;

// tslint:disable-next-line:variable-name
const MyHighlightsText = styled.span`
  ${toolbarDefaultText}
`;

// tslint:disable-next-line:variable-name
const HighlightButton = ({ openMyHighlights }: Props) => {
  const practiceQuestionsEnabled = useSelector(practiceQuestionsEnabledSelector);
  const trackOpenCloseMH = useAnalyticsEvent('openCloseMH');

  const openHighlightsSummary = () => {
    openMyHighlights();
    trackOpenCloseMH();
  };

  return <FormattedMessage id='i18n:toolbar:highlights:text'>
      {(msg: string) =>
        <MyHighlightsWrapper
          onClick={() => openHighlightsSummary()}
          aria-label={msg}
          practiceQuestionsEnabled={Boolean(practiceQuestionsEnabled)}
        >
          <HighlightsIcon />
          <MyHighlightsText>{msg}</MyHighlightsText>
        </MyHighlightsWrapper>
      }
    </FormattedMessage>
  ;
};

export default connect(
  (state: AppState) => ({
    myHighlightsOpen: selectors.myHighlightsOpen(state),
  }),
  (dispatch: Dispatch) => ({
    openMyHighlights: () => dispatch(openMyHighlightsAction()),
  })
)(HighlightButton);
