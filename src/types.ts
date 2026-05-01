export type Bindings = {
  DB: D1Database;
  KITS: R2Bucket;
  ASSETS: Fetcher;
};

export type Kit = {
  id: number;
  src: string;
  alt: string;
  team: string;
  year: string;
  type: string;
};
