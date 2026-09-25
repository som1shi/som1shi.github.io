import React, { useEffect, useState } from 'react';
import {
  FaClock,
  FaCloud,
  FaCloudRain,
  FaCloudSun,
  FaSmog,
  FaSnowflake,
  FaBolt,
  FaMoon,
  FaCloudMoon,
  FaLocationArrow,
  FaGithub,
  FaMapMarkerAlt,
  FaSun,
} from 'react-icons/fa';

const clockCities = [
  { city: 'San Francisco', timeZone: 'America/Los_Angeles' },
  { city: 'Lagos', timeZone: 'Africa/Lagos' },
  { city: 'Lucknow', timeZone: 'Asia/Kolkata' },
];

const WidgetLabel = ({ icon: Icon, name }) => (
  <div className="widget-label widget-label-top-left"><Icon aria-hidden="true" /><span>{name}</span></div>
);

const getDateIndex = (date, timeZone) => {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  }).formatToParts(date);
  const value = (type) => Number(parts.find((part) => part.type === type).value);
  return Date.UTC(value('year'), value('month') - 1, value('day')) / 86400000;
};

const getZonedParts = (date, timeZone) => {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: 'numeric',
    second: 'numeric',
    hourCycle: 'h23',
  }).formatToParts(date);
  const value = (type) => Number(parts.find((part) => part.type === type).value);

  return {
    year: value('year'),
    month: value('month'),
    day: value('day'),
    hour: value('hour'),
    minute: value('minute'),
    second: value('second'),
  };
};

const getTimeZoneOffset = (date, timeZone) => {
  const parts = getZonedParts(date, timeZone);
  const localTimestamp = Date.UTC(
    parts.year,
    parts.month - 1,
    parts.day,
    parts.hour,
    parts.minute,
    parts.second,
  );

  return Math.round((localTimestamp - date.getTime()) / 60000);
};

const getClockData = (date, timeZone) => {
  const parts = getZonedParts(date, timeZone);
  const localTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const dayOffset = getDateIndex(date, timeZone) - getDateIndex(date, localTimeZone);
  const relativeOffset = getTimeZoneOffset(date, timeZone) - getTimeZoneOffset(date, localTimeZone);
  const absoluteOffset = Math.abs(relativeOffset);
  const offsetHours = Math.floor(absoluteOffset / 60);
  const offsetMinutes = absoluteOffset % 60;
  const offset = `${relativeOffset >= 0 ? '+' : '−'}${offsetHours}${offsetMinutes ? `:${String(offsetMinutes).padStart(2, '0')}` : ''}HRS`;
  const label = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);

  return {
    label,
    offset,
    day: dayOffset === 0 ? 'Today' : dayOffset > 0 ? 'Tomorrow' : 'Yesterday',
    period: parts.hour >= 7 && parts.hour < 19 ? 'day' : 'night',
    hourAngle: ((parts.hour % 12) + parts.minute / 60) * 30,
    minuteAngle: (parts.minute + parts.second / 60) * 6,
    secondAngle: parts.second * 6,
  };
};

const AnalogClock = ({ city, timeZone, now }) => {
  const time = getClockData(now, timeZone);

  return (
    <article className="world-clock-city">
      <div className={`clock-face clock-face-${time.period}`} role="img" aria-label={`${city} clock showing local time ${time.label}`}>
        {Array.from({ length: 12 }, (_, index) => {
          const angle = (index + 1) * 30;
          return (
            <span
              className="clock-number"
              style={{ '--number-angle': `${angle}deg`, '--number-counter-angle': `${-angle}deg` }}
              key={index + 1}
            >
              {index + 1}
            </span>
          );
        })}
        <i className="clock-hand clock-hour" style={{ '--angle': `${time.hourAngle}deg` }} />
        <i className="clock-hand clock-minute" style={{ '--angle': `${time.minuteAngle}deg` }} />
        <i className="clock-hand clock-second" style={{ '--angle': `${time.secondAngle}deg` }} />
        <i className="clock-pin" />
      </div>
      <div className="clock-city-meta">
        <strong>{city}</strong>
        <span>{time.day} · {time.offset}</span>
      </div>
    </article>
  );
};

export const WorldClockWidget = () => {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const interval = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(interval);
  }, []);

  return (
    <section className="desktop-widget world-clock-widget" aria-label="World Clock widget" data-reveal>
      <WidgetLabel icon={FaClock} name="World Clock" />
      <div className="world-clock-list">
        {clockCities.map((clock) => <AnalogClock {...clock} now={now} key={clock.city} />)}
      </div>
    </section>
  );
};

const GITHUB_USER = 'som1shi';
const GITHUB_WEEKS = 18;
const LANGUAGE_COLORS = { JavaScript: '#f1e05a', TypeScript: '#3178c6', Python: '#3572a5', HTML: '#e34c26', CSS: '#563d7c' };

const readCache = (key) => {
  try {
    return JSON.parse(sessionStorage.getItem(key));
  } catch {
    return null;
  }
};

