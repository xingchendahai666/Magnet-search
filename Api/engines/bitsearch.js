/**
 * BitSearch 引擎 - Vercel 优化版
 */
const axios = require('axios');
const cheerio = require('cheerio');

class BitSearchEngine {
  constructor() {
    this.name = 'bitsearch';
    this.tier = 'tier3';
    this.baseUrl = 'https://bitsearch.to';
  }

  async search(query, options = {}) {
    const url = `${this.baseUrl}/search?q=${encodeURIComponent(query)}&sort=seeders`;
    
    try {
      const response = await axios.get(url, {
        timeout: 15000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.0',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5'
        }
      });

      return this.parseHTML(response.data);

    } catch (error) {
      throw new Error(`BitSearch crawl failed: ${error.message}`);
    }
  }

  parseHTML(html) {
    const $ = cheerio.load(html);
    const results = [];

    $('.search-result').each((i, elem) => {
      const $elem = $(elem);
      
      const titleEl = $elem.find('.title a');
      const name = titleEl.text().trim();
      const magnetEl = $elem.find('a[href^="magnet:"]');
      const magnet = magnetEl.attr('href') || '';
      const infoHash = this.extractInfoHash(magnet);
      
      const seeders = this.parseNumber($elem.find('.stats .seeders').text());
      const leechers = this.parseNumber($elem.find('.stats .leechers').text());
      const sizeText = $elem.find('.size').text().trim();
      const size = this.parseSize(sizeText);

      if (name && magnet) {
        results.push({
          name,
          infoHash,
          magnet,
          seeders,
          leechers,
          size,
          sizeText,
          category: $elem.find('.category').text().trim(),
          uploaded: $elem.find('.date').text().trim()
        });
      }
    });

    return { results, total: results.length };
  }

  extractInfoHash(magnet) {
    if (!magnet) return null;
    const match = magnet.match(/xt=urn:btih:([a-fA-F0-9]{40})/i);
    return match ? match[1].toLowerCase() : null;
  }

  parseNumber(text) {
    const num = parseInt(text.replace(/[^\d]/g, ''));
    return isNaN(num) ? 0 : num;
  }

  parseSize(sizeStr) {
    const units = {
      'B': 1, 'KB': 1000, 'MB': 1000**2, 'GB': 1000**3, 'TB': 1000**4,
      'KiB': 1024, 'MiB': 1024**2, 'GiB': 1024**3, 'TiB': 1024**4
    };
    const match = sizeStr.match(/^([\d.]+)\s*(B|KB|MB|GB|TB|KiB|MiB|GiB|TiB)$/i);
    if (!match) return 0;
    return Math.round(parseFloat(match[1]) * (units[match[2]] || 1));
  }

  async healthCheck() {
    try {
      const start = Date.now();
      const response = await axios.get(this.baseUrl, {
        timeout: 10000,
        validateStatus: () => true
      });
      return {
        status: response.status === 200 ? 'healthy' : 'degraded',
        responseTime: Date.now() - start
      };
    } catch (error) {
      return { status: 'unhealthy', error: error.message };
    }
  }
}

module.exports = new BitSearchEngine();

