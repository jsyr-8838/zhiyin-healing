'use client';

import { useState, useEffect, useCallback, memo } from 'react';
import {
  fetchWeatherData,
  fetchIPLocation,
  buildWeatherMood,
  moodToSeedQueries,
  generateMoodPlaylist,
  DEFAULT_THEME,
  type WeatherData,
  type WeatherMood,
  type WeatherRadioTrack,
} from '@/lib/mineradio/weather-mood';
import { toPlayerTracks, type PlayerTrack } from '@/lib/mineradio/playlist';
import { Cloud, MapPin, RefreshCw, Loader2, Music, Thermometer, Droplets, Wind } from 'lucide-react';

interface WeatherRadioProps {
  onStartRadio: (tracks: PlayerTrack[], mood: WeatherMood) => void;
  compact?: boolean;
}

/**
 * 天籁卡片组件
 * 基于 Mineradio 的天气电台系统简化重写
 */
export default memo(function WeatherRadio({ onStartRadio, compact = false }: WeatherRadioProps) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [mood, setMood] = useState<WeatherMood | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [city, setCity] = useState('');

  const loadWeather = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      // 1. 获取位置
      const loc = await fetchIPLocation();
      setCity(loc.city);

      // 2. 获取天气
      const weatherData = await fetchWeatherData(loc.lat, loc.lon);
      weatherData.city = loc.city;
      setWeather(weatherData);

      // 3. 生成 Mood
      const weatherMood = buildWeatherMood(weatherData);
      setMood(weatherMood);
    } catch (err) {
      // 静默处理，用户已看到 error 提示
      setError('天气数据获取失败，使用默认电台');
      // 使用默认 mood
      const defaultMood: WeatherMood = {
        key: 'default',
        title: '此刻',
        tagline: '随机应变的疗愈',
        energy: 0.5,
        warmth: 0.5,
        focus: 0.5,
        melancholy: 0.15,
        keywords: ['综合', '流行', '轻音乐', '电子'],
        theme: DEFAULT_THEME,
      };
      setMood(defaultMood);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadWeather();
  }, [loadWeather]);

  const handleStart = () => {
    if (!mood) return;
    const tracks = generateMoodPlaylist(mood);
    onStartRadio(toPlayerTracks(tracks), mood);
  };

  if (compact) {
    return (
      <div className="glass-card p-4 rounded-2xl bg-black/30 backdrop-blur-xl border border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
            <Cloud size={20} className="text-purple-300" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-white/90">
              {mood?.title || '天籁'}
            </p>
            <p className="text-[10px] text-white/50">
              {city && `${city} · `}{weather?.weatherLabel || '加载中'}
              {weather && ` ${Math.round(weather.temperature)}°C`}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-3xl bg-black/40 backdrop-blur-2xl border border-white/10 overflow-hidden">
      {/* 天气头图 */}
      <div className="relative h-28 sm:h-40 bg-gradient-to-br from-purple-900/60 via-blue-900/40 to-indigo-900/60 overflow-hidden">
        {/* 装饰粒子（用固定位置避免 hydration mismatch） */}
        <div className="absolute inset-0 opacity-20">
          {[3,7,11,17,23,29,31,37,41,43,47,53,59,61,67,71,73,79,83,89].map((n, i) => {
            // 用质数散列生成伪随机位置
            const x = ((n * 7 + 13) % 100);
            const y = ((n * 11 + 17) % 100);
            const sz = 1 + (n % 3);
            const op = 0.3 + (n % 5) * 0.1;
            return (
              <div
                key={i}
                className="absolute rounded-full bg-white"
                style={{ width: `${sz}px`, height: `${sz}px`, top: `${y}%`, left: `${x}%`, opacity: op }}
              />
            );
          })}
        </div>

        {/* 天气信息叠加 */}
        <div className="absolute inset-0 p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin size={12} className="text-white/50" />
              <span className="text-xs text-white/60">{city || '定位中'}</span>
            </div>
            <button
              onClick={loadWeather}
              disabled={loading}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition"
            >
              <RefreshCw size={12} className={`text-white/60 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          <div>
            <div className="flex items-end gap-3">
              {weather && (
                <span className="text-4xl font-light text-white">
                  {Math.round(weather.temperature)}°
                </span>
              )}
              <div>
                <p className="text-lg font-bold text-white/90">{weather?.weatherLabel || '--'}</p>
                <p className="text-xs text-white/50">{mood?.tagline || ''}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 天气详情 + Mood 标签 */}
      <div className="p-3 sm:p-5">
        {weather && (
          <div className="hidden sm:flex gap-4 mb-2 sm:mb-4">
            <div className="flex items-center gap-1.5 text-xs text-white/50">
              <Thermometer size={12} />
              <span>{Math.round(weather.temperature)}°C</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-white/50">
              <Droplets size={12} />
              <span>{weather.humidity}%</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-white/50">
              <Wind size={12} />
              <span>{Math.round(weather.windSpeed)} km/h</span>
            </div>
          </div>
        )}

        {/* Mood 标签 */}
        {mood && (
          <div className="flex flex-wrap gap-2 mb-2 sm:mb-4">
            {mood.keywords.map((kw) => (
              <span
                key={kw}
                className="px-2.5 py-1 rounded-full text-[10px] bg-purple-500/15 text-purple-300 border border-purple-500/20"
              >
                {kw}
              </span>
            ))}
          </div>
        )}

        {/* 能量指标（移动端隐藏） */}
        {mood && (
          <div className="hidden sm:grid grid-cols-4 gap-2 mb-2 sm:mb-4">
            {[
              { label: '能量', value: mood.energy, color: 'from-red-500 to-orange-500' },
              { label: '温暖', value: mood.warmth, color: 'from-amber-500 to-yellow-500' },
              { label: '专注', value: mood.focus, color: 'from-blue-500 to-cyan-500' },
              { label: '沉思', value: mood.melancholy, color: 'from-purple-500 to-indigo-500' },
            ].map((item) => (
              <div key={item.label} className="text-center">
                <div className="h-1 rounded-full bg-white/10 overflow-hidden mb-1">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${item.color}`}
                    style={{ width: `${item.value * 100}%` }}
                  />
                </div>
                <span className="text-[9px] text-white/40">{item.label}</span>
              </div>
            ))}
          </div>
        )}

        {/* 开始按钮 */}
        <button
          onClick={handleStart}
          disabled={!mood || loading}
          className="w-full py-3 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition
            bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-500 hover:to-blue-500
            disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              正在获取天气...
            </>
          ) : (
            <>
              <Music size={16} />
              开启{mood?.title || '天气'}电台
            </>
          )}
        </button>

        {error && (
          <p className="text-xs text-amber-400/70 mt-2 text-center">{error}</p>
        )}
      </div>
    </div>
  );
});
