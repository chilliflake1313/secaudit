function isTransientError(error) {
  const message = String(error?.message || error || "").toLowerCase();

  return [
    "timeout",
    "timed out",
    "eai_again",
    "econnreset",
    "etimedout",
    "socket hang up",
    "temporarily unavailable",
    "internal error",
    "503",
    "500"
  ].some((token) => message.includes(token));
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function retry(fn, attempts = 2) {
  let lastError;

  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      if (attempt >= attempts || !isTransientError(error)) {
        throw error;
      }

      await delay(200 * attempt);
    }
  }

  throw lastError;
}

module.exports = { retry, isTransientError };
