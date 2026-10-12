// ============================================================================
// Font Storage & Dynamic Font Loader Utility
// Supports Google Fonts and Local Downloaded Font Files (.ttf, .otf, .woff, .woff2)
// Persisted in IndexedDB with localStorage fallback
// ============================================================================

export interface CustomFont {
  id: string; // CSS font-family name e.g. "Chakra Petch", "CustomThai"
  label: string; // Display label
  sample: string; // Preview text sample
  source: 'google' | 'custom';
  fileData?: string; // Base64 data URL for uploaded local fonts
  fileName?: string; // Original uploaded file name
  fileSize?: number; // File size in bytes
  createdAt: number;
}

export interface PopularFont {
  id: string;
  label: string;
  sample: string;
  category: 'thai' | 'modern';
}

export const POPULAR_GOOGLE_FONTS: PopularFont[] = [
  // Thai Google Fonts
  { id: 'Chakra Petch', label: 'Chakra Petch (ชักระเพชร)', sample: 'ฟอนต์เหลี่ยม โมเดิร์น ล้ำยุค ไซไฟ', category: 'thai' },
  { id: 'Mali', label: 'Mali (มะลิ)', sample: 'ลายมือน่ารัก อบอุ่น เป็นมิตร สบายตา', category: 'thai' },
  { id: 'Bai Jamjuree', label: 'Bai Jamjuree (จามจุรี)', sample: 'ฟอนต์กึ่งทางการ ร่วมสมัย สะอาดตา', category: 'thai' },
  { id: 'Niramit', label: 'Niramit (นิรมิต)', sample: 'ลายเส้นประณีต อ่อนช้อย สง่างาม', category: 'thai' },
  { id: 'Krub', label: 'Krub (ครับ)', sample: 'สไตล์เรโทร ยุคใหม่ มีเอกลักษณ์', category: 'thai' },
  { id: 'Chonburi', label: 'Chonburi (ชลบุรี)', sample: 'ตัวหนา พาดหัวสะดุดตา โดดเด่น', category: 'thai' },
  { id: 'Pattaya', label: 'Pattaya (พัทยา)', sample: 'วินเทจ คลาสสิก มีเสน่ห์เฉพาะตัว', category: 'thai' },
  { id: 'Sriracha', label: 'Sriracha (ศรีราชา)', sample: 'ลายมือสดใส มีชีวิตชีวา ลื่นไหล', category: 'thai' },
  { id: 'Itim', label: 'Itim (ไอติม)', sample: 'ตัวกลมน่ารัก สนุกสนาน สไตล์คาเฟ่', category: 'thai' },
  { id: 'Noto Sans Thai', label: 'Noto Sans Thai (โนโตะ แซนส์)', sample: 'มาตรฐานสากล อ่านง่าย ชัดเจนทุกขนาด', category: 'thai' },
  { id: 'Thasadith', label: 'Thasadith (ทศดิษฐ์)', sample: 'มินิมอล ลายเส้นคมชัด เรียบโก้', category: 'thai' },
  { id: 'Charm', label: 'Charm (ชาร์ม)', sample: 'ตัวเขียนอ่อนหวาน หรูหรา ประณีต', category: 'thai' },

  // Global / English Google Fonts
  { id: 'Poppins', label: 'Poppins (ป๊อปปินส์)', sample: 'Geometric clean & contemporary type', category: 'modern' },
  { id: 'Montserrat', label: 'Montserrat (มอนต์เซอร์รัต)', sample: 'Urban modernist architecture inspired', category: 'modern' },
  { id: 'Outfit', label: 'Outfit (เอาต์ฟิต)', sample: 'Delicate modern digital UI font', category: 'modern' },
  { id: 'Roboto', label: 'Roboto (โรโบโต)', sample: 'Clean grotesque sans-serif classic', category: 'modern' },
];

const DB_NAME = 'yummy_pos_fonts_db';
const STORE_NAME = 'custom_fonts';
const DB_VERSION = 1;

/**
 * Open IndexedDB database for font persistence
 */
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      return reject(new Error('IndexedDB not supported in this environment'));
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Fetch all saved custom fonts from IndexedDB (with localStorage fallback)
 */
