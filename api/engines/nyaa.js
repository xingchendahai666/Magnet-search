/**
 * Nyaa 搜索引擎 - ES Module
 */

export default {
  name: 'nyaa',
  tier: 'tier2',
  description: 'Nyaa.si RSS Feed',
  
  async search(query, options = {}) {
    try {
      // RSS 搜索实现
      const encodedQuery = encodeURIComponent(query);
      const url = `https://nyaa.si/?page=rss&q=${encodedQuery}&f=0`;
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.0'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const text = await response.text();
      
      // 简单的 RSS 解析
      const results = parseRSS(text);
      
      return {
        results: results.map(item => ({
          name: item.title,
          infoHash: item.infoHash,
          magnet: item.magnet,
          size: parseSize(item.size),
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
  }
};

function parseRSS(xmlText) {
  // 简化的 RSS 解析
  const items = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match;
  
  while ((match = itemRegex.exec(xmlText)) !== null) {
    const itemContent = match[1];
    
    const title = extractTag(itemContent, 'title');
    const link = extractTag(itemContent, 'link');
    const description = extractTag(itemContent, 'description');
    
    // 从链接提取 infoHash
    const infoHashMatch = link.match(/\/([a-f0-9]{40})/i);
    const infoHash = infoHashMatch ? infoHashMatch[1] : null;
    
    if (title && infoHash) {
      items.push({
        title: title.replace(/<!
 $$CDATA
 $$|$$ $$ >/g, ''),
        infoHash,
        magnet: `magnet:?xt=urn:btih:${infoHash}`,
        size: extractSize(description),
        seeders: extractNumber(description, 'Seeders'),
        leechers: extractNumber(description, 'Leechers')
      });
    }
  }
  
  return items;
}

function extractTag(xml, tagName) {
  const regex = new RegExp(`<${tagName}>([^<]*)</${tagName}>`, 'i');
  const match = xml.match(regex);
  return match ? match[1].trim() : '';
}

function extractSize(description) {
  const match = description.match(/Size:\s*([0-9.]+\s*[KMGT]?i?B)/i);
  return match ? match[1] : 'Unknown';
}

function extractNumber(description, label) {
  const match = description.match(new RegExp(`${label}:\\s*(\\d+)`, 'i'));
  return match ? parseInt(match[1]) : 0;
}

function parseSize(sizeStr) {
  // 简化处理，返回字符串
  return sizeStr;
}
