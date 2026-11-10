import type { SourceConfig } from './types';

// 内置默认高清片源列表（当没有配置环境变量时自动加载）
const HARDCODED_SOURCES = [
  { name: '魔都资源', url: 'https://caiji.moduapi.cc/api.php/provide/vod/' },
  { name: '光速资源', url: 'https://api.guangsuapi.com/api.php/provide/vod/' },
  { name: '量子资源', url: 'https://cj.lziapi.com/api.php/provide/vod/' },
  { name: '红牛资源', url: 'https://www.hongniuzy2.com/api.php/provide/vod/' },
  { name: '暴风资源', url: 'https://bfzyapi.com/api.php/provide/vod/' },
  { name: '金鹰资源', url: 'https://jyzyapi.com/api.php/provide/vod/' },
  { name: '百度云资源', url: 'https://api.apibdzy.com/api.php/provide/vod/' },
  { name: '非凡资源', url: 'http://cj.ffzyapi.com/api.php/provide/vod/' },
];

/**
 * 优先读取环境变量预置源；若未设置，则自动回落到内置的 8 个优质源。
 */
export function getEnvSources(): SourceConfig[] {
  const raw = process.env.DEFAULT_SOURCES;
  
  // 如果没有环境变量，直接返回写好的 8 个优质源
  if (!raw || !raw.trim()) {
    return HARDCODED_SOURCES.map((item, i) => ({
      key: `hardcoded_${i}`,
      name: item.name,
      url: item.url.trim().replace(/\/+$/, ''),
      detail: undefined,
      isAdult: false,
    }));
  }

  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) throw new Error('必须是 JSON 数组');
    const list: SourceConfig[] = parsed.map((item, i) => {
      if (typeof item !== 'object' || item === null) {
        throw new Error(`第 ${i + 1} 项不是对象`);
      }
      const { name, url, detail, isAdult } = item as Record<string, unknown>;
      if (typeof name !== 'string' || !name.trim()) {
        throw new Error(`第 ${i + 1} 项缺少 name`);
      }
      if (typeof url !== 'string' || !/^https?:\/\//.test(url.trim())) {
        throw new Error(`第 ${i + 1} 项的 url 必须以 http:// 或 https:// 开头`);
      }
      return {
        key: `env_${i}`,
        name: name.trim(),
        url: url.trim().replace(/\/+$/, ''),
        detail: typeof detail === 'string' && detail.trim() ? detail.trim() : undefined,
        isAdult: isAdult === true,
      };
    });
    return list;
  } catch (err) {
    console.warn('[LibreTV] DEFAULT_SOURCES 解析失败，已回落至默认源：', err instanceof Error ? err.message : err);
    return HARDCODED_SOURCES.map((item, i) => ({
      key: `fallback_${i}`,
      name: item.name,
      url: item.url.trim().replace(/\/+$/, ''),
      detail: undefined,
      isAdult: false,
    }));
  }
}
