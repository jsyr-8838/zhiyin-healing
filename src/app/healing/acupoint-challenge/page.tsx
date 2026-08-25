'use client';

import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import Link from 'next/link';
import PageContainer from '@/components/layout/PageContainer';
import BottomNav from '@/components/BottomNav';
import { getTcmAcupoints, getTcmMeridians, type TcmAcupoint, type TcmMeridian } from '@/lib/tcm-acupoint-data';
import { useCultivationStore } from '@/lib/cultivation-store';
import { XWS_VIDEO_ACUPOINTS } from '@/lib/xws-video-names';
import { ACUPOINT_LOCATION_IMAGES } from '@/lib/acupoint-image-names';
import { cosUrl } from '@/lib/cos-url';
import { ArrowLeft, Target, Check, X, RotateCw, Zap, ChevronRight, MapPin, Video, ExternalLink, BookOpen, Activity, Stethoscope } from 'lucide-react';

// 鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺?// 缁忚剦涓枃鏄犲皠 (code 鈫?涓枃鍚?
// 鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺?const MERIDIAN_ZH: Record<string, string> = {
  LU: '鎵嬪お闃磋偤缁?, LI: '鎵嬮槼鏄庡ぇ鑲犵粡', ST: '瓒抽槼鏄庤儍缁?, SP: '瓒冲お闃磋劸缁?,
  HT: '鎵嬪皯闃村績缁?, SI: '鎵嬪お闃冲皬鑲犵粡', BL: '瓒冲お闃宠唨鑳辩粡', KI: '瓒冲皯闃磋偩缁?,
  PC: '鎵嬪帴闃村績鍖呯粡', TE: '鎵嬪皯闃充笁鐒︾粡', GB: '瓒冲皯闃宠儐缁?, LV: '瓒冲帴闃磋倽缁?,
  DU: '鐫ｈ剦', REN: '浠昏剦', DONG: '钁ｆ皬濂囩┐',
};

const WUXING_EN: Record<string, string> = {
  '閲?: 'metal', '姘?: 'water', '鏈?: 'wood', '鐏?: 'fire', '鍦?: 'earth',
};

// 鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺?// 鑾峰彇缁忕粶鍔ㄦ€佸浘URL
// 鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺?function getMeridianGifUrl(meridianCode: string): string | null {
  const zhName = MERIDIAN_ZH[meridianCode];
  if (!zhName) return null;
  return cosUrl(`/images/meridians/${encodeURIComponent(zhName)}_model.gif`);
}

function getMeridianTypeImgUrl(meridianCode: string): string | null {
  const zhName = MERIDIAN_ZH[meridianCode];
  if (!zhName) return null;
  return cosUrl(`/images/meridians/${encodeURIComponent(zhName)}_type.jpg`);
}

// 鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺?// 杩涘害鎸佷箙鍖?// 鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺?
interface ChallengeProgress {
  bestStreak: number;
  totalCorrect: number;
  totalAttempts: number;
  playedMeridians: string[];
}

const STORAGE_KEY = 'acupoint-challenge-progress-v3';

function loadProgress(): ChallengeProgress {
  if (typeof window === 'undefined') return { bestStreak: 0, totalCorrect: 0, totalAttempts: 0, playedMeridians: [] };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return { bestStreak: 0, totalCorrect: 0, totalAttempts: 0, playedMeridians: [] };
}

function saveProgress(p: ChallengeProgress) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(p)); } catch { /* ignore */ }
}

// 鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺?// 棰樺瀷瀹氫箟 鈥?鍏ㄩ儴鏂囧瓧鍑洪锛岀瓟鍚庤仈鍔ㄥ浘/瑙嗛/缁忕粶鍥?// 鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺?
type QuestionType = 'location-to-name' | 'indication-to-name' | 'meridian-to-acupoint' | 'acupoint-to-meridian';

interface Question {
  type: QuestionType;
  point: TcmAcupoint;
  // 棰樺共鏂囧瓧
  prompt: string;
  // 閫夐」鏂囧瓧鏁扮粍
  options: string[];
  // 姝ｇ‘绛旀
  correctAnswer: string;
  // 閫夐」瀵瑰簲鐨勭┐浣嶏紙绛旈鍚庡睍绀鸿鎯呯敤锛?  optionPoints: TcmAcupoint[];
  // 閫夐」瀵瑰簲鐨勭粡鑴夊悕锛坅cupoint-to-meridian 棰樺瀷鐢級
  optionMeridians?: string[];
}

// 鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺?// 宸ュ叿鍑芥暟
// 鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺?
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// 鎴彇涓绘不鍓峃涓叧閿瘝浣滀负棰樺共锛堥伩鍏嶅お闀匡級
function shortenIndications(text: string, maxLen: number = 60): string {
  // 鍘绘帀缂栧彿鍓嶇紑鍜屽浣欑┖鏍?  const cleaned = text.replace(/^\d+\.\s*/, '').replace(/\s+/g, ' ').trim();
  if (cleaned.length <= maxLen) return cleaned;
  return cleaned.substring(0, maxLen) + '...';
}

