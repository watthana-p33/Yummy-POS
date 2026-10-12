import { createTheme, type Theme } from '@mui/material/styles';

export type ThemeMode = 'light' | 'dark';
export type AccentColor =
  | 'sage'
  | 'ocean'
  | 'peach'
  | 'amber'
  | 'violet'
  | 'emerald'
  | 'palette1'
  | 'palette2'
  | 'palette3'
  | 'palette4'
  | 'palette5';
export type FontFamily = string;

export interface AccentTheme {
  id: AccentColor;
  name: string;
  nameEn: string;
  palette?: string[];
  primaryLight: string;
  primaryDark: string;
  primaryHoverLight: string;
  primaryHoverDark: string;
  badgeBgLight: string;
  badgeBgDark: string;
  badgeTextLight: string;
  badgeTextDark: string;
  badgeBorderLight: string;
  badgeBorderDark: string;
  previewColor: string;
}

export const ACCENT_THEMES: Record<AccentColor, AccentTheme> = {
  sage: {
    id: 'sage',
    name: 'เขียวเซจ (Sage Green)',
    nameEn: 'Sage Green',
    palette: ['#5b8a72', '#7eb99d', '#e8f3ee', '#273931'],
    primaryLight: '#5b8a72',
    primaryDark: '#7eb99d',
    primaryHoverLight: '#4d7863',
    primaryHoverDark: '#6ba388',
    badgeBgLight: '#e8f3ee',
    badgeBgDark: '#273931',
    badgeTextLight: '#387258',
    badgeTextDark: '#7eb99d',
    badgeBorderLight: '#c9e4d5',
    badgeBorderDark: '#387258',
    previewColor: '#5b8a72',
  },
  ocean: {
    id: 'ocean',
    name: 'น้ำเงินโอเชี่ยน (Ocean Blue)',
    nameEn: 'Ocean Blue',
    palette: ['#2563eb', '#60a5fa', '#eff6ff', '#1e293b'],
    primaryLight: '#2563eb',
    primaryDark: '#60a5fa',
    primaryHoverLight: '#1d4ed8',
    primaryHoverDark: '#93c5fd',
    badgeBgLight: '#eff6ff',
    badgeBgDark: '#1e293b',
    badgeTextLight: '#1d4ed8',
    badgeTextDark: '#93c5fd',
    badgeBorderLight: '#bfdbfe',
    badgeBorderDark: '#3b82f6',
    previewColor: '#2563eb',
  },
  peach: {
    id: 'peach',
    name: 'พีชคอรัล (Peach Coral)',
    nameEn: 'Peach Coral',
    palette: ['#e06d53', '#f4a28c', '#faebe7', '#3b2420'],
    primaryLight: '#e06d53',
    primaryDark: '#f4a28c',
    primaryHoverLight: '#c85338',
    primaryHoverDark: '#f87171',
    badgeBgLight: '#faebe7',
    badgeBgDark: '#3b2420',
    badgeTextLight: '#c85338',
    badgeTextDark: '#f4a28c',
    badgeBorderLight: '#f4c7be',
    badgeBorderDark: '#e06d53',
    previewColor: '#e06d53',
  },
  amber: {
    id: 'amber',
    name: 'อำพันน้ำผึ้ง (Honey Amber)',
    nameEn: 'Honey Amber',
    palette: ['#d97706', '#fbbf24', '#fef3c7', '#352814'],
    primaryLight: '#d97706',
    primaryDark: '#fbbf24',
    primaryHoverLight: '#b45309',
    primaryHoverDark: '#f59e0b',
    badgeBgLight: '#fef3c7',
    badgeBgDark: '#352814',
    badgeTextLight: '#b45309',
    badgeTextDark: '#fcd34d',
    badgeBorderLight: '#fde68a',
    badgeBorderDark: '#d97706',
    previewColor: '#d97706',
  },
  violet: {
    id: 'violet',
    name: 'ม่วงไวโอเล็ต (Royal Violet)',
    nameEn: 'Royal Violet',
    palette: ['#7c3aed', '#a78bfa', '#f3e8ff', '#2e1d4d'],
    primaryLight: '#7c3aed',
    primaryDark: '#a78bfa',
    primaryHoverLight: '#6d28d9',
    primaryHoverDark: '#c4b5fd',
    badgeBgLight: '#f3e8ff',
    badgeBgDark: '#2e1d4d',
    badgeTextLight: '#6d28d9',
    badgeTextDark: '#c4b5fd',
    badgeBorderLight: '#ddd6fe',
    badgeBorderDark: '#7c3aed',
    previewColor: '#7c3aed',
  },
  emerald: {
    id: 'emerald',
    name: 'เขียวมรกต (Fresh Emerald)',
    nameEn: 'Fresh Emerald',
    palette: ['#059669', '#34d399', '#ecfdf5', '#13382c'],
    primaryLight: '#059669',
    primaryDark: '#34d399',
    primaryHoverLight: '#047857',
    primaryHoverDark: '#6ee7b7',
    badgeBgLight: '#ecfdf5',
    badgeBgDark: '#13382c',
    badgeTextLight: '#047857',
    badgeTextDark: '#6ee7b7',
    badgeBorderLight: '#a7f3d0',
    badgeBorderDark: '#059669',
    previewColor: '#059669',
  },
  palette1: {
    id: 'palette1',
    name: 'ชุดที่ 1 : ลากูนทีล & มินต์ (Lagoon Teal & Mint)',
    nameEn: 'Set 1: Lagoon Teal & Mint',
    palette: ['#287A74', '#55A9A0', '#AEEED3', '#FFF8B0'],
    primaryLight: '#287A74',
    primaryDark: '#55A9A0',
    primaryHoverLight: '#1e5e59',
    primaryHoverDark: '#6fc2b8',
    badgeBgLight: '#e2f8ef',
    badgeBgDark: '#163532',
    badgeTextLight: '#287A74',
    badgeTextDark: '#AEEED3',
    badgeBorderLight: '#AEEED3',
    badgeBorderDark: '#287A74',
    previewColor: '#287A74',
  },
  palette2: {
    id: 'palette2',
    name: 'ชุดที่ 2 : มัทฉะเซลาดอน (Olive Celadon)',
    nameEn: 'Set 2: Matcha Celadon',
    palette: ['#5C7057', '#89A482', '#ACC5A6', '#D1EDD3'],
    primaryLight: '#5C7057',
    primaryDark: '#89A482',
    primaryHoverLight: '#475743',
    primaryHoverDark: '#9cb895',
    badgeBgLight: '#eaf5eb',
    badgeBgDark: '#253023',
    badgeTextLight: '#5C7057',
    badgeTextDark: '#D1EDD3',
    badgeBorderLight: '#ACC5A6',
    badgeBorderDark: '#5C7057',
    previewColor: '#5C7057',
  },
  palette3: {
    id: 'palette3',
    name: 'ชุดที่ 3 : มิดไนท์แชมเปญ (Midnight & Champagne)',
    nameEn: 'Set 3: Midnight & Champagne',
    palette: ['#010736', '#0D1C42', '#22396F', '#FCF1D0'],
    primaryLight: '#22396F',
    primaryDark: '#5b7ac2',
    primaryHoverLight: '#0D1C42',
    primaryHoverDark: '#708ed4',
    badgeBgLight: '#f3f6fc',
    badgeBgDark: '#0D1C42',
    badgeTextLight: '#0D1C42',
    badgeTextDark: '#FCF1D0',
    badgeBorderLight: '#d5ddf0',
    badgeBorderDark: '#22396F',
    previewColor: '#22396F',
  },
  palette4: {
    id: 'palette4',
    name: 'ชุดที่ 4 : ดีพฟอเรสต์เจด (Deep Forest Jade)',
    nameEn: 'Set 4: Deep Forest Jade',
    palette: ['#092328', '#12544F', '#2A835F', '#8BBB92'],
    primaryLight: '#12544F',
    primaryDark: '#2A835F',
    primaryHoverLight: '#092328',
    primaryHoverDark: '#3aa87c',
    badgeBgLight: '#e5f3ee',
    badgeBgDark: '#092328',
    badgeTextLight: '#12544F',
    badgeTextDark: '#8BBB92',
    badgeBorderLight: '#8BBB92',
    badgeBorderDark: '#2A835F',
    previewColor: '#2A835F',
  },
  palette5: {
    id: 'palette5',
    name: 'ชุดที่ 5 : ซีตรัสไลม์ (Citrus Lime & Moss)',
    nameEn: 'Set 5: Citrus Lime & Moss',
    palette: ['#499A13', '#BBDC12', '#8ECA3C', '#276F27'],
    primaryLight: '#499A13',
    primaryDark: '#8ECA3C',
    primaryHoverLight: '#276F27',
    primaryHoverDark: '#9fd94a',
    badgeBgLight: '#f3fae8',
    badgeBgDark: '#1b3e1b',
    badgeTextLight: '#276F27',
    badgeTextDark: '#BBDC12',
    badgeBorderLight: '#BBDC12',
    badgeBorderDark: '#499A13',
    previewColor: '#499A13',
  },
};

