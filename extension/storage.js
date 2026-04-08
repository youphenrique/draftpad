const Storage = {
  async get(key, defaultValue = null) {
    return new Promise((resolve) => {
      const api = typeof browser !== "undefined" ? browser : chrome;
      api.storage.local.get([key], (result) => {
        resolve(result[key] !== undefined ? result[key] : defaultValue);
      });
    });
  },

  async set(key, value) {
    return new Promise((resolve) => {
      const api = typeof browser !== "undefined" ? browser : chrome;
      api.storage.local.set({ [key]: value }, () => {
        resolve();
      });
    });
  },
};
