import type { Metadata } from 'next';
import YunQiClient from './YunQiClient';

export const metadata: Metadata = {
  title: '五运六气 · 知音',
  description: '基于《素问》七篇大论的运气推算，天符岁会、五步推运、主客顺逆、运气-体质联动',
};

export default function YunQiPage() {
  return <YunQiClient />;
}
