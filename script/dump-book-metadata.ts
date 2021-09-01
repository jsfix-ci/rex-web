import fetch from 'node-fetch';
import { ArchiveBook, LinkedArchiveTree, LinkedArchiveTreeSection } from '../src/app/content/types';
import { formatBookData } from '../src/app/content/utils';
import { findTreePages } from '../src/app/content/utils/archiveTreeUtils';
import { getPageDescription, getParentPrefix } from '../src/app/content/utils/seoUtils';
import createIntl from '../src/app/messages/createIntl';
import { ARCHIVE_URL, REACT_APP_ARCHIVE_URL, REACT_APP_OS_WEB_API_URL } from '../src/config';
import allBooks from '../src/config.books.json';
import createArchiveLoader from '../src/gateways/createArchiveLoader';
import createOSWebLoader from '../src/gateways/createOSWebLoader';

(global as any).fetch = fetch;
const domParser = new DOMParser();

const archiveLoader = createArchiveLoader(REACT_APP_ARCHIVE_URL, {
  archivePrefix: ARCHIVE_URL,
});
const osWebLoader = createOSWebLoader(`${ARCHIVE_URL}${REACT_APP_OS_WEB_API_URL}`);

const getPageMetadata = async(
  section: LinkedArchiveTreeSection | LinkedArchiveTree,
  book: ArchiveBook,
  loader: ReturnType<(typeof archiveLoader)['book']>
) => {
  const intl = await createIntl(book.language);
  const services = {
    archiveLoader,
  };
  const page = await loader.page(section.id).load();
  const description = getPageDescription(services, intl, book, page);
  const sectionTitle = domParser.parseFromString(section.title, 'text/html').body.textContent;
  const parentPrefix = getParentPrefix(section.parent, intl).trim();

  const row = `"${book.title}","${parentPrefix}","${sectionTitle}","${description}"`;
  // tslint:disable-next-line:no-console
  console.log(row);
};

const getBookMetadata = async(id: string, version: string) => {
  const loader = archiveLoader.book(id, version);
  const singleBook = await loader.load();
  const osWebBook = singleBook.tree.slug ? await osWebLoader.getBookFromSlug(singleBook.tree.slug) : undefined;
  const book = formatBookData(singleBook, osWebBook);
  const bookPages = findTreePages(book.tree);

  const bookRows = await Promise.all(bookPages.map(async(page) => getPageMetadata(page, book, loader)));

  return bookRows;
};

const getAllBooksMetadata = async() => {
  for (const [bookId, { defaultVersion }] of Object.entries(allBooks)) {
    await getBookMetadata(bookId, defaultVersion);
  }
};

getAllBooksMetadata();
