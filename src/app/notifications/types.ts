import { ActionType } from 'typesafe-actions';
import * as actions from './actions';

export type AnyNotification = ActionType<Pick<typeof actions, 'updateAvailable' | 'acceptCookies'>>;
export type State =  AnyNotification[];
