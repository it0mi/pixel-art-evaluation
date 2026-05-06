//
// https://phrase.com/blog/posts/step-step-guide-javascript-localization/
//

const defaultLocale = "cs";
const supportedLocales = ["cs", "en"];
let translations = {};
let locale;

document.addEventListener("DOMContentLoaded", async () => {
  const initialLocale = getLocale();
  if (initialLocale != "cs") document.body.hidden = true;
  await setLocale(initialLocale);
  document.body.hidden = false;
});

export function getLocale() {
  let locale = localStorage.getItem("locale");
  if (locale === null) {
    localStorage.setItem("locale", "cs");
    locale = "cs";
    applyTranslations();
  }
  return locale;
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
