export interface TorrentResult {
  id: string;
  name: string;
  size: string;
  seeders: number;
  leechers: number;
  uploadDate: string;
  magnetLink: string;
  torrentUrl?: string;
  source: string;
}

export interface SearchResponse {
  results: TorrentResult[];
  error?: string;
}
