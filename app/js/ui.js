var Tools = require("./tools.js");
var BodyType = require("./bodytype.js");
var UIBuilder = require("./uibuilder.js");
var Constants = require("./constants.js");
var Translations = require("./translations.js");

// Object for building the UI
var UI = {
  // UI initialisation
  initialize: function() {
    var languages = [];
    for (var i = 0; i < Translations.strings.length; i++) {
      languages.push({text: Translations.getTranslated("LANGUAGE_NAME", i), value: i});
    }

    var properties = [
      {
        type: "button",

        id: "play",
        text: Translations.getTranslatedWrapped("START"),
        onclick: function () {
          _engine.togglePause();

          if (_engine.world.paused) {
            $("#play").html(Translations.getTranslatedWrapped("START"));

            $("#collisions, #tool").each(function () {
              this.enable();
            });
          }
          else {
            $("#play").html(Translations.getTranslatedWrapped("PAUSE"));

            $("#collisions, #tool").each(function () {
              this.disable();
            });
          }
        }
      },
      {type: "break"},
      {
        type: "button",

        id: "collisions",
        text: Translations.getTranslatedWrapped("COLLISION_GROUPS"),
        onclick: function () {
          UIBuilder.popup(UI.createCollisions());
        }
      },
      {type: "break"},
      { type: "html", content: Translations.getTranslatedWrapped("TOOL") },
      {
        type: "radio",

        id: "tool",
        elements: [
          {
            text: el.img({src: "./img/selection.svg"}), id: "selectionTool", checked: true, onclick: function () {
            _engine.selectTool(Tools.Selection);
          }
          },
          {
            text: el.img({src: "./img/rectangle.svg"}), onclick: function () {
            _engine.selectTool(Tools.Rectangle);
          }
          },
          {
            text: el.img({src: "./img/circle.svg"}), onclick: function () {
            _engine.selectTool(Tools.Circle);
          }
          },
        ]
      },
      {type: "break"},
      { type: "html", content: Translations.getTranslatedWrapped("ZOOM") },
      {
        type: "range",

        min: 1,
        max: 11,
        step: 0.1,
        value: 6,
        width: "150px",
        disableWrite: true,

        oninput: function(val) {
          _engine.viewport.zoom(val);
        }
      },
      {type: "break"},
      {
        type: "select",
        options: languages,

        onchange: function (value) {
          Translations.setLanguage(value * 1);
        },
      }
    ];

    UIBuilder.buildLayout();
    $(".ui.toolbar")[0].appendChild(UIBuilder.build(properties));
    $(".ui.content")[0].appendChild(el("canvas#mainCanvas"));

  },

  // Building the collision group table
  createCollisions: function() {
    var table = el("table.collisionTable");

    for (var i = 0; i < Constants.COLLISION_GROUPS_NUMBER; i++) {
      var tr = el("tr");

      for (var j = 0; j < Constants.COLLISION_GROUPS_NUMBER; j++) {
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
            };
          }(i, j, table);

          // more highlighting
          td.onmouseout = function(table) {
            return function() {
              var tds = table.getElementsByTagName("td");
              for (var n = 0; n < tds.length; n++) {
                tds[n].className = "";
              }
            };
          }(table);

          // checkbox for collision toggling
          var checkbox = el("input", {type: "checkbox"});

          if (_engine.getCollision(i - 1, j - 1))
            checkbox.setAttribute("checked", "checked");

          checkbox.onchange = function(i, j, checkbox) {
            return function() {
              _engine.setCollision(i - 1, j - 1, checkbox.checked ? 1 : 0);
            };
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
    var BehaviorBuilder = new (require("./behaviorbuilder.js"))(_engine.tokenManager);
    var UIBuilder = require("./uibuilder.js");
    var Type = require("./typing.js").Type;

    var oneBehavior = function(behavior) {
      var wrapper = el("div.behavior");
      var logic = el("div.tokenBuilder", {}, [""]);
      var results = el("div");

      var remover = UIBuilder.button({
        text: Translations.getTranslatedWrapped("BEHAVIORS.REMOVE_BEHAVIOR"), onclick: (function (wrapper) {
          return function () {
            // If the function isn't wrapped, only the last instance of behavior gets passed

            $(wrapper).remove();
          };
        })(wrapper)
      });
      remover.style.float = "right";

      if (behavior === null) {
        BehaviorBuilder.initialize(Type.BOOLEAN, logic);

        results.appendChild(oneResult(null, Translations.getTranslatedWrapped("BEHAVIORS.ACTION"), false));
      }
      else {
        BehaviorBuilder.buildToken(behavior.logic, logic.firstChild);

        results.appendChild(oneResult(behavior.results[0], Translations.getTranslatedWrapped("BEHAVIORS.ACTION"), false));

        for (var j = 1; j < behavior.results.length; j++) {
          results.appendChild(oneResult(behavior.results[j], Translations.getTranslatedWrapped("BEHAVIORS.ANOTHER_ACTION"), true));
        }
      }


      results.appendChild(UIBuilder.button({text: Translations.getTranslatedWrapped("BEHAVIORS.NEW_ACTION"), onclick: function (e) {
        this.parentNode.insertBefore(oneResult(null, Translations.getTranslatedWrapped("BEHAVIORS.ANOTHER_ACTION"), true), this);
      }}));

      wrapper.appendChild(el("h2", {}, [Translations.getTranslatedWrapped("BEHAVIORS.CONDITION"), remover]));
      wrapper.appendChild(logic);
      wrapper.appendChild(results);

      return wrapper;
    };

    var oneResult = function(result, text, enableRemove) {
      var wrapper = el("div");
      var resultElement = el("div.tokenBuilder", {}, [""]);

      var resultRemover = UIBuilder.button({text: Translations.getTranslatedWrapped("BEHAVIORS.REMOVE_BEHAVIOR"), onclick:
        (function(resultElement){return function(){
          // If the function isn't wrapped, only the last instance of result gets passed

          $(resultElement).prev().remove(); // Remove the header
          $(resultElement).remove(); // And the token builder
        };})(resultElement)});
      resultRemover.style.float = "right";

      if(! enableRemove)
        resultRemover = "";

      wrapper.appendChild(el("h2", {}, [
        text,
        resultRemover
      ]));
      wrapper.appendChild(resultElement);

      if(result === null)
        BehaviorBuilder.initialize(Type.ACTION, resultElement);
      else
        BehaviorBuilder.buildToken(result, resultElement.firstChild);

      return wrapper;
    };

    var ret = el("div.behaviorWrapper");

    for (var i = 0; i < entity.behaviors.length; i++) {
      ret.appendChild(oneBehavior(entity.behaviors[i]));
    }

    var that = this;

    var buttons = el("div.bottom", {}, [
      UIBuilder.button({
        text: Translations.getTranslatedWrapped("BEHAVIORS.NEW_BEHAVIOR"),
        onclick: function () {
          ret.appendChild(oneBehavior(null));
          ret.scrollTop = ret.scrollHeight;
        }
      }),
      UIBuilder.break(),
      UIBuilder.button({
        text: Translations.getTranslatedWrapped("BEHAVIORS.CANCEL_BUTTON"),
        onclick: function () {
          UIBuilder.closePopup();
        }
      }),
      UIBuilder.button({
        text: Translations.getTranslatedWrapped("BEHAVIORS.DONE_BUTTON"),
        onclick: function () {
          that.saveBehavior(entity);
          UIBuilder.closePopup();
        }
      }),
    ]);
    var wrapper = el("div", {}, [ret, buttons]);

    return wrapper;
  },

  saveBehavior: function (entity) {
    var Behavior = require("./behavior.js");

    entity.behaviors = [];
    var behaviors = $(".behaviorWrapper .behavior");

    for(var i = 0; i < behaviors.length; i++) {
      var tokenBuilders = $(".tokenBuilder", behaviors[i]);

      try {
        var logic = _engine.tokenManager.parser.parse(tokenBuilders[0].textContent);
        var results = [];

        for(var j = 1; j < tokenBuilders.length; j++) {
          try {
            results.push(_engine.tokenManager.parser.parse(tokenBuilders[j].textContent));
          }
          catch (err) {}
        }

        if (results.length === 0)
          throw "All results blank";

        entity.behaviors.push(new Behavior(logic, results));
      }
      catch (err) {
        // Ignore parsing errors (something left blank)
      }
    }
  },

  buildSidebar: function (entity) {
    var sidebar = $(".sidebar.ui .content");

    sidebar.html("");

    if (entity === null) {
      $(".sidebar.ui .content").html(this.buildEntityList());

      return;
    }

    var properties = [
      // ID
      { type: "html", content: Translations.getTranslatedWrapped("SIDEBAR.ID")},
      { type: "inputText", value: entity.id, oninput: function (val) {_engine.changeId(entity, val);}},
      { type: "html", content: el("p")},

      // Collision group
      { type: "html", content: Translations.getTranslatedWrapped("SIDEBAR.COLLISION_GROUP")},
      { type: "range", value: entity.collisionGroup + 1, min: 1, max: Constants.COLLISION_GROUPS_NUMBER - 1,
        oninput: function (val) {entity.setCollisionGroup(val * 1 - 1);}},
      { type: "html", content: el("p")},

      // Layer
      { type: "html", content: Translations.getTranslatedWrapped("SIDEBAR.LAYER")},
      { type: "range", value: entity.layer + 1, min: 1, max: Constants.LAYERS_NUMBER,
        oninput: function (val) { _engine.setEntityLayer(entity, val*1 - 1); }},
      { type: "html", content: el("p")},

      // X
      { type: "html", content: Translations.getTranslatedWrapped("SIDEBAR.X")},
      { type: "inputNumber", value: entity.body.GetPosition().get_x(), id: "entity_x",
        oninput: function (val) {
          entity.body.SetTransform(new b2Vec2(val * 1, entity.body.GetPosition().get_y()), entity.body.GetAngle());
        }},
      { type: "html", content: el("p")},

      // Y
      { type: "html", content: Translations.getTranslatedWrapped("SIDEBAR.Y")},
      { type: "inputNumber", value: entity.body.GetPosition().get_y(), id: "entity_y",
        oninput: function (val) {
          entity.body.SetTransform(new b2Vec2(entity.body.GetPosition().get_x(), val * 1), entity.body.GetAngle());
        }},
      { type: "html", content: el("p")},

      // Rotation
      { type: "html", content: Translations.getTranslatedWrapped("SIDEBAR.ROTATION")},
      { type: "range", min: 0, max: 360, step: 1, value: (((entity.body.GetAngle() * 180 / Math.PI) % 360)+360)%360, id: "entity_rotation",
        oninput: function (val) {entity.body.SetTransform(entity.body.GetPosition(), ((val * 1) * Math.PI / 180)%360);}},
      { type: "html", content: el("p")},

      // Fixed rotation
      { type: "html", content: Translations.getTranslatedWrapped("SIDEBAR.FIXED_ROTATION")},
      { type: "checkbox", checked: entity.fixedRotation, onchange: function(val) { entity.disableRotation(val); } },
      { type: "html", content: el("p")},

      // Restitution
      { type: "html", content: Translations.getTranslatedWrapped("SIDEBAR.RESTITUTION")},
      { type: "range", min: 0, max: 1, step: 0.1, value: entity.fixture.GetRestitution(),
        oninput: function (val) {entity.fixture.SetRestitution(val*1);}},
      { type: "html", content: el("p")},

      // Friction
      { type: "html", content: Translations.getTranslatedWrapped("SIDEBAR.FRICTION")},
      { type: "range", min: 0, max: 1, step: 0.1, value: entity.fixture.GetFriction(),
        oninput: function (val) {entity.fixture.SetFriction(val*1);entity.body.ResetMassData();}},
      { type: "html", content: el("p")},

      // Density
      { type: "html", content: Translations.getTranslatedWrapped("SIDEBAR.DENSITY")},
      { type: "inputNumber", value: entity.fixture.GetDensity(), min: 0,
        oninput: function (val) {entity.fixture.SetDensity(val*1);entity.body.ResetMassData();}},
      { type: "html", content: el("p")},

      // Color
      { type: "html", content: Translations.getTranslatedWrapped("SIDEBAR.COLOR")},
      { type: "inputColor", value: entity.color, oninput: function (val) {entity.color = val}},
      { type: "html", content: el("p")},

      // Body type
      { type: "html", content: Translations.getTranslatedWrapped("SIDEBAR.BODY_TYPE")},
      {
        type: "select", selected: entity.body.GetType(), onchange: function (val) {entity.body.SetType(val * 1)},
        options: [
          { text: Translations.getTranslatedWrapped("SIDEBAR.BODY_TYPES.DYNAMIC"), value: BodyType.DYNAMIC_BODY },
          { text: Translations.getTranslatedWrapped("SIDEBAR.BODY_TYPES.KINEMATIC"), value: BodyType.KINEMATIC_BODY },
          { text: Translations.getTranslatedWrapped("SIDEBAR.BODY_TYPES.STATIC"), value: BodyType.STATIC_BODY },
        ]
      },
      { type: "html", content: el("p")},

      { type: "button", text: Translations.getTranslatedWrapped("SIDEBAR.DELETE_BUTTON"), onclick: function () {
        if(confirm(Translations.getTranslated("SIDEBAR.DELETE_CONFIRM")))
          _engine.removeEntity(entity);
      }},
      { type: "html", content: el("p")},

      { type: "button", text: Translations.getTranslatedWrapped("SIDEBAR.SET_BEHAVIORS"), onclick: function () {
        UIBuilder.popup(UI.createBehavior(entity));
      }},
      { type: "html", content: el("p")},

    ];

    sidebar[0].appendChild(UIBuilder.build(properties));
  },

  buildEntityList: function () {
    var ret = el("div.entityList");

    for (var i = 0; i < Constants.LAYERS_NUMBER; i++)
    {
      if (_engine.layers[i].length === 0)
        continue;

      var layerElement = el("div.layer", {}, [Translations.getTranslatedWrapped("LAYER"), " " + (i + 1) + ":"]);

      for (var j = 0; j < _engine.layers[i].length; j++) {
        var entity = _engine.layers[i][j];

        var entityElement = el("div.entity", {}, [el("span", {}, [
          el("span.id", {}, [entity.id]), ": ", Translations.getTranslatedWrapped(entity.nameString)
        ])]);

        entityElement.onclick = (function (entity) {
          return function () {
            _engine.selectEntity(entity);
          };
        })(entity);

        layerElement.appendChild(entityElement);
      }

      ret.appendChild(layerElement);
    }

    return ret;
  }
};

module.exports = UI;