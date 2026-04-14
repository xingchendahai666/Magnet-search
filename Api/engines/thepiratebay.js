/**
 * ThePirateBay 引擎 - Vercel 优化版
 */
const axios = require('axios');

class ThePirateBayEngine {
  constructor() {
    this.name = 'thepiratebay';
    this.tier = 'tier1';
    this.baseUrls = [
      'https://apibay.org',
      'https://piratebay.live',
      'https://thepiratebay.org'
    ];
    this.currentUrlIndex = 0;
  }

  get baseUrl() {
    return this.baseUrls[this.currentUrlIndex];
  }

  async search(query, options = {}) {
    const { categories = ['all'] } = options;
    const category = categories[0] === 'all' ? '0' : '0';
    
    try {
      const url = `${this.baseUrl}/q.php?q=${encodeURIComponent(query)}&cat=${category}`;
      
      const response = await axios.get(url, {
        timeout: 8000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      return this.parseResults(response.data);

    } catch (error) {
      // 尝试下一个镜像
      this.currentUrlIndex = (this.currentUrlIndex + 1) % this.baseUrls.length;
      throw error;
    }
  }

  parseResults(data) {
    if (!Array.isArray(data)) {
      return { results: [], total: 0 };
    }

    const results = data
      .filter(item => item.id !== '0')
      .map(item => ({
        name: item.name,
        infoHash: item.info_hash,
        magnet: `magnet:?xt=urn:btih:${item.info_hash}&dn=${encodeURIComponent(item.name)}&tr=udp://tracker.opentrackr.org:1337/announce`,
        seeders: parseInt(item.seeders) || 0,
        leechers: parseInt(item.leechers) || 0,
        size: parseInt(item.size) || 0,
        category: item.category,
        uploaded: item.added,
        verified: item.status === 'trusted' || item.status === 'vip',
        imdb: item.imdb || null
      }));

    return { results, total: results.length };
  }

  async healthCheck() {
    try {
      const start = Date.now();
      await axios.get(`${this.baseUrl}/q.php?q=test&cat=0`, {
        timeout: 5000
      });
      return { status: 'healthy', responseTime: Date.now() - start };
    } catch (error) {
      return { status: 'unhealthy', error: error.message };
    }
  }
}

module.exports = new ThePirateBayEngine();

