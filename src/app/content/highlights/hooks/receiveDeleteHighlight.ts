import { NewHighlight } from '@openstax/highlighter/dist/api';
import Sentry from '../../../../helpers/Sentry';
import { addToast } from '../../../notifications/actions';
import { toastMessageKeys } from '../../../notifications/components/ToastNotifications/constants';
import { getHighlightToastDesination } from '../../../notifications/utils';
import { ActionHookBody } from '../../../types';
import { actionHook } from '../../../utils';
import { createHighlight, receiveDeleteHighlight } from '../actions';

export const hookBody: ActionHookBody<typeof receiveDeleteHighlight> =
  ({highlightClient, dispatch, getState}) => async({meta, payload}) => {
    if (meta.revertingAfterFailure) { return; }

    const destination = getHighlightToastDesination(getState());

    try {
      await highlightClient.deleteHighlight({id: payload.id});
    } catch (error) {
      Sentry.captureException(error);

      dispatch(addToast(toastMessageKeys.higlights.failure.delete, {destination}));
      dispatch(createHighlight({
        ...payload as unknown as NewHighlight,
        id: payload.id,
      },
      {...meta, revertingAfterFailure: true}));
    }
  };

export default actionHook(receiveDeleteHighlight, hookBody);