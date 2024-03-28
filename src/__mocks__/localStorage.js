export const localStorageMock = (function () {
  let store = {};
  return {
    getItem: function (key) {
      return JSON.stringify(store[key]);
    },
    setItem: function (key, value) {
      store[key] = JSON.parse(value);
    },
    clear: function () {
      store = {};
    },
    removeItem: function (key) {
      delete store[key];
    },
  };
})();