const writeCache = (key, value) => {
  try {
    sessionStorage.setItem(key, JSON.stringify(value));
  } catch {
    // storage unavailable; the widget just refetches next time
  }
};

// Public GitHub data: recent repositories (REST API) and the contribution calendar (github-contributions-api).
const useGitHubActivity = () => {
  const [data, setData] = useState(() => readCache('gh-activity'));

  useEffect(() => {
    if (data) return undefined;
    let cancelled = false;
    Promise.all([
      fetch(`https://api.github.com/users/${GITHUB_USER}/repos?sort=pushed&per_page=4`).then((res) => (res.ok ? res.json() : [])),
      fetch(`https://github-contributions-api.jogruber.de/v4/${GITHUB_USER}?y=last`).then((res) => (res.ok ? res.json() : null)),
    ]).then(([repos, calendar]) => {
      if (cancelled) return;
      const next = {
        repos: repos.map((repo) => ({
          name: repo.name,
          description: repo.description,
          language: repo.language,
          url: repo.html_url,
          pushedAt: repo.pushed_at,
        })),
        total: calendar?.total?.lastYear ?? null,
        days: calendar?.contributions ?? [],
      };
      setData(next);
      writeCache('gh-activity', next);
    }).catch(() => {});
    return () => { cancelled = true; };
  }, [data]);

  return data;
};

const currentStreak = (days) => {
  let streak = 0;
  for (let i = days.length - 1; i >= 0; i -= 1) {
    if (days[i].count > 0) streak += 1;
    else if (i < days.length - 1) break;
  }
  return streak;
};

const relativeDate = (iso) => {
  const days = Math.round((Date.now() - new Date(iso).getTime()) / 86400000);
  if (days < 1) return 'today';
  if (days === 1) return 'yesterday';
  if (days < 30) return `${days} days ago`;
  const months = Math.round(days / 30);
  return months === 1 ? 'a month ago' : `${months} months ago`;
};

export const GitHubWidget = () => {
  const activity = useGitHubActivity();
  const days = activity?.days ?? [];
  // last N full weeks, aligned so each column is Sunday through Saturday
  const end = days.length;
  const start = Math.max(0, end - (GITHUB_WEEKS * 7) - (end > 0 ? (6 - new Date(days[end - 1].date).getDay()) : 0));
  const recent = days.slice(start, end);
  const weekSum = recent.slice(-7).reduce((sum, day) => sum + day.count, 0);

  return (
    <section className="desktop-widget github-widget github-widget-live" aria-label="GitHub widget" data-reveal>
      <WidgetLabel icon={FaGithub} name="GitHub" />
      <a className="gh-handle" href={`https://github.com/${GITHUB_USER}`} target="_blank" rel="noopener noreferrer">@{GITHUB_USER}</a>

      <div className="gh-stats">
        <div><strong>{activity?.total != null ? activity.total.toLocaleString() : '—'}</strong><span>contributions this year</span></div>
        <div><strong>{days.length ? currentStreak(days) : '—'}</strong><span>day streak</span></div>
        <div><strong>{days.length ? weekSum : '—'}</strong><span>this week</span></div>
      </div>

      <div className="gh-calendar" role="img" aria-label={`Contribution activity over the last ${GITHUB_WEEKS} weeks`}>
        {(recent.length ? recent : Array.from({ length: GITHUB_WEEKS * 7 }, () => ({ level: 0 }))).map((day, index) => (
          <i className={`contribution-level-${day.level}`} key={day.date ?? index} title={day.date ? `${day.count} on ${day.date}` : undefined} />
        ))}
      </div>

      <div className="gh-repos">
        <span className="gh-section-label">Recently pushed</span>
        {(activity?.repos ?? []).map((repo) => (
          <a className="gh-repo" href={repo.url} target="_blank" rel="noopener noreferrer" key={repo.name}>
            <strong>{repo.name}</strong>
            {repo.description && <span className="gh-repo-description">{repo.description}</span>}
            <span className="gh-repo-meta">
              {repo.language && <><i style={{ background: LANGUAGE_COLORS[repo.language] ?? '#8b949e' }} />{repo.language} · </>}
              updated {relativeDate(repo.pushedAt)}
            </span>
          </a>
        ))}
        {!activity && <span className="gh-repo-placeholder">Loading repositories…</span>}
      </div>
    </section>
  );
};

export const GoldenGateWidget = () => (
  <section className="desktop-widget golden-gate-widget" aria-label="San Francisco widget" data-reveal>
    <img src="/photos/thumbs/14.webp" alt="Golden Gate Bridge at golden hour" decoding="async" />
    <WidgetLabel icon={FaMapMarkerAlt} name="San Francisco" />
  </section>
);

