import { isPlainObject } from '../../guards';
import { isScrollTarget } from '../../navigation/utils';
import { HighlightScrollTarget } from './types';

export const isHighlightScrollTarget = (target: any): target is HighlightScrollTarget => isPlainObject(target)
  && isScrollTarget(target)
  && target.type === 'highlight'
  && typeof target.id === 'string';
