import { SearchResultHit } from '@openstax/open-search-client';
import isEqual from 'lodash/fp/isEqual';
import React from 'react';
import { useSelector } from 'react-redux';
import { useServices } from '../../../../context/Services';
import { ArchiveTreeSection, Book } from '../../../types';
import { loadPageContent } from '../../../utils';
import { stripIdVersion } from '../../../utils/idUtils';
import { isKeyTermHit } from '../../guards';
import { selectedResult as selectedResultSelector } from '../../selectors';
import { SearchScrollTarget } from '../../types';
import { getKeyTermPair } from '../../utils';
import RelatedKeyTermContent from './RelatedKeyTermContent';
import * as Styled from './styled';

interface SearchResultHitsProps {
  activeSectionRef?: React.RefObject<HTMLAnchorElement>;
  book: Book;
  hits: SearchResultHit[];
  testId: string;
  getPage: (hit: SearchResultHit) => ArchiveTreeSection;
  onClick: (result: {result: SearchResultHit, highlight: number}) => void;
}

// tslint:disable-next-line: variable-name
const SearchResultHits = ({ activeSectionRef, book, hits, getPage, testId, onClick }: SearchResultHitsProps) => {
  const selectedResult = useSelector(selectedResultSelector);
  const { archiveLoader } = useServices();
  const loader = archiveLoader.book(book.id, book.version);
  const [keyTerms, setKeyTerms] = React.useState({});

  React.useEffect(() => {
    const keyTermsHits = hits.filter((searchHit) => isKeyTermHit(searchHit));

    const getKeyTermsPages = async() => {
      keyTermsHits.forEach(async(hit) => {
        const content = await loadPageContent(loader, stripIdVersion(hit.source.pageId));
        setKeyTerms((pages) => ({...pages, [hit.source.elementId]: getKeyTermPair(content, hit.source.elementId)}));
      });
    };

    getKeyTermsPages();
  }, []);

  return <React.Fragment>
    {hits.map((hit) => {
      if (isKeyTermHit(hit)) {
        const pair = (keyTerms as {[key: string]: any})[hit.source.elementId];
        hit.highlight.term = (pair && pair.term) || hit.highlight.title;
        hit.highlight.visibleContent = (pair && pair.definition) ? [pair.definition] : hit.highlight.visibleContent;
      }

      return hit.highlight.visibleContent?.map((highlight: string, index: number) => {
        const thisResult = {result: hit, highlight: index};
        const isSelected = isEqual(selectedResult, thisResult);
        const target: SearchScrollTarget = {
          elementId: thisResult.result.source.elementId,
          index,
          type: 'search',
        };

        return <Styled.SectionContentPreview
          selectedResult={isSelected}
          data-testid={testId}
          key={index}
          book={book}
          page={getPage(hit)}
          result={thisResult}
          scrollTarget={target}
          onClick={() => onClick(thisResult)}
          {...isSelected && activeSectionRef ?  {ref: activeSectionRef} : {}}
        >
          {isKeyTermHit(hit)
            ? <RelatedKeyTermContent keyTermHit={hit} />
            : <div tabIndex={-1} dangerouslySetInnerHTML={{ __html: highlight }} />}
        </Styled.SectionContentPreview>;
      });
    })}
  </React.Fragment>;
};

export default SearchResultHits;