var _strings;
var _currentLanguage = 0;

function getTranslated(index)
{
  if(index < _strings[_currentLanguage].length && index >= 0)
    return strings[_currentLanguage][index];

  alert("ERROR! No translation for string number " + index);
}

function setLanguage(index)
{
  _currentLanguage = index;
}
