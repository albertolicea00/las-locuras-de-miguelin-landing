import type { Locale } from "../i18n/utils";
import rawSponsors from "./sponsors.json";

export interface SponsorLocalizedText {
  es: string | null;
  en: string | null;
}

export interface SponsorRecord {
  id: string;
  name: string;
  url: string;
  enabled: boolean;
  expiresAt: string | null;
  accentColor: string;
  logoAsset: string | null;
  offer: SponsorLocalizedText | null;
  code: string | null;
  shortDescription: SponsorLocalizedText;
  internalNote: SponsorLocalizedText;
}

export interface SponsorItem extends SponsorRecord {
  displayUrl: string;
  hostname: string;
  initials: string;
  isInstagram: boolean;
}

function getSponsorHostname(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

function getSponsorInitials(name: string): string {
  const parts = name
    .split(/\s+/)
    .map((part) => part.replace(/[^A-Za-z0-9]/g, ""))
    .filter(Boolean)
    .filter((part) => !["by", "de", "la", "del"].includes(part.toLowerCase()));

  const letters = parts.slice(0, 2).map((part) => part[0]?.toUpperCase() || "");
  return letters.join("") || name.slice(0, 2).toUpperCase();
}

function getSponsorDisplayUrl(url: string, isInstagram: boolean, hostname: string): string {
  if (!isInstagram) return hostname;

  try {
    const parsed = new URL(url);
    const handle = parsed.pathname.split("/").filter(Boolean)[0];
    return handle ? `@${handle}` : hostname;
  } catch {
    return hostname;
  }
}

function parseExpirationDate(expiresAt: string | null): Date | null {
  if (!expiresAt) return null;

  const normalized = /^\d{4}-\d{2}-\d{2}$/.test(expiresAt)
    ? `${expiresAt}T23:59:59.999`
    : expiresAt;
  const parsed = new Date(normalized);

  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function enrichSponsor(sponsor: SponsorRecord): SponsorItem {
  const hostname = getSponsorHostname(sponsor.url);
  const isInstagram = hostname.includes("instagram.com");

  return {
    ...sponsor,
    hostname,
    initials: getSponsorInitials(sponsor.name),
    isInstagram,
    displayUrl: getSponsorDisplayUrl(sponsor.url, isInstagram, hostname),
  };
}

export function getLocalizedSponsorText(
  value: SponsorLocalizedText | null,
  locale: Locale,
): string {
  if (!value) return "";
  return value[locale] || value.es || value.en || "";
}

export function isSponsorActive(sponsor: SponsorRecord, now = new Date()): boolean {
  if (!sponsor.enabled) return false;

  const expirationDate = parseExpirationDate(sponsor.expiresAt);
  if (!expirationDate) return true;

  return expirationDate.getTime() >= now.getTime();
}

export function getSponsorCatalog(): SponsorItem[] {
  return (rawSponsors as SponsorRecord[]).map(enrichSponsor);
}

export function getActiveSponsors(now = new Date()): SponsorItem[] {
  return getSponsorCatalog().filter((sponsor) => isSponsorActive(sponsor, now));
}
