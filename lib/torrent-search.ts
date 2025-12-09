import { TorrentResult } from './types';
import { fetchWithDoH, testMirrorAccess } from './doh-resolver';

// Torrent mirror sites
const MIRRORS = {
  '1337x': [
    'https://1337x.to',
    'https://1337x.st',
    'https://x1337x.ws',
    'https://x1337x.eu',
    'https://x1337x.se',
    'https://1337x.is',
    'https://1337x.gd',
  ],
  nyaa: [
    'https://nyaa.si',
    'https://nyaa.land',
  ],
};

async function findWorkingMirror(mirrors: string[]): Promise<string | null> {
  // Try all mirrors in parallel, return first working one
  const results = await Promise.allSettled(
    mirrors.map(async (mirror) => {
      const isWorking = await testMirrorAccess(mirror);
      if (isWorking) return mirror;
      throw new Error('Mirror not accessible');
    })
  );
  
  for (const result of results) {
    if (result.status === 'fulfilled') {
      return result.value;
    }
  }
  return null;
}


// Interfaces for API responses
interface TPBResult {
  id: string;
  name: string;
  info_hash: string;
  leechers: string;
  seeders: string;
  num_files: string;
  size: string;
  username: string;
  added: string;
  status: string;
  category: string;
  imdb: string;
}

interface YTSResult {
  data: {
    movies?: Array<{
      id: number;
      title: string;
      year: number;
      torrents: Array<{
        url: string;
        hash: string;
        quality: string;
        type: string;
        seeds: number;
        peers: number;
        size: string;
        size_bytes: number;
        date_uploaded: string;
      }>;
    }>;
  };
}

function formatBytes(bytes: number, decimals = 2) {
  if (!+bytes) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

async function searchTPB(query: string): Promise<TorrentResult[]> {
  try {
    const response = await fetchWithDoH(`https://apibay.org/q.php?q=${encodeURIComponent(query)}`);
    if (!response.ok) {
      return [];
    }
    const data: TPBResult[] = await response.json();

    if (!data || data.length === 0 || data[0]?.name === 'No results returned') {
      return [];
    }

    return data.slice(0, 50).map((item) => ({
      id: `tpb-${item.id}`,
      name: item.name,
      size: formatBytes(parseInt(item.size)),
      seeders: parseInt(item.seeders) || 0,
      leechers: parseInt(item.leechers) || 0,
      uploadDate: new Date(parseInt(item.added) * 1000).toISOString().split('T')[0],
      magnetLink: `magnet:?xt=urn:btih:${item.info_hash}&dn=${encodeURIComponent(item.name)}&tr=udp://tracker.opentrackr.org:1337&tr=udp://open.stealth.si:80/announce&tr=udp://tracker.torrent.eu.org:451/announce&tr=udp://tracker.bittor.pw:1337/announce&tr=udp://public.popcorn-tracker.org:6969/announce&tr=udp://tracker.dler.org:6969/announce&tr=udp://exodus.desync.com:6969&tr=udp://open.demonii.com:1337/announce`,
      source: 'TPB',
    }));
  } catch (error) {
    console.error('TPB search error:', error);
    return [];
  }
}

async function searchYTS(query: string): Promise<TorrentResult[]> {
  try {
    const response = await fetchWithDoH(`https://yts.mx/api/v2/list_movies.json?query_term=${encodeURIComponent(query)}&limit=20`);
    if (!response.ok) {
      return [];
    }
    const data: YTSResult = await response.json();

    if (!data.data?.movies) {
      return [];
    }

    const results: TorrentResult[] = [];
    const trackers = '&tr=udp://open.demonii.com:1337/announce&tr=udp://tracker.openbittorrent.com:80&tr=udp://tracker.coppersurfer.tk:6969&tr=udp://glotorrents.pw:6969/announce&tr=udp://tracker.opentrackr.org:1337/announce&tr=udp://torrent.gresille.org:80/announce&tr=udp://p4p.arenabg.com:1337&tr=udp://tracker.leechers-paradise.org:6969';

    data.data.movies.forEach((movie) => {
      movie.torrents.forEach((torrent) => {
        results.push({
          id: `yts-${movie.id}-${torrent.hash}`,
          name: `${movie.title} (${movie.year}) [${torrent.quality}] [${torrent.type}]`,
          size: torrent.size,
          seeders: torrent.seeds || 0,
          leechers: torrent.peers || 0,
          uploadDate: torrent.date_uploaded?.split(' ')[0] || 'Unknown',
          magnetLink: `magnet:?xt=urn:btih:${torrent.hash}&dn=${encodeURIComponent(movie.title)}${trackers}`,
          source: 'YTS',
          torrentUrl: torrent.url,
        });
      });
    });

    return results;
  } catch (error) {
    console.error('YTS search error:', error);
    return [];
  }
}

// Parse 1337x search results
async function search1337x(query: string): Promise<TorrentResult[]> {
  const results: TorrentResult[] = [];
  
  try {
    const mirror = await findWorkingMirror(MIRRORS['1337x']);
    if (!mirror) {
      console.warn('No working 1337x mirror found');
      return results;
    }

    const searchUrl = `${mirror}/search/${encodeURIComponent(query)}/1/`;
    const response = await fetchWithDoH(searchUrl);
    if (!response.ok) return results;
    
    const html = await response.text();

    // Parse the HTML to extract torrent info - look for table rows with torrent data
    const tableMatch = html.match(/<tbody>[\s\S]*?<\/tbody>/);
    if (!tableMatch) return results;
    
    const rows = tableMatch[0].match(/<tr>[\s\S]*?<\/tr>/g) || [];

    // Process up to 10 results to avoid too many requests
    for (const row of rows.slice(0, 10)) {
      const nameMatch = row.match(/<a href="\/torrent\/[^"]+\/([^"]+)\/"[^>]*>([^<]+)<\/a>/) ||
                        row.match(/<a href="\/torrent\/[^"]+">([^<]+)<\/a>/);
      const linkMatch = row.match(/href="(\/torrent\/[^"]+\/)"/);
      const sizeMatch = row.match(/<td class="coll-4[^"]*"[^>]*>([^<]+)<span/) ||
                        row.match(/<td[^>]*class="[^"]*size[^"]*"[^>]*>([^<]+)/);
      const seedersMatch = row.match(/<td class="coll-2[^"]*">(\d+)<\/td>/) ||
                          row.match(/seeds[^>]*>(\d+)</i);
      const leechersMatch = row.match(/<td class="coll-3[^"]*">(\d+)<\/td>/) ||
                           row.match(/leeches[^>]*>(\d+)</i);

      if (linkMatch) {
        const detailUrl = `${mirror}${linkMatch[1]}`;
        const name = nameMatch ? (nameMatch[2] || nameMatch[1]).trim().replace(/-/g, ' ') : 'Unknown';

        // Get magnet link from detail page
        try {
          const detailResponse = await fetchWithDoH(detailUrl);
          if (!detailResponse.ok) continue;
          
          const detailHtml = await detailResponse.text();
          const magnetMatch = detailHtml.match(/href="(magnet:\?xt=urn:btih:[^"]+)"/);
          
          if (magnetMatch) {
            results.push({
              id: `1337x-${Date.now()}-${results.length}`,
              name,
              size: sizeMatch ? sizeMatch[1].trim() : 'Unknown',
              seeders: seedersMatch ? parseInt(seedersMatch[1]) : 0,
              leechers: leechersMatch ? parseInt(leechersMatch[1]) : 0,
              uploadDate: 'Unknown',
              magnetLink: magnetMatch[1],
              source: '1337x',
            });
          }
        } catch {
          // Skip if can't get magnet
        }
      }
    }
  } catch (error) {
    console.error('1337x search error:', error);
  }

  return results;
}

