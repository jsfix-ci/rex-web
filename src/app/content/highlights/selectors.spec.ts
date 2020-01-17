import { treeWithoutUnits } from '../../../test/trees';
import { book } from '../selectors';
import * as select from './selectors';

jest.mock('./constants', () => ({
  enabledForBooks: ['enabledbook'],
}));

const mockBook = book as any as jest.SpyInstance;

jest.mock('../selectors', () => ({
  book: jest.fn(),
  localState: (state: any) => ({highlights: state}),
}));

describe('isEnabled', () => {
  it('when enabled and book is whitelisted', () => {
    mockBook.mockReturnValue({id: 'enabledbook'});
    expect(select.isEnabled({enabled: true} as any)).toEqual(true);
  });

  it('when enabled and book not is whitelisted', () => {
    mockBook.mockReturnValue({id: 'book'});
    expect(select.isEnabled({enabled: true} as any)).toEqual(false);
  });

  it('when not enabled', () => {
    mockBook.mockReturnValue({id: 'enabledbook'});
    expect(select.isEnabled({enabled: false} as any)).toEqual(false);
  });
});

describe('focused', () => {
  it('gets focused highlight id', () => {
    expect(select.focused({focused: 'asdf'} as any)).toEqual('asdf');
  });
});

describe('highlightLocationFiltersWithContent', () => {
  it('filters', () => {
    mockBook.mockReturnValue({id: 'enabledbook', tree: treeWithoutUnits});
    expect(select.highlightLocationFiltersWithContent({
      summary: {
        totalCountsPerPage: {page1: 1, page2: 3, preface: 2},
      },
    } as any)).toEqual(new Set(['chapter1', 'preface']));
  });

  it('works with null counts', () => {
    mockBook.mockReturnValue({id: 'enabledbook', tree: treeWithoutUnits});
    expect(select.highlightLocationFiltersWithContent({
      summary: {
        totalCountsPerPage: null,
      },
    } as any)).toEqual(new Set());
  });
});