// 鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺?// 鐢熸垚棰樼洰 鈥?鏍规嵁绌翠綅瀹氫綅鏁版嵁搴撴櫤鑳借浆鍖?// 鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺?
function generateQuestion(point: TcmAcupoint, allPoints: TcmAcupoint[]): Question {
  const types: QuestionType[] = [];

  // 鏈夊畾浣嶆弿杩?鈫?瀹氫綅杈ㄧ┐
  if (point.location && point.location.length > 10) {
    types.push('location-to-name');
  }
  // 鏈変富娌?鈫?涓绘不杈ㄧ┐
  if (point.indications && point.indications.length > 10) {
    types.push('indication-to-name');
  }
  // 鏈夌粡鑴?鈫?缁忚剦褰掑睘锛堥€夊嚭灞炰簬璇ョ粡鐨勭┐浣嶏級
  types.push('meridian-to-acupoint');
  // 鏈夌粡鑴?鈫?绌村悕杈ㄧ粡锛堥€夊嚭璇ョ┐浣嶅睘浜庡摢鏉＄粡锛?  types.push('acupoint-to-meridian');

  const type = types[Math.floor(Math.random() * types.length)];
  const meridianName = MERIDIAN_ZH[point.meridian] || point.meridian;

  // 鐢熸垚骞叉壈绌翠綅閫夐」锛堜紭鍏堝悓缁忚剦锛屾洿鐪熷疄锛?  const sameMeridian = allPoints.filter(p => p.meridian === point.meridian && p.code !== point.code && p.name !== point.name);
  const otherPoints = allPoints.filter(p => p.meridian !== point.meridian && p.meridian !== 'DONG');
  const pool = shuffle([...sameMeridian, ...shuffle(otherPoints).slice(0, 30)]);
  const wrongPoints = pool.filter(p => p.name !== point.name).slice(0, 3);
  const optionPoints = shuffle([point, ...wrongPoints]);

  switch (type) {
    case 'location-to-name': {
      // 棰樺共锛氬畾浣嶆弿杩?鈫?閫夌┐鍚?      return {
        type,
        point,
        prompt: point.location,
        options: optionPoints.map(p => p.name),
        correctAnswer: point.name,
        optionPoints,
      };
    }
    case 'indication-to-name': {
      // 棰樺共锛氫富娌?鈫?閫夌┐鍚?      return {
        type,
        point,
        prompt: shortenIndications(point.indications),
        options: optionPoints.map(p => p.name),
        correctAnswer: point.name,
        optionPoints,
      };
    }
    case 'meridian-to-acupoint': {
      // 棰樺共锛氱粡鑴夊悕 鈫?閫夊睘浜庤缁忕殑绌翠綅
      // 姝ｇ‘绌翠綅鏄?point锛屽共鎵伴」鏄笉灞炰簬璇ョ粡鐨勭┐浣?      const wrongForMeridian = shuffle(otherPoints).slice(0, 3);
      const meridianOptions = shuffle([point, ...wrongForMeridian]);
      return {
        type,
        point,
        prompt: meridianName,
        options: meridianOptions.map(p => p.name),
        correctAnswer: point.name,
        optionPoints: meridianOptions,
      };
    }
    case 'acupoint-to-meridian': {
      // 棰樺共锛氱┐鍚?鈫?閫夌粡鑴?      // 閫夐」鏄粡鑴夊悕锛屾纭瓟妗堟槸璇ョ┐浣嶆墍灞炵粡鑴?      const allMeridianCodes = Object.keys(MERIDIAN_ZH).filter(code => code !== 'DONG');
      const wrongMeridians = shuffle(allMeridianCodes.filter(c => c !== point.meridian)).slice(0, 3);
      const meridianOptions = shuffle([point.meridian, ...wrongMeridians]);
      return {
        type,
        point,
        prompt: point.name,
        options: meridianOptions.map(c => MERIDIAN_ZH[c]),
        correctAnswer: meridianName,
        optionPoints: [point],
        optionMeridians: meridianOptions,
      };
    }
  }
}

// 鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺?// 棰樺瀷鏍囩
// 鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺?
function getQuestionTypeLabel(type: QuestionType): string {
  switch (type) {
    case 'location-to-name': return '瀹氫綅杈ㄧ┐';
    case 'indication-to-name': return '涓绘不杈ㄧ┐';
    case 'meridian-to-acupoint': return '缁忚剦褰掑睘';
    case 'acupoint-to-meridian': return '绌村悕杈ㄧ粡';
  }
}

function getQuestionTypeIcon(type: QuestionType) {
  switch (type) {
    case 'location-to-name': return <MapPin size={14} className="text-emerald-600" />;
    case 'indication-to-name': return <Stethoscope size={14} className="text-green-600" />;
    case 'meridian-to-acupoint': return <Activity size={14} className="text-blue-600" />;
    case 'acupoint-to-meridian': return <BookOpen size={14} className="text-purple-600" />;
  }
}

