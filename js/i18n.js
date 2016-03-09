// A class for facilitating internationalisation
Translations =
{
  strings: [], // Array of languages (each language is an array of strings)
  currentLanguage: 0, // selected language

  getTranslated: function(index, language)
  {
    if(language == undefined)
    {
      language = this.currentLanguage;
    }

    if(index < this.strings[language].length && index >= 0)
      return this.strings[language][index];

    alert("ERROR! No translation for string number " + index);
  },

  setLanguage: function(index)
  {
    this.currentLanguage = index;
  }
}
