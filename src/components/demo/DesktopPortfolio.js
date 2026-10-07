import React, { useEffect, useRef, useState } from 'react';
import { FaExternalLinkAlt, FaThumbtack } from 'react-icons/fa';
import { experiences, projects, research, socialLinks } from '../../content/portfolioContent';
import notes from '../../content/notes.json';
import DesktopAppWindow from './DesktopAppWindow';
import Os32LivePreview from './Os32LivePreview';
import { GitHubWidget, WorldClockWidget } from './DesktopWidgets';

const ExternalLink = ({ href, children, className = '', ...props }) => (
  <a className={className} href={href} target="_blank" rel="noopener noreferrer" {...props}>
    {children}
  </a>
);

// "January 2026 – May 2026" -> "Jan 2026"
const shortDate = (date) => {
  const [month, year] = date.split(/\s+/);
  return year ? `${month.slice(0, 3)} ${year}` : date;
};

const arxivId = (url) => url?.match(/arxiv\.org\/abs\/([\w.]+)/)?.[1] ?? null;

// Research as Preview.app: page thumbnails on the left, the selected paper on the right.
const PreviewApp = () => {
  const [selectedId, setSelectedId] = useState(research[0].id);
  const canvasRef = useRef(null);
  useEffect(() => {
    if (canvasRef.current) canvasRef.current.scrollTop = 0;
  }, [selectedId]);
  const selectedIndex = Math.max(0, research.findIndex((item) => item.id === selectedId));
  const selected = research[selectedIndex];

  return (
    <div className="preview-app">
      <div className="preview-app-toolbar" aria-hidden="true">
        <span>{selected.title}</span>
      </div>
      <nav className="notes-app-sidebar preview-app-list" aria-label="Research papers">
        <div className="notes-app-folder"><span>Research</span><strong>{research.length} papers</strong></div>
        <ul>
          {research.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                className="notes-app-item"
                aria-current={item.id === selectedId ? 'true' : undefined}
                onClick={() => setSelectedId(item.id)}
              >
                <strong>{item.title}</strong>
                <span>
                  <time>{shortDate(item.date)}</time>
                  {arxivId(item.url) && <img className="preview-arxiv-tag" src="/marks/arxiv-logo.svg" alt="arXiv" />}
                  {item.organization}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
      <div className="preview-app-canvas" ref={canvasRef}>
        <article className="preview-paper" key={selected.id}>
          {arxivId(selected.url) && (
            <ExternalLink href={selected.url} className="preview-paper-stamp" title="Open on arXiv">
              arXiv:{arxivId(selected.url)}
            </ExternalLink>
          )}
          <h3>{selected.title}</h3>
          <span className="preview-paper-org">{selected.organization}</span>
          <span className="preview-paper-date">{selected.date}</span>
          <section className="preview-paper-abstract">
            <h4>Summary</h4>
            <p>{selected.description}</p>
          </section>
          {selected.url && (
            <ExternalLink href={selected.url} className="preview-paper-link">
              Read the paper <FaExternalLinkAlt />
            </ExternalLink>
          )}
          <div className="preview-paper-body" aria-hidden="true">
            {Array.from({ length: 2 }, (_, column) => (
              <div key={column}>{Array.from({ length: 14 }, (_, line) => <i key={line} />)}</div>
            ))}
          </div>
          <span className="preview-paper-folio" aria-hidden="true">{selectedIndex + 1}</span>
        </article>
      </div>
    </div>
  );
};

// Experience as a Pages document: a typeset résumé on a sheet of paper.
// "July 2026 – Present" -> 2026, "Summer 2025" -> 2025
const yearOf = (date) => (date.match(/\d{4}/) || [''])[0];
const seasonOf = (date) => date.replace(/\s*\d{4}.*$/, '').trim();

const PagesResume = () => (
  <div className="pages-app">
    <article className="pages-sheet">
      <header className="pages-sheet-header">
        <div>
          <h3>Experience</h3>
          <span className="pages-sheet-sub">{experiences.length} roles · {yearOf(experiences[experiences.length - 1].date)}–now</span>
        </div>
        <ExternalLink href={socialLinks.linkedin} className="pages-sheet-link">
          LinkedIn <FaExternalLinkAlt />
        </ExternalLink>
      </header>
      <ol className="xp-timeline">
        {experiences.map((item, index) => {
          const year = yearOf(item.date);
          const showYear = index === 0 || yearOf(experiences[index - 1].date) !== year;
          const current = /present/i.test(item.date);
          return (
            <li className={`xp-row${current ? ' is-current' : ''}`} key={item.id}>
              <span className="xp-year">{showYear ? year : ''}</span>
              <span className="xp-dot" aria-hidden="true" />
              <div className="xp-body">
                <div className="xp-line">
                  <strong>{item.company}</strong>
                  {current ? <span className="xp-now">Now</span> : seasonOf(item.date) && <span className="xp-season">{seasonOf(item.date)}</span>}
                </div>
                <div className="xp-line xp-sub">
                  <span>{item.role}</span>
                  <span className="xp-place">{item.location}</span>
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </article>
  </div>
);

const OS32_ASCII = `
 ██████╗ ███████╗██████╗ ██████╗
██╔═══██╗██╔════╝╚════██╗╚════██╗
██║   ██║███████╗ █████╔╝ █████╔╝
██║   ██║╚════██║ ╚═══██╗██╔═══╝
╚██████╔╝███████║██████╔╝███████╗
 ╚═════╝ ╚══════╝╚═════╝ ╚══════╝`;

const FOLDER_ASCII = `
┌──────┐
│      └───────┐
│              │
│              │
│              │
└──────────────┘`;

// Apple Notes-style date: "Today", a weekday within the last week, otherwise "Sep 3".
const noteDate = (iso) => {
  if (!iso) return '';
  const date = new Date(`${iso}T12:00:00`);
  const days = Math.floor((Date.now() - date.getTime()) / 86400000);
  if (days < 1) return 'Today';
  if (days < 7) return date.toLocaleDateString('en-US', { weekday: 'short' });
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

// Notes come from notes/*.md, converted by `npm run notes` (scripts/build-notes.mjs).
const NotesApp = () => {
  const [selectedId, setSelectedId] = useState(notes[0]?.id);
  const selected = notes.find((note) => note.id === selectedId) ?? notes[0];
  const groups = [
    { label: 'Pinned', items: notes.filter((note) => note.pinned) },
    { label: 'Recently', items: notes.filter((note) => !note.pinned) },
  ].filter((group) => group.items.length);

  return (
    <div className="notes-app">
      <nav className="notes-app-sidebar" aria-label="Notes">
        {groups.map((group) => (
          <section className="notes-app-group" key={group.label} aria-label={group.label}>
            <h4>{group.label}</h4>
            <ul>
              {group.items.map((note) => (
                <li key={note.id}>
                  <button
                    type="button"
                    className="notes-app-item"
                    aria-current={note.id === selected?.id ? 'true' : undefined}
                    onClick={() => setSelectedId(note.id)}
                  >
                    <strong>{note.title}</strong>
                    <span>
                      {note.pinned
                        ? <FaThumbtack className="notes-pin" aria-label="Pinned" />
                        : <time>{noteDate(note.date)}</time>}
                      {note.preview}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </nav>
      {selected && (
        <article className="notes-app-note" aria-label={selected.title} key={selected.id}>
          <div className="desktop-about-copy note-body">
            {selected.date && (
              <time className="notes-note-stamp" dateTime={selected.date}>
                {new Date(`${selected.date}T12:00:00`).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </time>
            )}
            <h3 className="notes-note-title">{selected.title}</h3>
            {/* authored locally in notes/*.md and escaped by the build script */}
            <div dangerouslySetInnerHTML={{ __html: selected.html }} />
          </div>
        </article>
      )}
    </div>
  );
};

const DesktopPortfolio = () => {
  const remainingProjects = projects.filter((project) => !project.featured);

  return (
    <>
      <section id="about" className="desktop-story desktop-about" aria-label="Ideas">
        <DesktopAppWindow app="about">
          <NotesApp />
        </DesktopAppWindow>
      </section>

      <section id="projects" className="desktop-story" aria-label="Projects">
        <DesktopAppWindow app="projects">
          <div className="projects-term">
            <div className="projects-term-top">
              <section className="term-block term-block-os32" aria-label="os32">
                <p className="term-line"><span className="term-prompt">sarvagya@macbook ~ %</span> open os32</p>
                <div className="term-os32">
                  <div className="term-os32-copy">
                    <span className="term-kicker"># featured · web operating system</span>
                    <h3 className="term-sr-only">os32</h3>
                    <pre className="term-ascii" aria-hidden="true">{OS32_ASCII.trim()}</pre>
                    <p>A playful desktop with a file system, terminal, browser, and built-in apps.</p>
                    <ExternalLink href={socialLinks.os32} className="term-open-link">
                      os32.vercel.app <FaExternalLinkAlt />
                    </ExternalLink>
                  </div>
                  <Os32LivePreview />
                </div>
              </section>
              <section className="term-block term-block-courses" aria-label="Coursework">
                <p className="term-line"><span className="term-prompt">sarvagya@macbook ~ %</span> ls ~/coursework</p>
                <div className="course-folder-grid">
                  {projects.filter((project) => project.featured && project.id !== 'os32').map((project) => (
                    <ExternalLink href={project.url} className="course-folder" key={project.id}>
                      <pre className="term-folder" aria-hidden="true">{FOLDER_ASCII.trim()}</pre>
                      <strong>{project.id === 'computer-vision' ? 'cs180/' : 'cs184/'}</strong>
                      <span># {project.id === 'computer-vision' ? 'computational photography' : 'computer graphics'}</span>
                      <small className="term-tags">{project.technologies.slice(0, 3).map((tech) => <span key={tech}>{tech}</span>)}</small>
                    </ExternalLink>
                  ))}
                </div>
              </section>
            </div>

          <div className="project-terminal" aria-label="More projects">
            <p className="term-line"><span className="term-prompt">sarvagya@macbook ~ %</span> ls ~/projects</p>
            <div className="term-listing">
            {remainingProjects.map((project) => {
              const slug = project.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
              const name = <span className="term-dir">{slug}/</span>;
              return (
                <div className="term-entry" key={project.id}>
                  <p className="term-line">
                    {project.url ? <ExternalLink href={project.url}>{name} <span className="term-link-mark">↗</span></ExternalLink> : name}
                    {!project.url && <span className="term-private"> private</span>}
                  </p>
                  <p className="term-comment"># {project.description}</p>
                  <p className="term-tags">{project.technologies.map((tech) => <span key={tech}>{tech}</span>)}</p>
                </div>
              );
            })}
            </div>
          </div>
          </div>
        </DesktopAppWindow>
      </section>

      <section id="research" className="desktop-story" aria-label="Research">
        <div className="research-split">
          <WorldClockWidget />
          <DesktopAppWindow app="research">
            <PreviewApp />
          </DesktopAppWindow>
        </div>
      </section>

      <section id="experience" className="desktop-story" aria-label="Experience">
        <div className="experience-split">
          <DesktopAppWindow app="experience">
            <PagesResume />
          </DesktopAppWindow>
          <GitHubWidget />
        </div>
      </section>
    </>
  );
};

export default DesktopPortfolio;
