import { Highlight } from '@openstax/highlighter';
import { HighlightColorEnum, HighlightUpdateColorEnum } from '@openstax/highlighter/dist/api';
import { HTMLElement } from '@openstax/types/lib.dom';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import styled, { css } from 'styled-components/macro';
import { useAnalyticsEvent } from '../../../../helpers/analytics';
import Button, { ButtonGroup } from '../../../components/Button';
import { useOnEsc } from '../../../reactUtils';
import theme from '../../../theme';
import { assertWindow, mergeRefs } from '../../../utils';
import {
  clearFocusedHighlight,
  setAnnotationChangesPending as setAnnotationChangesPendingAction,
  updateHighlight,
} from '../actions';
import { cardPadding, highlightStyles } from '../constants';
import { HighlightData } from '../types';
import ColorPicker from './ColorPicker';
import Confirmation from './Confirmation';
import Note from './Note';
import onClickOutside from './utils/onClickOutside';

interface Props {
  authenticated: boolean;
  loginLink: string;
  isFocused: boolean;
  hasUnsavedHighlight: boolean;
  highlight: Highlight;
  locationFilterId: string;
  pageId: string;
  onCreate: () => void;
  onBlur: typeof clearFocusedHighlight;
  setAnnotationChangesPending: typeof setAnnotationChangesPendingAction;
  onSave: typeof updateHighlight;
  onRemove: () => void;
  onCancel: () => void;
  data?: HighlightData;
  className: string;
}

// tslint:disable-next-line:variable-name
const EditCard = React.forwardRef<HTMLElement, Props>((
  {
    authenticated,
    className,
    data,
    highlight,
    locationFilterId,
    pageId,
    isFocused,
    hasUnsavedHighlight,
    loginLink,
    onBlur,
    onCancel,
    onCreate,
    setAnnotationChangesPending,
    onRemove,
    onSave,
  }: Props,
  ref
) => {
  const defaultAnnotation = () => data && data.annotation ? data.annotation : '';
  const [pendingAnnotation, setPendingAnnotation] = React.useState<string>(defaultAnnotation());
  const [editingAnnotation, setEditing] = React.useState<boolean>(!!data && !!data.annotation);
  const [confirmingDelete, setConfirmingDelete] = React.useState<boolean>(false);
  const element = React.useRef<HTMLElement>(null);

  const trackCreateNote = useAnalyticsEvent('createNote');
  const trackEditNoteColor = useAnalyticsEvent('editNoteColor');
  const trackEditAnnotation = useAnalyticsEvent('editAnnotation');
  const trackShowCreate = useAnalyticsEvent('showCreate');
  const trackShowLogin = useAnalyticsEvent('showLogin');
  const trackDeleteHighlight = useAnalyticsEvent('deleteHighlight');

  const blurIfNotEditing = () => {
    if (!editingAnnotation) {
      onBlur();
    }
  };

  const cancelEditing = () => {
    setPendingAnnotation(defaultAnnotation());
    setAnnotationChangesPending(false);
    setEditing(false);
    onCancel();
  };

  React.useEffect(() => {
    if (!isFocused) {
      cancelEditing();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFocused]);

  useOnEsc(element, isFocused, cancelEditing);

  React.useEffect(() => {
    if (data) { return; }
    if (authenticated) {
      trackShowCreate();
    } else {
      trackShowLogin();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(onClickOutside(element, isFocused, blurIfNotEditing), [isFocused, editingAnnotation]);

  const onColorChange = (color: HighlightColorEnum, isDefault?: boolean) => {
    highlight.setStyle(color);
    if (data) {
      onSave({
        highlight: {
          annotation: data.annotation,
          color: color as string as HighlightUpdateColorEnum,
        },
        id: data.id,
      }, {
        locationFilterId,
        pageId,
      });
      trackEditNoteColor(color);
    } else {
      assertWindow().getSelection().removeAllRanges();
      onCreate();
      trackCreateNote(isDefault ? 'default' : color);
    }
  };

  const saveAnnotation = (toSave: HighlightData) => {
    const addedNote = (data && data.annotation === undefined) ? true : false;

    onSave({
      highlight: {
        annotation: pendingAnnotation,
        color: toSave.color as string as HighlightUpdateColorEnum,
      },
      id: toSave.id,
    }, {
      locationFilterId,
      pageId,
    });
    trackEditAnnotation(addedNote, toSave.color);
    onCancel();
  };

  const updateUnsavedHighlightStatus = (newValue: string) => {
    const currentValue = data && data.annotation ? data.annotation : '';

    if (currentValue !== newValue && !hasUnsavedHighlight) {
      setAnnotationChangesPending(true);
    }

    if (currentValue === newValue && hasUnsavedHighlight) {
      setAnnotationChangesPending(false);
    }
  };

  return <form
    className={className}
    ref={mergeRefs(ref, element)}
    data-analytics-region='edit-note'
  >
    <ColorPicker color={data ? data.color : undefined} onChange={onColorChange} onRemove={() => {
      if (data && !data.annotation && !pendingAnnotation) {
        onRemove();
        trackDeleteHighlight(data.color);
      }
    }} />
    <Note
      note={pendingAnnotation}
      onFocus={() => {
        if (!highlight.getStyle()) {
          onColorChange(highlightStyles[0].label, true);
        }
      }}
      onChange={(newValue) => {
        setPendingAnnotation(newValue);
        updateUnsavedHighlightStatus(newValue);
        setEditing(true);
      }}
    />
    {editingAnnotation && data && <ButtonGroup>
      <FormattedMessage id='i18n:highlighting:button:save'>
        {(msg: Element | string) => <Button
          data-testid='save'
          data-analytics-label='save'
          size='small'
          variant='primary'
          onClick={(e: React.FormEvent) => {
            e.preventDefault();
            setEditing(false);

            if (pendingAnnotation === '' && data.annotation) {
              setConfirmingDelete(true);
            } else {
              saveAnnotation(data);
            }
          }}
        >{msg}</Button>}
      </FormattedMessage>
      <FormattedMessage id='i18n:highlighting:button:cancel'>
        {(msg: Element | string) => <Button
          size='small'
          data-analytics-label='cancel'
          data-testid='cancel'
          onClick={(e: React.FormEvent) => {
            e.preventDefault();
            cancelEditing();
          }}
        >{msg}</Button>}
      </FormattedMessage>
    </ButtonGroup>}
    {data && <Confirmation
      isOpen={confirmingDelete}
      data-testid='confirm-delete'
      data-analytics-region='highlighting-delete-note'
      message='i18n:highlighting:confirmation:delete-note'
      confirmMessage='i18n:highlighting:button:delete'
      onConfirm={() => saveAnnotation(data)}
      onCancel={() => {
        setEditing(true);
        setPendingAnnotation(defaultAnnotation());
      }}
      always={() => setConfirmingDelete(false)}
    />}
    <Confirmation
      isOpen={!authenticated}
      data-analytics-label='login'
      data-analytics-region='highlighting-login'
      message='i18n:highlighting:login:prompt'
      confirmMessage='i18n:highlighting:login:link'
      confirmLink={loginLink}
      onCancel={onBlur}
    />
  </form>;
});

export default styled(EditCard)`
  background: ${theme.color.neutral.formBackground};
  user-select: none;
  overflow: visible;

  ${ButtonGroup} {
    margin-top: ${cardPadding}rem;
  }

  ${theme.breakpoints.mobile(css`
    visibility: hidden;
  `)}
`;
