import React, { useMemo, useState } from 'react';
import {
  FaCheck,
  FaCode,
  FaDesktop,
  FaDiceFive,
  FaEnvelope,
  FaFileAlt,
  FaImage,
} from 'react-icons/fa';
import { games, photos, profile, research, socialLinks } from '../../content/portfolioContent';
import mediaLibrary from '../../content/mediaLibrary.json';
import DesktopAppWindow from './DesktopAppWindow';

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const REPO_URL = 'https://github.com/som1shi/som1shi.github.io';

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

const pick = (list) => list[Math.floor(Math.random() * list.length)];

// Shortcuts: one-tap actions, tiled like the Shortcuts widget.
export const ShortcutsWidget = ({ onOpenPhoto }) => {
  const [copied, setCopied] = useState(false);

  const copyEmail = () => {
    navigator.clipboard?.writeText(profile.email).then(() => {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    }).catch(() => {});
  };

  const shortcuts = [
    { id: 'email', label: copied ? 'Copied' : 'Copy Email', Icon: copied ? FaCheck : FaEnvelope, onClick: copyEmail },
    { id: 'os32', label: 'Open os32', Icon: FaDesktop, href: socialLinks.os32 },
    { id: 'paper', label: 'Read the Paper', Icon: FaFileAlt, href: research[0].url },
    { id: 'photo', label: 'Random Photo', Icon: FaImage, onClick: () => onOpenPhoto?.(pick(photos)) },
    { id: 'game', label: 'Surprise Game', Icon: FaDiceFive, onClick: () => { window.location.href = pick(games).route; } },
    { id: 'source', label: 'View Source', Icon: FaCode, href: REPO_URL },
  ];

  return (
    <section className="desktop-widget shortcuts-widget" aria-label="Shortcuts widget" data-reveal>
      {shortcuts.map(({ id, label, Icon, href, onClick }) => {
        const content = (
          <>
            <Icon aria-hidden="true" />
            <span>{label}</span>
          </>
        );
        return href ? (
          <a className={`shortcut shortcut-${id}`} href={href} target="_blank" rel="noopener noreferrer" key={id}>{content}</a>
        ) : (
          <button type="button" className={`shortcut shortcut-${id}`} onClick={onClick} key={id} aria-live={id === 'email' ? 'polite' : undefined}>
            {content}
          </button>
        );
      })}
    </section>
  );
};

const syncedOn = new Date(mediaLibrary.syncedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
const filmCount = Object.values(mediaLibrary.films).flat().length;

// About This Site, in the shape of About This Mac.
export const AboutSiteWindow = () => (
  <DesktopAppWindow app="aboutSite">
    <div className="about-site">
      <div className="about-site-machine" aria-hidden="true">
        <div className="about-site-screen">
          <span className="about-site-menubar" />
          <span className="about-site-card" />
          <span className="about-site-widget" />
          <span className="about-site-widget about-site-widget-photo" />
        </div>
        <div className="about-site-base" />
      </div>

      <div className="about-site-copy">
        <h3>som1shi.github.io</h3>
        <span className="about-site-version">Version 2026.{new Date(mediaLibrary.syncedAt).getMonth() + 1}</span>
        <dl>
          <div><dt>Built with</dt><dd>React · CSS, no UI kit</dd></div>
          <div><dt>Library</dt><dd>{mediaLibrary.books.length} books · {filmCount} films</dd></div>
          <div><dt>Sources</dt><dd>Goodreads · Letterboxd</dd></div>
          <div><dt>Last synced</dt><dd>{syncedOn}</dd></div>
          <div><dt>Live data</dt><dd>GitHub activity · San Francisco weather</dd></div>
          <div><dt>Photos</dt><dd>{photos.length} photographs</dd></div>
          <div><dt>Location</dt><dd>{profile.location}</dd></div>
        </dl>
        <div className="about-site-actions">
          <a href={REPO_URL} target="_blank" rel="noopener noreferrer">View Source</a>
          <a href={socialLinks.github} target="_blank" rel="noopener noreferrer">More Projects</a>
        </div>
      </div>
    </div>
  </DesktopAppWindow>
);
