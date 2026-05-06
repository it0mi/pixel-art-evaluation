/**
 * Author: Tomáš Kurtin (xkurti03@stud.fit.vut.cz)
 * Date: 6 May 2026
 * Description: Scripts for test.html page
 *  - Display pair of image for user to evaluate
 *  - Vote controls
 *  - Sending responses to Google Apps Script
 */

import { applyTranslations } from "./locale.js";

const SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycby7YcM35ALYGiTXd5bcCf6KpqLqwsRN3Tddb2VIxO5ispxWW8F1u-87Kf7HeTE4PA5R/exec";

const params = new URLSearchParams(window.location.search);

const testName = params.get("test") || "unknown";

const maxPairs = 60; // How many pairs are in Evaluation

const leftImage = document.getElementById("left-image");
const rightImage = document.getElementById("right-image");
const referenceImage = document.getElementById("reference-image");
const counter = document.getElementById("counter");
const title = document.getElementById("test-title");
const leftButton = document.getElementById("left-button");
const sameButton = document.getElementById("same-button");
const rightButton = document.getElementById("right-button");
const leftButtonText = document.getElementById("left-button-text");
const sameButtonText = document.getElementById("same-button-text");
const rightButtonText = document.getElementById("right-button-text");

// Pairs variables
let pairs = [];
let currentIndex = 0;
let pairStartTime = 0;

// Set session
let sessionId = localStorage.getItem("session_id");
if (!sessionId) {
  sessionId = crypto.randomUUID();

  localStorage.setItem("session_id", sessionId);
}

// Loading saved progress
const savedProgress = `progress_${testName}`;
const savedIndex = localStorage.getItem(savedProgress);
if (savedIndex) {
  currentIndex = parseInt(savedIndex);
}

/**
 * Initializes the page.
 */
async function init() {
  updateMobileControls();

  let evaluation = "";
  if (testName === "naive") evaluation = "evaluation1";
  if (testName === "colorReduction") evaluation = "evaluation2";
  if (testName === "allMethods") evaluation = "evaluation3";
  title.setAttribute("data-i18n-key", evaluation);

  applyTranslations();
  await loadPairs();

  showPair();
}

/**
 * Load image pairs.
 */
async function loadPairs() {
  const response = await fetch(`pairs/${testName}.json`);
  pairs = await response.json();
  const cacheKey = "pairs_cache_" + testName;
  const shuffledPairs = "pairs_shuffled_" + testName;

  // Check if pairs had been shuffled already
  if (!localStorage.getItem(shuffledPairs)) {
    // Not shuffled yet
    shuffle(pairs);
    pairs = pairs.slice(0, maxPairs);

    localStorage.setItem(cacheKey, JSON.stringify(pairs));
    localStorage.setItem(shuffledPairs, "true");
  } else {
    // Load shuffled paris
    pairs = JSON.parse(localStorage.getItem(cacheKey));
  }
}

/**
 * Checks if image exists or not.
 * @param {string} src Path to image
 * @returns {boolean} true if exists, else false
 */
function imageExists(src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = src;
  });
}

/**
 * Displays pair of images for user to choose better from.
 * @returns Shows evaluation end message if user completed all evaluations.
 */
async function showPair() {
  // Nothing more to evaluate, max evaluation count has been reached.
  if (currentIndex >= pairs.length) {
    document.body.innerHTML = `
        <main class="container">
          <h1 data-i18n-key="finished">Hodnocení dokončeno</h1>
          <p data-i18n-key="thanks">Děkuji za účast v testu.</p>
          <a data-i18n-key="backToMainPage" href="index.html" role="button"> Zpět na hlavní stránku </a>
        </main>
      `;
    applyTranslations();
    return;
  }

  // Set images
  const pair = pairs[currentIndex];
  leftImage.src = pair.left_image;
  rightImage.src = pair.right_image;

  // Set remaining evaluations counter
  counter.textContent = `${currentIndex + 1} / ${pairs.length}`;

  // Load original image
  const filename = leftImage.src.split("/").pop();
  const exists = await imageExists(`img/${filename}`);
  // Rename if original isn't png
  const input_file = exists ? filename : filename.replace(".png", ".jpg");
  referenceImage.src = `img/${input_file}`;

  pairStartTime = Date.now();
}