// Parse Nyaa search results (anime torrents)
async function searchNyaa(query: string): Promise<TorrentResult[]> {
  const results: TorrentResult[] = [];

  try {
    const mirror = await findWorkingMirror(MIRRORS.nyaa);
    if (!mirror) {
      console.warn('No working Nyaa mirror found');
      return results;
    }

    const searchUrl = `${mirror}/?f=0&c=0_0&q=${encodeURIComponent(query)}`;
    const response = await fetchWithDoH(searchUrl);
    if (!response.ok) return results;
    
    const html = await response.text();

    // Parse the HTML - look for table body
    const tableMatch = html.match(/<tbody>[\s\S]*?<\/tbody>/);
    if (!tableMatch) return results;
    
    const rows = tableMatch[0].match(/<tr[^>]*>[\s\S]*?<\/tr>/g) || [];

    for (const row of rows.slice(0, 20)) {
      // Look for title in the second column
      const titleMatch = row.match(/title="([^"]+)"[^>]*>[^<]*<\/a>\s*<\/td>/);
      const nameMatch = titleMatch || row.match(/<a href="\/view\/\d+"[^>]*>([^<]+)<\/a>/);
      const magnetMatch = row.match(/href="(magnet:\?[^"]+)"/);
      
      // Size is typically in the 4th td
      const tds = row.match(/<td[^>]*>([^<]*)<\/td>/g) || [];
      const sizeText = tds[3]?.replace(/<[^>]+>/g, '').trim() || 'Unknown';
      
      // Seeders (green) and leechers (red)
      const seedersMatch = row.match(/text-success[^>]*>(\d+)</);
      const leechersMatch = row.match(/text-danger[^>]*>(\d+)</);

      if (magnetMatch) {
        const name = nameMatch ? (nameMatch[1] || '').trim() : 'Unknown';
        results.push({
          id: `nyaa-${Date.now()}-${results.length}`,
          name: name || 'Unknown',
          size: sizeText,
          seeders: seedersMatch ? parseInt(seedersMatch[1]) : 0,
          leechers: leechersMatch ? parseInt(leechersMatch[1]) : 0,
          uploadDate: 'Unknown',
          magnetLink: magnetMatch[1],
          source: 'Nyaa',
        });
      }
    }
  } catch (error) {
    console.error('Nyaa search error:', error);
  }

  return results;
}

export async function searchTorrents(
  query: string
): Promise<TorrentResult[]> {
  if (!query.trim()) return [];

  // Run searches with individual error handling so one failure doesn't break others
  const searchPromises = [
    searchTPB(query).catch((e) => { console.error('TPB error:', e); return []; }),
    searchYTS(query).catch((e) => { console.error('YTS error:', e); return []; }),
    search1337x(query).catch((e) => { console.error('1337x error:', e); return []; }),
    searchNyaa(query).catch((e) => { console.error('Nyaa error:', e); return []; }),
  ];

  const [tpbResults, ytsResults, results1337x, resultsNyaa] = await Promise.all(searchPromises);

  const results = [
    ...tpbResults,
    ...ytsResults,
    ...results1337x,
    ...resultsNyaa
  ];

  // Sort by seeders (descending)
  return results.sort((a, b) => b.seeders - a.seeders);
}

