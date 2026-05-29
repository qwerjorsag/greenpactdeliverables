import fs from 'fs';
import path from 'path';
import { DEFAULT_LANG, NAMESPACES, SUPPORTED_LANGS, type Namespace, type SupportedLang } from './config';

type TranslationDict = Record<string, any>;

const cache = new Map<string, TranslationDict>();

const isSupportedLang = (lang: string): lang is SupportedLang =>
  (SUPPORTED_LANGS as readonly string[]).includes(lang);

const isNamespace = (ns: string): ns is Namespace =>
  (NAMESPACES as readonly string[]).includes(ns);

function loadJson(lang: SupportedLang, ns: Namespace): TranslationDict {
  const key = `${lang}:${ns}`;
  const cached = cache.get(key);
  if (cached) return cached;

  const filePath = path.join(process.cwd(), 'src', 'i18n', ns, `${lang}.json`);
  const raw = fs.readFileSync(filePath, 'utf-8');
  const data = JSON.parse(raw) as TranslationDict;
  cache.set(key, data);
  return data;
}

function getValue(obj: TranslationDict, key: string): string | undefined {
  return key.split('.').reduce<any>((acc, part) => (acc ? acc[part] : undefined), obj);
}

export function getServerT(lang: string, ns: string) {
  const safeLang: SupportedLang = isSupportedLang(lang) ? lang : DEFAULT_LANG;
  const safeNs: Namespace = isNamespace(ns) ? ns : 'common';

  return (key: string, fallback?: string) => {
    const dict = loadJson(safeLang, safeNs);
    const val = getValue(dict, key);
    if (typeof val === 'string') return val;

    if (safeLang !== DEFAULT_LANG) {
      const fallbackDict = loadJson(DEFAULT_LANG, safeNs);
      const fallbackVal = getValue(fallbackDict, key);
      if (typeof fallbackVal === 'string') return fallbackVal;
    }

    return fallback ?? key;
  };
}
