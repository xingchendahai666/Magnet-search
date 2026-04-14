/**
 * SSE流式搜索 - 实时推送搜索结果
 */
const { EventEmitter } = require('events');
const EngineRegistry = require('../../src/engine/EngineRegistry');

class StreamController extends EventEmitter {
  constructor() {
    super();
    this.registry = new EngineRegistry();
    this.activeStreams = new Map();
  }

  /**
   * 建立SSE连接
   */
  async stream(req, res) {
    const { query, engines = [], categories = [] } = req.query;
    
    if (!query) {
      return res.status(400).json({ error: 'Query parameter required' });
    }

    // 设置SSE头
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no'
    });

    const streamId = `stream_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const clientInfo = { res, startTime: Date.now(), resultsCount: 0 };

    this.activeStreams.set(streamId, clientInfo);

    // 发送初始化事件
    this.sendEvent(res, 'init', { streamId, query, timestamp: Date.now() });

    try {
      // 获取引擎
      const selectedEngines = engines.length > 0
        ? this.registry.getEnginesByNames(engines.split(','))
        : this.registry.getAllActiveEngines();

      // 发送引擎信息
      this.sendEvent(res, 'engines', {
        total: selectedEngines.length,
        engines: selectedEngines.map(e => ({ name: e.name, tier: e.tier }))
      });

      // 并行启动所有引擎搜索
      const searchPromises = selectedEngines.map(engine => 
        this.streamEngineResults(engine, query, categories, streamId, res)
      );

      // 等待所有引擎完成
      await Promise.allSettled(searchPromises);

      // 发送完成事件
      this.sendEvent(res, 'complete', {
        streamId,
        totalResults: clientInfo.resultsCount,
        duration: Date.now() - clientInfo.startTime
      });

    } catch (error) {
      this.sendEvent(res, 'error', { message: error.message });
    } finally {
      this.activeStreams.delete(streamId);
      res.end();
    }
  }

  /**
   * 流式获取单个引擎结果
   */
  async streamEngineResults(engine, query, categories, streamId, res) {
    try {
      // 发送引擎开始事件
      this.sendEvent(res, 'engine_start', {
        engine: engine.name,
        tier: engine.tier,
        timestamp: Date.now()
      });

      const startTime = Date.now();
      const results = await engine.search(query, { categories });
      
      // 逐个发送结果
      if (results.results && Array.isArray(results.results)) {
        for (const item of results.results) {
          const enrichedItem = {
            ...item,
            _meta: {
              engine: engine.name,
              tier: engine.tier,
              discoveredAt: Date.now()
            }
          };

          this.sendEvent(res, 'result', enrichedItem);
          
          // 更新计数
          const client = this.activeStreams.get(streamId);
          if (client) client.resultsCount++;
        }
      }

      // 发送引擎完成事件
      this.sendEvent(res, 'engine_complete', {
        engine: engine.name,
        resultCount: results.results?.length || 0,
        responseTime: Date.now() - startTime
      });

    } catch (error) {
      this.sendEvent(res, 'engine_error', {
        engine: engine.name,
        error: error.message,
        timestamp: Date.now()
      });
    }
  }

  /**
   * 发送SSE事件
   */
  sendEvent(res, event, data) {
    const payload = JSON.stringify(data);
    res.write(`event: ${event}\n`);
    res.write(`data: ${payload}\n\n`);
    
    // 立即刷新
    if (res.flush) res.flush();
  }

  /**
   * 关闭指定流
   */
  closeStream(streamId) {
    const client = this.activeStreams.get(streamId);
    if (client) {
      client.res.end();
      this.activeStreams.delete(streamId);
    }
  }
}

module.exports = new StreamController();

