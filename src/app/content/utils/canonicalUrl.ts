import { isEqual } from 'lodash/fp';
import { CANONICAL_MAP, ObjectLiteral } from '../../../canonicalBookMap';
import { AppServices } from '../../types';
import { assertDefined } from '../../utils';
import { hasOSWebData } from '../guards';
import { Book, BookWithOSWebData } from '../types';
import { makeUnifiedBookLoader } from '../utils';
import { findArchiveTreeNodeById } from './archiveTreeUtils';

export async function getCanonicalUrlParams(
  archiveLoader: AppServices['archiveLoader'],
  osWebLoader: AppServices['osWebLoader'],
  book: Book,
  pageId: string
) {
  const getBook = makeUnifiedBookLoader(archiveLoader, osWebLoader, book.loadOptions);

  const getCanonicalMap = (bookId: string) => {
    const bookDefaultMap = [[bookId, {}]] as Array<[string, ObjectLiteral<undefined>]>;
    return ([
      ...(CANONICAL_MAP[bookId] || bookDefaultMap),
      // use the current book if no map is found
    ]).filter(([id]) => !!book.loadOptions.booksConfig.books[id]);
};

  let canonicalMap = getCanonicalMap(book.id);
  const mapsChecked = [];
  let canonicalPageId = pageId;
  let done = false;
  let canonicalBook;
  let treeSection;

  while (canonicalMap.length && !done) {
    for (const [id, CANONICAL_PAGES_MAP] of canonicalMap) {
      mapsChecked.push(canonicalMap);
      const useCurrentBookAsCanonical = book.id === id  && hasOSWebData(book);
      canonicalBook = useCurrentBookAsCanonical ? book : await getBook(id);
      canonicalPageId = CANONICAL_PAGES_MAP[pageId] || canonicalPageId;
      treeSection = findArchiveTreeNodeById(canonicalBook.tree, canonicalPageId);

      if (!useCurrentBookAsCanonical) {
        const newMap = getCanonicalMap(canonicalBook.id);
        // stop when we run out of canonical maps to check
        done = !newMap.length || isEqual(canonicalMap, newMap);
        // throw if the new map has already been checked
        if (!done && mapsChecked.find((map) => isEqual(map, newMap))) {
          throw new Error(`Loop encountered in map for ${canonicalBook.id}`);
        }
        canonicalMap = newMap;
        break;
      }
      done = true;
    }
  }

  // use current page if page not found in canonical book
  if (!treeSection && canonicalMap.length) {
    treeSection = findArchiveTreeNodeById(book.tree, pageId);
    canonicalBook = book;
  }
  if (treeSection) {
    const pageInBook = assertDefined(treeSection.slug, 'Expected page to have slug.');
    return {book: {slug: (canonicalBook as BookWithOSWebData).slug}, page: {slug: pageInBook}};
  }

  return null;
}
