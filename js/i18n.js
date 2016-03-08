Translations =
{
  strings: [],
  currentLanguage: 0,

  getTranslated: function(index)
  {
    if(index < this.strings[this.currentLanguage].length && index >= 0)
      return this.strings[this.currentLanguage][index];

    alert("ERROR! No translation for string number " + index);
  },

  setLanguage: function(index)
  {
    this.currentLanguage = index;
  }
}
