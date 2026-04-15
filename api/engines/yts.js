/**
 * YTS 搜索引擎
 */

export default {
  name: 'yts',
  tier: 'tier1',
  description: 'YTS API',
  
  async search(query, options = {}) {
    try {
      const encodedQuery = encodeURIComponent(query);
      const url = `https://yts.mx/api/v2/list_movies.json?query_term=${encodedQuery}&limit=50`;
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      const movies = data?.data?.movies || [];
      
      const results = [];
      
      movies.forEach(movie => {
        movie.torrents?.forEach(torrent => {
          results.push({
            name: `${movie.title} (${movie.year}) [${torrent.quality}]`,
            infoHash: torrent.hash,
            magnet: `magnet:?xt=urn:btih:${torrent.hash}&dn=${encodeURIComponent(movie.title)}`,
            size: torrent.size,
            seeders: torrent.seeds || 0,
            leechers: torrent.peers || 0,
            verified: true,
            source: 'yts'
          });
        });
      });
      
      return { results };
    } catch (error) {
      console.error('YTS search error:', error);
      return { results: [] };
    }
  }
};

