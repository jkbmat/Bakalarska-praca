UI =
{
  initialize: function()
  {
    var collisionsContainer = document.createElement("div");

    var collisionsContent = document.createElement("table");
    for(var i = 0; i < 16; i++)
    {
      var tr = document.createElement("tr");

      for(var j = 1; j < 17; j++)
      {
        var td = document.createElement("td");

        if(i === 0 && j > 1)
          td.innerHTML = j;
        else if(j === 1 && i !== 0)
          td.innerHTML = i;
        else if(i < j && j !== 1 && i !== 0)
        {
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

        tr.appendChild(td);
      }

      collisionsContent.appendChild(tr);
    }
    collisionsContent.style.display = "none";
    collisionsContent.style.top = "50px";
    collisionsContent.className = "uiContainer collisionTable";

    var collisionsButton = document.createElement("div");
    collisionsButton.className = "uiContainer button";
    collisionsButton.innerHTML = Translations.getTranslated(1);
    collisionsButton.onclick = function()
    {
      if(collisionsContent.style.display === "block")
        collisionsContent.style.display = "none";
      else
        collisionsContent.style.display = "block";
    }

    collisionsContainer.insertBefore(collisionsContent, collisionsContainer.firstChild);
    collisionsContainer.insertBefore(collisionsButton, collisionsContainer.firstChild);
    document.body.insertBefore(collisionsContainer, document.body.firstChild);
  }
}
