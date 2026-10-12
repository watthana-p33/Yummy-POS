import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import type { Product, CartItem, Order, User, PaymentMethod, Shift, Customer, MenuPermission } from '../types/pos';
import { INITIAL_PRODUCTS, INITIAL_ORDERS, INITIAL_USERS } from '../data/mockData';
import { translations, type Language, type TranslationSchema } from '../i18n/translations';
import {
  ACCENT_THEMES,
  applyThemeColors,
  type AccentColor,
  type FontFamily,
  type FontOption,
  PRESET_FONT_OPTIONS,
} from '../theme/theme';
import {
  type CustomFont,
  getCustomFonts,
  saveCustomFontToStorage,
  removeCustomFontFromStorage,
  loadFontIntoDOM,
  readFontFile,
} from '../utils/fontStorage';
import { apiService } from '../services/apiService';

const safeJsonParse = <T,>(key: string, fallback: T): T => {
  try {
    const item = localStorage.getItem(key);
    if (!item || item === 'undefined' || item === 'null') return fallback;
    return JSON.parse(item) as T;
  } catch {
    return fallback;
  }
};

export const hasMenuPermission = (user: User | null, menuId: MenuPermission): boolean => {
  if (!user) return false;
  if (user.role === 'admin') return true;
  // Core operational menus accessible to all staff members
  if (menuId === 'shifts' || menuId === 'pos') return true;
  if (user.permissions && Array.isArray(user.permissions)) {
    return user.permissions.includes(menuId);
  }
  if (user.role === 'manager') {
    return ['pos', 'products', 'shifts', 'staff', 'sales', 'reports'].includes(menuId);
  }
  return ['pos', 'products', 'shifts', 'sales'].includes(menuId);
};

interface PosContextType {
  currentUser: User | null;
  login: (username: string) => boolean;
  logout: () => void;
  users: User[];
  registerUser: (userData: { username: string; name: string; role: 'cashier' | 'manager' | 'admin'; avatar?: string; gender?: 'male' | 'female'; permissions?: MenuPermission[] }) => User;
  updateUser: (id: string, userData: Partial<User>) => void;
  deleteUser: (id: string) => void;

  products: Product[];
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;

  cart: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;

  discount: number;
  discountType: 'fixed' | 'percent';
  setDiscount: (amount: number, type?: 'fixed' | 'percent') => void;
  taxRate: number;
  setTaxRate: (rate: number) => void;

  subtotal: number;
  calculatedDiscount: number;
  taxAmount: number;
  total: number;

  orders: Order[];
  createOrder: (paymentMethod: PaymentMethod, amountReceived?: number, customerId?: string, customerName?: string) => Order | null;
  currentReceipt: Order | null;
  setCurrentReceipt: (order: Order | null) => void;

  // Shift Management (เปิด / ปิด กะ)
  currentShift: Shift | null;
  shifts: Shift[];
  openShift: (startingCash: number, notes?: string) => Shift;
  closeShift: (endingCash: number, notes?: string) => Shift | null;

  // Customers Management (ลูกค้า)
  customers: Customer[];
  selectedCustomer: Customer | null;
  setSelectedCustomer: (customer: Customer | null) => void;
  addCustomer: (data: { name: string; phone?: string; email?: string }) => Customer;

  themeMode: 'light' | 'dark';
  toggleTheme: () => void;

  accentColor: AccentColor;
  setAccentColor: (accent: AccentColor) => void;

  fontFamily: FontFamily;
  setFontFamily: (font: FontFamily) => void;
  customFonts: CustomFont[];
  allFontOptions: FontOption[];
  addGoogleFont: (fontName: string, sampleText?: string) => Promise<{ success: boolean; message?: string }>;
  addLocalFont: (file: File, customName?: string) => Promise<{ success: boolean; message?: string }>;
  deleteCustomFont: (fontId: string) => Promise<void>;

  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: TranslationSchema;
}

const PosContext = createContext<PosContextType | undefined>(undefined);

