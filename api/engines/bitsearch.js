module.exports = {
  name: 'bitsearch',
  tier: 'tier3',
  description: 'BitSearch 爬虫',
  
  async search(query, options = {}) {
    try {
      const encodedQuery = encodeURIComponent(query);
      const url = `https://bitsearch.to/search?q=${encodedQuery}&sort=seeders`;
      
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
          source: 'bitsearch'
        }))
      };
    } catch (error) {
      console.error('BitSearch search error:', error);
      return { results: [] };
    }
  },

  parseHTML(html) {
    const results = [];
    const regex = /magnet:\?xt=urn:btih:([a-f0-9]{40})/gi;
    let match;
    
    while ((match = regex.exec(html)) !== null) {
      results.push({
        name: 'BitSearch Result',
        infoHash: match[1]
      });
    }
    
    return results.filter((v, i, a) => a.findIndex(t => t.infoHash === v.infoHash) === i).slice(0, 20);
  }
};
