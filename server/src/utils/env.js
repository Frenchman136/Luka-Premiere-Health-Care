let runtimeConfig;

function loadRuntimeConfig() {
  if (runtimeConfig !== undefined) {
    return runtimeConfig;
  }
  try {
    // Lazy require to avoid local dev dependency on functions runtime.
    // eslint-disable-next-line global-require
    const functions = require("firebase-functions");
    runtimeConfig = typeof functions.config === "function" ? functions.config() : {};
  } catch {
    runtimeConfig = {};
  }
  return runtimeConfig;
}

function getConfigValue(path) {
  if (!path) return undefined;
  const config = loadRuntimeConfig();
  return path.split(".").reduce((acc, key) => {
    if (!acc || acc[key] === undefined) return undefined;
    return acc[key];
  }, config);
}

function env(key, configPath) {
  return process.env[key] || getConfigValue(configPath);
}

module.exports = {
  env,
};
