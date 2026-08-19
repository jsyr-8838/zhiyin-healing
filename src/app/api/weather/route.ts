/**
 * /api/weather — 服务端天气代理
 * 绕过浏览器端 CORS/网络限制，在服务端请求 ipapi.co + Open-Meteo
 *
 * GET /api/weather           → 自动通过服务器IP定位 + 天气
 * GET /api/weather?lat=x&lon=y → 跳过IP定位，直接查天气
 * GET /api/weather?ip-only    → 只返回IP定位结果
 */
import { NextRequest, NextResponse } from 'next/server';

interface IPLocation {
  lat: number;
  lon: number;
  city: string;
  country: string;
}

interface WeatherResult {
  temperature: number;
  weatherCode: number;
  weatherLabel: string;
  isDay: boolean;
  windSpeed: number;
  humidity: number;
  city: string;
  country: string;
  lat: number;
  lon: number;
}

// WMO 天气码 → 中文标签
const WMO_CODES: Record<number, string> = {
  0: '晴', 1: '大部晴', 2: '多云', 3: '阴',
  45: '雾', 48: '冻雾',
  51: '细毛雨', 53: '毛毛雨', 55: '密毛雨',
  56: '冻毛雨', 57: '密冻毛雨',
  61: '小雨', 63: '中雨', 65: '大雨',
  66: '冻雨', 67: '大冻雨',
  71: '小雪', 73: '中雪', 75: '大雪',
  77: '雪粒', 80: '阵雨', 81: '中阵雨', 82: '大阵雨',
  85: '阵雪', 86: '大阵雪',
  95: '雷暴', 96: '雷暴+冰雹', 99: '强雷暴+冰雹',
};

async function fetchIPLocation(): Promise<IPLocation> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 6000);
  try {
    const res = await fetch('https://ipapi.co/json/', {
      signal: controller.signal,
      headers: { 'User-Agent': 'zhi-yin-weather-proxy/1.0' },
    });
    clearTimeout(timeoutId);
    if (!res.ok) throw new Error(`ipapi.co returned ${res.status}`);
    const data = await res.json();
    if (!data.latitude || !data.longitude) throw new Error('Missing coordinates');
    return {
      lat: data.latitude,
      lon: data.longitude,
      city: data.city || '当前位置',
      country: data.country_name || '',
    };
  } catch {
    clearTimeout(timeoutId);
    // 默认北京
    return { lat: 39.9, lon: 116.4, city: '北京', country: '中国' };
  }
}

async function fetchWeather(lat: number, lon: number): Promise<Omit<WeatherResult, 'city' | 'country' | 'lat' | 'lon'>> {
  const params = new URLSearchParams({
    latitude: lat.toString(),
    longitude: lon.toString(),
    current: 'temperature_2m,weather_code,is_day,wind_speed_10m,relative_humidity_2m',
    timezone: 'auto',
  });

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);
  try {
    const res = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`, {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    if (!res.ok) throw new Error(`Open-Meteo returned ${res.status}`);
    const data = await res.json();
    const current = data.current;

    return {
      temperature: current.temperature_2m,
      weatherCode: current.weather_code,
      weatherLabel: WMO_CODES[current.weather_code] || '未知',
      isDay: current.is_day === 1,
      windSpeed: current.wind_speed_10m,
      humidity: current.relative_humidity_2m,
    };
  } catch (err) {
    clearTimeout(timeoutId);
    // 返回默认天气（北京晴天）
    return {
      temperature: 25,
      weatherCode: 0,
      weatherLabel: '晴',
      isDay: true,
      windSpeed: 10,
      humidity: 50,
    };
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const ipOnly = searchParams.has('ip-only');
  const latParam = searchParams.get('lat');
  const lonParam = searchParams.get('lon');

  try {
    // 如果只请求IP定位
    if (ipOnly) {
      const location = await fetchIPLocation();
      return NextResponse.json(location);
    }

    // 确定坐标
    let location: IPLocation;
    if (latParam && lonParam) {
      location = {
        lat: parseFloat(latParam),
        lon: parseFloat(lonParam),
        city: searchParams.get('city') || '指定位置',
        country: searchParams.get('country') || '',
      };
    } else {
      location = await fetchIPLocation();
    }

    // 获取天气
    const weather = await fetchWeather(location.lat, location.lon);

    const result: WeatherResult = {
      ...weather,
      city: location.city,
      country: location.country,
      lat: location.lat,
      lon: location.lon,
    };

    return NextResponse.json(result, {
      headers: {
        // 缓存5分钟，避免频繁请求
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    });
  } catch (err) {
    return NextResponse.json(
      {
        error: 'Weather fetch failed',
        temperature: 25,
        weatherCode: 0,
        weatherLabel: '晴',
        isDay: true,
        windSpeed: 10,
        humidity: 50,
        city: '北京',
        country: '中国',
        lat: 39.9,
        lon: 116.4,
      },
      { status: 200 } // 返回200+默认数据，不阻塞前端
    );
  }
}
