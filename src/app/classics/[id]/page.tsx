'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { loadClassicText, getClassicMeta, type ClassicTextData } from '@/lib/classics-loader';
import HealingReader from '@/components/classics/HealingReader';

export default function ClassicReaderPage() {
  const params = useParams();
  const bookId = params.id as string;
  const [bookData, setBookData] = useState<ClassicTextData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!bookId) return;
    setLoading(true);
    setError(false);
    loadClassicText(bookId)
      .then(data => {
        if (data) {
          setBookData(data);
        } else {
          setError(true);
        }
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [bookId]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center" style={{ background: '#f5f0e8', fontFamily: "'Noto Serif SC', serif" }}>
        <div className="w-8 h-8 border-2 border-amber-800 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm" style={{ color: '#6b5d4d' }}>正在加载典籍...</p>
      </div>
    );
  }

  if (error || !bookData) {
    const meta = getClassicMeta(bookId);
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6" style={{ background: '#f5f0e8', fontFamily: "'Noto Serif SC', serif" }}>
        <div className="w-16 h-16 rounded-lg flex items-center justify-center text-2xl text-white mb-4" style={{ background: '#c23a2b', transform: 'rotate(-3deg)' }}>
          {meta?.name?.charAt(0) || '典'}
        </div>
        <h2 className="text-lg font-bold mb-2" style={{ color: '#2c2416' }}>{meta?.name || '典籍未找到'}</h2>
        <p className="text-sm text-center mb-6" style={{ color: '#6b5d4d' }}>
          该典籍正在整理中，完整内容即将上线
        </p>
        <a
          href="/classics"
          className="px-6 py-2.5 rounded-full text-sm text-white"
          style={{ background: '#8b4513' }}
        >
          返回玄览
        </a>
      </div>
    );
  }

  return <HealingReader book={bookData} />;
}
