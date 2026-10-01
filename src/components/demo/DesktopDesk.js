import React, { useMemo } from 'react';
import mediaLibrary from '../../content/mediaLibrary.json';

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

const localIso = (date) => [
  date.getFullYear(),
  String(date.getMonth() + 1).padStart(2, '0'),
  String(date.getDate()).padStart(2, '0'),
].join('-');

const shortDate = (iso) => new Date(`${iso}T12:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

const stars = (rating) => (rating ? `${'★'.repeat(Math.floor(rating))}${rating % 1 ? '½' : ''}` : '');

// Every dated entry from the Letterboxd and Goodreads sync, newest first.
const diaryEntries = () => {
  const films = Object.values(mediaLibrary.films).flat()
    .filter((film) => film.watchedAt)
    .map((film) => ({ date: film.watchedAt, kind: 'film', verb: film.rewatch ? 'Rewatched' : 'Watched', title: film.title, rating: film.rating, url: film.url }));
  const books = mediaLibrary.books.flatMap((book) => [
    book.readAt && { date: book.readAt, kind: 'book', verb: 'Finished', title: book.title, rating: book.rating, url: book.url },
    book.status === 'Reading' && book.addedAt && { date: book.addedAt, kind: 'book', verb: 'Started', title: book.title, url: book.url },
  ]).filter(Boolean);
  const seen = new Set();
  return [...films, ...books]
    .sort((a, b) => b.date.localeCompare(a.date))
    .filter((entry) => {
      const key = `${entry.date}|${entry.title}`;
      return !seen.has(key) && seen.add(key);
    });
};

// Calendar: this month, with a dot on each day that has a diary entry.
export const CalendarWidget = () => {
  const today = new Date();
  const todayIso = localIso(today);
  const entries = useMemo(diaryEntries, []);
  const marked = new Set(entries.map((entry) => entry.date));
  const first = new Date(today.getFullYear(), today.getMonth(), 1);
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const cells = [
    ...Array.from({ length: first.getDay() }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => new Date(today.getFullYear(), today.getMonth(), i + 1)),
  ];

  return (
    <section className="desktop-widget calendar-widget" aria-label="Calendar widget" data-reveal>
      <header className="cal-header">
        <span className="cal-weekday">{today.toLocaleDateString('en-US', { weekday: 'long' })}</span>
        <span className="cal-month">{today.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
      </header>

      <div className="cal-grid" role="grid" aria-label="This month">
        {WEEKDAYS.map((day, i) => <span className="cal-dow" key={`dow-${i}`}>{day}</span>)}
        {cells.map((date, i) => {
          if (!date) return <span key={`pad-${i}`} />;
          const iso = localIso(date);
          return (
            <span
              className={`cal-day${iso === todayIso ? ' is-today' : ''}${marked.has(iso) ? ' has-entry' : ''}`}
              key={iso}
            >
              {date.getDate()}
            </span>
          );
        })}
      </div>

      <div className="cal-events">
        <span className="cal-events-label">Diary</span>
        <ul>
          {entries.slice(0, 4).map((entry) => (
            <li key={`${entry.date}-${entry.title}`}>
              <a href={entry.url} target="_blank" rel="noopener noreferrer" className={`cal-event cal-event-${entry.kind}`}>
                <span className="cal-event-bar" aria-hidden="true" />
                <span className="cal-event-text">
                  <strong>{entry.verb} {entry.title}</strong>
                  <span>{shortDate(entry.date)}{entry.rating ? ` · ${stars(entry.rating)}` : ''}</span>
                </span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};
