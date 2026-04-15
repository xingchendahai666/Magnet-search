/**
 * 健康检查 API
 */
const engines = require('./engines');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  const checks = await Promise.all(
    Object.entries(engines).map(async ([name, engine]) => {
      try {
        const start = Date.now();
        await engine.healthCheck();
        return { name, status: 'healthy', responseTime: Date.now() - start };
      } catch (e) {
        return { name, status: 'unhealthy', error: e.message };
      }
    })
  );

  res.json({
    timestamp: Date.now(),
    total: checks.length,
    healthy: checks.filter(c => c.status === 'healthy').length,
    engines: checks
  });
};

