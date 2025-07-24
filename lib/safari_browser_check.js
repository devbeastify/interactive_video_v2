// @ts-check

/**
 * iPadOS Safari has the same user agent as OSX Safari, but is still subject
 * to all of the mobile browser policies enforced by Apple.  Therefore, we
 * have to assume that all Safari browsers are mobile.
 * @param {string} userAgent The user agent string to test.  Defaults to the browser's userAgent.
 * @return {boolean}
 */
export function browserIsSafari(userAgent = navigator.userAgent) {
  let result = false;
  if (appleProductWithSafari().test(userAgent)) result = true;
  if (iOSDevice().test(userAgent)) result = true;
  return result;
}

/**
 * Due to past efforts by browser vendors to bypass user agent checks,
 * testing a user agent string for "Safari" is unreliable for checking if the
 * browser is indeed Safari.
 *
 * The following regex tests for the presence of "Macintosh" (used by Apple
 * products) followed by the explicit use of "Version" (including a version
 * number), a space, and finally "Safari" with another version number.
 *
 * @example
 * // iPad Safari, tests true
 * Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_6) AppleWebKit/605.1.15 (KHTML, like Gecko)
 * Version/14.0.1 Safari/605.1.15
 *
 * // Chrome on OSX, tests false
 * Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko)
 * Chrome/86.0.4240.193 Safari/537.36
 *
 * @return {RegExp}
 */
function appleProductWithSafari() {
  return /(\(Macintosh).+(Version\/[0-9.]+)\s(Safari\/[0-9.]+)$/;
}

/**
 * iPhone user agents may not match the regex string above, howeever newer iPhones typically
 * contain "iPhone" in the user agent string.
 *
 * @return {RegExp}
 */
function iOSDevice() {
  return /iPhone|iPad|iPod/;
}