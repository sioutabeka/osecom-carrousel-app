export interface ArticleSection {
  heading: string;
  content: string;
}

export interface ArticleTable {
  headers: string[];
  rows: string[][];
}

export interface ArticleTip {
  label: string;
  text: string;
}

export interface ArticlePullquote {
  quote: string;
  author: string;
}

export interface Article {
  slug: string;
  url: string;
  title: string;
  tag: string;
  date_published: string;
  date_label: string;
  reading_time: string;
  description: string;
  summary: string;
  sections: ArticleSection[];
  table?: ArticleTable;
  tips?: ArticleTip[];
  pullquote?: ArticlePullquote;
  errors?: string[];
  related?: string[];
}

export interface ArticleIndexEntry {
  slug: string;
  title: string;
  tag: string;
  summary: string;
  has_table: boolean;
  keywords: string[];
  topics: string[];
}

export interface ArticleIndex {
  meta: {
    source: string;
    brand: string;
    context: string;
    tone: string;
    count: number;
    tags: string[];
  };
  instructions: string;
  index: ArticleIndexEntry[];
}
