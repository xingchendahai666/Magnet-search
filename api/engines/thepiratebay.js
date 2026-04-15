/**
 * ThePirateBay 搜索引擎
 */

export default {
  name: 'thepiratebay',
  tier: 'tier1',
  description: '海盗湾官方 API',
  
  async search(query, options = {}) {
    try {
      // 使用原生 fetch 替代 axios
      const encodedQuery = encodeURIComponent(query);
      const url = `https://apibay.org/q.php?q=${encodedQuery}&cat=0`;
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      
      // 过滤无效结果
      const results = Array.isArray(data) ? data.filter(item => item.id !== '0') : [];
      
      return {
        results: results.map(item => ({
          name: item.name,
          infoHash: item.info_hash,
          magnet: `magnet:?xt=urn:btih:${item.info_hash}`,
          size: this.formatSize(parseInt(item.size)),
          seeders: parseInt(item.seeders) || 0,
          leechers: parseInt(item.leechers) || 0,
          verified: item.status === 'trusted' || item.status === 'vip',
          source: 'thepiratebay'
        }))
      };
    } catch (error) {
      console.error('ThePirateBay search error:', error);
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
