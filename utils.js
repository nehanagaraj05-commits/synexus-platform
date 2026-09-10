/* ========================================== */
/* utils.js: Shared Helper Functions          */
/* ========================================== */

export function debounce(func, delay = 500) {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  };
}

export async function fetchWithRetry(
  url,
  options = {},
  retries = 3,
  backoff = 500,
) {
  if (!navigator.onLine) {
    throw new Error("No internet connection detected.");
  }

  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, options);

      if (response.status >= 400 && response.status < 500) {
        return response;
      }

      if (!response.ok) {
        throw new Error(`Server Error: ${response.status}`);
      }

      return response;
    } catch (error) {
      if (i === retries - 1) {
        console.error(`Fetch completely failed after ${retries} attempts.`);
        throw error;
      }

      console.warn(
        `⚠️ Network attempt ${i + 1} failed. Retrying in ${backoff}ms...`,
      );
      await new Promise((resolve) => setTimeout(resolve, backoff));
      backoff *= 2;
    }
  }
}