// 鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺?// 绛旈鍙嶉闈㈡澘锛堟牳蹇冿細姣绾т氦浜掕仈鍔?鈥?绌翠綅鍥?瑙嗛+缁忕粶鍥撅級
// 鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺?
function FeedbackPanel({ question, selectedAnswer, meridian }: {
  question: Question;
  selectedAnswer: string | null;
  meridian?: TcmMeridian;
}) {
  const point = question.point;
  const isCorrect = selectedAnswer === question.correctAnswer;
  const hasImage = ACUPOINT_LOCATION_IMAGES.has(point.name);
  const hasVideo = XWS_VIDEO_ACUPOINTS.has(point.name) || XWS_VIDEO_ACUPOINTS.has(point.name + '绌?);
  const meridianGifUrl = getMeridianGifUrl(point.meridian);
  const meridianTypeImgUrl = getMeridianTypeImgUrl(point.meridian);
  const [showVideo, setShowVideo] = useState(false);
  const [showMeridianGif, setShowMeridianGif] = useState(false);

  const meridianName = MERIDIAN_ZH[point.meridian] || point.meridian;

  return (
    <div className="mt-4 space-y-3">
      {/* 绛旈缁撴灉 */}
      <div className={`p-3 rounded-lg text-sm font-medium ${isCorrect ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
        <p className="font-bold text-base">
          {isCorrect ? '鉁?鍥炵瓟姝ｇ‘锛? : '鉁?鍥炵瓟閿欒'}
        </p>
        <p className="text-[11px] mt-1 text-gray-600">
          姝ｇ‘绛旀锛?span className="font-bold">{point.name}</span> 路 {meridianName}
        </p>
      </div>

      {/* 绌翠綅瀹氫綅鍥撅紙姣绾у搷搴旓級 */}
      {hasImage && (
        <div className="rounded-xl overflow-hidden bg-white border-2 border-emerald-300 shadow-lg">
          <div className="bg-emerald-50 px-3 py-1.5 flex items-center gap-1.5 border-b border-emerald-200">
            <MapPin size={13} className="text-emerald-600" />
            <span className="text-xs font-bold text-emerald-700">{point.name} 绌翠綅瀹氫綅鍥?/span>
            <span className="text-[10px] text-gray-400 ml-auto">{meridianName}</span>
          </div>
          <img
            src={cosUrl(`/assets/acupoint/images/${encodeURIComponent(point.name)}.jpg`)}
            alt={`${point.name}绌翠綅瀹氫綅鍥綻}
            className="w-full"
            loading="eager"
          />
        </div>
      )}

      {/* 绌翠綅瀹氫綅瑙嗛锛堟姌鍙犲睍寮€锛?*/}
      {hasVideo && (
        <div className="rounded-xl overflow-hidden bg-white border border-purple-200">
          <button
            onClick={() => setShowVideo(!showVideo)}
            className="w-full px-3 py-2 flex items-center gap-1.5 bg-purple-50 border-b border-purple-200 transition hover:bg-purple-100"
          >
            <Video size={13} className="text-purple-600" />
            <span className="text-xs font-bold text-purple-700">{showVideo ? '鏀惰捣瀹氫綅瑙嗛' : '瑙傜湅瀹氫綅瑙嗛'}</span>
            <ChevronRight size={13} className={`text-purple-400 ml-auto transition-transform ${showVideo ? 'rotate-90' : ''}`} />
          </button>
          {showVideo && (
            <video
              src={cosUrl(`/videos/acupoints/${encodeURIComponent(point.name + '绌?)}.mp4`)}
              controls
              autoPlay
              preload="metadata"
              playsInline
              className="w-full"
              style={{ maxHeight: '50vh' }}
              onError={(e) => {
                const target = e.target as HTMLVideoElement;
                target.parentElement!.innerHTML = '<p class="text-xs text-gray-400 text-center py-4">瑙嗛鍔犺浇澶辫触</p>';
              }}
            />
          )}
        </div>
      )}

      {/* 缁忕粶鍔ㄦ€佸浘锛堟墦閫氱粡缁滃浘瑙ｆā鍧楋級 */}
      {meridianGifUrl && (
        <div className="rounded-xl overflow-hidden bg-white border border-blue-200">
          <button
            onClick={() => setShowMeridianGif(!showMeridianGif)}
            className="w-full px-3 py-2 flex items-center gap-1.5 bg-blue-50 border-b border-blue-200 transition hover:bg-blue-100"
          >
            <Activity size={13} className="text-blue-600" />
            <span className="text-xs font-bold text-blue-700">{showMeridianGif ? '鏀惰捣缁忕粶鍔ㄦ€佸浘' : `鏌ョ湅${meridianName}鍔ㄦ€佸浘`}</span>
            <ChevronRight size={13} className={`text-blue-400 ml-auto transition-transform ${showMeridianGif ? 'rotate-90' : ''}`} />
          </button>
          {showMeridianGif && (
            <div className="bg-gray-50 p-2 flex items-center justify-center">
              <img
                src={meridianGifUrl}
                alt={`${meridianName}鍔ㄦ€佸浘`}
                className="max-h-[50vh] rounded-lg shadow-md object-contain"
                loading="eager"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  if (meridianTypeImgUrl) target.src = meridianTypeImgUrl;
                }}
              />
            </div>
          )}
        </div>
      )}

      {/* 瀹氫綅鎻忚堪 */}
      {point.location && (
        <div className="p-3 rounded-lg bg-blue-50/80 border border-blue-200">
          <div className="flex items-center gap-2 mb-1">
            <BookOpen size={12} className="text-blue-600" />
            <span className="text-[10px] text-blue-700 font-bold">瀹氫綅鎻忚堪</span>
          </div>
          <p className="text-[11px] text-gray-700 leading-relaxed">{point.location}</p>
        </div>
      )}

      {/* 涓绘不 */}
      {point.indications && (
        <div className="p-3 rounded-lg bg-green-50/80 border border-green-200">
          <span className="text-[10px] text-green-700 font-bold">涓绘不</span>
          <div className="flex flex-wrap gap-1 mt-1">
            {point.indications.split(/[锛?銆乚/).filter(Boolean).slice(0, 10).map((ind, i) => (
              <span key={i} className="px-1.5 py-0.5 rounded-full text-[10px] bg-green-100 text-green-700 border border-green-200">
                {ind.trim()}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 閽堝埡鏂规硶 */}
      {point.needlingMethod && (
        <div className="p-3 rounded-lg bg-amber-50/80 border border-amber-200">
          <span className="text-[10px] text-amber-700 font-bold">閽堝埡鏂规硶</span>
          <p className="text-[11px] text-gray-700 leading-relaxed mt-1">{point.needlingMethod}</p>
        </div>
      )}

      {/* 璺宠浆閾炬帴 */}
      <div className="flex gap-2">
        <Link
          href={`/meridian?focus=${point.code}`}
          className="flex-1 p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-center text-xs text-emerald-700 font-bold hover:bg-emerald-100 transition-colors flex items-center justify-center gap-1"
        >
          <ExternalLink size={12} />
          绌翠綅瀹氫綅妯″潡
        </Link>
        <Link
          href="/healing/meridian-chart"
          className="flex-1 p-2.5 rounded-lg bg-blue-50 border border-blue-200 text-center text-xs text-blue-700 font-bold hover:bg-blue-100 transition-colors flex items-center justify-center gap-1"
        >
          <Activity size={12} />
          缁忕粶鍥捐В
        </Link>
      </div>
    </div>
  );
}

// 鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺?// 涓荤粍浠?// 鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺?
type GameState = 'idle' | 'playing' | 'finished';

export default function AcupointChallengePage() {
  const allPoints = useMemo(() => getTcmAcupoints(), []);
  const meridians = useMemo(() => getTcmMeridians(), []);

  // 棰樺簱锛氭墍鏈夌┐浣嶏紙鏈夊畾浣嶆弿杩扮殑浼樺厛锛?  const qualifiedPoints = useMemo(() => {
    return allPoints.filter(p => p.location && p.location.length > 5);
  }, [allPoints]);

  const validMeridianCodes = useMemo(() => {
    return meridians
      .filter(m => m.acupoints.filter(p => p.location && p.location.length > 5).length >= 3)
      .map(m => m.code);
  }, [meridians]);

  const [selectedMeridian, setSelectedMeridian] = useState<string>('all');
  const [gameState, setGameState] = useState<GameState>('idle');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [streak, setStreak] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [progress, setProgress] = useState<ChallengeProgress>(loadProgress);
  const [roundSize, setRoundSize] = useState(10);
  const rewardGivenRef = useRef(false);

  useEffect(() => { saveProgress(progress); }, [progress]);

  const currentQuestion = questions[currentIdx] || null;

  const gamePoints = useMemo(() => {
    if (selectedMeridian === 'all') {
      return qualifiedPoints;
    }
    return qualifiedPoints.filter(p => p.meridian === selectedMeridian);
  }, [qualifiedPoints, selectedMeridian]);

  const startGame = useCallback(() => {
    const pool = [...gamePoints];
    const shuffled = shuffle(pool);
    const round = shuffled.slice(0, Math.min(roundSize, shuffled.length));
    const qs: Question[] = round.map(point => generateQuestion(point, allPoints));

    setQuestions(qs);
    setCurrentIdx(0);
    setCorrectCount(0);
    setWrongCount(0);
    setStreak(0);
    setSelectedAnswer(null);
    setGameState('playing');
    rewardGivenRef.current = false;
  }, [gamePoints, roundSize, allPoints]);

  const handleAnswer = useCallback((answer: string) => {
    if (!currentQuestion || selectedAnswer !== null) return;

    setSelectedAnswer(answer);
    const isCorrect = answer === currentQuestion.correctAnswer;
    const point = currentQuestion.point;

    if (isCorrect) {
      const newCorrect = correctCount + 1;
      const newStreak = streak + 1;
      setCorrectCount(newCorrect);
      setStreak(newStreak);

      const meridian = meridians.find(m => m.code === point.meridian);
      const el = (meridian ? WUXING_EN[meridian.wuxing] : 'earth') as 'wood' | 'fire' | 'earth' | 'metal' | 'water';
      const { addXiuWei, recordPractice } = useCultivationStore.getState();
      addXiuWei(el, 2);
      recordPractice('acupoint-challenge', 30, el, 2);

      setProgress(prev => ({
        ...prev,
        totalCorrect: prev.totalCorrect + 1,
        totalAttempts: prev.totalAttempts + 1,
        bestStreak: Math.max(prev.bestStreak, newStreak),
        playedMeridians: prev.playedMeridians.includes(point.meridian)
          ? prev.playedMeridians
          : [...prev.playedMeridians, point.meridian],
      }));
    } else {
      setWrongCount(wrongCount + 1);
      setStreak(0);
      setProgress(prev => ({ ...prev, totalAttempts: prev.totalAttempts + 1 }));
    }
  }, [currentQuestion, selectedAnswer, correctCount, wrongCount, streak, meridians]);

  const nextQuestion = useCallback(() => {
    if (currentIdx + 1 >= questions.length) {
      if (!rewardGivenRef.current) {
        rewardGivenRef.current = true;
        const { completeTodayStep } = useCultivationStore.getState();
        completeTodayStep('acupoint-challenge');
      }
      setGameState('finished');
    } else {
      setCurrentIdx(currentIdx + 1);
      setSelectedAnswer(null);
    }
  }, [currentIdx, questions.length]);

  const resetGame = useCallback(() => {
    setGameState('idle');
    setQuestions([]);
    setCurrentIdx(0);
    setCorrectCount(0);
    setWrongCount(0);
    setStreak(0);
    setSelectedAnswer(null);
  }, []);

  const accuracy = useMemo(() => {
    const total = correctCount + wrongCount;
    return total > 0 ? Math.round((correctCount / total) * 100) : 0;
  }, [correctCount, wrongCount]);

  const progressPercent = useMemo(() => {
    if (questions.length === 0) return 0;
    return Math.round((currentIdx / questions.length) * 100);
  }, [currentIdx, questions.length]);

  const currentMeridian = currentQuestion
    ? meridians.find(m => m.code === currentQuestion.point.meridian)
    : undefined;

  // 鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺?  // 娓叉煋
  // 鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺?
  return (
    <PageContainer theme="healing" className="pb-24">
      {/* 椤堕儴 */}
      <div className="px-5 pt-12 pb-5 text-white" style={{ background: 'linear-gradient(135deg, #1565C0, #0D47A1)' }}>
        <div className="flex items-center gap-3 mb-2">
          <button onClick={() => window.history.back()} className="text-white/70 hover:text-white">
            <ArrowLeft size={22} />
          </button>
          <h1 className="text-xl font-black font-serif">绌翠綅鎸戞垬</h1>
          <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-teal-400/20 text-teal-300 font-bold ml-auto">鏅鸿兘鍑洪</span>
        </div>
        <p className="text-sm text-white/60 font-serif">鏂囧瓧鍑洪 路 绛斿悗鑱斿姩绌翠綅鍥?瑙嗛/缁忕粶鍥?路 淇负鑱斿姩</p>

        {/* 鍘嗗彶缁熻 */}
        <div className="mt-3 flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1 text-emerald-300">
            <Check size={13} />
            <span>绱绛斿 {progress.totalCorrect}</span>
          </div>
          <div className="flex items-center gap-1 text-amber-300">
            <Zap size={13} />
            <span>鏈€楂樿繛鍑?{progress.bestStreak}</span>
          </div>
          <div className="flex items-center gap-1 text-teal-300">
            <Target size={13} />
            <span>宸茬粌 {progress.playedMeridians.length}/{validMeridianCodes.length} 缁?/span>
          </div>
        </div>
      </div>

      <div className="px-4 pt-4 space-y-4">
        {/* 鈺愨晲鈺?娓告垙鏈紑濮?鈺愨晲鈺?*/}
        {gameState === 'idle' && (
          <>
            {/* 璇存槑 */}
            <div className="glass-card p-4 bg-blue-50/50">
              <div className="flex items-start gap-2">
                <BookOpen size={16} className="text-blue-600 shrink-0 mt-0.5" />
                <div className="text-xs text-gray-700 leading-relaxed">
                  <p className="font-bold text-blue-700 mb-1">鐜╂硶璇存槑</p>
                  <p>绯荤粺鏍规嵁绌翠綅瀹氫綅鏁版嵁搴撴櫤鑳藉嚭棰橈紝鎵€鏈夐鐩互<b>鏂囧瓧鍐呭</b>鍛堢幇锛堝畾浣嶆弿杩般€佷富娌汇€佺粡鑴夊悕绛夛級銆?/p>
                  <p className="mt-1">绛旈鍚庣珛鍗宠仈鍔ㄥ睍绀猴細<b>绌翠綅瀹氫綅鍥?+ 瀹氫綅瑙嗛 + 缁忕粶鍔ㄦ€佸浘</b>锛屽姞娣卞涔犺蹇嗐€?/p>
                </div>
              </div>
            </div>

            {/* 棰樺瀷棰勮 */}
            <div className="grid grid-cols-2 gap-2">
              <div className="glass-card p-3 text-center">
                <MapPin size={18} className="text-emerald-500 mx-auto mb-1" />
                <p className="text-[10px] font-bold text-gray-700">瀹氫綅杈ㄧ┐</p>
                <p className="text-[9px] text-gray-400">鏍规嵁瀹氫綅鎻忚堪閫夌┐鍚?/p>
              </div>
              <div className="glass-card p-3 text-center">
                <Stethoscope size={18} className="text-green-500 mx-auto mb-1" />
                <p className="text-[10px] font-bold text-gray-700">涓绘不杈ㄧ┐</p>
                <p className="text-[9px] text-gray-400">鏍规嵁涓绘不鎻忚堪閫夌┐鍚?/p>
              </div>
              <div className="glass-card p-3 text-center">
                <Activity size={18} className="text-blue-500 mx-auto mb-1" />
                <p className="text-[10px] font-bold text-gray-700">缁忚剦褰掑睘</p>
                <p className="text-[9px] text-gray-400">閫夊嚭灞炰簬璇ョ粡鐨勭┐浣?/p>
              </div>
              <div className="glass-card p-3 text-center">
                <BookOpen size={18} className="text-purple-500 mx-auto mb-1" />
                <p className="text-[10px] font-bold text-gray-700">绌村悕杈ㄧ粡</p>
                <p className="text-[9px] text-gray-400">鏍规嵁绌村悕閫夋墍灞炵粡鑴?/p>
              </div>
            </div>

            {/* 缁忚剦閫夋嫨 */}
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-1 h-5 rounded-full bg-blue-500" />
                <h3 className="font-bold font-serif text-base text-gray-800 tracking-wide">閫夋嫨缁忚剦</h3>
                <div className="flex-1 h-px bg-gradient-to-r from-blue-500/40 to-transparent" />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setSelectedMeridian('all')}
                  className={`glass-card p-3 text-center transition hover:shadow-md hover:-translate-y-0.5 ${selectedMeridian === 'all' ? 'ring-2 ring-blue-500' : ''}`}
                >
                  <div className="text-lg">馃寪</div>
                  <p className="text-xs font-bold mt-1 text-gray-800">鍏ㄩ儴</p>
                  <p className="text-[9px] text-gray-400">{qualifiedPoints.length}绌?/p>
                </button>
                {meridians
                  .filter(m => m.acupoints.filter(p => p.location && p.location.length > 5).length >= 3)
                  .map(m => {
                    const count = m.acupoints.filter(p => p.location && p.location.length > 5).length;
                    return (
                      <button
                        key={m.code}
                        onClick={() => setSelectedMeridian(m.code)}
                        className={`glass-card p-3 text-center transition hover:shadow-md hover:-translate-y-0.5 ${selectedMeridian === m.code ? 'ring-2 ring-blue-500' : ''}`}
                      >
                        <div className="w-3 h-3 rounded-full mx-auto" style={{ backgroundColor: m.color }} />
                        <p className="text-[10px] font-bold mt-1 text-gray-800 truncate">{m.nameZh}</p>
                        <p className="text-[9px] text-gray-400">{count}绌?/p>
                      </button>
                    );
                  })}
              </div>
            </div>

            {/* 姣忚疆棰樻暟 */}
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-1 h-5 rounded-full bg-amber-500" />
                <h3 className="font-bold font-serif text-base text-gray-800 tracking-wide">姣忚疆棰樻暟</h3>
                <div className="flex-1 h-px bg-gradient-to-r from-amber-500/40 to-transparent" />
              </div>
              <div className="flex gap-2">
                {[5, 10, 15, 20].map(n => (
                  <button
                    key={n}
                    onClick={() => setRoundSize(n)}
                    className={`flex-1 glass-card p-3 text-center transition hover:shadow-md ${roundSize === n ? 'ring-2 ring-amber-500 text-amber-700 font-bold' : 'text-gray-600'}`}
                  >
                    {n}棰?                  </button>
                ))}
              </div>
            </div>

            {/* 寮€濮嬫寜閽?*/}
            <button
              onClick={startGame}
              className="w-full rounded-xl p-4 flex items-center justify-center gap-2 text-white font-bold text-sm font-serif transition hover:shadow-md hover:-translate-y-0.5"
              style={{ background: 'linear-gradient(135deg, #1565C0, #0D47A1)' }}
            >
              <Target size={18} />
              寮€濮嬫寫鎴?            </button>
          </>
        )}

        {/* 鈺愨晲鈺?娓告垙涓?缁撴潫 鈺愨晲鈺?*/}
        {(gameState === 'playing' || gameState === 'finished') && (
          <>
            {/* 杩涘害鏉?+ 缁熻 */}
            <div className="glass-card p-3">
              <div className="flex items-center gap-2 mb-2">
                <div className="flex-1 h-2 rounded-full bg-gray-200 overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-teal-500 transition-all duration-300" style={{ width: `${progressPercent}%` }} />
                </div>
                <span className="text-xs text-gray-500 font-bold shrink-0">{currentIdx}/{questions.length}</span>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="text-emerald-600 font-bold">鉁?{correctCount}</span>
                <span className="text-red-500 font-bold">鉁?{wrongCount}</span>
                <span className="text-amber-600 font-bold">杩炲嚮 {streak}</span>
                <span className="text-gray-400">姝ｇ‘鐜?{accuracy}%</span>
              </div>
            </div>

            {/* 鈺愨晲鈺?褰撳墠棰樼洰 鈺愨晲鈺?*/}
            {gameState === 'playing' && currentQuestion && (
              <div className="glass-card p-4 ring-2 ring-blue-500/30">
                {/* 棰樼洰绫诲瀷鏍囩 */}
                <div className="flex items-center justify-center gap-1.5 mb-3">
                  <span className="text-[9px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center gap-1">
                    {getQuestionTypeIcon(currentQuestion.type)}
                    {getQuestionTypeLabel(currentQuestion.type)}
                  </span>
                </div>

                {/* 鈺愨晲鈺?绾枃瀛楅骞?鈺愨晲鈺?*/}
                <div className="mb-4">
                  {currentQuestion.type === 'location-to-name' && (
                    <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                      <div className="flex items-center gap-2 mb-2">
                        <MapPin size={14} className="text-blue-600" />
                        <span className="text-[10px] text-blue-700 font-bold">瀹氫綅鎻忚堪</span>
                      </div>
                      <p className="text-sm text-gray-800 leading-relaxed">{currentQuestion.prompt}</p>
                      <p className="text-[10px] text-gray-400 mt-2">璇烽€夊嚭瀵瑰簲鐨勭┐浣嶅悕绉?/p>
                    </div>
                  )}

                  {currentQuestion.type === 'indication-to-name' && (
                    <div className="p-4 rounded-lg bg-green-50 border border-green-200">
                      <div className="flex items-center gap-2 mb-2">
                        <Stethoscope size={14} className="text-green-600" />
                        <span className="text-[10px] text-green-700 font-bold">涓绘不</span>
                      </div>
                      <p className="text-sm text-gray-800 leading-relaxed">{currentQuestion.prompt}</p>
                      <p className="text-[10px] text-gray-400 mt-2">璇烽€夊嚭瀵瑰簲鐨勭┐浣嶅悕绉?/p>
                    </div>
                  )}

                  {currentQuestion.type === 'meridian-to-acupoint' && (
                    <div className="p-4 rounded-lg bg-blue-50 border border-blue-200 text-center">
                      <p className="text-[10px] text-gray-400 mb-1">缁忚剦</p>
                      <p className="text-2xl font-black font-serif text-blue-700">{currentQuestion.prompt}</p>
                      <p className="text-[10px] text-gray-400 mt-2">閫夊嚭灞炰簬杩欐潯缁忚剦鐨勭┐浣?/p>
                    </div>
                  )}

                  {currentQuestion.type === 'acupoint-to-meridian' && (
                    <div className="p-4 rounded-lg bg-purple-50 border border-purple-200 text-center">
                      <p className="text-[10px] text-gray-400 mb-1">绌翠綅</p>
                      <p className="text-3xl font-black font-serif text-purple-700">{currentQuestion.prompt}</p>
                      <p className="text-[10px] text-gray-400 mt-2">閫夊嚭璇ョ┐浣嶆墍灞炵殑缁忚剦</p>
                    </div>
                  )}
                </div>

                {/* 鈺愨晲鈺?閫夐」鍖猴紙绾枃瀛楋級 鈺愨晲鈺?*/}
                <div className="grid grid-cols-2 gap-2">
                  {currentQuestion.options.map((opt, i) => {
                    const isCorrect = opt === currentQuestion.correctAnswer;
                    const isSelected = selectedAnswer === opt;
                    let btnClass = 'glass-card p-3 text-center text-sm font-bold font-serif transition ';

                    if (selectedAnswer !== null) {
                      if (isCorrect) {
                        btnClass += 'bg-emerald-50 border-2 border-emerald-400 text-emerald-700';
                      } else if (isSelected) {
                        btnClass += 'bg-red-50 border-2 border-red-400 text-red-600';
                      } else {
                        btnClass += 'opacity-50 border-2 border-transparent text-gray-400';
                      }
                    } else {
                      btnClass += 'border-2 border-transparent text-gray-700 hover:border-blue-300 hover:bg-blue-50 active:scale-95';
                    }

                    return (
                      <button
                        key={i}
                        onClick={() => handleAnswer(opt)}
                        disabled={selectedAnswer !== null}
                        className={btnClass}
                      >
                        <span className="text-base">{opt}</span>
                        {selectedAnswer !== null && isCorrect && <Check size={14} className="inline ml-1 text-emerald-500" />}
                        {selectedAnswer !== null && isSelected && !isCorrect && <X size={14} className="inline ml-1 text-red-500" />}
                      </button>
                    );
                  })}
                </div>

                {/* 鈺愨晲鈺?绛旈鍙嶉锛堟绉掔骇浜や簰鑱斿姩锛氱┐浣嶅浘+瑙嗛+缁忕粶鍥撅級 鈺愨晲鈺?*/}
                {selectedAnswer !== null && (
                  <>
                    <FeedbackPanel
                      question={currentQuestion}
                      selectedAnswer={selectedAnswer}
                      meridian={currentMeridian}
                    />
                    {/* 涓嬩竴棰樻寜閽?*/}
                    <button
                      onClick={nextQuestion}
                      className="mt-4 w-full rounded-xl p-3 flex items-center justify-center gap-2 text-white font-bold text-sm font-serif transition hover:shadow-md"
                      style={{ background: 'linear-gradient(135deg, #1565C0, #0D47A1)' }}
                    >
                      {currentIdx + 1 >= questions.length ? '鏌ョ湅缁撴灉' : '涓嬩竴棰?}
                      <ChevronRight size={16} />
                    </button>
                  </>
                )}
              </div>
            )}

            {/* 鈺愨晲鈺?娓告垙缁撴潫 鈺愨晲鈺?*/}
            {gameState === 'finished' && (
              <div className="glass-card p-6 text-center">
                <div className="text-4xl mb-2">
                  {accuracy >= 90 ? '馃弳' : accuracy >= 75 ? '馃' : accuracy >= 60 ? '馃' : '馃挭'}
                </div>
                <p className="text-lg font-bold font-serif text-gray-800">
                  {accuracy >= 90 ? '浼樼锛? : accuracy >= 75 ? '鑹ソ锛? : accuracy >= 60 ? '缁х画鍔姏' : '澶氬缁冧範'}
                </p>
                <div className="mt-3 flex justify-center gap-4 text-sm">
                  <div>
                    <p className="text-2xl font-black text-emerald-600">{correctCount}</p>
                    <p className="text-[10px] text-gray-500">姝ｇ‘</p>
                  </div>
                  <div>
                    <p className="text-2xl font-black text-red-500">{wrongCount}</p>
                    <p className="text-[10px] text-gray-500">閿欒</p>
                  </div>
                  <div>
                    <p className="text-2xl font-black text-amber-600">{accuracy}%</p>
                    <p className="text-[10px] text-gray-500">姝ｇ‘鐜?/p>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-3">
                  鏈疆鑾峰緱淇负锛?{correctCount * 2} 浜旇淇负
                </p>
                {/* 閾炬帴 */}
                <div className="flex gap-2 mt-4">
                  <Link
                    href="/meridian"
                    className="flex-1 p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-center text-xs text-emerald-700 font-bold hover:bg-emerald-100 transition-colors flex items-center justify-center gap-1"
                  >
                    <MapPin size={12} />
                    绌翠綅瀹氫綅
                  </Link>
                  <Link
                    href="/healing/meridian-chart"
                    className="flex-1 p-2 rounded-lg bg-blue-50 border border-blue-200 text-center text-xs text-blue-700 font-bold hover:bg-blue-100 transition-colors flex items-center justify-center gap-1"
                  >
                    <Activity size={12} />
                    缁忕粶鍥捐В
                  </Link>
                </div>
              </div>
            )}

            {/* 鎿嶄綔鎸夐挳 */}
            <div className="flex gap-3">
              {gameState === 'playing' && (
                <button
                  onClick={resetGame}
                  className="flex-1 glass-card p-3 flex items-center justify-center gap-2 text-sm font-medium text-gray-600 transition hover:shadow-md"
                >
                  <RotateCw size={16} />
                  閲嶆柊寮€濮?                </button>
              )}
              {gameState === 'finished' && (
                <>
                  <button
                    onClick={startGame}
                    className="flex-1 rounded-xl p-3 flex items-center justify-center gap-2 text-white text-sm font-bold font-serif transition hover:shadow-md"
                    style={{ background: 'linear-gradient(135deg, #1565C0, #0D47A1)' }}
                  >
                    <RotateCw size={16} />
                    鍐嶆潵涓€杞?                  </button>
                  <button
                    onClick={resetGame}
                    className="flex-1 glass-card p-3 flex items-center justify-center gap-2 text-sm font-medium text-gray-600 transition hover:shadow-md"
                  >
                    杩斿洖璁剧疆
                  </button>
                </>
              )}
            </div>
          </>
        )}
      </div>

      <BottomNav />
    </PageContainer>
  );
}