export interface FontOption {
  id: string;
  label: string;
  sample: string;
  source?: 'preset' | 'google' | 'custom';
  fileData?: string;
  fileName?: string;
  fileSize?: number;
}

export const PRESET_FONT_OPTIONS: FontOption[] = [
  { id: 'Prompt', label: 'Prompt (พร้อมพท์)', sample: 'ฟอนต์เรียบหรู ทันสมัย สบายตา', source: 'preset' },
  { id: 'Kanit', label: 'Kanit (คณิต)', sample: 'ฟอนต์กลม มินิมอล โมเดิร์น', source: 'preset' },
  { id: 'Sarabun', label: 'Sarabun (สารบัญ)', sample: 'ฟอนต์ทางการ คมชัด ชัดเจน', source: 'preset' },
  { id: 'Mitr', label: 'Mitr (มิตร)', sample: 'ฟอนต์เป็นมิตร สดใส สบายใจ', source: 'preset' },
  { id: 'Inter', label: 'Inter (อินเตอร์)', sample: 'ฟอนต์มาตรฐานสากล Modern UI', source: 'preset' },
];

export const FONT_OPTIONS: FontOption[] = PRESET_FONT_OPTIONS;

export const applyThemeColors = (accent: AccentColor = 'sage', isDark: boolean = false) => {
  if (typeof document === 'undefined') return;
  const theme = ACCENT_THEMES[accent] || ACCENT_THEMES.sage;
  const root = document.documentElement;

  const primary = isDark ? theme.primaryDark : theme.primaryLight;
  const primaryHover = isDark ? theme.primaryHoverDark : theme.primaryHoverLight;
  const primaryLight = isDark ? theme.badgeBgDark : theme.badgeBgLight;
  const primaryText = isDark ? theme.badgeTextDark : theme.badgeTextLight;
  const primaryBorder = isDark ? theme.badgeBorderDark : theme.badgeBorderLight;

  root.style.setProperty('--theme-primary', primary);
  root.style.setProperty('--theme-primary-hover', primaryHover);
  root.style.setProperty('--theme-primary-light', primaryLight);
  root.style.setProperty('--theme-primary-text', primaryText);
  root.style.setProperty('--theme-primary-border', primaryBorder);

  // Tailwind CSS v4 variables
  root.style.setProperty('--color-primary', primary);
  root.style.setProperty('--color-primary-hover', primaryHover);
  root.style.setProperty('--color-primary-light', primaryLight);
  root.style.setProperty('--color-primary-text', primaryText);
  root.style.setProperty('--color-primary-border', primaryBorder);

  // Expose palette colors as CSS variables if present
  if (theme.palette && theme.palette.length > 0) {
    theme.palette.forEach((color, idx) => {
      root.style.setProperty(`--theme-palette-${idx + 1}`, color);
    });
  }
};

