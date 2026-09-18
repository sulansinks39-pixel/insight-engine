export type Paper = {
  index: number;
  id: string;
  title: string;
  year: number | null;
  authors: string[];
  venue: string | null;
  citationCount: number;
  doi: string | null;
  url: string;
  abstract: string;
  type: string;
};
