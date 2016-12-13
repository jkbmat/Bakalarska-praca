var LSManager = {
  storageName: "saved",

  get: function (key, storage) {
    storage = storage == undefined ? this.storageName : storage;

    return this.getObj(storage)[key];
  },

  set: function (key, val, storage) {
    storage = storage == undefined ? this.storageName : storage;

    if (val == undefined) {
      // Setting in batch

      for (var k in key) {
        set(k, key[k]);
      }
    }

    var obj = this.getObj(storage);
    obj[key] = val;

    window.localStorage.setItem(storage, JSON.stringify(obj));
  },

  remove: function(key, storage) {
    storage = storage == undefined ? this.storageName : storage;

    var obj = this.getObj(storage);
    delete obj[key];

    window.localStorage.setItem(storage, JSON.stringify(obj));
  },

  getObj: function(storage) {
    storage = storage == undefined ? this.storageName : storage;

    var ret = JSON.parse(window.localStorage.getItem(storage));

    if (ret === null) {
      ret = {};
      window.localStorage.setItem(storage, JSON.stringify(ret));
    }

    return ret;
  }
};

module.exports = LSManager;