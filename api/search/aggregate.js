/**
 * 聚合搜索控制器 - 协调多个引擎并行搜索
 */
const EngineRegistry = require('../../src/engine/EngineRegistry');
const EngineBalancer = require('../../src/engine/EngineBalancer');
const resultMerger = require('../../src/utils/resultMerger');
const similarityEngine = require('../../src/utils/similarityEngine');

class AggregateController {
  constructor() {
    this.registry = new EngineRegistry();
    this.balancer = new EngineBalancer();
    this.activeSearches = new Map();
  }

  /**
   * 执行聚合搜索
   * @param {Object} req - 请求对象
   * @param {Object} res - 响应对象
   */
  async search(req, res) {
    const { query, categories = [], engines = [], limit = 100, timeout = 30000 } = req.body;
    
    if (!query || query.trim().length === 0) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const searchId = `search_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    try {
      // 获取可用引擎
      const availableEngines = engines.length > 0 
        ? this.registry.getEnginesByNames(engines)
        : this.registry.getAllActiveEngines();

      // 根据负载均衡选择引擎
      const selectedEngines = this.balancer.selectEngines(availableEngines, {
        maxEngines: 20,
        diversity: true
      });

      // 并行执行搜索
      const searchPromises = selectedEngines.map(engine => 
        this.executeEngineSearch(engine, query, categories, timeout)
      );

      const results = await Promise.allSettled(searchPromises);
      
      // 合并结果
      const mergedResults = this.processResults(results, query, limit);
      
      // 去重和排序
      const finalResults = this.deduplicateAndSort(mergedResults);

      res.json({
        searchId,
        query,
        enginesUsed: selectedEngines.map(e => e.name),
        totalResults: finalResults.length,
        results: finalResults.slice(0, limit),
        metadata: {
          searchTime: Date.now(),
          engineStats: this.getEngineStats(results)
        }
      });

    } catch (error) {
      console.error('Aggregate search error:', error);
      res.status(500).json({ 
        error: 'Search failed', 
        message: error.message,
        searchId 
      });
    }
  }

  /**
   * 执行单个引擎搜索
   */
  async executeEngineSearch(engine, query, categories, timeout) {
    const startTime = Date.now();
    
    try {
      const result = await Promise.race([
        engine.search(query, { categories }),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), timeout)
        )
      ]);

      return {
        engine: engine.name,
        tier: engine.tier,
        status: 'fulfilled',
        results: result.results || [],
        responseTime: Date.now() - startTime,
        totalFound: result.total || result.results?.length || 0
      };

    } catch (error) {
      return {
        engine: engine.name,
        tier: engine.tier,
        status: 'rejected',
        error: error.message,
        responseTime: Date.now() - startTime,
        results: []
      };
    }
  }

  /**
   * 处理并合并结果
   */
  processResults(results, query, limit) {
    const allResults = [];
    
    results.forEach(result => {
      if (result.status === 'fulfilled') {
        const value = result.value;
        value.results.forEach(item => {
          allResults.push({
            ...item,
            _meta: {
              engine: value.engine,
              tier: value.tier,
              responseTime: value.responseTime
            }
          });
        });
      }
    });

    return allResults;
  }

  /**
   * 去重和智能排序
   */
  deduplicateAndSort(results) {
    // 使用相似度引擎去重
    const uniqueResults = similarityEngine.deduplicate(results, {
      threshold: 0.85,
      compareFields: ['name', 'infoHash', 'magnet']
    });

    // 智能排序
    return similarityEngine.smartSort(uniqueResults, {
      factors: {
        seeders: 0.3,
        leechers: 0.1,
        verified: 0.2,
        engineTier: 0.15,
        responseTime: 0.1,
        fileSize: 0.15
      }
    });
  }

  /**
   * 获取引擎统计
   */
  getEngineStats(results) {
    const stats = {
      total: results.length,
      successful: 0,
      failed: 0,
      byTier: { tier1: 0, tier2: 0, tier3: 0, tier4: 0 }
    };

    results.forEach(r => {
      const result = r.status === 'fulfilled' ? r.value : r.reason;
      if (r.status === 'fulfilled' && result.status === 'fulfilled') {
        stats.successful++;
      } else {
        stats.failed++;
      }
      if (result.tier) {
        stats.byTier[result.tier] = (stats.byTier[result.tier] || 0) + 1;
      }
    });

    return stats;
  }
}

module.exports = new AggregateController();

