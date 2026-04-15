module.exports = {
  name: 'solidtorrents',
  tier: 'tier3',
  description: 'Solid Torrents',
  
  async search(query, options = {}) {
    try {
      const encodedQuery = encodeURIComponent(query);
      const url = `https://solidtorrents.to/search?q=${encodedQuery}`;
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const html = await response.text();
      
      return {
        results: []
      };
    } catch (error) {
      console.error('SolidTorrents search error:', error);
      return { results: [] };
    }
  }
};
