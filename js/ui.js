UI =
{
  initialize: function()
  {
    var collisionsButton = document.createElement("div");
    collisionsButton.className = "uiContainer button";
    collisionsButton.innerHTML = Translations.getTranslated(1);
    collisionsButton.onclick = function()
    {
      UI.popup(UI.createCollisions());
    }

    document.body.insertBefore(collisionsButton, document.body.firstChild);
  },

  popup: function(data)
  {
    var overlay = document.createElement("div");
    overlay.id = "popupOverlay";
    overlay.onclick = this.closePopup;

    var content = document.createElement("div");
    content.id = "popupContent";

    content.appendChild(data);
    overlay.appendChild(content);

    document.body.insertBefore(overlay, document.body.firstChild);
  },

  closePopup: function(e)
  {
    var overlay = document.getElementById("popupOverlay");
    var content = document.getElementById("popupContent");

    if(e.srcElement !== overlay)
      return true;

    content.parentNode.removeChild(content);
    overlay.parentNode.removeChild(overlay);
  },

  createCollisions: function()
  {
    var table = document.createElement("table");

    for(var i = 0; i < COLLISION_GROUPS_NUMBER + 1; i++)
    {
      var tr = document.createElement("tr");

      for(var j = 0; j < COLLISION_GROUPS_NUMBER + 1; j++)
      {
        var td = document.createElement("td");

        if(i === 0 && j > 0)
        {
          td.innerHTML = "<div><span>"+ j +"</span></div>";
        }
        else if(j === 0 && i !== 0)
          td.innerHTML = i;
        else if(i <= j && j !== 0 && i !== 0)
        {
          td.row = i;
          td.col = j;

          td.onmouseover = function(i, j, table)
          {
            return function()
            {
              var tds = table.getElementsByTagName("td");
              for(var n = 0; n < tds.length; n++)
              {
                tds[n].className = "";

                if((tds[n].row === i && tds[n].col <= j) || (tds[n].col === j && tds[n].row <= i))
                  tds[n].className = "highlight";
              }
            }
          }(i, j, table);

          td.onmouseout = function(table)
          {
            return function()
            {
              var tds = table.getElementsByTagName("td");
              for(var n = 0; n < tds.length; n++)
              {
                tds[n].className = "";
              }
            }
          }(table);


          var checkbox = document.createElement("input");
          checkbox.type = "checkbox";
          checkbox.checked = _engine.getCollision(i - 1, j - 1);
          checkbox.onchange = function(i, j, checkbox)
          {
            return function()
            {
              _engine.setCollision(i - 1, j - 1, checkbox.checked ? 1 : 0);
            }
          }(i, j, checkbox)
          td.appendChild(checkbox);
        }
        else
        {
          td.row = i;
          td.col = j;
        }

        tr.appendChild(td);
      }

      table.appendChild(tr);
    }

    table.className = "collisionTable";

    return table;
  }
}