/**
 * Sends user's answer to Google Apps Script
 * @param {string} choice
 */
async function submitChoice(choice) {
  const pair = pairs[currentIndex];

  const responseTime = Date.now() - pairStartTime;
  // Get info from image path
  // (results/piaResize/10/128/14.png)
  // (folder/methodName/colorNumber/maxSize/imageName)
  const pair_arr = pair.left_image.split("/");
  const arr_len = pair_arr.length;
  const img_name = pair_arr[arr_len - 1];
  const pair_scale = pair_arr[arr_len - 2];
  const color_count =
    testName === "colorReduction" ? pair_arr[arr_len - 3] : "";

  // Set winner string
  let winner = "None";
  if (choice === "left") winner = pair.left_method + "_" + pair.right_method;
  if (choice === "right") winner = pair.right_method + "_" + pair.left_method;

  let pix_artist = localStorage.getItem("pixelArtist");

  const payload = {
    test_name: testName,
    session_id: sessionId,
    pair_id: pair.pair_id,

    choice: choice,
    winner_loser: winner,

    left_image: pair.left_image,
    right_image: pair.right_image,

    left_method: pair.left_method,
    right_method: pair.right_method,
    scale: pair_scale,

    color_count: arr_len,
    image_name: img_name,

    response_time_ms: responseTime,

    is_pixel_artist: pix_artist,
    is_on_mobile: isCurrentlyMobile,

    timestamp: new Date().toISOString(),
  };

  // Load next and then send result, so the user doesn't need to wait
  currentIndex++;

  localStorage.setItem(savedProgress, currentIndex);

  showPair();

  // Send POST to Google Apps Script
  try {
    const formData = new FormData();

    // Send as formData, Apps Script had problem with json
    for (const key in payload) {
      formData.append(key, payload[key]);
    }

    await fetch(SCRIPT_URL, {
      method: "POST",

      body: formData,
    });
  } catch (error) {
    console.error("Failed to save:", error);
  }
}

leftButton.addEventListener("click", () => {
  submitChoice("left");
});

sameButton.addEventListener("click", () => {
  submitChoice("same");
});

rightButton.addEventListener("click", () => {
  submitChoice("right");
});

// Key shortcuts
document.addEventListener("keydown", (e) => {
  if (e.repeat) {
    return;
  }

  let lower = e.key.toLowerCase();
  switch (lower) {
    case "a":
      leftButton.click();
      break;
    case "s":
      sameButton.click();
      break;
    case "d":
      sameButton.click();
  }
});

// https://stackoverflow.com/a/2450976
/**
 * Shuffle pairs array.
 * @param {*} array Input array
 */
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));

    [array[i], array[j]] = [array[j], array[i]];
  }
}

let isCurrentlyMobile = false;
/**
 * Update controls text to match mobile/desktop layout
 */
function updateMobileControls() {
  const isMobile = window.innerWidth <= 768;

  // Check if there is need to adjust content
  if (isMobile == isCurrentlyMobile) return;
  isCurrentlyMobile = !isCurrentlyMobile;

  if (isMobile) {
    leftButtonText.setAttribute("data-i18n-key", "topBetter");
    rightButtonText.setAttribute("data-i18n-key", "bottomBetter");

    document.querySelectorAll(".key-hint").forEach((element) => {
      element.classList.add("key-hint-hidden");
    });
  } else {
    leftButtonText.setAttribute("data-i18n-key", "leftBetter");
    rightButtonText.setAttribute("data-i18n-key", "rightBetter");
    document.querySelectorAll(".key-hint").forEach((element) => {
      element.classList.remove("key-hint-hidden");
    });
  }
  applyTranslations();
}

window.addEventListener("resize", updateMobileControls);

init();
