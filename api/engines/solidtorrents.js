/**
 * SolidTorrents 搜索引擎
 */

export default {
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
      const results = this.parseHTML(html);
      
      return {
        results: results.map(item => ({
          name: item.name,
          infoHash: item.infoHash,
          magnet: `magnet:?xt=urn:btih:${item.infoHash}`,
          size: item.size || 'Unknown',
          seeders: item.seeders || 0,
          leechers: item.leechers || 0,
          verified: false,
          source: 'solidtorrents'
        }))
      };
    } catch (error) {
      console.error('SolidTorrents search error:', error);
      return { results: [] };
    }
  },

  parseHTML(html) {
    // 简化实现
    return [];
  }
};

