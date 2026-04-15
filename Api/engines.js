/**
 * 引擎列表 API
 */
module.exports = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  const engineList = [
    { name: 'thepiratebay', tier: 'tier1', description: 'The Pirate Bay Official API' },
    { name: 'nyaa', tier: 'tier2', description: 'Nyaa.si RSS Feed' },
    { name: 'bitsearch', tier: 'tier3', description: 'BitSearch Crawler' },
    { name: 'solidtorrents', tier: 'tier3', description: 'Solid Torrents' },
    { name: 'yts', tier: 'tier1', description: 'YTS API' },
    { name: 'eztv', tier: 'tier2', description: 'EZTV API' }
  ];

  res.json({ engines: engineList, total: engineList.length });
};
