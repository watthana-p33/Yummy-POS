import React, { useMemo } from 'react';
import { usePos } from '../../context/PosContext';
import { ACCENT_THEMES, type AccentColor } from '../../theme/theme';

function hexToRgba(hex: string, alpha: number): string {
  if (!hex) return `rgba(91, 138, 114, ${alpha})`;
  const clean = hex.replace('#', '');
  if (clean.length === 6) {
    const r = parseInt(clean.substring(0, 2), 16);
    const g = parseInt(clean.substring(2, 4), 16);
    const b = parseInt(clean.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  return hex;
}

export const LiquidBackground: React.FC = () => {
  const { themeMode, accentColor } = usePos();
  const isDark = themeMode === 'dark';

  const currentTheme = ACCENT_THEMES[accentColor as AccentColor] || ACCENT_THEMES.sage;

  const { c1, c2, c3, c4 } = useMemo(() => {
    const p = currentTheme.palette && currentTheme.palette.length >= 4
      ? currentTheme.palette
      : [
          currentTheme.primaryLight,
          currentTheme.primaryDark,
          currentTheme.badgeBorderLight,
          currentTheme.badgeBgLight,
        ];

    return {
      c1: p[0],
      c2: p[1],
      c3: p[2],
      c4: p[3],
    };
  }, [currentTheme]);

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none overflow-hidden z-0 select-none transition-colors duration-700"
      style={{
        backgroundColor: isDark ? '#080911' : '#e6e3da',
      }}
    >
      {/* Subtle canvas base tinted with active theme palette */}
      <div
        className="absolute inset-0 transition-all duration-700"
        style={{
          background: isDark
            ? `radial-gradient(circle at 50% 30%, ${hexToRgba(c1, 0.28)} 0%, rgba(8, 9, 17, 0.95) 70%, #05060a 100%)`
            : `radial-gradient(circle at 50% 30%, rgba(255, 255, 255, 0.6) 0%, ${hexToRgba(c4, 0.35)} 40%, rgba(228, 224, 215, 0.85) 80%, #ded9ce 100%)`,
        }}
      />

      {/* Blob 1: Primary Fluid Blob (Top-Left) */}
      <div
        className="absolute -top-12 left-4 w-[540px] h-[540px] sm:w-[640px] sm:h-[640px] animate-blob-1 transition-all duration-700"
        style={{
          background: isDark
            ? `radial-gradient(circle at 35% 35%, ${hexToRgba(c1, 0.95)} 0%, ${hexToRgba(c2, 0.72)} 45%, ${hexToRgba(c3, 0.45)} 80%, transparent 100%)`
            : `radial-gradient(circle at 35% 35%, ${hexToRgba(c1, 0.75)} 0%, ${hexToRgba(c2, 0.55)} 45%, ${hexToRgba(c3, 0.32)} 80%, transparent 100%)`,
          filter: isDark ? 'blur(48px)' : 'blur(52px)',
          opacity: isDark ? 0.68 : 0.48,
          mixBlendMode: isDark ? 'screen' : 'multiply',
        }}
      />

      {/* Blob 2: Secondary Harmonic Fluid Blob (Top-Right) */}
      <div
        className="absolute top-1/6 -right-12 w-[560px] h-[560px] sm:w-[660px] sm:h-[660px] animate-blob-2 transition-all duration-700"
        style={{
          background: isDark
            ? `radial-gradient(circle at 60% 40%, ${hexToRgba(c2, 0.92)} 0%, ${hexToRgba(c3, 0.7)} 50%, ${hexToRgba(c4, 0.45)} 85%, transparent 100%)`
            : `radial-gradient(circle at 60% 40%, ${hexToRgba(c2, 0.72)} 0%, ${hexToRgba(c3, 0.52)} 50%, ${hexToRgba(c4, 0.3)} 85%, transparent 100%)`,
          filter: isDark ? 'blur(50px)' : 'blur(54px)',
          opacity: isDark ? 0.65 : 0.45,
          mixBlendMode: isDark ? 'screen' : 'multiply',
        }}
      />

      {/* Blob 3: Accent Tone Fluid Blob (Bottom-Left / Center) */}
      <div
        className="absolute -bottom-16 left-1/6 w-[520px] h-[520px] sm:w-[620px] sm:h-[620px] animate-blob-3 transition-all duration-700"
        style={{
          background: isDark
            ? `radial-gradient(circle at 45% 45%, ${hexToRgba(c3, 0.95)} 0%, ${hexToRgba(c1, 0.72)} 50%, ${hexToRgba(c2, 0.45)} 85%, transparent 100%)`
            : `radial-gradient(circle at 45% 45%, ${hexToRgba(c3, 0.75)} 0%, ${hexToRgba(c1, 0.52)} 50%, ${hexToRgba(c2, 0.3)} 85%, transparent 100%)`,
          filter: isDark ? 'blur(46px)' : 'blur(50px)',
          opacity: isDark ? 0.66 : 0.46,
          mixBlendMode: isDark ? 'screen' : 'multiply',
        }}
      />

      {/* Blob 4: Light Highlight Droplet (Center / Floating) */}
      <div
        className="absolute top-1/3 left-1/3 w-[380px] h-[380px] sm:w-[460px] sm:h-[460px] animate-blob-4 transition-all duration-700"
        style={{
          background: isDark
            ? `radial-gradient(circle at 30% 30%, ${hexToRgba(c4, 0.92)} 0%, ${hexToRgba(c2, 0.68)} 50%, ${hexToRgba(c1, 0.35)} 90%, transparent 100%)`
            : `radial-gradient(circle at 30% 30%, ${hexToRgba(c4, 0.78)} 0%, ${hexToRgba(c2, 0.55)} 50%, ${hexToRgba(c1, 0.28)} 90%, transparent 100%)`,
          filter: isDark ? 'blur(42px)' : 'blur(46px)',
          opacity: isDark ? 0.62 : 0.42,
          mixBlendMode: isDark ? 'screen' : 'multiply',
        }}
      />

      {/* Blob 5: Ambient Floating Droplet (Bottom-Right) */}
      <div
        className="absolute bottom-12 right-1/5 w-[340px] h-[340px] sm:w-[420px] sm:h-[420px] animate-blob-1 transition-all duration-700"
        style={{
          background: isDark
            ? `radial-gradient(circle at 40% 40%, ${hexToRgba(c1, 0.88)} 0%, ${hexToRgba(c3, 0.62)} 55%, ${hexToRgba(c4, 0.35)} 100%, transparent 100%)`
            : `radial-gradient(circle at 40% 40%, ${hexToRgba(c1, 0.68)} 0%, ${hexToRgba(c3, 0.48)} 55%, ${hexToRgba(c4, 0.25)} 100%, transparent 100%)`,
          filter: isDark ? 'blur(38px)' : 'blur(42px)',
          opacity: isDark ? 0.56 : 0.38,
          mixBlendMode: isDark ? 'screen' : 'multiply',
        }}
      />

      {/* Ambient dark edge vignette */}
      {isDark && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at 50% 50%, transparent 40%, rgba(5, 6, 10, 0.45) 80%, rgba(5, 6, 10, 0.75) 100%)',
          }}
        />
      )}
    </div>
  );
};
