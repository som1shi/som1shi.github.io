import React, { useEffect, useRef, useState } from 'react';
import { FaArrowUp, FaCheck, FaGithub, FaLinkedinIn, FaPlus, FaRegCopy, FaRegEdit, FaSearch } from 'react-icons/fa';
import { profile, socialLinks } from '../../content/portfolioContent';
import DesktopAppWindow from './DesktopAppWindow';

// Contact as macOS Messages (dark). Writing to Sarvagya sends a real message through the visitor's mail app;
// the LinkedIn and GitHub threads hold link previews, as Messages shows shared links.
const threads = [
  {
    id: 'sarvagya',
    name: 'Sarvagya',
    initials: 'S',
    time: 'Now',
    preview: 'Hi, I’m Sarvagya.',
    messages: [
      { from: 'them', text: 'Hi, I’m Sarvagya.' },
      { from: 'them', text: 'Happy to talk about work, research, or anything you found here.' },
      { from: 'them', text: 'Send a message below and it’ll open in your mail app, addressed to me.' },
    ],
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    Icon: FaLinkedinIn,
    time: 'Fri',
    preview: 'linkedin.com/in/sarvagyasomvanshi',
    messages: [
      { from: 'them', text: 'Experience, roles and the long version of the résumé:' },
      { from: 'them', link: { url: socialLinks.linkedin, title: 'Sarvagya Somvanshi · LinkedIn', domain: 'linkedin.com', Icon: FaLinkedinIn } },
    ],
  },
  {
    id: 'github',
    name: 'GitHub',
    Icon: FaGithub,
    time: 'Thu',
    preview: 'github.com/som1shi',
    messages: [
      { from: 'them', text: 'Code for os32, the games, and this site:' },
      { from: 'them', link: { url: socialLinks.github, title: 'som1shi · GitHub', domain: 'github.com', Icon: FaGithub } },
    ],
  },
];

const Avatar = ({ thread, small }) => (
  <span className={`msg-avatar msg-avatar-${thread.id}${small ? ' msg-avatar-small' : ''}`} aria-hidden="true">
    {thread.Icon ? <thread.Icon /> : thread.initials}
  </span>
);

// open the visitor's mail app without navigating the page away
const openMail = (text) => {
  const link = document.createElement('a');
  link.href = `mailto:${profile.email}?subject=${encodeURIComponent('Hello from your site')}&body=${encodeURIComponent(text)}`;
  link.click();
};

// copy action shown under the reply like Messages' small metadata line
const CopyEmail = () => {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard?.writeText(profile.email).then(() => {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    }).catch(() => {});
  };
  return (
    <button type="button" className={`msg-copy${copied ? ' is-copied' : ''}`} onClick={copy}>
      {copied ? <><FaCheck aria-hidden="true" /> Copied</> : <><FaRegCopy aria-hidden="true" /> Copy email</>}
    </button>
  );
};

