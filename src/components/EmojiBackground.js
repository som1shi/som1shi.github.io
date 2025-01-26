import React, { useEffect, useRef } from 'react';
import './EmojiBackground.css';

const EMOJIS = ['🌟','💫', '✨', '💻', '🚀', '🤖', '⚡', '🔮', '🎮', '🖥️', '📱', '⚙️','🛠️', '📟', '📡','🔗', '📌'];

const EmojiBackground = () => {
    const containerRef = useRef(null);

    const handleMouseMove = (e) => {
        if (!containerRef.current) return;
        const emojis = containerRef.current.getElementsByClassName('emoji-line');
        const mouseX = e.clientX;
        const mouseY = e.clientY;

        Array.from(emojis).forEach(emoji => {
            const rect = emoji.getBoundingClientRect();
            const emojiX = rect.left + rect.width / 2;
            const emojiY = rect.top + rect.height / 2;
            
            const distX = mouseX - emojiX;
            const distY = mouseY - emojiY;
            const distance = Math.sqrt(distX * distX + distY * distY);
            
            if (distance < 150) {
                const angle = Math.atan2(distY, distX);
                const pushX = -Math.cos(angle) * (150 - distance) * 0.3;
                const pushY = -Math.sin(angle) * (150 - distance) * 0.3;
                emoji.style.transform = `translate(${pushX}px, ${pushY}px)`;
            } else {
                emoji.style.transform = 'none';
            }
        });
    };

    const createEmojiLine = () => {
        if (!containerRef.current) return;

        const emoji = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
        const line = document.createElement('div');
        line.className = 'emoji-line';
        line.innerHTML = emoji;

        const startX = Math.random() * window.innerWidth;
        const size = 24 + Math.random() * 20;
        const duration = 15 + Math.random() * 10;
        const goingUp = Math.random() > 0.5;

        line.style.left = `${startX}px`;
        line.style.fontSize = `${size}px`;
        line.style.top = goingUp ? '100%' : '-50px';
        line.style.transition = `top ${duration}s linear`;

        containerRef.current.appendChild(line);

        // Start the animation after a small delay
        setTimeout(() => {
            line.style.top = goingUp ? '-50px' : '100%';
        }, 50);

        // Remove the emoji after animation
        setTimeout(() => {
            if (containerRef.current && containerRef.current.contains(line)) {
                containerRef.current.removeChild(line);
            }
        }, duration * 1000);
    };

    useEffect(() => {
        const interval = setInterval(createEmojiLine, 900);
        for (let i = 0; i < 6; i++) createEmojiLine();

        window.addEventListener('mousemove', handleMouseMove);
        return () => {
            clearInterval(interval);
            window.removeEventListener('mousemove', handleMouseMove);
        };
    }, []);

    return <div ref={containerRef} className="emoji-background" />;
};

export default EmojiBackground; 