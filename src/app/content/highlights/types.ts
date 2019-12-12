import { Highlight, HighlightColorEnum } from '@openstax/highlighter/dist/api';

export type HighlightData = Highlight;
export interface SummaryHighlights {
  [chapterId: string]: {[pageId: string]: HighlightData[]};
}

export interface State {
  myHighlightsOpen: boolean;
  enabled: boolean;
  focused?: string;
  highlights: null | HighlightData[];
  summary: {
    filters: {
      colors: HighlightColorEnum[];
      chapters: string[];
    },
    loading: boolean;
    chapterCounts: {[key: string]: number};
    highlights: SummaryHighlights;
  };
}
