/**
 * Check if s is a string that fulfills options.
 *
 * @param {*} s - Thing to check.
 * @param {number} min - Minimum length of string.
 * @param {number} max - Maximum length of string.
 * @param {boolean} trim - True to trim trailing spaces.
 *
 * @returns {boolean} True if s is a string fulfilling all options.
 */
function isValidString(s, { min = 0, max = undefined, trim = true } = {}) {
  if (typeof s === 'string' && trim) {
    s = s.trim(); // eslint-disable-line
  }

  if (typeof s !== 'string') {
    return false;
  }

  if (max && s.length > max) {
    return false;
  }

  if (s.length < min) {
    return false;
  }

  return true;
}


module.exports = {
  isValidString,
};
