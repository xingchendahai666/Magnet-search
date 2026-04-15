/**
 * Nyaa 搜索引擎
 */

module.exports = {
  name: 'nyaa',
  tier: 'tier2',
  description: 'Nyaa.si RSS Feed',
  
  async search(query, options = {}) {
    try {
      const encodedQuery = encodeURIComponent(query);
      const url = `https://nyaa.si/?page=rss&q=${encodedQuery}&f=0`;
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const xmlText = await response.text();
      const results = this.parseRSS(xmlText);
      
      return {
        results: results.map(item => ({
          name: item.title,
          infoHash: item.infoHash,
          magnet: item.magnet,
          size: item.size,
          seeders: item.seeders || 0,
          leechers: item.leechers || 0,
          verified: false,
          source: 'nyaa'
        }))
      };
    } catch (error) {
      console.error('Nyaa search error:', error);
      return { results: [] };
    }
  },

  parseRSS(xmlText) {
    const items = [];
    const itemRegex = /<item>([\s\S]*?)<\/item>/g;
    let match;
    
    while ((match = itemRegex.exec(xmlText)) !== null) {
      const itemContent = match[1];
      
      const title = this.extractTag(itemContent, 'title');
      const link = this.extractTag(itemContent, 'link');
      const description = this.extractTag(itemContent, 'description');
      
      const infoHashMatch = link.match(/\/([a-f0-9]{40})/i);
      const infoHash = infoHashMatch ? infoHashMatch[1] : null;
      
      if (title && infoHash) {
        items.push({
          // ✅ 修复：使用简单字符串替换，避免复杂正则
          title: this.cleanTitle(title),
          infoHash,
          magnet: `magnet:?xt=urn:btih:${infoHash}`,
          size: this.extractSize(description),
          seeders: this.extractNumber(description, 'Seeders'),
          leechers: this.extractNumber(description, 'Leechers')
        });
      }
    }
    
    return items;
  },

  // ✅ 新增：安全的标题清理函数
  cleanTitle(title) {
    if (!title) return '';
    // 简单替换 CDATA 标签，不用复杂正则
    return title
      .replace('<![CDATA[', '')
      .replace(']]>', '')
      .trim();
  },

  extractTag(xml, tagName) {
    const regex = new RegExp(`<${tagName}>([^<]*)</${tagName}>`, 'i');
    const match = xml.match(regex);
    return match ? match[1].trim() : '';
  },

  extractSize(description) {
    const match = description.match(/Size:\s*([0-9.]+\s*[KMGT]?i?B)/i);
    return match ? match[1] : 'Unknown';
  },

  extractNumber(description, label) {
    const match = description.match(new RegExp(`${label}:\\s*(\\d+)`, 'i'));
    return match ? parseInt(match[1]) : 0;
  }
};
