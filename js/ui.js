// Object for building the UI
UI = {
  // UI initialisation
  initialize: function() {
    var collisionsButton = document.createElement("div");
    collisionsButton.className = "uiContainer button translated";
    collisionsButton.stringId = 1;
    collisionsButton.innerHTML = Translations.getTranslated(1);
    collisionsButton.onclick = function() {
      UI.popup(UI.createCollisions());
    }

    document.body.insertBefore(collisionsButton, document.body.firstChild);
  },

  // Creating a popup message
  popup: function(data) {
    var overlay = document.createElement("div");
    overlay.id = "popupOverlay";
    overlay.onclick = function(e) {
      UI.closePopup(e)
    };

    var content = document.createElement("div");
    content.id = "popupContent";

    content.appendChild(data);
    overlay.appendChild(content);

    document.body.insertBefore(overlay, document.body.firstChild);
  },

  // Closing a popup message
  closePopup: function(e) {
    var overlay = document.getElementById("popupOverlay");
    var content = document.getElementById("popupContent");

    // Make sure it was the overlay that was clicked, not an element above it
    if (typeof e !== "undefined" && e.target !== overlay)
      return true;

    content.parentNode.removeChild(content);
    overlay.parentNode.removeChild(overlay);
  },

  // Building the collision group table
  createCollisions: function() {
    var table = document.createElement("table");

    for (var i = 0; i < COLLISION_GROUPS_NUMBER + 1; i++) {
      var tr = document.createElement("tr");

      for (var j = 0; j < COLLISION_GROUPS_NUMBER + 1; j++) {
        var td = document.createElement("td");

        // first row
        if (i === 0 && j > 0) {
          td.innerHTML = "<div><span>" + _engine.collisionGroups[j - 1].name + "</span></div>";
        }

        // first column
        else if (j === 0 && i !== 0)
          td.innerHTML = _engine.collisionGroups[i - 1].name;

        // relevant triangle
        else if (i <= j && j !== 0 && i !== 0) {
          td.row = i;
          td.col = j;

          // highlighting
          td.onmouseover = function(i, j, table) {
            return function() {
              var tds = table.getElementsByTagName("td");
              for (var n = 0; n < tds.length; n++) {
                tds[n].className = "";

                // only highlight up to the relevant cell
                if ((tds[n].row === i && tds[n].col <= j) || (tds[n].col === j && tds[n].row <= i))
                  tds[n].className = "highlight";
              }
            }
          }(i, j, table);

          // more highlighting
          td.onmouseout = function(table) {
            return function() {
              var tds = table.getElementsByTagName("td");
              for (var n = 0; n < tds.length; n++) {
                tds[n].className = "";
              }
            }
          }(table);

          // checkbox for collision toggling
          var checkbox = document.createElement("input");
          checkbox.type = "checkbox";
          checkbox.checked = _engine.getCollision(i - 1, j - 1) ? true : false;
          checkbox.onchange = function(i, j, checkbox) {
            return function() {
              _engine.setCollision(i - 1, j - 1, checkbox.checked ? 1 : 0);
            }
          }(i, j, checkbox)

          // clicking the checkbox's cell should work as well
          td.onclick = function(checkbox) {
            return function(e) {
              if (e.target === checkbox)
                return true;

              checkbox.checked = !checkbox.checked;
              checkbox.onchange();
            }
          }(checkbox)

          td.appendChild(checkbox);
        }

        // fix for also highlighting cells without checkboxes
        else {
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