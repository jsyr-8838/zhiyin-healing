/**
 * 五行音乐分类助手
 * 
 * 扫描 F:\heytcm-audio\ 下的所有音频文件，
 * 根据文件名用 AI 辅助归入五行（木-角/火-徵/土-宫/金-商/水-羽）。
 * 
 * 使用方式：
 *   npx tsx scripts/classify-wuxing-audio.ts [--scan] [--ai] [--generate]
 * 
 * --scan      仅扫描并列出所有文件
 * --ai        调用 AI 对文件名进行五行分类（需要 LLM_API_KEY）
 * --generate  生成 healing-music-catalog.ts 的扩展数据 JSON
 */

import { readdir, stat, writeFile } from 'fs/promises';
import { join, extname, basename } from 'path';
import { existsSync } from 'fs';

const AUDIO_ROOT = process.env.WUXING_AUDIO_ROOT || 'F:\\heytcm-audio';
const ELEMENTS = ['wood', 'fire', 'earth', 'metal', 'water'] as const;
type Element = typeof ELEMENTS[number];

const ELEMENT_LABELS: Record<Element, { name: string; tone: string; color: string }> = {
  wood:  { name: '木', tone: '角', color: '#5d8a63' },
  fire:  { name: '火', tone: '徵', color: '#c26158' },
  earth: { name: '土', tone: '宫', color: '#c9a94f' },
  metal: { name: '金', tone: '商', color: '#5ba09a' },
  water: { name: '水', tone: '羽', color: '#3d7a75' },
};

const AUDIO_EXTENSIONS = new Set(['.mp3', '.wav', '.ogg', '.flac', '.m4a', '.aac']);

interface AudioFile {
  filename: string;
  element: Element;
  fullPath: string;
  sizeBytes: number;
  aiSuggestion?: Element;
  confidence?: number;
}

async function scanFiles(): Promise<AudioFile[]> {
  const files: AudioFile[] = [];

  for (const element of ELEMENTS) {
    const dir = join(AUDIO_ROOT, element);
    if (!existsSync(dir)) continue;

    const entries = await readdir(dir);
    for (const entry of entries) {
      const ext = extname(entry).toLowerCase();
      if (!AUDIO_EXTENSIONS.has(ext)) continue;

      const fullPath = join(dir, entry);
      const fileStat = await stat(fullPath);
      files.push({
        filename: basename(entry, ext),
        element,
        fullPath,
        sizeBytes: fileStat.size,
      });
    }
  }

  return files;
}

