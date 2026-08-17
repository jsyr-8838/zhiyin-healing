/**
 * 天籁 — LRC 歌词解析器
 * 基于 Mineradio index.html 的 parseLyricText / parseYrcText / finalizeLyricLineDurations 逻辑
 * 精简重写为纯 TypeScript
 */

export interface LyricLine {
  /** 起始时间（秒） */
  t: number;
  /** 结束时间（秒，由 finalize 计算） */
  end?: number;
  /** 歌词文本 */
  text: string;
  /** 来源格式 */
  source: 'lrc' | 'yrc';
  /** 逐字时间（YRC 格式），单位 ms */
  words?: WordTime[];
}

export interface WordTime {
  start: number;
  duration: number;
  text: string;
}

/** LRC 时间标签 → 秒数 */
function lyricTagTimeToSeconds(min: string, sec: string, ms?: string): number {
  const m = parseInt(min, 10) || 0;
  const s = parseInt(sec, 10) || 0;
  let sub = 0;
  if (ms) {
    const raw = parseInt(ms, 10) || 0;
    // LRC 支持 2 位或 3 位毫秒
    sub = ms.length === 2 ? raw / 100 : raw / 1000;
  }
  return m * 60 + s + sub;
}

/** 根据 t 排序并补充 end 时间 */
function finalizeLyricLineDurations(lines: LyricLine[]): LyricLine[] {
  if (!lines.length) return lines;
  // 按时间排序
  lines.sort((a, b) => a.t - b.t);
  for (let i = 0; i < lines.length - 1; i++) {
    lines[i].end = lines[i + 1].t;
  }
  // 最后一行 end 设为 当前 +5s
  const last = lines[lines.length - 1];
  last.end = last.t + 5;
  return lines;
}

/** 解析 LRC 格式歌词
 *  格式：[mm:ss.xx]歌词文本，支持多时间标签
 */
export function parseLyricText(text: string): LyricLine[] {
  const lines: LyricLine[] = [];
  const reg = /\[(\d{1,2}):(\d{1,2})(?:\.(\d{1,3}))?\]/g;

  text.split(/\r?\n/).forEach((line) => {
    const times: number[] = [];
    let m: RegExpExecArray | null;
    reg.lastIndex = 0;
    while ((m = reg.exec(line))) {
      times.push(lyricTagTimeToSeconds(m[1], m[2], m[3]));
    }
    if (!times.length) return;
    const txt = line.replace(reg, '').trim();
    if (!txt) return;
    times.forEach((t) => {
      lines.push({ t, text: txt, source: 'lrc' });
    });
  });

  return finalizeLyricLineDurations(lines);
}

/** 解析 YRC（逐字歌词）格式
 *  格式：[lineStartMs,lineDurMs](wordStartMs,wordDurMs,flag)wordText...
 */
export function parseYrcText(text: string): LyricLine[] {
  const lines: LyricLine[] = [];

  String(text || '')
    .split(/\r?\n/)
    .forEach((line) => {
      const m = line.match(/^\[(\d+),(\d+)\](.*)$/);
      if (!m) return;
      const lineStartMs = parseInt(m[1], 10) || 0;
      const lineDurMs = parseInt(m[2], 10) || 0;
      const body = m[3] || '';

      const words: WordTime[] = [];
      let fullText = '';
      const reg = /\((\d+),(\d+),\d+\)([^()]*)/g;
      let wm: RegExpExecArray | null;
      while ((wm = reg.exec(body))) {
        const txt = (wm[3] || '').replace(/\s+/g, ' ');
        if (!txt) continue;
        words.push({
          start: parseInt(wm[1], 10) || 0,
          duration: parseInt(wm[2], 10) || 0,
          text: txt,
        });
        fullText += txt;
      }

      if (!fullText.trim()) return;

      lines.push({
        t: lineStartMs / 1000,
        end: (lineStartMs + lineDurMs) / 1000,
        text: fullText.trim(),
        source: 'yrc',
        words,
      });
    });

  return finalizeLyricLineDurations(lines);
}

/** 自动检测并解析歌词（LRC / YRC） */
export function parseLyrics(text: string): LyricLine[] {
  if (!text || !text.trim()) return [];
  // YRC 格式检测：首行匹配 [数字,数字](...)
  if (/^\[\d+,\d+\]\(/.test(text.trim())) {
    return parseYrcText(text);
  }
  return parseLyricText(text);
}

/** 根据当前播放时间获取当前歌词行索引 */
export function findCurrentLineIndex(lines: LyricLine[], currentTime: number): number {
  if (!lines.length) return -1;
  // 二分查找
  let lo = 0, hi = lines.length - 1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    const line = lines[mid];
    if (currentTime < line.t) {
      hi = mid - 1;
    } else if (line.end != null && currentTime >= line.end) {
      lo = mid + 1;
    } else {
      return mid;
    }
  }
  // 如果超出了最后一行
  if (lo >= lines.length) return lines.length - 1;
  return hi >= 0 ? hi : 0;
}

/** 格式化秒数为 mm:ss */
export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}
