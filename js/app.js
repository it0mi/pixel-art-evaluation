/**
 * Author: Tomáš Kurtin (xkurti03@stud.fit.vut.cz)
 * Date: 5 May 2026
 * Description: Scripts for main page of feedback collection
 *  - Setting page language
 *  - Setting flag if user is artist
 */

import { setLocale, getLocale } from "./locale.js";

const langButton = document.getElementById("lang");
const yesButton = document.getElementById("isPixelArtist");
const noButton = document.getElementById("isNotPixelArtist");

let lang = getLocale();
let nextLang = lang === "en" ? "cs" : "en";
langButton.innerHTML = nextLang === "en" ? "EN" : "CZ";

langButton.addEventListener("click", () => {
  setLocale(nextLang);
  nextLang = nextLang === "en" ? "cs" : "en";
  langButton.innerHTML = nextLang === "en" ? "EN" : "CZ";
});

/**
 * Sets if user is "artist" to local storage "pixelArtist"
 * @param {boolean} isArtist
 */
function setArtistFlag(isArtist) {
  if (isArtist) {
    localStorage.setItem("pixelArtist", "true");
  } else {
    localStorage.setItem("pixelArtist", "false");
  }
}

yesButton.addEventListener("click", () => {
  noButton.classList.remove("selected-button");
  yesButton.classList.add("selected-button");
  setArtistFlag(true);
});

noButton.addEventListener("click", () => {
  noButton.classList.add("selected-button");
  yesButton.classList.remove("selected-button");
  setArtistFlag(false);
});

let isArtist = localStorage.getItem("pixelArtist");
if (isArtist === null) {
  localStorage.setItem("pixelArtist", "false");
} else {
  if (isArtist === "true") yesButton.click();
  else noButton.click();
}

["naive", "colorReduction", "allMethods"].forEach((element) => {
  if (localStorage.getItem(element + "-done") === "true") return;
  let currentIndex;
  let pairs;
  const savedProgress = `progress_${element}`;
  const savedIndex = localStorage.getItem(savedProgress);
  if (savedIndex) {
    currentIndex = parseInt(savedIndex);
  }
  const cacheKey = "pairs_cache_" + element;
  if (localStorage.getItem(cacheKey) == null) return;
  pairs = JSON.parse(localStorage.getItem(cacheKey));

  if (currentIndex >= pairs.length)
    localStorage.setItem(element + "-done", "true");
});
