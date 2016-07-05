var Tools = require("./tools.js");
var BodyType = require("./bodytype.js");

// Object for building the UI
var UI = {
  // UI initialisation
  initialize: function() {

    var toolbar = el("div.toolbar");

    var collisionsButton = el("div.uiContainer.button", {stringId: 1});
    collisionsButton.onclick = function() {
      UI.popup(UI.createCollisions());
    };

    var pauseButton = el("div.uiContainer.button", {stringId: 2});
    pauseButton.onclick = function() {
      _engine.togglePause();
      this.stringId = _engine.world.paused ? 2 : 3;
      this.innerHTML = Translations.getTranslated(this.stringId);
    };

    var languageSelector = el("select");
    languageSelector.onchange = function () {
      Translations.setLanguage(this.value);
    };
    for (var i = 0; i < Translations.strings.length; i++)
    {
      var option = el("option", {value: i});
      option.innerHTML = Translations.getTranslated(0, i);

      languageSelector.appendChild(option);
    }

    toolbar.appendChild(pauseButton);
    toolbar.appendChild(collisionsButton);
    toolbar.appendChild(languageSelector);

    var languages = [];
    for (var i = 0; i < Translations.strings.length; i++)
    {
      languages.push({ text: Translations.getTranslated(0, i), id: i });
    }

    $("body").w2layout(
      {
        name: "editorLayout",
        panels: [
          {
            type: "main",

            content: "<canvas id='mainCanvas'></canvas>",

            toolbar: {
              items: [
                { type: "button", id: "pause", caption: Translations.getTranslatedWrapped(2).outerHTML, stringId: 2 },
                { type: 'break', id: 'break1' },
                { type: "button", id: "collisions", caption: Translations.getTranslatedWrapped(1).outerHTML},
                { type: 'break', id: 'break2' },
                { type: "radio", group: 1, id: "selection", checked: true, caption: Translations.getTranslatedWrapped(17).outerHTML},
                { type: "radio", group: 1, id: "rectangle", caption: Translations.getTranslatedWrapped(18).outerHTML},
                { type: "radio", group: 1, id: "circle", caption: Translations.getTranslatedWrapped(19).outerHTML},
                { type: "spacer" },
                { type: "menu", id: "language", caption: Translations.getTranslatedWrapped(0).outerHTML, items: languages}
              ],
              onClick: function(e) {
                _engine.selectEntity(null);

                switch (e.target)
                {
                  case "pause":
                    _engine.togglePause();
                    UI.buildSidebar(null);
                    w2ui.editorLayout.toggle("right");
                    this.get("pause").stringId = _engine.world.paused ? 2 : 3;
                    this.get("pause").caption = "<span stringId='"+ this.get("pause").stringId +"'>"+
                      Translations.getTranslated(this.get("pause").stringId)
                    +"</span>";

                    if(_engine.world.paused)
                      this.enable("collisions", "selection", "rectangle", "circle");
                    else
                      this.disable("collisions", "selection", "rectangle", "circle");

                    this.refresh();
                    Translations.refresh();

                    break;

                  case "collisions":
                    UI.popup(UI.createCollisions());
                    break;

                  case "selection":
                    window.Input.tool = Tools.Selection;
                    break;

                  case "rectangle":
                    window.Input.tool = Tools.Rectangle;
                    break;

                  case "circle":
                    window.Input.tool = Tools.Circle;
                    break;
                }

                if (e.target.startsWith("language:"))
                {
                  Translations.setLanguage(e.subItem.id);
                }
              }
            }
          },
          {
            type: "right",
            size: 250,
            resizable: true,
            style: "padding: 1em;"
          },
        ],
        onResize: function (e) {
          if(typeof (_engine) === 'undefined')
            return;

          e.onComplete = function () {
            _engine.viewport.autoResize();
            _engine.viewport.resetElement();
          }
        },
        onClick: function (e) {
          alert();
        }
      }
    );

    Translations.refresh();
  },

  // Creating a popup message
  popup: function(data) {
    /*w2popup.open(
      {
        body: "<div class='w2ui-centered'>"+ data.outerHTML +"</div>",
        width: "700",
        height: "700",
        speed: 0.15
      }
    );*/
    var overlay = el("div#popupOverlay", [el("div#popupContent", [el("div.w2ui-centered", [data])])]);
    overlay.onclick = function(e) {
      UI.closePopup(e)
    };

    document.body.insertBefore(overlay, document.body.firstChild);

    Translations.refresh();
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
    var table = el("table.collisionTable");

    for (var i = 0; i < _engine.COLLISION_GROUPS_NUMBER + 1; i++) {
      var tr = el("tr");

      for (var j = 0; j < _engine.COLLISION_GROUPS_NUMBER + 1; j++) {
        var td = el("td");

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
          var checkbox = el("input", {type: "checkbox"});

          if (_engine.getCollision(i - 1, j - 1))
            checkbox.setAttribute("checked", "checked");

          checkbox.onchange = function(i, j, checkbox) {
            return function() {
              _engine.setCollision(i - 1, j - 1, checkbox.checked ? 1 : 0);
            }
          }(i, j, checkbox);

          // clicking the checkbox's cell should work as well
          td.onclick = function(checkbox) {
            return function(e) {
              if (e.target === checkbox)
                return true;

              checkbox.checked = !checkbox.checked;
              checkbox.onchange();
            };
          }(checkbox);

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

    return table;
  },

  createBehavior: function (entity) {
    return "TODO";

    var logic = el("textarea");
    logic.innerHTML = entity.behaviors[0].toString();

    return el("div", [
      Translations.getTranslatedWrapped(5), el("br"),
      logic,
      el.p(),
      Translations.getTranslatedWrapped(6), el("br"),

    ]);
  },

  buildSidebar: function (entity) {
    var sidebar = w2ui.editorLayout.get("right");

    sidebar.content = "";

    if (entity === null) {
      w2ui.editorLayout.refresh("right");
      return;
    }


    var id = el.input({type: "text", value: entity.id});
    id.oninput = function ()
    {
      _engine.changeId(entity, this.value);
    };

    var collisionGroup = el.input({type: "number", min: 1, max: 16, value: entity.collisionGroup + 1});
    collisionGroup.onchange = function (e)
    {
      entity.setCollisionGroup(this.value * 1 - 1);
    };

    var x = el.input({type: "number", value: entity.body.GetPosition().get_x()});
    x.onchange = function ()
    {
      entity.body.SetTransform(new b2Vec2(this.value * 1, entity.body.GetPosition().get_y()), entity.body.GetAngle());
    };

    var y = el.input({type: "number", value: entity.body.GetPosition().get_y()});
    y.onchange = function ()
    {
      entity.body.SetTransform(new b2Vec2(entity.body.GetPosition().get_x(), this.value * 1), entity.body.GetAngle());
    };

    var rotation = el.input({type: "number", value: entity.body.GetAngle() * 180 / Math.PI});
    rotation.onchange = function ()
    {
      entity.body.SetTransform(entity.body.GetPosition(), (this.value * 1) * Math.PI / 180);
    };

    var fixedRotation = el.input({type: "checkbox"});
    fixedRotation.checked = entity.fixedRotation;
    fixedRotation.onchange = function ()
    {
      entity.disableRotation(this.checked);
    };

    var color = el.input({type: "color", value: entity.color});
    color.onchange = function () {
      entity.color = this.value;
    };

    var changeBehavior = el("button", [Translations.getTranslatedWrapped(4)]);
    changeBehavior.onclick = function () {
      UI.popup(UI.createBehavior(entity));
    };
    
    var bodyType = el("select", {}, [
      el("option", {value: BodyType.DYNAMIC_BODY}, [Translations.getTranslatedWrapped(15)]),
      el("option", {value: BodyType.KINEMATIC_BODY}, [Translations.getTranslatedWrapped(16)]),
    ]);
    for(var i = 0; i < bodyType.options.length; i ++)
    {
      if((bodyType.options[i].value * 1) === entity.body.GetType()) {
        bodyType.options[i].selected = true;

        break;
      }
    }
    bodyType.onchange = function () {
      entity.body.SetType(this.value * 1);
    };


    var content = el.div({}, [
      Translations.getTranslatedWrapped(7),
      el("br"), id, el("p"),
      Translations.getTranslatedWrapped(8),
      el("br"), collisionGroup, el("p"),
      Translations.getTranslatedWrapped(9),
      el("br"), x, el("p"),
      Translations.getTranslatedWrapped(10),
      el("br"), y, el("p"),
      Translations.getTranslatedWrapped(11),
      el("br"), rotation, el("p"),
      Translations.getTranslatedWrapped(12),
      el("br"), fixedRotation, el("p"),
      Translations.getTranslatedWrapped(13),
      el("br"), color, el("p"),
      Translations.getTranslatedWrapped(14),
      el("br"), bodyType, el("p"),
      /*el("br"), changeBehavior, el("p")*/
    ]);

    w2ui.editorLayout.content("right", content);

  }
};

module.exports = UI;