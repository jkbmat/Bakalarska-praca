require("chai").should();
require("./setup/base");

module.exports = {
  "before": function () {
    Translations = require("./setup/translations");
    Translations.strings = [
      {
        STRING: {
          LONG: {
            PATH: "Language 0"
          }
        }
      },

      {
        STRING: {
          LONG: {
            PATH: "Language 1"
          }
        }
      }
    ];
  },

  "Translations": {
    "returns correct translation in current language": function () {
      Translations.getTranslated("STRING.LONG.PATH").should.equal("Language 0");
    },

    "returns correct translation in a non-selected language": function () {
      Translations.getTranslated("STRING.LONG.PATH", 1).should.equal("Language 1");
    },

    "fails when the specified language doesn't exist": function () {
      (function () {
        Translations.getTranslated("STRING.LONG.PATH", 2);
      }).should.throw(Error);
    },

    "fails when the specified key doesn't exist": function () {
      (function () {
        Translations.getTranslated("FAIL");
      }).should.throw(Error);
    },

    "fails when using an uncomplete route": function () {
      (function () {
        Translations.getTranslated("STRING");
      }).should.throw(Error);
    }
  }
};