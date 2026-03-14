import { es } from "./es";
import { en } from "./en";

export const LOCALES = {
  es: "Español",
  en: "English",
} as const;

export type Locale = keyof typeof LOCALES;

const translations = { es, en } as const;

export function getLangFromUrl(url: URL): Locale {
  const [, lang] = url.pathname.split("/");
  if (lang in translations) return lang as Locale;
  return "es";
}

export function useTranslations(lang: Locale) {
  return translations[lang];
}

export function getLocalizedPath(path: string, lang: Locale): string {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  if (lang === "es") return cleanPath;
  return `/${lang}${cleanPath}`;
}

export function getAlternateLang(lang: Locale): Locale {
  return lang === "es" ? "en" : "es";
}
