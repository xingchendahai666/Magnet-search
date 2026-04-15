module.exports = {
  name: 'eztv',
  tier: 'tier2',
  description: 'EZTV API',
  
  async search(query, options = {}) {
    try {
      const encodedQuery = encodeURIComponent(query);
      const url = `https://eztvx.to/api/get-torrents?limit=100&page=1&imdb_id=${encodedQuery}`;
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      const torrents = data?.torrents || [];
      
      return {
        results: torrents.map(item => ({
          name: `${item.title} S${item.season}E${item.episode}`,
          infoHash: item.hash,
          magnet: `magnet:?xt=urn:btih:${item.hash}&dn=${encodeURIComponent(item.title)}`,
          size: this.formatSize(parseInt(item.size_bytes)),
          seeders: item.seeds || 0,
          leechers: 0,
          verified: true,
          source: 'eztv'
        }))
      };
    } catch (error) {
      console.error('EZTV search error:', error);
      return { results: [] };
    }
  },

  formatSize(bytes) {
    if (!bytes || bytes === 0) return 'Unknown';
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    const exp = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
    return `${(bytes / Math.pow(1024, exp)).toFixed(2)} ${units[exp]}`;
  }
};
