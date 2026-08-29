import i18next from 'i18next';
import HttpBackend from 'i18next-http-backend';
import { getStoredItem, setStoredItem } from '../utils/safe-storage.js';
import enCommon from '../../../public/locales/en/common.json';
import enTools from '../../../public/locales/en/tools.json';

// Supported languages
export const supportedLanguages = [
  'en',
  'ar',
  'be',
  'ru',
  'fr',
  'de',
  'es',
  'zh',
  'zh-TW',
  'vi',
  'tr',
  'id',
  'it',
  'pt',
  'nl',
  'da',
  'sv',
  'ko',
  'ja',
  'uk',
  'sk',
] as const;
export type SupportedLanguage = (typeof supportedLanguages)[number];

export const languageNames: Record<SupportedLanguage, string> = {
  en: 'English',
  ar: 'العربية',
  be: 'Беларуская',
  ru: 'Русский',
  fr: 'Français',
  de: 'Deutsch',
  es: 'Español',
  zh: '中文',
  'zh-TW': '繁體中文（台灣）',
  vi: 'Tiếng Việt',
  tr: 'Türkçe',
  id: 'Bahasa Indonesia',
  it: 'Italiano',
  pt: 'Português',
  nl: 'Nederlands',
  da: 'Dansk',
  sv: 'Svenska',
  ko: '한국어',
  ja: '日本語',
  uk: 'Українська',
  sk: 'Slovenčina',
};

export const getLanguageFromUrl = (): SupportedLanguage => {
  const basePath = import.meta.env.BASE_URL.replace(/\/$/, '');
  let path = window.location.pathname;

  if (basePath && basePath !== '/' && path.startsWith(basePath)) {
    path = path.slice(basePath.length) || '/';
  }

  if (!path.startsWith('/')) {
    path = '/' + path;
  }

  const langMatch = path.match(
    /^\/(en|ar|fr|es|de|zh|zh-TW|vi|tr|id|it|pt|nl|be|da|ko|sv|ru|ja|uk|sk)(?:\/|$)/
  );
  if (
    langMatch &&
    supportedLanguages.includes(langMatch[1] as SupportedLanguage)
  ) {
    return langMatch[1] as SupportedLanguage;
  }

  const storedLang = getStoredItem('i18nextLng');
  if (
    storedLang &&
    supportedLanguages.includes(storedLang as SupportedLanguage)
  ) {
    return storedLang as SupportedLanguage;
  }

  // Check browser language preferences
  if (typeof navigator !== 'undefined' && navigator.languages) {
    for (const lang of navigator.languages) {
      if (supportedLanguages.includes(lang as SupportedLanguage)) {
        return lang as SupportedLanguage;
      }

      const primaryLang = lang.split('-')[0];
      if (supportedLanguages.includes(primaryLang as SupportedLanguage)) {
        return primaryLang as SupportedLanguage;
      }
    }
  }

  const envLang = import.meta.env?.VITE_DEFAULT_LANGUAGE;
  if (envLang && supportedLanguages.includes(envLang as SupportedLanguage)) {
    return envLang as SupportedLanguage;
  }

  return 'en';
};

let initialized = false;

export const initI18n = async (): Promise<typeof i18next> => {
  if (initialized) return i18next;

  const currentLang = getLanguageFromUrl();

  setStoredItem('i18nextLng', currentLang);

  await i18next.use(HttpBackend).init({
    lng: currentLang,
    fallbackLng: 'en',
    supportedLngs: supportedLanguages as unknown as string[],
    ns: ['common', 'tools'],
    defaultNS: 'common',
    preload: [currentLang],
    partialBundledLanguages: true,
    resources: {
      en: {
        common: enCommon,
        tools: enTools,
      },
    },
    backend: {
      loadPath: `${import.meta.env.BASE_URL.replace(/\/?$/, '/')}locales/{{lng}}/{{ns}}.json`,
    },
    interpolation: {
      escapeValue: false,
    },
  });

  await i18next.loadNamespaces('tools');

  initialized = true;
  return i18next;
};

export const t = (key: string, options?: Record<string, unknown>): string => {
  return i18next.t(key, options);
};

export const changeLanguage = (lang: SupportedLanguage): void => {
  if (!supportedLanguages.includes(lang)) return;
  setStoredItem('i18nextLng', lang);

  const basePath = import.meta.env.BASE_URL.replace(/\/$/, '');
  let relativePath = window.location.pathname;

  if (basePath && basePath !== '/' && relativePath.startsWith(basePath)) {
    relativePath = relativePath.slice(basePath.length) || '/';
  }

  if (!relativePath.startsWith('/')) {
    relativePath = '/' + relativePath;
  }

  let pagePathWithoutLang = relativePath;
  const langPrefixMatch = relativePath.match(
    /^\/(en|ar|fr|es|de|zh|zh-TW|vi|tr|id|it|pt|nl|be|da|ko|sv|ru|ja|uk|sk)(\/.*)?$/
  );
  if (langPrefixMatch) {
    pagePathWithoutLang = langPrefixMatch[2] || '/';
  }

  if (!pagePathWithoutLang.startsWith('/')) {
    pagePathWithoutLang = '/' + pagePathWithoutLang;
  }

  // O idioma é persistido em localStorage e aplicado em runtime — não há
  // páginas estáticas por idioma, então a URL nunca recebe prefixo /{lang}.
  const newRelativePath = pagePathWithoutLang;

  let newPath: string;
  if (basePath && basePath !== '/') {
    newPath = basePath + newRelativePath;
  } else {
    newPath = newRelativePath;
  }

  newPath = newPath.replace(/\/+/g, '/');

  const newUrl = newPath + window.location.search + window.location.hash;
  if (newPath === window.location.pathname) {
    window.location.reload();
  } else {
    window.location.href = newUrl;
  }
};

// Apply translations to all elements with data-i18n attribute
export const applyTranslations = (): void => {
  document.querySelectorAll('[data-i18n]').forEach((element) => {
    const key = element.getAttribute('data-i18n');
    if (key) {
      const translation = t(key);
      if (translation && translation !== key) {
        element.textContent = translation;
      }
    }
  });

  document.querySelectorAll('[data-i18n-placeholder]').forEach((element) => {
    const key = element.getAttribute('data-i18n-placeholder');
    if (key && element instanceof HTMLInputElement) {
      const translation = t(key);
      if (translation && translation !== key) {
        element.placeholder = translation;
      }
    }
  });

  document.querySelectorAll('[data-i18n-title]').forEach((element) => {
    const key = element.getAttribute('data-i18n-title');
    if (key) {
      const translation = t(key);
      if (translation && translation !== key) {
        (element as HTMLElement).title = translation;
      }
    }
  });

  document.documentElement.lang = i18next.language;
  document.documentElement.dir = i18next.language === 'ar' ? 'rtl' : 'ltr';
};

export const rewriteLinks = (): void => {
  // Sem páginas estáticas por idioma: os links internos nunca recebem
  // prefixo /{lang} — a tradução acontece em runtime na mesma URL.
};

export default i18next;