// WMO weather codes from Open-Meteo -> label, icon and background mood (day/night aware)
const describeWeather = (code, isDay = true) => {
  if (code === 0) return { label: isDay ? 'Sunny' : 'Clear', Icon: isDay ? FaSun : FaMoon, mood: 'clear' };
  if (code <= 2) return { label: 'Partly Cloudy', Icon: isDay ? FaCloudSun : FaCloudMoon, mood: 'clear' };
  if (code === 3) return { label: 'Cloudy', Icon: FaCloud, mood: 'cloudy' };
  if (code <= 48) return { label: 'Foggy', Icon: FaSmog, mood: 'cloudy' };
  if (code <= 67 || (code >= 80 && code <= 82)) return { label: 'Rain', Icon: FaCloudRain, mood: 'rain' };
  if (code <= 77 || code === 85 || code === 86) return { label: 'Snow', Icon: FaSnowflake, mood: 'cloudy' };
  return { label: 'Thunderstorms', Icon: FaBolt, mood: 'rain' };
};

const WEATHER_URL = 'https://api.open-meteo.com/v1/forecast?latitude=37.7749&longitude=-122.4194'
  + '&current=temperature_2m,weather_code,is_day&hourly=temperature_2m,weather_code,is_day'
  + '&daily=weather_code,temperature_2m_max,temperature_2m_min&temperature_unit=fahrenheit'
  + '&timezone=America%2FLos_Angeles&forecast_days=6';

const useSanFranciscoWeather = () => {
  const [weather, setWeather] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const load = () => fetch(WEATHER_URL)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!data || cancelled) return;
        const nowIndex = Math.max(0, data.hourly.time.findIndex((time) => time >= data.current.time.slice(0, 13)));
        const hours = data.hourly.time.slice(nowIndex, nowIndex + 6).map((time, i) => ({
          time: i === 0 ? 'Now' : new Date(time).toLocaleTimeString('en-US', { hour: 'numeric' }).replace(' ', ''),
          temperature: Math.round(data.hourly.temperature_2m[nowIndex + i]),
          code: data.hourly.weather_code[nowIndex + i],
          isDay: data.hourly.is_day[nowIndex + i] === 1,
        }));
        const days = data.daily.time.slice(0, 5).map((date, i) => ({
          name: i === 0 ? 'Today' : new Date(`${date}T12:00:00`).toLocaleDateString('en-US', { weekday: 'short' }),
          code: data.daily.weather_code[i],
          high: Math.round(data.daily.temperature_2m_max[i]),
          low: Math.round(data.daily.temperature_2m_min[i]),
        }));
        setWeather({
          temperature: Math.round(data.current.temperature_2m),
          code: data.current.weather_code,
          isDay: data.current.is_day === 1,
          high: days[0].high,
          low: days[0].low,
          hours,
          days,
        });
      })
      .catch(() => {});
    load();
    const interval = window.setInterval(load, 30 * 60 * 1000);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, []);

  return weather;
};

export const WeatherWidget = () => {
  const weather = useSanFranciscoWeather();
  const current = weather ? describeWeather(weather.code, weather.isDay) : null;
  const weekLow = weather ? Math.min(...weather.days.map((day) => day.low)) : 0;
  const weekHigh = weather ? Math.max(...weather.days.map((day) => day.high)) : 1;
  const span = Math.max(1, weekHigh - weekLow);
  const mood = current ? `${weather.isDay ? 'day' : 'night'}-${current.mood}` : 'day-clear';

  return (
    <section className={`desktop-widget weather-widget weather-${mood}`} aria-label="Weather widget" data-reveal>
      <div className="wx-header">
        <div>
          <strong className="wx-city">San Francisco <FaLocationArrow aria-hidden="true" /></strong>
          <span className="wx-temp">{weather ? `${weather.temperature}°` : '—'}</span>
        </div>
        {current && (
          <div className="wx-now">
            <current.Icon aria-hidden="true" />
            <strong>{current.label}</strong>
            <span>H:{weather.high}° L:{weather.low}°</span>
          </div>
        )}
      </div>

      <div className="wx-hours">
        {(weather?.hours ?? []).map((hour) => {
          const { Icon, label } = describeWeather(hour.code, hour.isDay);
          return (
            <div className="wx-hour" key={hour.time}>
              <span>{hour.time}</span>
              <Icon aria-label={label} />
              <strong>{hour.temperature}°</strong>
            </div>
          );
        })}
      </div>

      <div className="wx-days">
        {(weather?.days ?? []).map((day) => {
          const { Icon, label } = describeWeather(day.code, true);
          return (
            <div className="wx-day" key={day.name}>
              <span className="wx-day-name">{day.name}</span>
              <Icon aria-label={label} />
              <span className="wx-day-low">{day.low}°</span>
              <span className="wx-range" aria-hidden="true">
                <i style={{ left: `${((day.low - weekLow) / span) * 100}%`, right: `${100 - ((day.high - weekLow) / span) * 100}%` }} />
              </span>
              <span className="wx-day-high">{day.high}°</span>
            </div>
          );
        })}
      </div>
    </section>
  );
};
