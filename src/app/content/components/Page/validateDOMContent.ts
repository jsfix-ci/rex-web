import { Document, HTMLElement } from '@openstax/types/lib.dom';

export const validateDOMContent = (_document: Document, rootEl: HTMLElement) => {
  validateLinks(rootEl);
};

const validateLinks = (rootEl: HTMLElement) => {

  /*
   * all links in the content should be relative links to other pages
   * or fully qualified links to other things like videos or reading
   * on other sites.
   */

  const urls = Array.from(rootEl.querySelectorAll('a[href^="/"]'))
    .map((element) => element.getAttribute('href'));

  if (urls.length > 0) {
    throw new Error(['found invalid links in content: ', ...urls].join('\n'));
  }
};