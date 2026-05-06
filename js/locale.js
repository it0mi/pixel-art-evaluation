//
// https://phrase.com/blog/posts/step-step-guide-javascript-localization/
//

const defaultLocale = "cs";
const supportedLocales = ["cs", "en"];
let translations = {};
let locale;

document.addEventListener("DOMContentLoaded", async () => {
  const initialLocale = supportedOrDefault(browserLocale(true));
  if (initialLocale != "cs") document.body.hidden = true;
  await setLocale(initialLocale);
  document.body.hidden = false;
});

function isSupported(locale) {
  return supportedLocales.indexOf(locale) > -1;
}

function supportedOrDefault(locales) {
  let ls = localStorage.getItem("locale");
  if (ls != null) return ls;
  return locales.find(isSupported) || defaultLocale;
}

function browserLocale(languageCodeOnly = false) {
  const locale = navigator.language;

  return languageCodeOnly ? locale.split("-")[0] : locale;
}

export async function setLocale(newLocale) {
  if (newLocale === locale) return;
  const newTranslations = await fetchTranslationsFor(newLocale);
  locale = newLocale;
  translations = newTranslations;
  localStorage.setItem("locale", locale);

  applyTranslations();
}

async function fetchTranslationsFor(newLocale) {
  const response = await fetch(`./locales/${newLocale}.json`);
  return await response.json();
}

function translateElement(element) {
  const key = element.getAttribute("data-i18n-key");
  const translation = translations[key];
  element.innerText = translation;
}

export function applyTranslations() {
  document.querySelectorAll("[data-i18n-key]").forEach(translateElement);

  document.title = translations["pageTitle"];
}
