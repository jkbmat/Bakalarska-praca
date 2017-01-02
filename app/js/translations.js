// A class for facilitating internationalisation
module.exports = {
  strings: [require('../translations/english.js'), require('../translations/slovak.js')], // Array of languages (each language is an array of strings)
  currentLanguage: 0, // selected language

  getTranslated: function(route, language) {
    if (language == undefined) {
      language = this.currentLanguage;
    }

    if (typeof language !== "number" || language < 0 || language >= this.strings.length) {
      throw new Error("ERROR! Undefined language: " + language);
    }

    var translation = this.strings[language];

    var steps = route.split('.');
    for (var i = 0; i < steps.length; ++i) {
      var step = steps[i];
      if (step in translation) {
        translation = translation[step];
      }
      else {
        throw new Error("ERROR! No translation for " + route);
      }
    }

    if (typeof translation !== "string") {
      throw new Error("ERROR! Uncomplete translation route: " + route);
    }

    return translation;
  },

  getTranslatedWrapped: function(route, language) {
    var ret = el("span", {translation: route});
    ret.innerHTML = this.getTranslated(route, language);

    return ret;
  },

  setLanguage: function(index) {
    this.currentLanguage = index;

    var translated = document.querySelectorAll("[translation]");
    for (var i = 0; i < translated.length; i++) {
      translated[i].innerHTML = this.getTranslated(translated[i].getAttribute("translation"));
    }
  },

  refresh: function () {
    this.setLanguage(this.currentLanguage);
  }
};