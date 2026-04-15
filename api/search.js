/**
 * 聚合搜索 API - Vercel Serverless Function
 */

const engines = require('./engines');

module.exports = async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // 支持 GET 和 POST
  const params = req.method === 'POST' ? req.body : req.query;
  const { query, engines: selectedEngines = [], categories = [], limit = 50 } = params;

  if (!query || query.trim().length === 0) {
    return res.status(400).json({ error: 'Search query is required' });
  }

  const searchId = `search_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const startTime = Date.now();

  try {
    // 选择引擎
    const enginesToUse = selectedEngines.length > 0
      ? selectedEngines.filter(name => engines[name]).map(name => ({ name, engine: engines[name] }))
      : Object.entries(engines).slice(0, 8).map(([name, engine]) => ({ name, engine }));

    // 并行搜索
    const searchPromises = enginesToUse.map(({ name, engine }) =>
      Promise.race([
        searchWithEngine(name, engine, query, categories),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 25000))
      ])
    );

    const results = await Promise.allSettled(searchPromises);

    // 处理结果
    const allResults = [];
    const engineStats = [];

    results.forEach((result, index) => {
      const engineName = enginesToUse[index].name;
      
      if (result.status === 'fulfilled') {
        const value = result.value;
        allResults.push(...(value.results || []).map(r => ({
          ...r,
          _meta: { engine: engineName, discoveredAt: Date.now() }
        })));
        engineStats.push({ name: engineName, status: 'success', count: value.results?.length || 0 });
      } else {
        engineStats.push({ name: engineName, status: 'error', error: result.reason?.message || 'Unknown error' });
      }
    });

    // 去重和排序
    const uniqueResults = deduplicateResults(allResults);
    const sortedResults = smartSort(uniqueResults).slice(0, parseInt(limit) || 50);

    res.json({
      searchId,
      query: query.trim(),
      totalResults: sortedResults.length,
      results: sortedResults,
      engineStats,
      searchTime: Date.now() - startTime
    });

  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ 
      error: 'Search failed', 
      message: error.message,
      searchId 
    });
  }
};

async function searchWithEngine(name, engine, query, categories) {
  const startTime = Date.now();
  try {
    const results = await engine.search(query, { categories });
    return {
      results: results?.results || [],
      responseTime: Date.now() - startTime
    };
  } catch (error) {
    throw new Error(`${name}: ${error.message}`);
  }
}

function deduplicateResults(results) {
  const seen = new Set();
  return results.filter(r => {
    const key = r.infoHash || r.name?.toLowerCase().trim();
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function smartSort(results) {
  return results.sort((a, b) => {
    const scoreA = (a.seeders || 0) * 2 + (a.verified ? 100 : 0);
    const scoreB = (b.seeders || 0) * 2 + (b.verified ? 100 : 0);
    return scoreB - scoreA;
  });
}
