import Highlighter, { Highlight } from '@openstax/highlighter';
import { NewHighlightSourceTypeEnum } from '@openstax/highlighter/dist/api';
import { HTMLElement } from '@openstax/types/lib.dom';
import flow from 'lodash/fp/flow';
import React from 'react';
import { connect, useSelector } from 'react-redux';
import styled from 'styled-components';
import { useServices } from '../../../context/Services';
import { useFocusIn } from '../../../reactUtils';
import { AppState, Dispatch } from '../../../types';
import { highlightStyles } from '../../constants';
import * as selectHighlights from '../../highlights/selectors';
import * as selectSearch from '../../search/selectors';
import * as selectContent from '../../selectors';
import * as contentSelect from '../../selectors';
import { stripIdVersion } from '../../utils/idUtils';
import {
  clearFocusedHighlight,
  createHighlight,
  focusHighlight,
  requestDeleteHighlight,
  setAnnotationChangesPending,
} from '../actions';
import { HighlightData } from '../types';
import { getHighlightLocationFilterForPage } from '../utils';
import { mainCardStyles } from './cardStyles';
import DisplayNote from './DisplayNote';
import EditCard from './EditCard';
import scrollHighlightIntoView from './utils/scrollHighlightIntoView';
import showConfirmation from './utils/showConfirmation';

export interface CardProps {
  page: ReturnType<typeof selectContent['bookAndPage']>['page'];
  book: ReturnType<typeof selectContent['bookAndPage']>['book'];
  container?: HTMLElement;
  isActive: boolean;
  lastActive: number;
  isTocOpen: boolean;
  hasQuery: boolean;
  highlighter: Highlighter;
  highlight: Highlight;
  create: typeof createHighlight;
  focus: typeof focusHighlight;
  remove: typeof requestDeleteHighlight;
  blur: typeof clearFocusedHighlight;
  setAnnotationChangesPending: typeof setAnnotationChangesPending;
  data?: HighlightData;
  className: string;
  zIndex: number;
  shouldFocusCard: boolean;
  topOffset?: number;
  highlightOffsets?: { top: number, bottom: number };
  onHeightChange: (ref: React.RefObject<HTMLElement>) => void;
  isHidden: boolean;
}

// tslint:disable-next-line:variable-name
const Card = (props: CardProps) => {
  const annotation = props.data && props.data.annotation;
  const element = React.useRef<HTMLElement>(null);
  const [editing, setEditing] = React.useState<boolean>(!annotation);
  const [highlightRemoved, setHighlightRemoved] = React.useState<boolean>(false);
  const locationFilters = useSelector(selectHighlights.highlightLocationFilters);
  const hasUnsavedHighlight = useSelector(selectHighlights.hasUnsavedHighlight);
  const services = useServices();

  const { isActive, highlight: { id }, focus } = props;

  const focusCard = React.useCallback(async() => {
    if (!isActive && (!hasUnsavedHighlight || await showConfirmation(services))) {
      focus(id);
    }
  }, [isActive, hasUnsavedHighlight, id, focus, services]);

  useFocusIn(element, true, focusCard);

  React.useEffect(() => {
    if (!props.lastActive) {
      setEditing(false);
    } else {
      scrollHighlightIntoView(props.highlight, element);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [element, props.lastActive]);

  React.useEffect(() => {
    if (annotation) {
      props.highlight.elements.forEach((el) => (el as HTMLElement).classList.add('has-note'));
    } else {
      props.highlight.elements.forEach((el) => (el as HTMLElement).classList.remove('has-note'));
    }
  }, [props.highlight, annotation]);

  React.useEffect(() => {
    if (!annotation && !props.isActive) {
      props.onHeightChange({ current: null });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [annotation, props.isActive]);

  const location = React.useMemo(() => {
    return props.page && getHighlightLocationFilterForPage(locationFilters, props.page);
  }, [locationFilters, props.page]);

  const locationFilterId = location && stripIdVersion(location.id);

  const { page, book } = props;
  if (!props.highlight.range || !page || !book || !locationFilterId) {
    return null;
  }

  const onRemove = () => {
    if (props.data) {
      setHighlightRemoved(true);
      props.remove(props.data, {
        locationFilterId,
        pageId: page.id,
      });
    }
  };
  const style = highlightStyles.find((search) => props.data && search.label === props.data.color);

  const onCreate = (isDefaultColor: boolean) => {
    props.create({
      ...props.highlight.serialize().getApiPayload(props.highlighter, props.highlight),
      scopeId: book.id,
      sourceId: page.id,
      sourceMetadata: {
        bookVersion: book.contentVersion,
        pipelineVersion: book.archiveVersion,
      },
      sourceType: NewHighlightSourceTypeEnum.OpenstaxPage,
    }, {
      isDefaultColor,
      locationFilterId,
      pageId: page.id,
    });
  };

  const commonProps = {
    className: props.className,
    highlight: props.highlight,
    isActive: props.isActive,
    onBlur: props.blur,
    onHeightChange: props.onHeightChange,
    onRemove,
    ref: element,
    shouldFocusCard: props.shouldFocusCard,
  };

  return !highlightRemoved ? <div onClick={focusCard} data-testid='card'>
    {
      !editing && style && annotation ? <DisplayNote
        {...commonProps}
        style={style}
        note={annotation}
        focus={props.focus}
        onEdit={() => setEditing(true)}
      /> : <EditCard
        {...commonProps}
        locationFilterId={locationFilterId}
        hasUnsavedHighlight={hasUnsavedHighlight}
        pageId={page.id}
        onCreate={onCreate}
        setAnnotationChangesPending={props.setAnnotationChangesPending}
        onCancel={() => setEditing(false)}
        data={props.data}
      />
    }
  </div> : null;
};

// tslint:disable-next-line: variable-name
const StyledCard = styled(Card)`
  ${mainCardStyles}
`;

export default connect(
  (state: AppState, ownProps: {highlight: Highlight}) => ({
    ...selectContent.bookAndPage(state),
    data: selectHighlights.highlights(state).find((search) => search.id === ownProps.highlight.id),
    hasQuery: !!selectSearch.query(state),
    isActive: selectHighlights.focused(state) === ownProps.highlight.id,
    isTocOpen: contentSelect.tocOpen(state),
    lastActive: (selectHighlights.focused(state) === ownProps.highlight.id) && selectHighlights.lastFocused(state),
  }),
  (dispatch: Dispatch) => ({
    blur: flow(clearFocusedHighlight, dispatch),
    create: flow(createHighlight, dispatch),
    focus: flow(focusHighlight, dispatch),
    remove: flow(requestDeleteHighlight, dispatch),
    setAnnotationChangesPending: flow(setAnnotationChangesPending, dispatch),
  })
)(StyledCard);