const DesktopMessages = () => {
  const [activeId, setActiveId] = useState('sarvagya');
  const [extra, setExtra] = useState([]); // what the visitor sent to Sarvagya, and his replies
  const [typing, setTyping] = useState(false);
  const [draft, setDraft] = useState('');
  const transcriptRef = useRef(null);
  const replied = useRef(false);
  const active = threads.find((thread) => thread.id === activeId);
  const canWrite = activeId === 'sarvagya';
  const lastMine = [...extra].reverse().find((message) => message.from === 'me');

  useEffect(() => {
    const el = transcriptRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  }, [activeId, extra, typing]);

  useEffect(() => {
    if (!typing) return undefined;
    const timer = window.setTimeout(() => {
      setTyping(false);
      setExtra((list) => [...list, { from: 'them', id: Date.now(), reply: true }]);
    }, 1400);
    return () => window.clearTimeout(timer);
  }, [typing]);

  const send = (event) => {
    event.preventDefault();
    const text = draft.trim();
    if (!text || !canWrite) return;
    setExtra((list) => [...list, { from: 'me', id: Date.now(), text }]);
    setDraft('');
    openMail(text);
    if (!replied.current) {
      replied.current = true;
      window.setTimeout(() => setTyping(true), 700);
    }
  };

  return (
    <DesktopAppWindow app="contact">
      <div className="msg-app">
        <aside className="msg-sidebar" aria-label="Conversations">
          <div className="msg-sidebar-toolbar">
            <img className="msg-app-icon" src="/icons/dock/messages.png" alt="" />
            <strong>Messages</strong>
            <span className="msg-compose-icon" aria-hidden="true"><FaRegEdit /></span>
          </div>
          <label className="msg-search">
            <FaSearch aria-hidden="true" />
            <input type="search" placeholder="Search" aria-label="Search conversations" />
          </label>
          <ul>
            {threads.map((thread) => (
              <li key={thread.id}>
                <button
                  type="button"
                  className="msg-thread"
                  aria-current={thread.id === activeId ? 'true' : undefined}
                  onClick={() => setActiveId(thread.id)}
                >
                  <Avatar thread={thread} />
                  <span className="msg-thread-text">
                    <span className="msg-thread-top"><strong>{thread.name}</strong><time>{thread.time}</time></span>
                    <span className="msg-thread-preview">
                      {thread.id === 'sarvagya' && lastMine ? `You: ${lastMine.text}` : thread.preview}
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </aside>

        <section className="msg-conversation" aria-label={`Conversation with ${active.name}`}>
          <header className="msg-header">
            <span className="msg-header-to">To:</span>
            <span className="msg-header-chip"><Avatar thread={active} small />{active.name}</span>
          </header>

          <div className="msg-transcript" ref={transcriptRef} aria-live="polite" key={activeId}>
            {active.messages.map((message, index) => (
              message.link ? (
                <a className="msg-link msg-in msg-enter" style={{ animationDelay: `${index * 70}ms` }} href={message.link.url} target="_blank" rel="noopener noreferrer" key={index}>
                  <span className="msg-link-art"><message.link.Icon aria-hidden="true" /></span>
                  <span className="msg-link-meta">
                    <strong>{message.link.title}</strong>
                    <span>{message.link.domain}</span>
                  </span>
                </a>
              ) : (
                <p className="msg-bubble msg-in msg-enter" style={{ animationDelay: `${index * 70}ms` }} key={index}>{message.text}</p>
              )
            ))}
            {canWrite && extra.map((message) => (
              message.from === 'me' ? (
                <React.Fragment key={message.id}>
                  <p className="msg-bubble msg-out msg-sent">{message.text}</p>
                  {message === lastMine && <span className="msg-receipt">Delivered</span>}
                </React.Fragment>
              ) : (
                <React.Fragment key={message.id}>
                  <p className="msg-bubble msg-in msg-pop">Thanks! Your mail app should open with that ready to send.</p>
                  <p className="msg-bubble msg-in msg-pop" style={{ animationDelay: '120ms' }}>
                    If it didn’t, you can reach me at{' '}
                    <a className="msg-detected" href={`mailto:${profile.email}`}>{profile.email}</a>
                  </p>
                  <CopyEmail />
                </React.Fragment>
              )
            ))}
            {canWrite && typing && (
              <p className="msg-bubble msg-in msg-typing msg-pop" aria-label="Sarvagya is typing"><i /><i /><i /></p>
            )}
          </div>

          <form className="msg-compose" onSubmit={send}>
            <button type="button" className="msg-compose-apps" aria-label="Apps" tabIndex={-1}><FaPlus /></button>
            <div className="msg-field">
              <input
                type="text"
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder={canWrite ? 'iMessage' : `Open the link above to reach me on ${active.name}`}
                aria-label="Message"
                disabled={!canWrite}
              />
              {draft.trim() && (
                <button type="submit" className="msg-send" aria-label="Send"><FaArrowUp /></button>
              )}
            </div>
          </form>
        </section>
      </div>
    </DesktopAppWindow>
  );
};

export default DesktopMessages;
