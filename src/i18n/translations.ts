import {
  commonTh,
  commonEn,
  navbarTh,
  navbarEn,
  sidebarTh,
  sidebarEn,
} from "./modules/common";
import { loginTh, loginEn, registerTh, registerEn } from "./modules/auth";
import {
  posTh,
  posEn,
  receiptTh,
  receiptEn,
  customersTh,
  customersEn,
} from "./modules/pos";
import {
  productsTh,
  productsEn,
  stockBadgeTh,
  stockBadgeEn,
} from "./modules/products";
import { salesTh, salesEn } from "./modules/sales";
import { shiftsTh, shiftsEn } from "./modules/shifts";
import { staffTh, staffEn } from "./modules/staff";
import { reportsTh, reportsEn } from "./modules/reports";
import { settingsTh, settingsEn } from "./modules/settings";
import { landingTh, landingEn } from "./modules/landing";

import type { Language } from "./types";
export type { Language };

export const th = {
  common: commonTh,
  navbar: navbarTh,
  sidebar: sidebarTh,
  login: loginTh,
  register: registerTh,
  pos: posTh,
  receipt: receiptTh,
  products: productsTh,
  sales: salesTh,
  shifts: shiftsTh,
  staff: staffTh,
  customers: customersTh,
  reports: reportsTh,
  stockBadge: stockBadgeTh,
  settings: settingsTh,
  landing: landingTh,
};

export type LocaleType = typeof th;
export type TranslationSchema = LocaleType;

export const en: LocaleType = {
  common: commonEn,
  navbar: navbarEn,
  sidebar: sidebarEn,
  login: loginEn,
  register: registerEn,
  pos: posEn,
  receipt: receiptEn,
  products: productsEn,
  sales: salesEn,
  shifts: shiftsEn,
  staff: staffEn,
  customers: customersEn,
  reports: reportsEn,
  stockBadge: stockBadgeEn,
  settings: settingsEn,
  landing: landingEn,
};

export const translations: Record<Language, LocaleType> = {
  th,
  en,
};

// Re-export modules for direct granular access if needed
export * from "./modules/common";
export * from "./modules/auth";
export * from "./modules/pos";
export * from "./modules/products";
export * from "./modules/sales";
export * from "./modules/shifts";
export * from "./modules/staff";
export * from "./modules/reports";
export * from "./modules/settings";
export * from "./modules/landing";
