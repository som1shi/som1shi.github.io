import React, { useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { ContactShadows } from '@react-three/drei/core/ContactShadows';
import { RoundedBox } from '@react-three/drei/core/RoundedBox';
import { useTexture } from '@react-three/drei/core/Texture';
import {
  CanvasTexture,
  Color,
  DoubleSide,
  MathUtils,
  SRGBColorSpace,
} from 'three';

const makeBookTexture = (item, face) => {
  const canvas = document.createElement('canvas');
  const isSpine = face === 'spine';
  canvas.width = isSpine ? 1536 : 1024;
  canvas.height = isSpine ? 256 : 768;
  const context = canvas.getContext('2d');
  const background = isSpine ? item.spine : item.cover;
  const gradient = context.createLinearGradient(0, 0, canvas.width, canvas.height);
  gradient.addColorStop(0, background);
  gradient.addColorStop(0.55, new Color(background).offsetHSL(0, 0, 0.035).getStyle());
  gradient.addColorStop(1, new Color(background).offsetHSL(0, 0, -0.055).getStyle());
  context.fillStyle = gradient;
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.globalAlpha = 0.08;
  context.strokeStyle = item.ink;
  for (let line = 12; line < canvas.height; line += 18) {
    context.beginPath();
    context.moveTo(0, line);
    context.lineTo(canvas.width, line);
    context.stroke();
  }
  context.globalAlpha = 1;
  context.fillStyle = item.ink;

  if (isSpine) {
    context.textBaseline = 'middle';
    context.font = '500 44px Georgia';
    context.fillText(item.creator, 64, canvas.height / 2);
    context.textAlign = 'center';
    context.font = '500 58px Georgia';
    context.fillText(item.title, canvas.width * 0.57, canvas.height / 2);
    context.textAlign = 'right';
    context.font = '600 38px -apple-system, BlinkMacSystemFont, sans-serif';
    context.fillText('◉', canvas.width - 64, canvas.height / 2);
  } else {
    context.textAlign = 'center';
    context.textBaseline = 'top';
    context.font = '600 30px -apple-system, BlinkMacSystemFont, sans-serif';
    context.fillText(item.creator.toUpperCase(), canvas.width / 2, 704);
    context.font = '500 88px Georgia';
    const words = item.title.split(' ');
    const lines = [];
    let line = '';
    words.forEach((word) => {
      const next = `${line} ${word}`.trim();
      if (context.measureText(next).width > canvas.width - 180 && line) {
        lines.push(line);
        line = word;
      } else {
        line = next;
      }
    });
    lines.push(line);
    lines.slice(0, 3).forEach((text, index) => context.fillText(text, canvas.width / 2, 420 + index * 96));
    context.strokeStyle = item.ink;
    context.lineWidth = 4;
    context.globalAlpha = 0.24;
    context.beginPath();
    context.arc(canvas.width / 2, 170, 64, 0, Math.PI * 2);
    context.stroke();
    context.beginPath();
    context.arc(canvas.width / 2, 170, 34, 0, Math.PI * 2);
    context.stroke();
  }

  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.anisotropy = 8;
  texture.needsUpdate = true;
  return texture;
};

const Book = ({ item }) => {
  const coverTexture = useMemo(() => makeBookTexture(item, 'cover'), [item]);
  const spineTexture = useMemo(() => makeBookTexture(item, 'spine'), [item]);
  const [width, thickness, depth] = item.size;

  useEffect(() => () => {
    coverTexture.dispose();
    spineTexture.dispose();
  }, [coverTexture, spineTexture]);

  return (
    <group position={item.position} rotation={item.rotation}>
      <RoundedBox args={[width - 0.08, thickness - 0.12, depth - 0.12]} radius={0.035} smoothness={3}>
        <meshStandardMaterial color={item.pages} roughness={0.72} />
      </RoundedBox>
      <RoundedBox args={[width, 0.07, depth]} position={[0, thickness / 2, 0]} radius={0.045} smoothness={3}>
        <meshStandardMaterial map={coverTexture} roughness={0.68} />
      </RoundedBox>
      <mesh position={[0, thickness / 2 + 0.075, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[width - 0.16, depth - 0.16]} />
        <meshBasicMaterial
          map={coverTexture}
          side={DoubleSide}
          toneMapped={false}
          polygonOffset
          polygonOffsetFactor={-1}
          polygonOffsetUnits={-4}
        />
      </mesh>
      <RoundedBox args={[width, 0.07, depth]} position={[0, -thickness / 2, 0]} radius={0.045} smoothness={3}>
        <meshStandardMaterial color={item.cover} roughness={0.74} />
      </RoundedBox>
      <RoundedBox args={[width, thickness, 0.1]} position={[0, 0, depth / 2]} radius={0.035} smoothness={3}>
        <meshStandardMaterial color={item.spine} roughness={0.66} />
      </RoundedBox>
      <mesh position={[0, 0, depth / 2 + 0.052]}>
        <planeGeometry args={[width - 0.15, thickness - 0.13]} />
        <meshStandardMaterial map={spineTexture} roughness={0.7} />
      </mesh>
    </group>
  );
};

const Poster = ({ item }) => {
  const texture = useTexture(item.src);
  const [width, height, depth] = item.size;

  useEffect(() => {
    texture.colorSpace = SRGBColorSpace;
    texture.anisotropy = 8;
    texture.needsUpdate = true;
  }, [texture]);

  return (
    <group position={item.position} rotation={item.rotation}>
      <RoundedBox args={[width, height, depth]} radius={0.06} smoothness={4}>
        <meshStandardMaterial color={item.edge} roughness={0.54} metalness={0.04} />
      </RoundedBox>
      <mesh position={[0, 0, depth / 2 + 0.008]}>
        <planeGeometry args={[width - 0.13, height - 0.13]} />
        <meshBasicMaterial map={texture} toneMapped={false} />
      </mesh>
    </group>
  );
};

const SceneMotion = ({ children, kind, progress, reducedMotion }) => {
  const group = useRef(null);
  const { viewport } = useThree();
  const baseRotation = kind === 'books' ? 0.3 : 0.02;
  const scale = Math.min(1, viewport.width / (kind === 'books' ? 9.5 : 11.2));

  useFrame((state, delta) => {
    if (!group.current || reducedMotion) return;
    group.current.rotation.x = MathUtils.damp(
      group.current.rotation.x,
      baseRotation + state.pointer.y * 0.025,
      5,
      delta,
    );
    group.current.rotation.y = MathUtils.damp(
      group.current.rotation.y,
      state.pointer.x * 0.055,
      5,
      delta,
    );
    group.current.position.y = MathUtils.damp(
      group.current.position.y,
      (0.5 - progress) * 0.28,
      4,
      delta,
    );
  });

  return <group ref={group} rotation={[baseRotation, 0, 0]} scale={scale}>{children}</group>;
};

const Scene = ({ items, kind, progress, reducedMotion }) => (
  <>
    <ambientLight intensity={kind === 'books' ? 1.5 : 1.8} />
    <directionalLight
      position={[-5, 7, 8]}
      intensity={2.2}
      color="#fff7e8"
    />
    <directionalLight position={[6, -3, 5]} intensity={0.7} color="#9ec4ff" />
    <SceneMotion kind={kind} progress={progress} reducedMotion={reducedMotion}>
      {items.map((item) => (
        kind === 'books'
          ? <Book item={item} key={item.title} />
          : <Poster item={item} key={item.title} />
      ))}
    </SceneMotion>
    <ContactShadows
      position={[0, kind === 'books' ? -2.35 : -2.45, -0.2]}
      opacity={kind === 'books' ? 0.58 : 0.46}
      scale={12}
      blur={2.8}
      far={6}
      frames={1}
      resolution={256}
      color={kind === 'books' ? '#050303' : '#070a10'}
    />
  </>
);

class WebGLBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { failed: false };
  }

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

export const supportsWebGL = () => {
  if (typeof window === 'undefined') return false;
  try {
    const canvas = document.createElement('canvas');
    return Boolean(canvas.getContext('webgl2') || canvas.getContext('webgl'));
  } catch {
    return false;
  }
};

const DesktopMediaScene = ({ active = false, fallback = null, items, kind, progress = 0 }) => {
  const reducedMotion = typeof window !== 'undefined'
    && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

  if (!supportsWebGL()) return fallback;

  return (
    <WebGLBoundary fallback={fallback}>
      <Canvas
        className={`desktop-media-canvas desktop-media-canvas-${kind}`}
        orthographic
        camera={{ position: [0, 0, 10], zoom: kind === 'books' ? 88 : 82, near: 0.1, far: 100 }}
        dpr={[1, 1.25]}
        frameloop={active && !reducedMotion ? 'always' : 'demand'}
        gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
      >
        <Scene items={items} kind={kind} progress={progress} reducedMotion={reducedMotion} />
      </Canvas>
    </WebGLBoundary>
  );
};

export default DesktopMediaScene;
