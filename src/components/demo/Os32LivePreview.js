import React, { useEffect, useRef, useState } from 'react';
import { socialLinks } from '../../content/portfolioContent';

const OS32_WIDTH = 1280;
const OS32_HEIGHT = 800;

// The real os32 desktop, rendered live and scaled into a monitor frame; clicks open the site.
const Os32LivePreview = () => {
  const frameRef = useRef(null);
  const [scale, setScale] = useState(0.4);

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame || !('ResizeObserver' in window)) return undefined;
    const observer = new ResizeObserver(([entry]) => setScale(entry.contentRect.width / OS32_WIDTH));
    observer.observe(frame);
    return () => observer.disconnect();
  }, []);

  return (
    <a href={socialLinks.os32} target="_blank" rel="noopener noreferrer" className="os32-live" aria-label="Open os32 in a new tab">
      <span className="os32-live-screen" ref={frameRef}>
        <iframe
          src={socialLinks.os32}
          title="os32 live preview"
          loading="lazy"
          tabIndex="-1"
          aria-hidden="true"
          style={{ width: OS32_WIDTH, height: OS32_HEIGHT, transform: `scale(${scale})` }}
        />
      </span>
      <span className="os32-live-hint">Open os32 ↗</span>
    </a>
  );
};

export default Os32LivePreview;
