const query = require('query-string');

// NOTE: for a specific archive version, prefer using the path param. use
// this argument to use a completely different archive, such as archive-preview
// or localhost
const REACT_APP_ARCHIVE_URL_OVERRIDE = typeof(window) === 'undefined'
  ? undefined
  : query.parse(window.location.search).archive
;

const UNLIMITED_CONTENT_QUERY = typeof(window) === 'undefined'
  ? undefined
  : query.parse(window.location.search).validateLinks
;

const UNLIMITED_CONTENT_ENV = process.env.REACT_APP_UNLIMITED_CONTENT === undefined
  ? undefined
  : process.env.REACT_APP_UNLIMITED_CONTENT !== 'false'
;

const UNLIMITED_CONTENT = UNLIMITED_CONTENT_QUERY === undefined
  ? UNLIMITED_CONTENT_ENV
  : Boolean(UNLIMITED_CONTENT_QUERY)
;

module.exports = {
  RELEASE_ID: 'development',
  CODE_VERSION: 'development',
  DEPLOYED_ENV: 'development',

  REACT_APP_ARCHIVE_URL_OVERRIDE,
  ACCOUNTS_URL: process.env.ACCOUNTS_URL || 'https://dev.openstax.org',
  OS_WEB_URL: process.env.OS_WEB_URL || 'https://dev.openstax.org',
  HIGHLIGHTS_URL: process.env.HIGHLIGHTS_URL || 'https://highlights-hl-40b2567.sandbox.openstax.org',
  SEARCH_URL: process.env.SEARCH_URL || 'https://openstax.org',

  SKIP_OS_WEB_PROXY: process.env.SKIP_OS_WEB_PROXY !== undefined,
  FIXTURES: false,
  DEBUG: true,

  PORT: process.env.PORT ? parseInt(process.env.PORT, 10) : 8000,

  UNLIMITED_CONTENT: UNLIMITED_CONTENT === undefined ? true : UNLIMITED_CONTENT
};
