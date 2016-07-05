// A class for facilitating internationalisation
var Translations = {
  strings: [], // Array of languages (each language is an array of strings)
  currentLanguage: 0, // selected language

  getTranslated: function(index, language) {
    if (language == undefined) {
      language = this.currentLanguage;
    }

    if (index < this.strings[language].length && index >= 0)
      return this.strings[language][index];

    alert("ERROR! No translation for string number " + index);
  },

  getTranslatedWrapped: function(index, language) {
    var ret = el("span", {stringId: index});
    ret.innerHTML = this.getTranslated(index, language);

    return ret;
  },

  setLanguage: function(index) {
    this.currentLanguage = index;

    var translated = document.querySelectorAll("[stringId]");
    for (var i = 0; i < translated.length; i++)
    {
      translated[i].innerHTML = this.getTranslated(translated[i].getAttribute("stringId"));
    }
  },

  refresh: function () {
    this.setLanguage(this.currentLanguage);
  }
};