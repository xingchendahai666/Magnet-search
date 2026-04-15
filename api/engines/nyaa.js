/**
 * Nyaa 引擎 - Vercel 优化版
 */
const axios = require('axios');
const xml2js = require('xml2js');

class NyaaEngine {
  constructor() {
    this.name = 'nyaa';
    this.tier = 'tier2';
    this.baseUrl = 'https://nyaa.si';
  }

  async search(query, options = {}) {
    const { categories = ['anime'] } = options;
    const categoryMap = {
      all: '0_0',
      anime: '1_0',
      audio: '2_0',
      literature: '3_0',
      live: '4_0',
      pictures: '5_0',
      software: '6_0'
    };
    const cat = categoryMap[categories[0]] || '0_0';
    
    const url = `${this.baseUrl}/?page=rss&q=${encodeURIComponent(query)}&c=${cat}&f=0`;
    
    try {
      const response = await axios.get(url, {
        timeout: 10000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      const parsed = await xml2js.parseStringPromise(response.data, {
        explicitArray: false,
        mergeAttrs: true
      });

      return this.parseRSS(parsed);

    } catch (error) {
      throw new Error(`Nyaa search failed: ${error.message}`);
    }
  }

  parseRSS(data) {
    const items = data.rss?.channel?.item || [];
    const itemArray = Array.isArray(items) ? items : [items];

    const results = itemArray.map(item => {
      const infoHash = item['nyaa:infoHash'] || '';
      const seeders = parseInt(item['nyaa:seeders']) || 0;
      const leechers = parseInt(item['nyaa:leechers']) || 0;
      const size = this.parseSize(item['nyaa:size'] || '0');

      return {
        name: item.title,
        infoHash: infoHash.toLowerCase(),
        magnet: item.link,
        torrentUrl: item.guid,
        seeders,
        leechers,
        size,
        category: item.category,
        uploaded: item.pubDate,
        trusted: item['nyaa:trusted'] === 'Yes',
        remake: item['nyaa:remake'] === 'Yes'
      };
    });

    return { results, total: results.length };
  }

  parseSize(sizeStr) {
    const units = {
      'B': 1, 'KiB': 1024, 'MiB': 1024**2, 'GiB': 1024**3, 'TiB': 1024**4
    };
    const match = sizeStr.match(/^([\d.]+)\s*(B|KiB|MiB|GiB|TiB)$/);
    if (!match) return 0;
    return Math.round(parseFloat(match[1]) * (units[match[2]] || 1));
  }

  async healthCheck() {
    try {
      const start = Date.now();
      await axios.get(this.baseUrl, { timeout: 5000 });
      return { status: 'healthy', responseTime: Date.now() - start };
    } catch (error) {
      return { status: 'unhealthy', error: error.message };
    }
  }
}

module.exports = new NyaaEngine();

