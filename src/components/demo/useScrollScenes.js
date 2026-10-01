import { useEffect } from 'react';

const clamp = (v) => Math.min(1, Math.max(0, v));
const ease = (t) => 1 - (1 - t) ** 3;

// Scroll-linked scenes: each top-level section rises and scales up as it comes in from the bottom
// (like an app opening), then recedes slightly as it scrolls off the top. It follows the scroll position
// in both directions. Once a section has mostly arrived it gets data-entered, which starts its inner cascade.
const useScrollScenes = (containerRef) => {
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      container.querySelectorAll('.desktop-demo-workspace > *').forEach((scene) => { scene.dataset.entered = 'true'; });
      return undefined;
    }

    let frame = 0;
    const update = () => {
      frame = 0;
      const view = container.clientHeight;
      const scenes = container.querySelectorAll('.desktop-demo-workspace > *');
      scenes.forEach((scene, index) => {
        const rect = scene.getBoundingClientRect();
        // 0 while the top edge is below the fold, 1 once it has risen 55% of the way up
        const enter = index === 0 ? 1 : ease(clamp((view - rect.top) / (view * 0.55)));
        // 0 until the bottom edge passes 30% from the top, 1 as it leaves
        const exit = clamp((view * 0.3 - rect.bottom) / (view * 0.3));
        const y = (1 - enter) * 70;
        const scale = 0.92 + 0.08 * enter - 0.035 * exit;
        const opacity = (0.15 + 0.85 * enter) * (1 - 0.45 * exit);
        scene.style.transform = `translate3d(0, ${y.toFixed(1)}px, 0) scale(${scale.toFixed(4)})`;
        scene.style.opacity = opacity.toFixed(3);
        if (enter > 0.35 && !scene.dataset.entered) scene.dataset.entered = 'true';
      });
    };

    // scroll events already arrive at most once per frame, so update in place (no extra frame of lag)
    const onScroll = () => update();
    const onResize = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    container.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);
    return () => {
      cancelAnimationFrame(frame);
      container.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
    };
  }, [containerRef]);
};

export default useScrollScenes;
