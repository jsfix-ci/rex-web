import Cookies from 'js-cookie';
import { disableAnalyticsCookie } from './constants';

export const trackingIsDisabled = () => !!JSON.parse(Cookies.get(disableAnalyticsCookie));
