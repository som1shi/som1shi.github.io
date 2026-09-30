import React, { useEffect, useRef, useState } from 'react';
import { FaArrowUp, FaGithub, FaLinkedinIn } from 'react-icons/fa';
import { socialLinks } from '../../content/portfolioContent';
import DesktopAppWindow from './DesktopAppWindow';

const TRIGGER = 'show email';
const EMAIL = 'sarvagya [at] berkeley [dot] edu';

const threads = [
  { id: 'sarvagya', name: 'Sarvagya', preview: 'Say “show email” and I’ll send it over.', time: 'Now', initials: 'S' },
  { id: 'linkedin', name: 'LinkedIn', preview: 'linkedin.com/in/sarvagyasomvanshi', time: 'Fri', Icon: FaLinkedinIn, url: socialLinks.linkedin },
  { id: 'github', name: 'GitHub', preview: 'github.com/som1shi', time: 'Thu', Icon: FaGithub, url: socialLinks.github },
];

// Contact as Messages: the email only appears after someone asks for it.
const DesktopMessages = () => {
  const [draft, setDraft] = useState('');
  const [stage, setStage] = useState('idle'); // idle -> typing -> revealed
  const inputRef = useRef(null);
  const ready = draft.trim().toLowerCase() === TRIGGER;

  useEffect(() => {
    if (stage !== 'typing') return undefined;
    const timer = setTimeout(() => setStage('revealed'), 1400);
    return () => clearTimeout(timer);
  }, [stage]);

  const send = (text = draft) => {
    if (text.trim().toLowerCase() !== TRIGGER || stage !== 'idle') return;
    setDraft('');
    setStage('typing');
  };

  return (
    <DesktopAppWindow app="contact">
      <div className="messages-app">
        <aside className="messages-sidebar" aria-label="Conversations">
          <div className="messages-search" aria-hidden="true">Search</div>
          <ul>
            {threads.map((thread) => {
              const body = (
                <>
                  <span className={`messages-avatar${thread.Icon ? ` messages-avatar-${thread.id}` : ''}`} aria-hidden="true">
                    {thread.Icon ? <thread.Icon /> : thread.initials}
                  </span>
                  <span className="messages-thread-text">
                    <span className="messages-thread-top"><strong>{thread.name}</strong><time>{thread.time}</time></span>
                    <span className="messages-thread-preview">{thread.preview}</span>
                  </span>
                </>
              );
              return (
                <li key={thread.id}>
                  {thread.url ? (
                    <a className="messages-thread" href={thread.url} target="_blank" rel="noopener noreferrer">{body}</a>
                  ) : (
                    <div className="messages-thread is-active" aria-current="true">{body}</div>
                  )}
                </li>
              );
            })}
          </ul>
        </aside>

        <section className="messages-conversation" aria-label="Conversation with Sarvagya">
          <header className="messages-header">
            <span className="messages-avatar messages-avatar-small" aria-hidden="true">S</span>
            <strong>Sarvagya</strong>
          </header>

          <div className="messages-transcript" aria-live="polite">
            <span className="messages-stamp">iMessage · Today</span>
            <p className="bubble bubble-in">Hey! Thanks for stopping by 👋</p>
            <p className="bubble bubble-in">Say “show email” and I’ll send my address over.</p>
            {stage !== 'idle' && (
              <>
                <p className="bubble bubble-out">show email</p>
                <span className="messages-receipt">{stage === 'typing' ? 'Delivered' : 'Read'}</span>
              </>
            )}
            {stage === 'typing' && <p className="bubble bubble-in bubble-typing" aria-label="Sarvagya is typing"><i /><i /><i /></p>}
            {stage === 'revealed' && (
              <>
                <p className="bubble bubble-in bubble-email">{EMAIL}</p>
                <p className="bubble bubble-in">Or find me on <a href={socialLinks.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn</a> and <a href={socialLinks.github} target="_blank" rel="noopener noreferrer">GitHub</a>.</p>
                <button type="button" className="messages-reset" onClick={() => { setStage('idle'); inputRef.current?.focus(); }}>
                  Clear conversation
                </button>
              </>
            )}
          </div>

          {stage === 'idle' && (
            <div className="messages-suggestions">
              <button type="button" onClick={() => send(TRIGGER)}>show email</button>
            </div>
          )}

          <form className="messages-compose" onSubmit={(event) => { event.preventDefault(); send(); }}>
            <input
              ref={inputRef}
              type="text"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="iMessage"
              aria-label="Message"
              disabled={stage !== 'idle'}
            />
            <button type="submit" className={ready ? 'is-ready' : ''} disabled={!ready} aria-label="Send">
              <FaArrowUp />
            </button>
          </form>
        </section>
      </div>
    </DesktopAppWindow>
  );
};

export default DesktopMessages;
