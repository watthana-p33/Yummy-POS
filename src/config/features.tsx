import React, { lazy } from 'react';
import type { TranslationSchema } from '../i18n/translations';
import {
  ShoppingCart,
  Package,
  Clock,
  Users,
  BarChart3,
  ScrollText,
} from 'lucide-react';

// Code-split / lazy-load screens on-demand to reduce initial bundle and accelerate page entry
const PosScreen = lazy(() =>
  import('../components/screens/PosScreen').then((m) => ({ default: m.PosScreen }))
);
const ProductManagementScreen = lazy(() =>
  import('../components/screens/ProductManagementScreen').then((m) => ({
    default: m.ProductManagementScreen,
  }))
);
const ShiftScreen = lazy(() =>
  import('../components/screens/ShiftScreen').then((m) => ({ default: m.ShiftScreen }))
);
const StaffManagementScreen = lazy(() =>
  import('../components/screens/StaffManagementScreen').then((m) => ({
    default: m.StaffManagementScreen,
  }))
);
const SalesHistoryScreen = lazy(() =>
  import('../components/screens/SalesHistoryScreen').then((m) => ({
    default: m.SalesHistoryScreen,
  }))
);
const ReportsScreen = lazy(() =>
  import('../components/screens/ReportsScreen').then((m) => ({
    default: m.ReportsScreen,
  }))
);

export type FeatureId =
  | 'pos'
  | 'products'
  | 'shifts'
  | 'staff'
  | 'sales'
  | 'reports';

export interface FeatureConfig {
  id: FeatureId;
  path: string;
  component: React.ReactNode;
  icon: (props?: { className?: string }) => React.ReactNode;
  permissionEmoji: string;
  getLabel: (t: TranslationSchema) => string;
  getSublabel: (t: TranslationSchema) => string;
  defaultRoles: Array<'cashier' | 'manager' | 'admin'>;
  scrollableContainer?: boolean;
  getBadge?: (context: { cartItemCount: number }) => number | undefined;
}

/**
 * Single Source of Truth for all POS System Features / Navigation / Routes / Permissions.
 * To add a new feature to the entire system, simply add an entry here.
 */
export const FEATURE_REGISTRY: FeatureConfig[] = [
  {
    id: 'pos',
    path: 'pos',
    component: <PosScreen />,
    icon: (props) => <ShoppingCart className={props?.className || 'w-5 h-5'} />,
    permissionEmoji: '🛒',
    getLabel: (t) => t.sidebar.posTab,
    getSublabel: (t) => t.sidebar.posSub,
    defaultRoles: ['cashier', 'manager', 'admin'],
    scrollableContainer: false,
    getBadge: ({ cartItemCount }) => (cartItemCount > 0 ? cartItemCount : undefined),
  },
  {
    id: 'products',
    path: 'products',
    component: <ProductManagementScreen />,
    icon: (props) => <Package className={props?.className || 'w-5 h-5'} />,
    permissionEmoji: '📦',
    getLabel: (t) => t.sidebar.productsTab,
    getSublabel: (t) => t.sidebar.productsSub,
    defaultRoles: ['cashier', 'manager', 'admin'],
    scrollableContainer: true,
  },
  {
    id: 'shifts',
    path: 'shifts',
    component: <ShiftScreen />,
    icon: (props) => <Clock className={props?.className || 'w-5 h-5'} />,
    permissionEmoji: '⏰',
    getLabel: (t) => t.sidebar.shiftsTab,
    getSublabel: (t) => t.sidebar.shiftsSub,
    defaultRoles: ['cashier', 'manager', 'admin'],
    scrollableContainer: true,
  },
  {
    id: 'staff',
    path: 'staff',
    component: <StaffManagementScreen />,
    icon: (props) => <Users className={props?.className || 'w-5 h-5'} />,
    permissionEmoji: '👥',
    getLabel: (t) => t.sidebar.staffTab,
    getSublabel: (t) => t.sidebar.staffSub,
    defaultRoles: ['manager', 'admin'],
    scrollableContainer: true,
  },
  {
    id: 'sales',
    path: 'sales',
    component: <SalesHistoryScreen />,
    icon: (props) => <BarChart3 className={props?.className || 'w-5 h-5'} />,
    permissionEmoji: '📊',
    getLabel: (t) => t.sidebar.salesTab,
    getSublabel: (t) => t.sidebar.salesSub,
    defaultRoles: ['cashier', 'manager', 'admin'],
    scrollableContainer: true,
  },
  {
    id: 'reports',
    path: 'reports',
    component: <ReportsScreen />,
    icon: (props) => <ScrollText className={props?.className || 'w-5 h-5'} />,
    permissionEmoji: '📑',
    getLabel: (t) => t.sidebar.reportsTab,
    getSublabel: (t) => t.sidebar.reportsSub,
    defaultRoles: ['manager', 'admin'],
    scrollableContainer: true,
  },
];

export const ALL_FEATURE_IDS: FeatureId[] = FEATURE_REGISTRY.map((f) => f.id);

export const DEFAULT_FEATURE_ID: FeatureId = 'pos';

/**
 * Returns default permissions for a user role based on the centralized feature registry
 */
export const getDefaultPermissionsForRole = (
  role: 'cashier' | 'manager' | 'admin'
): FeatureId[] => {
  if (role === 'admin') {
    return ALL_FEATURE_IDS;
  }
  return FEATURE_REGISTRY.filter((f) => f.defaultRoles.includes(role)).map((f) => f.id);
};

export const getFeatureById = (id: string): FeatureConfig | undefined => {
  return FEATURE_REGISTRY.find((f) => f.id === id);
};

export const getFeatureByPath = (path: string): FeatureConfig | undefined => {
  const clean = path.replace(/^\//, '');
  return FEATURE_REGISTRY.find((f) => f.path === clean);
};