export const PosProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Theme Mode State
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('yummy_pos_theme');
    return (saved === 'dark' || saved === 'light') ? saved : 'light';
  });

  const toggleTheme = () => {
    setThemeMode((prev) => {
      const next = prev === 'light' ? 'dark' : 'light';
      localStorage.setItem('yummy_pos_theme', next);
      if (next === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      return next;
    });
  };

  useEffect(() => {
    if (themeMode === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [themeMode]);

  // Language State (i18n TH / EN)
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('yummy_pos_lang');
    return (saved === 'th' || saved === 'en') ? saved : 'th';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('yummy_pos_lang', lang);
  };

  const toggleLanguage = () => {
    setLanguageState((prev) => {
      const next = prev === 'th' ? 'en' : 'th';
      localStorage.setItem('yummy_pos_lang', next);
      return next;
    });
  };

  const t = useMemo(() => {
    return translations[language] || translations.th;
  }, [language]);

  // Accent Color Theme State
  const [accentColor, setAccentColorState] = useState<AccentColor>(() => {
    const saved = localStorage.getItem('yummy_pos_accent') as AccentColor | null;
    return saved && ACCENT_THEMES[saved] ? saved : 'sage';
  });

  const setAccentColor = (accent: AccentColor) => {
    setAccentColorState(accent);
    localStorage.setItem('yummy_pos_accent', accent);
  };

  // Font Family State
  const [fontFamily, setFontFamilyState] = useState<FontFamily>(() => {
    const saved = localStorage.getItem('yummy_pos_font') as FontFamily | null;
    return saved || 'Prompt';
  });

  // Custom Fonts State (loaded from storage)
  const [customFonts, setCustomFonts] = useState<CustomFont[]>([]);

  // Initialize and load custom fonts on startup
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const loaded = await getCustomFonts();
        if (isMounted) {
          setCustomFonts(loaded);
          for (const font of loaded) {
            await loadFontIntoDOM(font);
          }
          // If current active font is custom or google, load it into DOM
          const matchingCustom = loaded.find((f) => f.id === fontFamily);
          if (matchingCustom) {
            await loadFontIntoDOM(matchingCustom);
          } else if (!PRESET_FONT_OPTIONS.some((p) => p.id === fontFamily)) {
            await loadFontIntoDOM({ id: fontFamily, source: 'google' });
          }
        }
      } catch (err) {
        console.error('Failed to initialize custom fonts:', err);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  const allFontOptions: FontOption[] = useMemo(() => {
    const customOptions: FontOption[] = customFonts.map((f) => ({
      id: f.id,
      label: f.label,
      sample: f.sample,
      source: f.source,
      fileData: f.fileData,
      fileName: f.fileName,
      fileSize: f.fileSize,
    }));
    return [...PRESET_FONT_OPTIONS, ...customOptions];
  }, [customFonts]);

  const setFontFamily = (font: FontFamily) => {
    setFontFamilyState(font);
    localStorage.setItem('yummy_pos_font', font);
    const foundCustom = customFonts.find((f) => f.id === font);
    if (foundCustom) {
      loadFontIntoDOM(foundCustom);
    } else if (!PRESET_FONT_OPTIONS.some((p) => p.id === font)) {
      loadFontIntoDOM({ id: font, source: 'google' });
    }
  };

  const addGoogleFont = async (
    fontName: string,
    sampleText?: string
  ): Promise<{ success: boolean; message?: string }> => {
    const trimmed = fontName.trim();
    if (!trimmed) {
      return { success: false, message: 'กรุณาระบุชื่อฟอนต์ (Font name cannot be empty)' };
    }
    if (allFontOptions.some((f) => f.id.toLowerCase() === trimmed.toLowerCase())) {
      return { success: false, message: `มีฟอนต์ "${trimmed}" อยู่ในระบบแล้ว` };
    }

    const newFont: CustomFont = {
      id: trimmed,
      label: trimmed,
      sample: sampleText?.trim() || 'ตัวอย่างข้อความภาษาไทยและ English 1234567890',
      source: 'google',
      createdAt: Date.now(),
    };

    try {
      await loadFontIntoDOM(newFont);
      await saveCustomFontToStorage(newFont);
      setCustomFonts((prev) => [...prev.filter((f) => f.id !== newFont.id), newFont]);
      setFontFamily(newFont.id);
      return { success: true };
    } catch (err) {
      console.error('Failed to add Google Font:', err);
      return { success: false, message: 'ไม่สามารถโหลดฟอนต์ได้' };
    }
  };

  const addLocalFont = async (
    file: File,
    customName?: string
  ): Promise<{ success: boolean; message?: string }> => {
    try {
      const { fontName, dataUrl, fileSize } = await readFontFile(file);
      const finalId = (customName?.trim() || fontName).trim();

      if (allFontOptions.some((f) => f.id.toLowerCase() === finalId.toLowerCase())) {
        return { success: false, message: `มีฟอนต์ "${finalId}" อยู่ในระบบแล้ว` };
      }

      const newFont: CustomFont = {
        id: finalId,
        label: `${finalId} (ไฟล์ในเครื่อง)`,
        sample: 'ตัวอย่างข้อความภาษาไทยและ English 1234567890',
        source: 'custom',
        fileData: dataUrl,
        fileName: file.name,
        fileSize,
        createdAt: Date.now(),
      };

      await loadFontIntoDOM(newFont);
      await saveCustomFontToStorage(newFont);
      setCustomFonts((prev) => [...prev.filter((f) => f.id !== newFont.id), newFont]);
      setFontFamily(newFont.id);
      return { success: true };
    } catch (err: any) {
      console.error('Failed to add local font:', err);
      return {
        success: false,
        message: err.message || 'เกิดข้อผิดพลาดในการนำเข้าไฟล์ฟอนต์',
      };
    }
  };

  const deleteCustomFont = async (fontId: string): Promise<void> => {
    await removeCustomFontFromStorage(fontId);
    setCustomFonts((prev) => prev.filter((f) => f.id !== fontId));
    if (fontFamily === fontId) {
      setFontFamily('Prompt');
    }
  };

  // Sync font to document.body and root CSS variables
  useEffect(() => {
    const fontStr = `"${fontFamily}", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
    document.documentElement.style.setProperty('--app-font-family', fontStr);
    document.documentElement.style.setProperty('--font-sans', fontStr);
    document.body.style.fontFamily = fontStr;
  }, [fontFamily]);

  // Sync CSS variables for centralized theme colors
  useEffect(() => {
    applyThemeColors(accentColor, themeMode === 'dark');
  }, [accentColor, themeMode]);

  // Session / User State
  const [users, setUsers] = useState<User[]>(() => {
    const list = safeJsonParse<User[]>('yummy_pos_users_list', INITIAL_USERS);
    const resolved = list.map((u) => {
      let updated = { ...u };
      if (!updated.gender) {
        const matchingInitial = INITIAL_USERS.find(
          (init) => init.id === u.id || init.username.toLowerCase() === u.username?.toLowerCase()
        );
        updated.gender = matchingInitial?.gender || 'male';
      }
      if (updated.permissions && !updated.permissions.includes('shifts')) {
        updated.permissions = [...updated.permissions, 'shifts' as MenuPermission];
      }
      return updated;
    });
    try {
      localStorage.setItem('yummy_pos_users_list', JSON.stringify(resolved));
    } catch {}
    return resolved;
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const user = safeJsonParse<User | null>('yummy_pos_user', INITIAL_USERS[0]); // Default logged-in as Somchai for convenience
    if (user) {
      let updated = { ...user };
      if (!updated.gender) {
        const matchingInitial = INITIAL_USERS.find(
          (init) => init.id === user.id || init.username.toLowerCase() === user.username?.toLowerCase()
        );
        updated.gender = matchingInitial?.gender || 'male';
      }
      if (updated.permissions && !updated.permissions.includes('shifts')) {
        updated.permissions = [...updated.permissions, 'shifts' as MenuPermission];
      }
      try {
        localStorage.setItem('yummy_pos_user', JSON.stringify(updated));
      } catch {}
      return updated;
    }
    return user;
  });

  const registerUser = (userData: { username: string; name: string; role: 'cashier' | 'manager' | 'admin'; avatar?: string; gender?: 'male' | 'female'; permissions?: MenuPermission[] }): User => {
    const defaultPermissions: MenuPermission[] =
      userData.role === 'admin'
        ? ['pos', 'products', 'shifts', 'staff', 'sales', 'reports']
        : userData.role === 'manager'
        ? ['pos', 'products', 'shifts', 'staff', 'sales', 'reports']
        : ['pos', 'products', 'shifts', 'sales'];

    const inferredGender = userData.gender || 'male';

    const newUser: User = {
      id: `usr-${Date.now()}`,
      username: userData.username.toLowerCase().trim(),
      name: userData.name.trim(),
      role: userData.role || 'cashier',
      avatar: userData.avatar || (userData.role === 'admin' ? '🧑‍💻' : userData.role === 'manager' ? '👩‍💼' : '👨‍🍳'),
      gender: inferredGender,
      permissions: userData.permissions && userData.permissions.length > 0 ? userData.permissions : defaultPermissions,
    };
    setUsers((prev) => {
      const next = [...prev, newUser];
      try {
        localStorage.setItem('yummy_pos_users_list', JSON.stringify(next));
      } catch {}
      return next;
    });
    apiService.registerUser(newUser).catch(() => null);
    return newUser;
  };

  const updateUser = (id: string, userData: Partial<User>) => {
    setUsers((prev) => {
      const next = prev.map((u) => {
        if (u.id === id) {
          const updated = { ...u, ...userData };
          return updated;
        }
        return u;
      });
      try {
        localStorage.setItem('yummy_pos_users_list', JSON.stringify(next));
      } catch {}
      return next;
    });
    if (currentUser && currentUser.id === id) {
      const updatedCurrent = { ...currentUser, ...userData };
      setCurrentUser(updatedCurrent);
      localStorage.setItem('yummy_pos_user', JSON.stringify(updatedCurrent));
    }
    apiService.updateUser(id, userData).catch(() => null);
  };

  const deleteUser = (id: string) => {
    setUsers((prev) => {
      const next = prev.filter((u) => u.id !== id);
      try {
        localStorage.setItem('yummy_pos_users_list', JSON.stringify(next));
      } catch {}
      return next;
    });
    apiService.deleteUser(id).catch(() => null);
  };

  // Shift Management State
  const [shifts, setShifts] = useState<Shift[]>(() => {
    const saved = localStorage.getItem('yummy_pos_shifts');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          let hasOpen = false;
          // Ensure at most 1 shift is ever open from saved storage
          return parsed.map((s: Shift) => {
            if (s.status === 'open') {
              if (!hasOpen) {
                hasOpen = true;
                return s;
              }
              return { ...s, status: 'closed' as const };
            }
            return s;
          });
        }
      } catch {
        // fallback
      }
    }
    return [
      {
        id: 'shift-initial-01',
        cashierId: INITIAL_USERS[0].id,
        cashierName: INITIAL_USERS[0].name,
        startTime: new Date(Date.now() - 3600000 * 4).toISOString(),
        startingCash: 1000,
        totalSales: 890,
        totalOrders: 6,
        status: 'open',
        notes: 'เงินทอนเปิดร้านรอบเช้า',
      },
    ];
  });

  const currentShift = shifts.find((s) => s.status === 'open') || null;

  const openShift = (startingCash: number, notes?: string): Shift => {
    const now = new Date().toISOString();
    const newShift: Shift = {
      id: `shift-${Date.now()}`,
      cashierId: currentUser ? currentUser.id : 'unknown',
      cashierName: currentUser ? currentUser.name : 'Unknown Cashier',
      startTime: now,
      startingCash,
      totalSales: 0,
      totalOrders: 0,
      status: 'open',
      notes,
    };
    // Close any previous open shifts before opening this one
    setShifts((prev) => [
      newShift,
      ...prev.map((s) => (s.status === 'open' ? { ...s, status: 'closed' as const, endTime: s.endTime || now } : s)),
    ]);
    apiService.openShift({
      cashierId: newShift.cashierId,
      cashierName: newShift.cashierName,
      startingCash,
      notes,
    }).catch(() => null);
    return newShift;
  };

  const closeShift = (endingCash: number, notes?: string): Shift | null => {
    if (!currentShift) return null;
    const now = new Date().toISOString();
    // Calculate expected cash: startingCash + cash payments in this shift
    const expectedCash = currentShift.startingCash + currentShift.totalSales;
    const closed: Shift = {
      ...currentShift,
      endTime: now,
      endingCash,
      expectedCash,
      status: 'closed',
      notes: notes ? `${currentShift.notes || ''} | ${notes}` : currentShift.notes,
    };
    // Close THIS shift AND ensure that NO OTHER shift in the array remains open!
    setShifts((prev) =>
      prev.map((s) => {
        if (s.id === currentShift.id) return closed;
        if (s.status === 'open') return { ...s, status: 'closed' as const, endTime: s.endTime || now };
        return s;
      })
    );
    apiService.closeShift(currentShift.id, { endingCash, notes }).catch(() => null);
    return closed;
  };

  // Customers Management State
  const [customers, setCustomers] = useState<Customer[]>(() => {
    return safeJsonParse<Customer[]>('yummy_pos_customers', [
      { id: 'cust-1', name: 'คุณสมศักดิ์ มั่งมี (VIP)', phone: '081-234-5678', email: 'somsak@example.com', points: 150 },
      { id: 'cust-2', name: 'คุณวิภาวรรณ สดใส', phone: '089-876-5432', email: 'wipawan@example.com', points: 45 },
      { id: 'cust-3', name: 'คุณณัฐพล ใจดี', phone: '086-555-1234', points: 20 },
    ]);
  });
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const addCustomer = (data: { name: string; phone?: string; email?: string }): Customer => {
    const newCust: Customer = {
      id: `cust-${Date.now()}`,
      name: data.name.trim(),
      phone: data.phone?.trim(),
      email: data.email?.trim(),
      points: 0,
    };
    setCustomers((prev) => [newCust, ...prev]);
    setSelectedCustomer(newCust);
    apiService.createCustomer(data).catch(() => null);
    return newCust;
  };

  useEffect(() => {
    localStorage.setItem('yummy_pos_users_list', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('yummy_pos_shifts', JSON.stringify(shifts));
  }, [shifts]);

  useEffect(() => {
    localStorage.setItem('yummy_pos_customers', JSON.stringify(customers));
  }, [customers]);

  // Products State
  const [products, setProducts] = useState<Product[]>(() => {
    return safeJsonParse<Product[]>('yummy_pos_products', INITIAL_PRODUCTS);
  });

  // Cart State
  const [cart, setCart] = useState<CartItem[]>(() => {
    return safeJsonParse<CartItem[]>('yummy_pos_cart', []);
  });

  // Pricing State
  const [discount, setDiscountState] = useState<number>(0);
  const [discountType, setDiscountType] = useState<'fixed' | 'percent'>('fixed');
  const [taxRate, setTaxRate] = useState<number>(7); // Default VAT 7%

  // Orders State
  const [orders, setOrders] = useState<Order[]>(() => {
    return safeJsonParse<Order[]>('yummy_pos_orders', INITIAL_ORDERS);
  });

  const [currentReceipt, setCurrentReceipt] = useState<Order | null>(null);

  // Persistence effects
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('yummy_pos_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('yummy_pos_user');
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('yummy_pos_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('yummy_pos_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('yummy_pos_orders', JSON.stringify(orders));
  }, [orders]);

  // Auth methods
  const login = (username: string): boolean => {
    const found = users.find((u) => u.username.toLowerCase() === username.trim().toLowerCase());
    if (found) {
      setCurrentUser(found);
      return true;
    }
    // Also allow typing any name for quick test
    if (username.trim()) {
      const newUser: User = {
        id: `u-${Date.now()}`,
        name: username.trim(),
        username: username.trim().toLowerCase(),
        role: 'cashier',
        avatar: '👤',
      };
      setCurrentUser(newUser);
      return true;
    }
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
    clearCart();
  };

  // Initial Data Fetching from Backend Server API
  useEffect(() => {
    let isMounted = true;

    // Fetch Products
    apiService.getProducts()
      .then((data) => {
        if (isMounted && Array.isArray(data) && data.length > 0) {
          setProducts(data);
        }
      })
      .catch(() => null);

    // Fetch Users
    apiService.getUsers()
      .then((data) => {
        if (isMounted && Array.isArray(data) && data.length > 0) {
          setUsers(data);
        }
      })
      .catch(() => null);

    // Fetch Shifts
    apiService.getShifts()
      .then((data) => {
        if (isMounted && Array.isArray(data) && data.length > 0) {
          setShifts(data);
        }
      })
      .catch(() => null);

    // Fetch Orders
    apiService.getOrders()
      .then((data) => {
        if (isMounted && Array.isArray(data) && data.length > 0) {
          setOrders(data);
        }
      })
      .catch(() => null);

    // Fetch Customers
    apiService.getCustomers()
      .then((data) => {
        if (isMounted && Array.isArray(data) && data.length > 0) {
          setCustomers(data);
        }
      })
      .catch(() => null);

    return () => {
      isMounted = false;
    };
  }, []);

  // Product CRUD
  const addProduct = (prodData: Omit<Product, 'id'>) => {
    const newProduct: Product = {
      ...prodData,
      id: `prod-${Date.now()}`,
    };
    setProducts((prev) => [newProduct, ...prev]);
    apiService.createProduct(prodData).catch(() => null);
  };

  const updateProduct = (id: string, updated: Partial<Product>) => {
    setProducts((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const merged = { ...item, ...updated };
          if (merged.stock <= 0) merged.status = 'out_of_stock';
          else if (merged.stock < 10) merged.status = 'low_stock';
          else merged.status = 'in_stock';
          return merged;
        }
        return item;
      })
    );
    apiService.updateProduct(id, updated).catch(() => null);
  };

  const deleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    removeFromCart(id);
    apiService.deleteProduct(id).catch(() => null);
  };

  // Cart operations
  const addToCart = (product: Product) => {
    if (!currentShift || product.stock <= 0) return;
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) return prev;
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => {
        if (item.product.id === productId) {
          const validQty = Math.min(quantity, item.product.stock);
          return { ...item, quantity: validQty };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setCart([]);
    setDiscountState(0);
  };

  const setDiscount = (amount: number, type: 'fixed' | 'percent' = 'fixed') => {
    setDiscountState(amount);
    setDiscountType(type);
  };

  // Calculations
  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  const calculatedDiscount =
    discountType === 'percent'
      ? Math.round((subtotal * Math.min(100, Math.max(0, discount))) / 100)
      : Math.min(subtotal, Math.max(0, discount));

  const amountAfterDiscount = Math.max(0, subtotal - calculatedDiscount);
  const taxAmount = Number(((amountAfterDiscount * taxRate) / 100).toFixed(2));
  const total = Number((amountAfterDiscount + taxAmount).toFixed(2));

  // Order Placement
  const createOrder = (
    paymentMethod: PaymentMethod,
    amountReceived?: number,
    customerId?: string,
    customerName?: string
  ): Order | null => {
    if (cart.length === 0 || !currentUser || !currentShift) return null;

    const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const receiptNumber = `REC-${todayStr}-${randomSuffix}`;

    const orderItems = cart.map((c) => ({
      productId: c.product.id,
      name: c.product.name,
      price: c.product.price,
      quantity: c.quantity,
      subtotal: c.product.price * c.quantity,
    }));

    const received = amountReceived !== undefined ? amountReceived : total;
    const change = Math.max(0, Number((received - total).toFixed(2)));

    const targetCustomer = selectedCustomer || (customerId ? customers.find((c) => c.id === customerId) : null);
    const finalCustName = customerName || (targetCustomer ? targetCustomer.name : undefined);
    const finalCustId = targetCustomer ? targetCustomer.id : customerId;

    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      receiptNumber,
      timestamp: new Date().toISOString(),
      cashierName: currentUser.name,
      cashierId: currentUser.id,
      customerId: finalCustId,
      customerName: finalCustName,
      shiftId: currentShift ? currentShift.id : undefined,
      items: orderItems,
      subtotal,
      discount: calculatedDiscount,
      discountType,
      taxRate,
      taxAmount,
      total,
      paymentMethod,
      amountReceived: received,
      change,
    };

    // Update active shift sales count
    if (currentShift) {
      setShifts((prev) =>
        prev.map((s) =>
          s.id === currentShift.id
            ? { ...s, totalSales: s.totalSales + total, totalOrders: s.totalOrders + 1 }
            : s
        )
      );
    }

    // Update loyalty points for customer (1 point per 10 baht)
    if (finalCustId) {
      const earned = Math.floor(total / 10);
      if (earned > 0) {
        setCustomers((prev) =>
          prev.map((c) => (c.id === finalCustId ? { ...c, points: c.points + earned } : c))
        );
      }
    }

    // Deduct stocks
    setProducts((prev) =>
      prev.map((prod) => {
        const cartItem = cart.find((ci) => ci.product.id === prod.id);
        if (cartItem) {
          const newStock = Math.max(0, prod.stock - cartItem.quantity);
          let newStatus = prod.status;
          if (newStock <= 0) newStatus = 'out_of_stock';
          else if (newStock < 10) newStatus = 'low_stock';
          return { ...prod, stock: newStock, status: newStatus };
        }
        return prod;
      })
    );

    apiService.createOrder({
      items: newOrder.items,
      paymentMethod: newOrder.paymentMethod,
      discount: newOrder.discount,
      taxRate: newOrder.taxRate,
      amountReceived: newOrder.amountReceived,
      cashierName: newOrder.cashierName,
      customerId: newOrder.customerId,
      customerName: newOrder.customerName,
      shiftId: newOrder.shiftId,
    }).catch(() => null);

    setOrders((prev) => [newOrder, ...prev]);
    setCurrentReceipt(newOrder);
    clearCart();
    setSelectedCustomer(null);

    return newOrder;
  };

  return (
    <PosContext.Provider
      value={{
        currentUser,
        login,
        logout,
        users,
        registerUser,
        updateUser,
        deleteUser,
        products,
        addProduct,
        updateProduct,
        deleteProduct,
        cart,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        discount,
        discountType,
        setDiscount,
        taxRate,
        setTaxRate,
        subtotal,
        calculatedDiscount,
        taxAmount,
        total,
        orders,
        createOrder,
        currentReceipt,
        setCurrentReceipt,
        currentShift,
        shifts,
        openShift,
        closeShift,
        customers,
        selectedCustomer,
        setSelectedCustomer,
        addCustomer,
        themeMode,
        toggleTheme,
        accentColor,
        setAccentColor,
        fontFamily,
        setFontFamily,
        customFonts,
        allFontOptions,
        addGoogleFont,
        addLocalFont,
        deleteCustomFont,
        language,
        setLanguage,
        toggleLanguage,
        t,
      }}
    >
      {children}
    </PosContext.Provider>
  );
};

export const usePos = () => {
  const context = useContext(PosContext);
  if (!context) {
    throw new Error('usePos must be used within a PosProvider');
  }
  return context;
};
