// @ts-check
/// <reference path="./browser-env.js" />

/**
 * Wrapper for the browser's storage API (compatible with Chrome and Firefox).
 * @namespace AppStorage
 */
const AppStorage = {
  /**
   * Retrieves a value from local storage.
   * @template T
   * @param {string} key - The configuration key
   * @param {T} [defaultValue=null] - Default value if not found
   * @returns {Promise<T>} Promise resolving to the retrieved or default value
   */
  async get(key, defaultValue = /** @type {any} */ (null)) {
    return new Promise((resolve) => {
      // @ts-ignore
      const api = typeof browser !== "undefined" ? browser : chrome;

      api.storage.local.get([key], (/** @type {Record<string, any>} */ result) => {
        resolve(result[key] !== undefined ? result[key] : defaultValue);
      });
    });
  },

  /**
   * Sets a value in local storage.
   * @param {string} key - The configuration key
   * @param {any} value - The value to store
   * @returns {Promise<void>} Promise resolving when the value is saved
   */
  async set(key, value) {
    return new Promise((resolve) => {
      // @ts-ignore
      const api = typeof browser !== "undefined" ? browser : chrome;
      api.storage.local.set({ [key]: value }, () => {
        resolve();
      });
    });
  },
};
