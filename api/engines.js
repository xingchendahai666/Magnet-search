/**
 * 引擎列表 API
 */

import engines from './engines/index.js';

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const engineList = Object.entries(engines).map(([name, engine]) => ({
    name,
    tier: engine.tier || 'tier4',
    description: engine.description || name
  }));

  res.json({
    engines: engineList,
    total: engineList.length
  });
}
