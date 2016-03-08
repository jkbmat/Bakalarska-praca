Translations =
{
  strings: [],
  currentLanguage: 0,

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
