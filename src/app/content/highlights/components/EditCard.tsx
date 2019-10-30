import { Highlight } from '@openstax/highlighter';
import defer from 'lodash/fp/defer';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import styled from 'styled-components/macro';
import Button, { ButtonGroup } from '../../../components/Button';
import theme from '../../../theme';
import { clearFocusedHighlight, createHighlight, updateHighlight } from '../actions';
import { cardPadding, highlightStyles } from '../constants';
import { HighlightData } from '../types';
import ColorPicker from './ColorPicker';
import Confirmation from './Confirmation';
import Note from './Note';

interface Props {
  isFocused: boolean;
  highlight: Highlight;
  create: typeof createHighlight;
  blur: typeof clearFocusedHighlight;
  save: typeof updateHighlight;
  onRemove: () => void;
  data?: HighlightData;
  className: string;
}

// tslint:disable-next-line:variable-name
const EditCard = ({highlight, className, data, create, save, onRemove, blur}: Props) => {
  const defaultNote = () => data && data.note ? data.note : '';
  const [pendingNote, setPendingNote] = React.useState<string>(defaultNote());
  const [editingNote, setEditing] = React.useState<boolean>(false);
  const [confirmingDelete, setConfirmingDelete] = React.useState<boolean>(false);

  const onColorChange = (style: string) => {
    highlight.setStyle(style);
    if (data) {
      save({...data, style});
    } else {
      create(highlight.serialize().data);
    }
  };

  // this is deferred so that a click on a color button
  // will have processed onColorChange before this handler
  const onClick = () => defer(() => {
    if (!highlight.getStyle()) {
      onColorChange(highlightStyles[0].label);
    }
  });

  const saveNote = () => {
    save({...(data || highlight.serialize().data), note: pendingNote});
    blur();
  };

  const cancelEditing = () => {
    setPendingNote(defaultNote());
    setEditing(false);
    blur();
  };

  return <form className={className} onClick={onClick}>
    <ColorPicker color={data ? data.style : undefined} onChange={onColorChange} onRemove={() => {
      if ((!data || !data.note) && !pendingNote) {
        onRemove();
      }
    }} />
    <Note note={pendingNote} onChange={(newValue) => {
      setPendingNote(newValue);
      setEditing(true);
    }} />
    {editingNote && <ButtonGroup>
      <FormattedMessage id='i18n:highlighting:button:save'>
        {(msg: Element | string) => <Button
          data-testid='save'
          size='small'
          variant='primary'
          onClick={(e: React.FormEvent) => {
            e.preventDefault();
            setEditing(false);

            if (pendingNote === '' && data && data.note) {
              setConfirmingDelete(true);
            } else {
              saveNote();
            }
          }}
        >{msg}</Button>}
      </FormattedMessage>
      <FormattedMessage id='i18n:highlighting:button:cancel'>
        {(msg: Element | string) => <Button
          size='small'
          data-testid='cancel'
          onClick={(e: React.FormEvent) => {
            e.preventDefault();
            cancelEditing();
          }}
        >{msg}</Button>}
      </FormattedMessage>
    </ButtonGroup>}
    {confirmingDelete && <Confirmation
      message='i18n:highlighting:confirmation:delete-note'
      confirmMessage='i18n:highlighting:button:delete'
      onConfirm={saveNote}
      onCancel={() => {
        setEditing(true);
        setPendingNote(defaultNote());
      }}
      always={() => setConfirmingDelete(false)}
    />}
  </form>;
};

export default styled(EditCard)`
  background: ${theme.color.neutral.formBackground};

  ${ButtonGroup} {
    margin-top: ${cardPadding}rem;
  }
`;
