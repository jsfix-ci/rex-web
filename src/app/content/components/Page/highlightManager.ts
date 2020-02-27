import Highlighter, { Highlight, SerializedHighlight } from '@openstax/highlighter';
import { HTMLElement } from '@openstax/types/lib.dom';
import defer from 'lodash/fp/defer';
import flow from 'lodash/fp/flow';
import React from 'react';
import { isDefined } from '../../../guards';
import * as selectNavigation from '../../../navigation/selectors';
import { ScrollTargetHighlight } from '../../../navigation/types';
import { AppState, Dispatch } from '../../../types';
import {
  clearFocusedHighlight,
  focusHighlight,
} from '../../highlights/actions';
import CardWrapper from '../../highlights/components/CardWrapper';
import * as selectHighlights from '../../highlights/selectors';
import { HighlightData } from '../../highlights/types';
import * as select from '../../selectors';
import attachHighlight from '../utils/attachHighlight';

interface Services {
  getProp: () => HighlightProp;
  setPendingHighlight: (highlight: Highlight) => void;
  clearPendingHighlight: () => void;
  highlighter: Highlighter;
  container: HTMLElement;
}

export const mapStateToHighlightProp = (state: AppState) => ({
  focused: selectHighlights.focused(state),
  highlights: selectHighlights.highlights(state),
  page: select.page(state),
  scrollTargetHighlightId: selectNavigation.highlightId(state),
});
export const mapDispatchToHighlightProp = (dispatch: Dispatch) => ({
  clearFocus: flow(clearFocusedHighlight, dispatch),
  focus: flow(focusHighlight, dispatch),
});
export type HighlightProp = ReturnType<typeof mapStateToHighlightProp>
  & ReturnType<typeof mapDispatchToHighlightProp>;

// deferred so any cards that are going to blur themselves will have done so before this is processed
const onClickHighlight = (services: Services, highlight: Highlight | undefined) => defer(() => {
  if (!highlight || services.getProp().focused) {
    return;
  }

  services.getProp().focus(highlight.id);
});

// deferred so any cards that are going to blur themselves will have done so before this is processed
const onSelectHighlight = (
  services: Services,
  highlights: Highlight[],
  highlight: Highlight | undefined
) => defer(() => {
  if (highlights.length > 0 || !highlight || services.getProp().focused) {
    return;
  }

  services.getProp().focus(highlight.id);
  services.setPendingHighlight(highlight);
});

const createHighlighter = (services: Omit<Services, 'highlighter'>) => {

  const highlighter: Highlighter = new Highlighter(services.container, {
    onClick: (...args) => onClickHighlight({ ...services, highlighter }, ...args),
    onSelect: (...args) => onSelectHighlight({ ...services, highlighter }, ...args),
    skipIDsBy: /^(\d+$|term)/,
    snapMathJax: true,
    snapTableRows: true,
    snapWords: true,
  });
  return highlighter;
};

const isUnknownHighlightData = (highlighter: Highlighter) => (data: HighlightData) =>
  !highlighter.getHighlight(data.id);

const updateStyle = (highlighter: Highlighter) => (data: HighlightData) => {
  const highlight = highlighter.getHighlight(data.id);

  if (highlight) {
    highlight.setStyle(data.color);
  }
};

const highlightData = (services: Services) => (data: HighlightData) => {
  const { highlighter } = services;

  const serialized = SerializedHighlight.fromApiResponse(data);

  return attachHighlight(serialized, highlighter);
};

const erase = (highlighter: Highlighter) => (highlight: Highlight) => {
  highlighter.erase(highlight);
  return highlight;
};

export default (container: HTMLElement, getProp: () => HighlightProp) => {
  let highlighter: Highlighter;
  let pendingHighlight: Highlight | undefined;
  let setListHighlighter = (_highlighter: Highlighter): void => undefined;
  let setListHighlights = (_highlights: Highlight[]): void => undefined;
  let setListPendingHighlight: ((highlight: Highlight | undefined) => void) | undefined;

  const clearPendingHighlight = () => {
    pendingHighlight = undefined;
    if (setListPendingHighlight) {
      setListPendingHighlight(undefined);
    }
  };

  const setPendingHighlight = (highlight: Highlight) => {
    pendingHighlight = highlight;
    if (setListPendingHighlight) {
      setListPendingHighlight(highlight);
    }
  };

  const services = {
    clearPendingHighlight,
    container,
    getProp,
    setPendingHighlight,
  };

  highlighter = createHighlighter(services);
  setListHighlighter(highlighter);

  return {
    CardList: () => {
      const [listHighlighter, setHighlighter] = React.useState<Highlighter | undefined>(highlighter);
      const [listHighlights, setHighlights] = React.useState<Highlight[]>([]);
      const [listPendingHighlight, setInnerPendingHighlight] = React.useState<Highlight | undefined>(pendingHighlight);

      setListHighlighter = setHighlighter;
      setListHighlights = setHighlights;
      setListPendingHighlight = setInnerPendingHighlight;

      return React.createElement(CardWrapper, {
        container,
        highlighter: listHighlighter,
        highlights: listPendingHighlight
          ? [
            ...listHighlights.filter(
              (highlight) => !listPendingHighlight || highlight.id !== listPendingHighlight.id
            ),
            listPendingHighlight,
          ]
          : listHighlights,
      });
    },
    getScrollTarget: (): ScrollTargetHighlight | null => {
      const targetId = services.getProp().scrollTargetHighlightId;
      if (!targetId) { return null; }

      if (!services.getProp().highlights.find((search) => search.id === targetId)) {
        // TODO: Display some error dialog.
        // Probably when https://github.com/openstax/rex-web/pull/465 is merged
        return null;
      }

      return {
        id: targetId,
        scrollToFunction: () => services.getProp().focus(targetId),
        type: 'highlight',
      };
    },
    unmount: (): void => highlighter && highlighter.unmount(),
    update: () => {
      let addedOrRemoved = false;

      const matchHighlightId = (id: string) => (search: HighlightData | Highlight) => search.id === id;

      if (
        pendingHighlight
        && !highlighter.getHighlight(pendingHighlight.id)
        && getProp().highlights.find(matchHighlightId(pendingHighlight.id))
      ) {
        addedOrRemoved = true;
        attachHighlight(pendingHighlight, highlighter);
      }

      getProp().highlights
        .map(updateStyle(highlighter))
      ;

      const newHighlights = getProp().highlights
        .filter(isUnknownHighlightData(highlighter))
        .map(highlightData({ ...services, highlighter }))
        .filter(isDefined)
        ;

      const removedHighlights = highlighter.getHighlights()
        .filter((highlight) => !getProp().highlights.find(matchHighlightId(highlight.id)))
        .map(erase(highlighter))
        ;

      highlighter.clearFocus();
      const focusedId = getProp().focused;
      const focused = focusedId && highlighter.getHighlight(focusedId);
      if (focused) {
        focused.focus();
      }

      if (pendingHighlight && removedHighlights.find(matchHighlightId(pendingHighlight.id))) {
        clearPendingHighlight();
      }

      if (addedOrRemoved || newHighlights.length > 0 || removedHighlights.length > 0) {
        setListHighlights(highlighter.getOrderedHighlights());
        return true;
      }

      return addedOrRemoved;
    },
  };
};

export const stubHighlightManager = ({
  CardList: (() => null) as React.FC,
  getScrollTarget: (): ScrollTargetHighlight | null => null,
  unmount: (): void => undefined,
  update: (): boolean => false,
});