async function aiClassify(filenames: string[]): Promise<Map<string, { element: Element; confidence: number }>> {
  const apiKey = process.env.LLM_API_KEY;
  const apiBase = process.env.LLM_API_BASE || 'https://integrate.api.nvidia.com/v1';
  const model = process.env.LLM_MODEL || 'deepseek-ai/deepseek-r1';

  const result = new Map<string, { element: Element; confidence: number }>();

  if (!apiKey) {
    console.log('[WARN] LLM_API_KEY 未设置，跳过 AI 分类');
    return result;
  }

  // Batch classify in groups of 30
  const batchSize = 30;
  for (let i = 0; i < filenames.length; i += batchSize) {
    const batch = filenames.slice(i, i + batchSize);
    const list = batch.map((f, idx) => `${idx + 1}. ${f}`).join('\n');

    const systemPrompt = `你是中医五行音乐分类专家。根据曲目名称判断其五行归属。
规则：
- 木-角音：舒缓流畅、春天、肝胆相关、如泉水般流淌
- 火-徵音：热情奔放、夏天、心小肠相关、如火焰般升腾
- 土-宫音：稳定和谐、长夏、脾胃相关、如大地般厚重
- 金-商音：清脆高亢、秋天、肺大肠相关、如钟声般回荡
- 水-羽音：深沉静谧、冬天、肾膀胱相关、如流水般沉静

只输出 JSON：{"classifications":[{"index":number,"element":"wood|fire|earth|metal|water","confidence":0-1}]}`;

    try {
      const response = await fetch(`${apiBase}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: `请分类以下曲目：\n${list}` },
          ],
          max_tokens: 2000,
          temperature: 0.3,
          response_format: { type: 'json_object' },
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const content = data.choices?.[0]?.message?.content;
        if (content) {
          try {
            const parsed = JSON.parse(content);
            if (Array.isArray(parsed.classifications)) {
              for (const c of parsed.classifications) {
                const idx = (c.index as number) - 1;
                if (idx >= 0 && idx < batch.length && ELEMENTS.includes(c.element)) {
                  result.set(batch[idx], { element: c.element, confidence: c.confidence || 0.5 });
                }
              }
            }
          } catch {}
        }
      }
    } catch (err) {
      console.error('[ERROR] AI classification batch failed:', err);
    }
  }

  return result;
}

function generateCatalogData(files: AudioFile[]): object[] {
  return files.map((f, idx) => {
    const el = f.aiSuggestion || f.element;
    const label = ELEMENT_LABELS[el];
    const ext = extname(f.fullPath).toLowerCase().slice(1);
    return {
      id: `wuxing300-${el}-${String(idx + 1).padStart(3, '0')}`,
      title: f.filename,
      subtitle: `${label.name}行·${label.tone}音`,
      src: `/api/wuxing-audio/${el}/${f.filename}.${ext}`,
      instrument: 'mix' as const,
      element: el,
      color: label.color,
      credit: '五行养生音源（个人研究用）',
    };
  });
}

async function main() {
  const args = process.argv.slice(2);
  const doScan = args.includes('--scan');
  const doAi = args.includes('--ai');
  const doGenerate = args.includes('--generate');

  // Default: run all
  if (!doScan && !doAi && !doGenerate) {
    process.argv.push('--scan', '--ai', '--generate');
  }

  console.log('=== 五行音乐分类助手 ===');
  console.log(`音频目录: ${AUDIO_ROOT}\n`);

  if (!existsSync(AUDIO_ROOT)) {
    console.log(`[INFO] 目录不存在，请先从百度网盘下载音频到 ${AUDIO_ROOT}`);
    console.log('目录结构：');
    for (const el of ELEMENTS) {
      console.log(`  ${AUDIO_ROOT}\\${el}\\  (${ELEMENT_LABELS[el].name}行·${ELEMENT_LABELS[el].tone}音)`);
    }
    return;
  }

  let files = await scanFiles();
  console.log(`扫描到 ${files.length} 个音频文件`);

  if (files.length === 0) {
    console.log('[INFO] 目录为空，请将音频文件放入对应五行子目录');
    console.log('提示：如果不清楚五行归属，可先将所有文件放入 wood/ 目录');
    console.log('      然后使用 --ai 参数自动分类');
    return;
  }

  // Show scan results
  if (doScan || !doAi) {
    for (const el of ELEMENTS) {
      const elFiles = files.filter(f => f.element === el);
      if (elFiles.length > 0) {
        console.log(`\n${ELEMENT_LABELS[el].name}行(${ELEMENT_LABELS[el].tone}音) - ${elFiles.length} 首:`);
        for (const f of elFiles.slice(0, 10)) {
          console.log(`  ${f.filename} (${(f.sizeBytes / 1024 / 1024).toFixed(1)}MB)`);
        }
        if (elFiles.length > 10) {
          console.log(`  ... 还有 ${elFiles.length - 10} 首`);
        }
      }
    }
  }

  // AI classification
  if (doAi && files.length > 0) {
    console.log('\n--- AI 五行分类 ---');
    const allFiles = files.filter(f => f.element === 'wood' || f.element === 'earth').map(f => f.filename);
    if (allFiles.length > 0) {
      console.log(`对 ${allFiles.length} 个待分类文件调用 AI...`);
      const classifications = await aiClassify(allFiles);
      for (const f of files) {
        const cls = classifications.get(f.filename);
        if (cls) {
          f.aiSuggestion = cls.element;
          f.confidence = cls.confidence;
          console.log(`  ${f.filename} → ${cls.element} (${ELEMENT_LABELS[cls.element].name}行) 置信度:${(cls.confidence * 100).toFixed(0)}%`);
        }
      }
    } else {
      console.log('所有文件已有五行归属，无需 AI 分类');
    }
  }

  // Generate catalog data
  if (doGenerate && files.length > 0) {
    const catalog = generateCatalogData(files);
    const outputPath = join(AUDIO_ROOT, 'wuxing300-catalog.json');
    await writeFile(outputPath, JSON.stringify(catalog, null, 2), 'utf-8');
    console.log(`\n生成数据: ${outputPath} (${catalog.length} 条)`);
    console.log('可将此 JSON 导入 healing-music-catalog.ts');
  }

  // Summary
  console.log('\n=== 统计 ===');
  for (const el of ELEMENTS) {
    const count = files.filter(f => (f.aiSuggestion || f.element) === el).length;
    console.log(`  ${ELEMENT_LABELS[el].name}行(${ELEMENT_LABELS[el].tone}音): ${count} 首`);
  }
  console.log(`  合计: ${files.length} 首`);
}

main().catch(console.error);
