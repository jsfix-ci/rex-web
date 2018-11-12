import { createStandardAction } from 'typesafe-actions';
import { historyActions, LocationChange } from './types';

export const callHistoryMethod = createStandardAction('Navigation/callHistoryMethod')<historyActions>();

export const locationChange = createStandardAction('Navigation/locationChange')<LocationChange>();
