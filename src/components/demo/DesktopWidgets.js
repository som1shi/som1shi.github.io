import React, { useEffect, useState } from 'react';
import {
  FaClock,
  FaCloudSun,
  FaGithub,
  FaImages,
  FaMusic,
  FaStickyNote,
  FaSun,
} from 'react-icons/fa';

const contributionLevels = [
  0, 1, 0, 2, 3, 1, 0, 1, 2, 4, 2, 1,
  1, 2, 0, 3, 4, 2, 1, 0, 3, 4, 3, 2,
  0, 1, 2, 3, 2, 1, 0, 2, 4, 3, 1, 0,
  2, 3, 4, 4, 3, 2, 1, 3, 4, 2, 0, 1,
  1, 2, 3, 2, 4, 3, 2, 1, 3, 4, 2, 0,
  0, 1, 2, 3, 4, 4, 3, 2, 1, 2, 3, 1,
  1, 3, 4, 2, 1, 0, 2, 3, 4, 3, 2, 1,
];

const clockCities = [
  { city: 'San Francisco', timeZone: 'America/Los_Angeles' },
  { city: 'Lagos', timeZone: 'Africa/Lagos' },
  { city: 'Lucknow', timeZone: 'Asia/Kolkata' },
];

const galleryPhotos = [
  { src: '/photos/13.JPG', alt: 'Golden Gate Bridge over San Francisco Bay' },
  { src: '/photos/17.jpg', alt: 'Sunset over the Berkeley marina' },
  { src: '/photos/24.JPG', alt: 'Mountain ridge beneath pink clouds' },
  { src: '/photos/32.JPG', alt: 'Mountain valley beneath a blue sky' },
];

const hourlyForecast = [
  { time: 'Now', temperature: '68°', condition: 'clear' },
  { time: '1 PM', temperature: '69°', condition: 'clear' },
  { time: '2 PM', temperature: '70°', condition: 'clear' },
  { time: '3 PM', temperature: '71°', condition: 'partly-cloudy' },
];

const notes = [
  { title: 'Ideas', preview: 'Interfaces that feel calm and useful.', time: 'Today' },
  { title: 'This week', preview: 'Finish the portfolio widget pass.', time: 'Tue' },
  { title: 'Reading list', preview: 'Books, films, and projects to revisit.', time: 'Sun' },
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

const WorldClockWidget = () => {
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

export const MusicWidget = () => (
  <section className="desktop-widget music-widget" aria-label="Music widget" data-reveal>
    <WidgetLabel icon={FaMusic} name="Music" />
    <div className="music-player">
      <div className="music-artwork-frame">
        <img className="music-artwork" src="/photos/17.jpg" alt="Sunset artwork for Daylight" />
      </div>
      <div className="music-track">
        <strong>Daylight</strong>
        <span className="music-artist">Golden Hour Mix</span>
      </div>
    </div>
  </section>
);

const DesktopWidgets = () => (
  <aside className="desktop-demo-widgets" aria-label="Desktop widgets">
    <WorldClockWidget />

    <section className="desktop-widget weather-widget" aria-label="Weather widget" data-reveal>
      <WidgetLabel icon={FaSun} name="Weather" />
      <div className="weather-summary">
        <strong>Berkeley</strong>
        <span className="weather-temperature">68°</span>
        <div className="weather-condition"><strong>Clear</strong><span>H:72° L:55°</span></div>
      </div>
      <div className="weather-forecast">
        {hourlyForecast.map((item) => (
          <div className="weather-hour" key={item.time}>
            <span>{item.time}</span>
            {item.condition === 'partly-cloudy' ? <FaCloudSun /> : <FaSun />}
            <strong>{item.temperature}</strong>
          </div>
        ))}
      </div>
    </section>

    <section className="desktop-widget notes-widget" aria-label="Notes widget" data-reveal>
      <WidgetLabel icon={FaStickyNote} name="Notes" />
      <div className="notes-meta"><span>iCloud</span><strong>3 notes</strong></div>
      <div className="notes-list">
        {notes.map((note) => (
          <div className="note-row" key={note.title}>
            <div><strong>{note.title}</strong><time>{note.time}</time></div>
            <span>{note.preview}</span>
          </div>
        ))}
      </div>
    </section>

    <section className="desktop-widget photos-widget" aria-label="Photos widget" data-reveal>
      <WidgetLabel icon={FaImages} name="Photos" />
      <a className="widget-overlay-link" href="#photos" aria-label="Open photo library" />
      <div className="photos-grid">
        {galleryPhotos.map((photo) => <img src={photo.src} alt={photo.alt} key={photo.src} />)}
      </div>
      <div className="photos-meta"><strong>Recents</strong><span>4 favorites</span></div>
    </section>

    <section className="desktop-widget github-widget" aria-label="GitHub widget" data-reveal>
      <WidgetLabel icon={FaGithub} name="GitHub" />
      <a className="widget-overlay-link" href="https://github.com/som1shi" target="_blank" rel="noopener noreferrer" aria-label="Open GitHub profile" />
      <div className="github-profile"><span>@som1shi</span><strong>Building in public</strong></div>
      <div className="github-repo"><span>Latest repository</span><strong>som1shi.github.io</strong><small>main · updated today</small></div>
      <div className="github-summary"><strong>47 contributions</strong><span>8 day streak</span></div>
      <div className="github-activity">
        <div className="contribution-grid" role="img" aria-label="Contribution activity">
          {contributionLevels.map((level, index) => (
            <i
              className={`contribution-level-${level}`}
              style={{ '--cell-delay': `${(index % 12) * 18}ms` }}
              key={index}
            />
          ))}
        </div>
        <div className="github-legend" aria-hidden="true"><span>Less</span><i /><i /><i /><i /><span>More</span></div>
      </div>
    </section>
  </aside>
);

export default DesktopWidgets;
