/**
 * 典籍搜索服务端工具（仅限服务端使用）
 * 
 * 搜索范围：
 * - 全部 52 本书的元数据（书名、描述、作者、概要）
 * - 16 本养生书的全文内容（从 public/wellness-texts/ 读取 JSON）
 * - 36 本古书的 TypeScript 内容（动态 import 按需加载）
 */

import { CLASSICS_CATEGORIES, type ClassicBook } from './classics-data';
import { promises as fs } from 'fs';
import path from 'path';

export interface SearchResult {
  type: 'book' | 'content';
  bookId: string;
  bookName: string;
  author: string;
  category: string;
  chapterTitle?: string;
  excerpt: string;
  score: number;
}

const WELLNESS_BOOK_IDS = new Set([
  'yingyangshi', 'zhongbingzhiwang', 'danguimin',
  'chidezhenxiang1', 'chidezhenxiang2', 'chidezhenxiang3',
  'qiutujianshen', 'huijia_chifan', 'bachulaidebing',
  'wendujueding', 'lvseyangsheng', 'feipang_shipu',
  'qingduanshi', 'jieyan', 'huo20nian', 'huangdi_jiayong',
]);

// 养生书缓存（进程级别，避免重复 IO）
interface WellnessBook {
  title: string;
  author: string;
  chapters: { title: string; content: string }[];
}
const wellnessCache = new Map<string, WellnessBook | null>();

async function loadWellnessBook(bookId: string): Promise<WellnessBook | null> {
  if (wellnessCache.has(bookId)) return wellnessCache.get(bookId)!;
  try {
    const filePath = path.join(process.cwd(), 'public', 'wellness-texts', `${bookId}.json`);
    const raw = await fs.readFile(filePath, 'utf-8');
    const data = JSON.parse(raw) as WellnessBook;
    wellnessCache.set(bookId, data);
    return data;
  } catch {
    wellnessCache.set(bookId, null);
    return null;
  }
}

// 获取所有书的元数据
function getAllBookMetas(): ClassicBook[] {
  const metas: ClassicBook[] = [];
  for (const cat of CLASSICS_CATEGORIES) {
    metas.push(...cat.books);
  }
  return metas;
}

/**
 * 跨书搜索
 * @param query 搜索关键词
 * @param maxResults 最大返回数（默认 30）
 * @param includeContent 是否搜索全文内容（默认 true）
 */
export async function searchClassics(
  query: string,
  maxResults = 30,
  includeContent = true,
): Promise<SearchResult[]> {
  if (!query || query.trim().length < 1) return [];

  const q = query.trim();
  const results: SearchResult[] = [];

  // 1. 搜索元数据（全部 52 本书）
  for (const cat of CLASSICS_CATEGORIES) {
    for (const book of cat.books) {
      let score = 0;
      let excerpt = '';
      if (book.name.includes(q)) { score += 10; excerpt = book.summary; }
      if (book.description.includes(q)) { score += 5; excerpt = excerpt || book.description; }
      if (book.author.includes(q)) { score += 3; excerpt = excerpt || `${book.author} · ${book.description}`; }
      if (book.summary.includes(q)) {
        score += 4;
        const idx = book.summary.indexOf(q);
        excerpt = book.summary.substring(Math.max(0, idx - 20), idx + q.length + 40);
      }
      if (score > 0) {
        results.push({
          type: 'book',
          bookId: book.id,
          bookName: book.name,
          author: book.author,
          category: cat.name,
          excerpt,
          score,
        });
      }
    }
  }

  // 2. 搜索养生书全文内容
  if (includeContent) {
    const metas = getAllBookMetas();
    for (const bookId of WELLNESS_BOOK_IDS) {
      const book = await loadWellnessBook(bookId);
      if (!book) continue;
      const meta = metas.find(m => m.id === bookId);
      const cat = meta?.category || '养';
      let bookContentMatched = false;

      for (const chapter of book.chapters) {
        let score = 0;
        let excerpt = '';

        if (chapter.title.includes(q)) {
          score += 5;
          excerpt = chapter.content.substring(0, 80);
        }

        const idx = chapter.content.indexOf(q);
        if (idx >= 0) {
          score += 3;
          excerpt = chapter.content.substring(
            Math.max(0, idx - 30),
            Math.min(chapter.content.length, idx + q.length + 50),
          );
        }

        if (score > 0 && !bookContentMatched) {
          bookContentMatched = true;
          results.push({
            type: 'content',
            bookId,
            bookName: book.title,
            author: book.author,
            category: cat,
            chapterTitle: chapter.title,
            excerpt,
            score: score + 1, // 内容匹配略加权
          });
        }
        if (bookContentMatched) break; // 每本书只取第一个匹配
      }
    }
  }

  // 按分数排序，取 top N
  results.sort((a, b) => b.score - a.score);
  return results.slice(0, maxResults);
}

/**
 * 获取 AI 问答所需的上下文
 * 搜索相关内容，返回格式化的上下文文本 + 引用来源
 */
export async function getContextForQuestion(
  question: string,
  maxChars = 6000,
): Promise<{ context: string; sources: SearchResult[] }> {
  // 从问题中提取关键词进行搜索
  const results = await searchClassics(question, 20, true);

  // 如果直接搜索无结果，尝试更短的关键词
  let usedResults = results;
  if (results.length === 0 && question.length > 4) {
    // 取前4个字搜索
    usedResults = await searchClassics(question.substring(0, 4), 20, true);
  }

  // 构建上下文文本
  let contextParts: string[] = [];
  let totalChars = 0;
  const sources: SearchResult[] = [];

  for (const r of usedResults) {
    if (totalChars >= maxChars) break;

    let part: string;
    if (r.type === 'content') {
      // 对于内容匹配，获取更多上下文
      part = `《${r.bookName}》${r.chapterTitle ? ` · ${r.chapterTitle}` : ''}\n${r.excerpt}`;
    } else {
      part = `《${r.bookName}》(${r.author})\n${r.excerpt}`;
    }

    if (totalChars + part.length > maxChars) {
      part = part.substring(0, maxChars - totalChars);
    }

    contextParts.push(part);
    sources.push(r);
    totalChars += part.length;
  }

  return {
    context: contextParts.join('\n\n---\n\n'),
    sources,
  };
}
