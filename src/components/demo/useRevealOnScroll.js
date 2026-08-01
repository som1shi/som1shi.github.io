import { useEffect } from 'react';

const useRevealOnScroll = (containerRef) => {
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;

    const targets = Array.from(container.querySelectorAll('[data-reveal]'));
    targets.forEach((target, index) => {
      target.style.setProperty('--reveal-delay', index < 4 ? `${index * 45}ms` : '0ms');
    });
    container.dataset.motionReady = 'true';

    if (typeof window.IntersectionObserver !== 'function') {
      targets.forEach((target) => { target.dataset.visible = 'true'; });
      return undefined;
    }

    const observer = new window.IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.dataset.visible = 'true';
        observer.unobserve(entry.target);
      });
    }, {
      root: container,
      rootMargin: '0px 0px -10% 0px',
      threshold: 0.08,
    });

    targets.forEach((target) => observer.observe(target));
    return () => observer.disconnect();
  }, [containerRef]);
};

export default useRevealOnScroll;