// Immediate invocation on module evaluation to prevent color flash
if (typeof document !== 'undefined') {
  try {
    const savedAccent = (localStorage.getItem('yummy_pos_accent') as AccentColor) || 'sage';
    const isDark = localStorage.getItem('yummy_pos_theme') === 'dark';
    applyThemeColors(savedAccent, isDark);
  } catch {
    applyThemeColors('sage', false);
  }
}

export const getDesignTokens = (
  mode: ThemeMode,
  accent: AccentColor = 'sage',
  font: FontFamily = 'Prompt'
) => {
  const accentTheme = ACCENT_THEMES[accent] || ACCENT_THEMES.sage;
  const primaryColor = mode === 'dark' ? accentTheme.primaryDark : accentTheme.primaryLight;
  const primaryLight = mode === 'dark' ? accentTheme.badgeBgDark : accentTheme.badgeBgLight;

  return {
    palette: {
      mode,
      primary: {
        main: primaryColor,
        light: primaryLight,
        contrastText: mode === 'dark' ? '#0d1b14' : '#ffffff',
      },
      secondary: {
        main: mode === 'dark' ? '#f4a28c' : '#e58a74',
        light: mode === 'dark' ? '#3d2a26' : '#faebe7',
        dark: mode === 'dark' ? '#e58a74' : '#c2654f',
        contrastText: '#ffffff',
      },
      success: {
        main: mode === 'dark' ? '#86c8a7' : '#629f82',
        light: mode === 'dark' ? '#183829' : '#ecfdf5',
      },
      warning: {
        main: mode === 'dark' ? '#f2c078' : '#e5a855',
        light: mode === 'dark' ? '#3d2b10' : '#fef9ed',
      },
      error: {
        main: mode === 'dark' ? '#e88282' : '#d96565',
        light: mode === 'dark' ? '#3b1818' : '#fdf2f2',
      },
      background: {
        default: mode === 'dark' ? '#080911' : '#e6e3da',
        paper: mode === 'dark' ? '#111422' : '#f5f3ed',
      },
      text: {
        primary: mode === 'dark' ? '#f7fafc' : '#2d3748',
        secondary: mode === 'dark' ? '#a0aec0' : '#718096',
      },
      divider: mode === 'dark' ? 'rgba(255, 255, 255, 0.07)' : 'rgba(235, 231, 223, 0.7)',
    },
    typography: {
      fontFamily: [
        `"${font}"`,
        '-apple-system',
        'BlinkMacSystemFont',
        '"Segoe UI"',
        'Roboto',
        'sans-serif',
      ].join(','),
      button: {
        textTransform: 'none' as const,
        fontWeight: 600,
      },
    },
    shape: {
      borderRadius: 18,
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 16,
            padding: '10px 20px',
            boxShadow: 'none',
            transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 24,
            backgroundImage: 'none',
            backgroundColor: mode === 'dark' ? 'rgba(22, 28, 40, 0.85)' : 'rgba(255, 255, 255, 0.88)',
            backdropFilter: 'blur(20px)',
            boxShadow:
              mode === 'dark'
                ? '0 8px 32px -4px rgba(0, 0, 0, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.08)'
                : '0 8px 32px -4px rgba(45, 55, 72, 0.04), inset 0 1px 1px rgba(255, 255, 255, 0.9)',
            border: mode === 'dark' ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(235, 231, 223, 0.8)',
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            borderRadius: 28,
            backgroundImage: 'none',
            backgroundColor: mode === 'dark' ? 'rgba(21, 25, 34, 0.90)' : 'rgba(255, 255, 255, 0.92)',
            backdropFilter: 'blur(24px)',
            boxShadow:
              mode === 'dark'
                ? '0 24px 64px -12px rgba(0, 0, 0, 0.6), inset 0 1px 1px rgba(255, 255, 255, 0.1)'
                : '0 24px 64px -12px rgba(45, 55, 72, 0.12), inset 0 1px 1px rgba(255, 255, 255, 0.95)',
            border: mode === 'dark' ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(235, 231, 223, 0.8)',
          },
        },
      },
      MuiMenu: {
        styleOverrides: {
          paper: {
            borderRadius: 20,
            backgroundImage: 'none',
            backgroundColor: mode === 'dark' ? 'rgba(22, 28, 40, 0.92)' : 'rgba(255, 255, 255, 0.94)',
            backdropFilter: 'blur(24px)',
            boxShadow:
              mode === 'dark'
                ? '0 16px 40px -8px rgba(0, 0, 0, 0.5), inset 0 1px 1px rgba(255, 255, 255, 0.1)'
                : '0 16px 40px -8px rgba(45, 55, 72, 0.1), inset 0 1px 1px rgba(255, 255, 255, 0.95)',
            border: mode === 'dark' ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(235, 231, 223, 0.8)',
          },
        },
      },
      MuiTableContainer: {
        styleOverrides: {
          root: {
            borderRadius: 24,
            backgroundImage: 'none',
          },
        },
      },
      MuiTableHead: {
        styleOverrides: {
          root: {
            backgroundColor: 'transparent',
            '& .MuiTableCell-head': {
              color: mode === 'dark' ? 'rgba(255, 255, 255, 0.75)' : 'var(--theme-primary-text, #4a5568)',
              fontSize: '11px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              borderColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.06)' : 'var(--theme-primary-border, rgba(235, 231, 223, 0.8))',
              padding: '16px 20px',
            },
          },
        },
      },
      MuiTableRow: {
        styleOverrides: {
          root: {
            transition: 'background-color 0.2s ease',
            '&:hover': {
              backgroundColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.02)',
            },
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: {
            borderColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(235, 231, 223, 0.8)',
            padding: '14px 20px',
            fontFamily: `"${font}", sans-serif`,
            color: mode === 'dark' ? '#f7fafc' : '#2d3748',
          },
        },
      },
    },
  };
};

export const createAppTheme = (
  mode: ThemeMode = 'light',
  accent: AccentColor = 'sage',
  font: FontFamily = 'Prompt'
): Theme => {
  return createTheme(getDesignTokens(mode, accent, font));
};

export const yummyTheme = createAppTheme('light');