export async function getCustomFonts(): Promise<CustomFont[]> {
  try {
    const db = await openDB();
    return await new Promise<CustomFont[]>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('IndexedDB unavailable, checking localStorage fallback:', err);
    try {
      const saved = localStorage.getItem('yummy_pos_custom_fonts');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  }
}

/**
 * Save custom font to storage
 */
export async function saveCustomFontToStorage(font: CustomFont): Promise<void> {
  try {
    const db = await openDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(font);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('Could not save to IndexedDB, saving to localStorage:', err);
    try {
      const existing = await getCustomFonts();
      const updated = [...existing.filter((f) => f.id !== font.id), font];
      localStorage.setItem('yummy_pos_custom_fonts', JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save custom font to localStorage:', e);
    }
  }
}

/**
 * Remove custom font from storage
 */
export async function removeCustomFontFromStorage(fontId: string): Promise<void> {
  try {
    const db = await openDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(fontId);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('Could not remove from IndexedDB:', err);
  }

  // Remove dynamically injected style/link if present
  if (typeof document !== 'undefined') {
    const linkEl = document.getElementById(`google-font-${toSlug(fontId)}`);
    if (linkEl) linkEl.remove();

    const styleEl = document.getElementById(`custom-font-style-${toSlug(fontId)}`);
    if (styleEl) styleEl.remove();
  }

  // Clean up localStorage fallback
  try {
    const saved = localStorage.getItem('yummy_pos_custom_fonts');
    if (saved) {
      const parsed: CustomFont[] = JSON.parse(saved);
      localStorage.setItem(
        'yummy_pos_custom_fonts',
        JSON.stringify(parsed.filter((f) => f.id !== fontId))
      );
    }
  } catch {
    // Ignore
  }
}

/**
 * Slugify a font family name for element IDs
 */
function toSlug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]/g, '-');
}

/**
 * Dynamically load a font into the DOM (Google Fonts <link> or @font-face / FontFace API)
 */
export async function loadFontIntoDOM(font: {
  id: string;
  source: 'preset' | 'google' | 'custom';
  fileData?: string;
}): Promise<boolean> {
  if (typeof document === 'undefined') return true;

  // 1. Google Font Loader
  if (font.source === 'google') {
    const slug = toSlug(font.id);
    const linkId = `google-font-${slug}`;
    if (!document.getElementById(linkId)) {
      const link = document.createElement('link');
      link.id = linkId;
      link.rel = 'stylesheet';
      const familyParam = encodeURIComponent(font.id).replace(/%20/g, '+');
      link.href = `https://fonts.googleapis.com/css2?family=${familyParam}:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&display=swap`;
      document.head.appendChild(link);
    }
    return true;
  }

  // 2. Custom Uploaded Local Font Loader
  if (font.source === 'custom' && font.fileData) {
    const slug = toSlug(font.id);
    const styleId = `custom-font-style-${slug}`;

    // Add @font-face rule via style tag for bulletproof CSS inheritance
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        @font-face {
          font-family: "${font.id}";
          src: url("${font.fileData}");
          font-display: swap;
        }
      `;
      document.head.appendChild(style);
    }

    // Also register via modern FontFace API if supported
    if ('FontFace' in window && document.fonts) {
      try {
        const fontFace = new FontFace(font.id, `url(${font.fileData})`);
        const loadedFace = await fontFace.load();
        document.fonts.add(loadedFace);
      } catch (err) {
        console.warn(`FontFace API warning for "${font.id}":`, err);
      }
    }

    return true;
  }

  return true;
}

/**
 * Helper to read a local font file as Base64 Data URL
 */
export function readFontFile(
  file: File
): Promise<{ fontName: string; dataUrl: string; fileSize: number }> {
  return new Promise((resolve, reject) => {
    // Validate file extension
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!ext || !['ttf', 'otf', 'woff', 'woff2'].includes(ext)) {
      return reject(
        new Error('รองรับเฉพาะไฟล์ .ttf, .otf, .woff, .woff2 เท่านั้น (Only .ttf, .otf, .woff, .woff2 supported)')
      );
    }

    // Default clean font family name from file name
    const rawName = file.name.replace(/\.[^/.]+$/, '');
    const cleanName = rawName
      .replace(/[-_]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve({
          fontName: cleanName || 'CustomFont',
          dataUrl: reader.result,
          fileSize: file.size,
        });
      } else {
        reject(new Error('ไม่สามารถอ่านไฟล์ฟอนต์ได้'));
      }
    };
    reader.onerror = () => reject(reader.error || new Error('เกิดข้อผิดพลาดในการอ่านไฟล์'));
    reader.readAsDataURL(file);
  });
}
