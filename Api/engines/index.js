/**
 * 引擎统一导出
 */
module.exports = {
  thepiratebay: require('./thepiratebay'),
  nyaa: require('./nyaa'),
  bitsearch: require('./bitsearch'),
  // 添加更多引擎...
  solidtorrents: require('./bitsearch'), // 临时使用相同实现
  kickass: require('./bitsearch'),
  yts: require('./thepiratebay'),
  eztv: require('./thepiratebay')
};
