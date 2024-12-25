/*
 * Khai-Huy Alex Nguyen
 * December 25th, 2024
 */

"use strict";

(function() {

  const IMG_URL = "https://www.foryu.me";
  // const URL = "https://www.foryu.me/foryu/characters";
  const URL = "http://localhost:8000/get";

  let chars = undefined;  // list of foryu characters

  window.addEventListener("load", init);

  /**
   * Gets foryu characters
   * Populates main page with characters
   */
  async function init() {
    chars = await getRequest(URL, res => res.json());
    chars = chars["characters"];

    for (let i = 0; i < chars.length; i++) {
      populateCharacter(chars[i]);
    }

    qs("nav p").addEventListener("click", search);
  }

  /**
   * Searches through names of foryu characters:
   * Ignores casing,
   * Hides characters that do not match, and shows characters that do
   */
  function search() {
    let characters = qsa(".character-card");
    let query = qs("nav input").value;
    for (let i = 0; i < characters.length; i++) {
      let name = characters[i].querySelector(".character-name");
      if (query === "" || areSimilar(name.textContent, query)) {
        characters[i].classList.remove("hidden");
      } else {
        characters[i].classList.add("hidden");
      }
    }
  }

  /**
 * Calculates similarity between two strings using exact and fuzzy matching
 * @param {string} str1 - First string to compare
 * @param {string} str2 - Second string to compare
 * @param {number} [threshold=0.8] - Similarity threshold (0 to 1) for fuzzy matching
 * @returns {boolean} - True if strings are similar, false otherwise
 */
function areSimilar(str1, str2, threshold = 0.4) {
  // Handle null, undefined, or empty inputs
  if (!str1 || !str2) {
      return str1 === str2;
  }

  // First try exact match (case-insensitive)
  if (str1.toLowerCase() === str2.toLowerCase()) {
      return true;
  }

  // If not exact match, try fuzzy matching
  return getFuzzySimilarity(str1, str2) >= threshold;
}

/**
* Calculates fuzzy similarity score between two strings
* @param {string} str1 - First string
* @param {string} str2 - Second string
* @returns {number} - Similarity score between 0 and 1
*/
function getFuzzySimilarity(str1, str2) {
  const s1 = str1.toLowerCase();
  const s2 = str2.toLowerCase();

  // Calculate Levenshtein distance
  const distance = levenshteinDistance(s1, s2);

  // Convert distance to similarity score
  const maxLength = Math.max(s1.length, s2.length);
  const similarity = 1 - (distance / maxLength);

  return similarity;
}

/**
* Calculates the Levenshtein distance between two strings
* @param {string} str1 - First string
* @param {string} str2 - Second string
* @returns {number} - The minimum number of single-character edits needed
*/
function levenshteinDistance(str1, str2) {
  const matrix = Array(str2.length + 1).fill(null)
      .map(() => Array(str1.length + 1).fill(null));

  // Fill first row and column
  for (let i = 0; i <= str1.length; i++) {
      matrix[0][i] = i;
  }
  for (let j = 0; j <= str2.length; j++) {
      matrix[j][0] = j;
  }

  // Fill rest of the matrix
  for (let j = 1; j <= str2.length; j++) {
    for (let i = 1; i <= str1.length; i++) {
      const substitutionCost = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1, // deletion
          matrix[j - 1][i] + 1, // insertion
          matrix[j - 1][i - 1] + substitutionCost // substitution
      );
    }
  }

  return matrix[str2.length][str1.length];
}

  /**
   * Populates the character container with a single character
   * @param {object} char - the character to show
   */
  function populateCharacter(char) {
    let newChar = gen("div");
    newChar.classList.add("character-card");

    let textAttributes = [
      "id",
      "vrm_id",
      "code",
      "name",
      "description",
      "personality",
      "scenario",
      "first_message",
      "voice_id",
      "temperature",
      "created_at",
      "vrm_file_url",
      "preview_image_url"
    ];

    let img = gen("img");
    img.src = IMG_URL + char["preview_image_url"];
    img.alt = char["name"];
    img.classList.add("character-image");
    newChar.appendChild(img);

    let details = gen("div");
    details.classList.add("character-content");
    let name = gen("h2");
    name.classList.add("character-name")
    name.textContent = char["name"];
    details.appendChild(name);

    let desc = gen("div");
    desc.classList.add("character-description")
    for (let i = 0; i < textAttributes.length; i++) {
      let p = gen("p");
      let attr = textAttributes[i];
      let strong = gen("strong");
      strong.textContent = attr + ": ";
      let span = gen("span");
      span.textContent = char[attr];
      p.appendChild(strong);
      p.appendChild(span);
      desc.appendChild(p);
    }
    details.appendChild(desc);

    newChar.appendChild(details);

    id("chars").appendChild(newChar);
  }

  /**
   * returns result of GET request with extractFunc being
   * either res => res.json() or res => res.text()
   * @param {string} url - URL to fetch
   * @param {function} extractFunc - res => res.json() or res => res.text()
   * @returns {object | string | undefined} - res.json(), res.text(), or undefined
   */
  async function getRequest(url, extractFunc) {
    try {
      let res = await fetch(url);
      await statusCheck(res);
      res = await extractFunc(res);
      return res;
    } catch (err) {
      handleError(err);
    }
  }
  /**
   * Handles errors gracefully
   * @param {object} err - the error
   */
  function handleError(err) {
    id("error").classList.remove("hidden");
    id("error").textContent = "Error: " + err.message;
  }

  /* --- CSE 154 HELPER FUNCTIONS --- */

  /**
   * If res does not have an ok HTML response code, throws an error.
   * Returns the argument res.
   * @param {object} res - HTML result
   * @returns {object} -  same res passed in
   */
  async function statusCheck(res) {
    if (!res.ok) {
      throw new Error(await res.text());
    }
    return res;
  }

  /**
   * Returns the element that has the ID attribute with the specified value.
   * @param {string} name - element ID.
   * @returns {object} - DOM object associated with id.
   */
  function id(name) {
    return document.getElementById(name);
  }

  /**
   * Returns first element matching selector.
   * @param {string} selector - CSS query selector.
   * @returns {object} - DOM object associated selector.
   */
  function qs(selector) {
    return document.querySelector(selector);
  }

  /**
   * Returns an array of elements matching the given query.
   * @param {string} query - CSS query selector.
   * @returns {array} - Array of DOM objects matching the given query.
   */
  function qsa(query) {
    return document.querySelectorAll(query);
  }

  /**
   * Returns a new HTML element matching the tag.
   * @param {string} tagName - HTML tag name.
   * @returns {object} - new HTML element matching the tag.
   */
  function gen(tagName) {
    return document.createElement(tagName);
  }

})();