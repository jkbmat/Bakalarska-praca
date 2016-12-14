var Tools = require("./tools.js");
var BodyType = require("./bodyType.js");
var CameraStyle = require("./cameraStyle.js");
var UIBuilder = require("./UIBuilder.js");
var Constants = require("./constants.js");
var Translations = require("./translations.js");
var UpdateEvent = require("./updateEvent.js");
var Saver = require("./saver.js");
var Type = require("./typing.js").Type;

// Object for building the UI
var UI = {
  // UI initialisation
  initialize: function () {
    var languages = [];
    for (var i = 0; i < Translations.strings.length; i++) {
      languages.push({text: Translations.getTranslated("LANGUAGE_NAME", i), value: i});
    }

    var properties = [
      {
        type: "button",

        id: "play",
        tooltip: "START_TOOLTIP",
        text: Translations.getTranslatedWrapped("START"),
        onclick: function () {
          _engine.togglePause();
          var elem = $("#" + this.id);

          if (_engine.world.paused) {
            elem.attr("tooltip", "START_TOOLTIP");
            elem.html(Translations.getTranslatedWrapped("START"));

            $("#collisions, #tool").each(function () {
              this.enable();
            });
          }
          else {
            elem.attr("tooltip", "STOP_TOOLTIP");
            elem.html(Translations.getTranslatedWrapped("STOP"));

            $("#collisions, #tool, #undo, #redo, #clearWorld").each(function () {
              this.disable();
            });
          }
        }
      },
      {type: "break"},
      {
        type: "button",

        id: "save",
        tooltip: "SAVE_TOOLTIP",
        text: Translations.getTranslatedWrapped("SAVE"),
        onclick: function () {
          UIBuilder.popup(UI.createSave());
        }
      },
      {
        type: "button",

        id: "load",
        tooltip: "LOAD_TOOLTIP",
        text: Translations.getTranslatedWrapped("LOAD"),
        onclick: function () {
          UIBuilder.popup(UI.createLoad());
        }
      },
      {type: "break"},
      {
        type: "button",

        id: "clearWorld",
        tooltip: "CLEAR_WORLD_TOOLTIP",
        text: el.img({src: "./img/trash.svg"}),
        onclick: function () {
          _engine.stateManager.clearWorld();
        },
        onupdate: function (action, details) {
          if (typeof(_engine) !== "undefined" && (_engine.entities().length === 0 || !_engine.world.paused)) {
            $("#" + this.id)[0].disable();
          }
          else {
            $("#" + this.id)[0].enable();
          }
        }
      },
      {type: "break"},
      {
        type: "button",

        id: "undo",
        tooltip: "UNDO",
        disabled: true,
        // text: Translations.getTranslatedWrapped("UNDO"),
        text: el.img({src: "./img/undo.svg"}),
        onclick: function () {
          _engine.stateManager.undo();
          UI.buildSidebarTopWorld(true);
        },
        onupdate: function (action, detail) {
          var elem = $("#" + this.id)[0];

          if (action === UpdateEvent.STATE_CHANGE) {
            elem.enable();

            if (detail.first)
              elem.disable();
          }
        }
      },
      {
        type: "button",

        id: "redo",
        tooltip: "REDO",
        disabled: true,
        // text: Translations.getTranslatedWrapped("REDO"),
        text: el.img({src: "./img/redo.svg"}),
        onclick: function () {
          _engine.stateManager.redo();
          UI.buildSidebarTopWorld(true);
        },
        onupdate: function (action, detail) {
          var elem = $("#" + this.id)[0];

          if (action === UpdateEvent.STATE_CHANGE) {
            elem.enable();

            if (detail.last)
              elem.disable();
          }
        }
      },
      {type: "break"},
      {
        type: "button",

        id: "collisions",
        tooltip: "COLLISION_GROUPS_TOOLTIP",
        text: Translations.getTranslatedWrapped("COLLISION_GROUPS"),
        onclick: function () {
          UIBuilder.popup(UI.createCollisions());
        }
      },
      {type: "break"},
      {type: "html", content: Translations.getTranslatedWrapped("TOOL")},
      {
        type: "radio",

        id: "tool",
        elements: [
          {
            text: el.img({src: "./img/selection.svg"}),
            tooltip: "SELECTION_TOOL",
            id: "selectionTool",
            checked: true,
            onclick: function () {
              _engine.selectTool(Tools.Selection);
            }
          },
          {
            text: el.img({src: "./img/rectangle.svg"}), tooltip: "RECTANGLE_TOOL", onclick: function () {
            _engine.selectTool(Tools.Rectangle);
          }
          },
          {
            text: el.img({src: "./img/circle.svg"}), tooltip: "CIRCLE_TOOL", onclick: function () {
            _engine.selectTool(Tools.Circle);
          }
          },
        ]
      },
      {type: "break"},
      {type: "html", content: Translations.getTranslatedWrapped("ZOOM")},
      {
        type: "range",

        min: 1,
        max: 11,
        step: 0.1,
        value: 6,
        width: "150px",
        disableWrite: true,

        oninput: function (val) {
          _engine.viewport.zoom(val);
        }
      },
      {type: "break"},
      {
        type: "select",
        tooltip: "LANGUAGE_TOOLTIP",
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
  createCollisions: function () {
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
          td.onmouseover = function (i, j, table) {
            return function () {
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
          td.onmouseout = function (table) {
            return function () {
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

          checkbox.onchange = function (i, j, checkbox) {
            return function () {
              _engine.setCollision(i - 1, j - 1, checkbox.checked ? 1 : 0);
            };
          }(i, j, checkbox);

          // clicking the checkbox's cell should work as well
          td.onclick = function (checkbox) {
            return function (e) {
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
    var BehaviorBuilder = new (require("./behaviorBuilder.js"))(_engine.tokenManager);

    var oneBehavior = function (behavior) {
      var wrapper = el("div.behavior");
      var logic = el("div.tokenBuilder", {}, [""]);
      var results = el("div");

      var remover = UIBuilder.button({
        text: Translations.getTranslatedWrapped("BEHAVIORS.REMOVE_BEHAVIOR"),
        classList: ["removeButton"],
        onclick: (function (wrapper) {
          return function () {
            // If the function isn't wrapped, only the last instance of behavior gets passed

            $(wrapper).remove();
          };
        })(wrapper)
      });

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


      results.appendChild(UIBuilder.button({
        text: Translations.getTranslatedWrapped("BEHAVIORS.NEW_ACTION"), onclick: function (e) {
          var elem = document.getElementById(this.id);
          elem.parentNode.insertBefore(
            oneResult(null, Translations.getTranslatedWrapped("BEHAVIORS.ANOTHER_ACTION"), true),
            elem
          );
        }
      }));

      wrapper.appendChild(el("span.behaviorTitle", {}, [el("h2", {}, [Translations.getTranslatedWrapped("BEHAVIORS.CONDITION")]), remover]));
      wrapper.appendChild(logic);
      wrapper.appendChild(results);
      wrapper.appendChild(el("hr"));

      return wrapper;
    };

    var oneResult = function (result, text, enableRemove) {
      var wrapper = el("div");
      var resultElement = el("div.tokenBuilder", {}, [""]);

      var resultRemover = UIBuilder.button({
        text: Translations.getTranslatedWrapped("BEHAVIORS.REMOVE_ACTION"), onclick: (function (resultElement) {
          return function () {
            // If the function isn't wrapped, only the last instance of result gets passed

            $(resultElement).prev().remove(); // Remove the header
            $(resultElement).remove(); // And the token builder
          };
        })(resultElement)
      });
      resultRemover.style.float = "right";

      if (!enableRemove)
        resultRemover = "";

      wrapper.appendChild(el("h2", {}, [
        text,
        resultRemover
      ]));
      wrapper.appendChild(resultElement);

      if (result === null)
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
          UpdateEvent.fire(UpdateEvent.BEHAVIOR_CHANGE, {entities: [this]});
          UIBuilder.closePopup();
        }
      }),
    ]);
    var wrapper = el("div.behaviorOverlay", {}, [el("h1", {}, [Translations.getTranslatedWrapped("BEHAVIORS.TITLE")]), ret, buttons]);

    return wrapper;
  },

  createSave: function () {
    return UIBuilder.build([
      {type: "html", content: el("h1", {}, [Translations.getTranslatedWrapped("SAVEUI.TITLE")])},
      {type: "html", content: el("h2", {}, [Translations.getTranslatedWrapped("SAVEUI.SAVE_REMOTE")])},
      {type: "html", content: el("p")},
      {type: "html", content: Translations.getTranslatedWrapped("SAVEUI.SHARE_CODE")},
      {
        type: "button",
        id: "generateButton",
        text: Translations.getTranslatedWrapped("SAVEUI.GENERATE"),
        onclick: function () {
          $("#popupContent").addClass("loading");

          Saver.saveRemote().then(function (id) {
            $("#popupContent").removeClass("loading");

            var link = location.href.replace(location.hash, "") + "#" + id;

            $("#generateButton").replaceWith($("" +
              "<input type='text' class='success' id='shareCode' value='" + id + "'>" +
              "<p>" + Translations.getTranslated("SAVEUI.SHARE_LINK") +
              "<a href='" + link + "'>" + link + "</a>"
            ));

            var shareCode = $("#shareCode");

            shareCode.on("click", function () {
              $(this).select();
            });

          });

        }
      },
      {type: "html", content: el("p")},
      {type: "html", content: el("hr")},
      {type: "html", content: el("h2", {}, [Translations.getTranslatedWrapped("SAVEUI.SAVE_LOCAL")])},
      {type: "html", content: el("p")},
      {type: "html", content: Translations.getTranslatedWrapped("SAVEUI.NAME")},
      {type: "inputText", id: "sceneName", value: (new Date()).toLocaleString()},
      {
        type: "button",
        id: "localSave",
        text: Translations.getTranslatedWrapped("SAVEUI.SAVE_BUTTON"),
        onclick: function () {
          var name = $("#sceneName").val();

          Saver.saveLocal(name);

          $("#localSave").remove();
          $("#sceneName").replaceWith(el("span.success", {}, [name]));
        }
      },

    ]);
  },

  createLoad: function () {
    var storedSaves = Saver.getLocalSaves();
    var saveElements = el("div");

    var loadClick = function () {
      Saver.load(this.toString());
      UI.buildSidebarTopWorld(true);
      UIBuilder.closePopup();
    };

    var removeClick = function () {
      var title = this.toString();

      if (confirm(Translations.getTranslated("LOADUI.CONFIRM_DELETE") + "\"" + title + "\"?")) {
        Saver.removeLocal(title);

        $(".one-save").each(function () {
          if ($(this).attr("title") === title)
            $(this).remove();
        });

        if ($(".one-save").length === 0) {
          $("#noLocal").show();
        }
      }
    };

    for (var i in storedSaves) {
      if (!storedSaves.hasOwnProperty(i))
        continue;

      var content = UIBuilder.build([
        {type: "html", content: el("h2", {}, [i])},
        {
          type: "button",
          text: Translations.getTranslatedWrapped("LOADUI.REMOVE_BUTTON"),
          onclick: removeClick.bind(i)
        },
        {
          type: "button",
          text: Translations.getTranslatedWrapped("LOADUI.LOAD_BUTTON"),
          onclick: loadClick.bind(storedSaves[i])
        }
      ]);
      content.classList.add("content");

      saveElements.appendChild(
        el("div.one-save", {title: i}, [
          el.img({src: Saver.getLocalSaveScreenshot(i)}),
          content
        ])
      );
    }

    return UIBuilder.build([
      {type: "html", content: el("h1", {}, [Translations.getTranslatedWrapped("LOADUI.TITLE")])},
      {type: "html", content: el("h2", {}, [Translations.getTranslatedWrapped("LOADUI.LOAD_REMOTE")])},
      {type: "html", content: el("p")},
      {type: "html", content: Translations.getTranslatedWrapped("LOADUI.SHARE_CODE")},
      {
        type: "inputText", id: "shareCodeLoad", oninput: function () {
        $("#shareCodeLoad").removeClass("invalid");
        $("#codeError").replaceWith(el("span#codeError"));
      }
      },
      {
        type: "button",
        id: "remoteLoad",
        text: Translations.getTranslatedWrapped("LOADUI.LOAD_BUTTON"),
        onclick: function () {
          $("#popupContent").addClass("loading");

          Saver.loadRemote($("#shareCodeLoad").val()).then(function (success) {
            $("#popupContent").removeClass("loading");

            if (success) {
              UIBuilder.closePopup();
              UI.buildSidebarTopWorld(true);
            }
            else {
              $("#shareCodeLoad").addClass("invalid");
              $("#codeError").replaceWith(
                el("span.failure#codeError", {}, [Translations.getTranslatedWrapped("LOADUI.INVALID_CODE")])
              );
            }
          });
        }
      },
      {type: "html", content: el("p")},
      {type: "html", content: el("span#codeError")},
      {type: "html", content: el("hr")},
      {type: "html", content: el("h2", {}, [Translations.getTranslatedWrapped("LOADUI.LOAD_LOCAL")])},
      {
        type: "html", content: el("span#noLocal", {
        style: "display: " + (Object.getOwnPropertyNames(storedSaves).length === 0 ? "inline;" : "none;")
      }, [Translations.getTranslatedWrapped("LOADUI.NO_LOCAL")])
      },
      {type: "html", content: saveElements},

    ]);
  },

  saveBehavior: function (entity) {
    var Behavior = require("./behavior.js");

    entity.behaviors = [];
    var behaviors = $(".behaviorWrapper .behavior");

    for (var i = 0; i < behaviors.length; i++) {
      var tokenBuilders = $(".tokenBuilder", behaviors[i]);

      try {
        var logic = _engine.tokenManager.parser.parse(tokenBuilders[0].textContent);
        var results = [];

        for (var j = 1; j < tokenBuilders.length; j++) {
          try {
            results.push(_engine.tokenManager.parser.parse(tokenBuilders[j].textContent));
          }
          catch (err) {
          }
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

  buildSidebarTopWorld: function (force) {
    var sidebarTop = $(".sidebarTop");

    if (!force && sidebarTop[0].showing === "world")
      return;

    sidebarTop[0].showing = "world";
    sidebarTop.html("");

    var properties = [
      {type: "html", content: Translations.getTranslatedWrapped("SIDEBAR.GRAVITY_X")},
      {
        type: "inputNumber", value: _engine.getGravityX(), id: "gravity_x",
        onchange: function (val) {
          _engine.setGravityX(val * 1);
        },
        onupdate: function (action, detail) {
          if (action === UpdateEvent.GRAVITY_CHANGE) {
            $("#" + this.id).val(_engine.getGravityX());
          }
        }
      },
      {type: "html", content: el("p")},
      {type: "html", content: Translations.getTranslatedWrapped("SIDEBAR.GRAVITY_Y")},
      {
        type: "inputNumber", value: _engine.getGravityY(), id: "gravity_y",
        onchange: function (val) {
          _engine.setGravityY(val * 1);
        },
        onupdate: function (action, detail) {
          if (action === UpdateEvent.GRAVITY_CHANGE) {
            $("#" + this.id).val(_engine.getGravityY());
          }
        }
      },
      {type: "html", content: el("p")},
      {type: "html", content: Translations.getTranslatedWrapped("SIDEBAR.CAMERA_STYLE")},
      {
        type: "select", selected: _engine.viewport.getCameraStyle(), onchange: function (val) {
        _engine.viewport.setCameraStyle(val);

        if (val === CameraStyle.FIXED) {
          $(".fixedCamera").show();
          $(".entityCamera").hide();
        }
        if (val === CameraStyle.ENTITY) {
          $(".fixedCamera").hide();
          $(".entityCamera").show();
        }
      },
        options: [
          {text: Translations.getTranslatedWrapped("SIDEBAR.CAMERA_STYLES.FIXED"), value: CameraStyle.FIXED},
          {text: Translations.getTranslatedWrapped("SIDEBAR.CAMERA_STYLES.ENTITY"), value: CameraStyle.ENTITY},
        ],
      },
      {type: "html", content: el("p")},
      {type: "html", content: el("span.fixedCamera", {}, [Translations.getTranslatedWrapped("SIDEBAR.CAMERA_X")])},
      {
        type: "inputNumber", value: _engine.viewport.x, id: "camera_x", classList: ["fixedCamera"],
        onchange: function (val) {
          _engine.viewport.x = val * 1;
        },
        onupdate: function (action, detail) {
          if (action === UpdateEvent.CAMERA_MOVE) {
            $("#" + this.id).val(_engine.viewport.x);
          }
        }
      },
      {type: "html", content: el("p")},
      {type: "html", content: el("span.fixedCamera", {}, [Translations.getTranslatedWrapped("SIDEBAR.CAMERA_Y")])},
      {
        type: "inputNumber", value: _engine.viewport.y, id: "camera_y", classList: ["fixedCamera"],
        onchange: function (val) {
          _engine.viewport.y = val * 1;
        },
        onupdate: function (action, detail) {
          if (action === UpdateEvent.CAMERA_MOVE) {
            $("#" + this.id).val(_engine.viewport.y);
          }
        }
      },
      {type: "html", content: el("p")},
      {
        type: "html",
        content: el("span.entityCamera", {}, [Translations.getTranslatedWrapped("SIDEBAR.CAMERA_ENTITY")])
      },
      {
        type: "inputText",
        value: _engine.viewport.getCameraEntityId(),
        id: "camera_entity",
        classList: ["entityCamera"],
        onchange: function (val) {
          if (!_engine.getEntityById(val)) {
            $("#cameraError").html(el("span.failure", {}, [Translations.getTranslatedWrapped("NO_ENTITY_WITH_ID")]));
          }
          else
            _engine.viewport.setCameraEntityId(val);
        },
        oninput: function () {
          $("#cameraError").html("");
        }
      },
      {type: "html", content: el("p")},
      {type: "html", content: el("span#cameraError")},
    ];

    sidebarTop.html(UIBuilder.build(properties));

    if (_engine.viewport.getCameraStyle() === CameraStyle.FIXED) {
      $(".fixedCamera").show();
      $(".entityCamera").hide();
    }
    if (_engine.viewport.getCameraStyle() === CameraStyle.ENTITY) {
      $(".fixedCamera").hide();
      $(".entityCamera").show();
    }
  },

  buildSidebarTop: function (entity) {
    var sidebar = $(".sidebar.ui .sidebarTop");

    if (entity === null) {
      this.buildSidebarTopWorld();

      return;
    }

    sidebar.html("");
    sidebar[0].showing = "entity";

    var properties = [
      // ID
      {type: "html", content: Translations.getTranslatedWrapped("SIDEBAR.ID")},
      {
        type: "inputText", value: entity.id, onchange: function (val) {
        entity.setId(val);
      }
      },
      {type: "html", content: el("p")},

      // Collision group
      {type: "html", content: Translations.getTranslatedWrapped("SIDEBAR.COLLISION_GROUP")},
      {
        type: "range", value: entity.collisionGroup + 1, min: 1, max: Constants.COLLISION_GROUPS_NUMBER - 1,
        onchange: function (val) {
          entity.setCollisionGroup(val * 1 - 1);
        }
      },
      {type: "html", content: el("p")},

      // Layer
      {type: "html", content: Translations.getTranslatedWrapped("SIDEBAR.LAYER")},
      {
        type: "range", value: entity.layer + 1, min: 1, max: Constants.LAYERS_NUMBER,
        onchange: function (val) {
          _engine.setEntityLayer(entity, val * 1 - 1);
        }
      },
      {type: "html", content: el("p")},

      // X
      {type: "html", content: Translations.getTranslatedWrapped("SIDEBAR.X")},
      {
        type: "inputNumber", value: entity.getX(), id: "entity_x",
        onchange: function (val) {
          entity.setX(val * 1);
        },
        onupdate: function (action, detail) {
          if (action === UpdateEvent.REPOSITION) {
            $("#" + this.id).val(entity.getX());
          }
        }
      },
      {type: "html", content: el("p")},

      // Y
      {type: "html", content: Translations.getTranslatedWrapped("SIDEBAR.Y")},
      {
        type: "inputNumber", value: entity.getY(), id: "entity_y",
        onchange: function (val) {
          entity.setY(val * 1);
        },
        onupdate: function (action, detail) {
          if (action === UpdateEvent.REPOSITION) {
            $("#" + this.id).val(entity.getY());
          }
        }
      },
      {type: "html", content: el("p")},

      // Width
      {type: "html", content: Translations.getTranslatedWrapped("SIDEBAR.WIDTH")},
      {
        type: "inputNumber", value: entity.getWidth(), step: 0.1, id: "entity_width",
        onchange: function (val) {
          entity.resize(val / 2, entity.getHeight() / 2);
        },
        onupdate: function (action, detail) {
          if (action === UpdateEvent.RESIZE)
            $("#" + this.id).val(entity.getWidth());
        }
      },
      {type: "html", content: el("p")},

      // Height
      {type: "html", content: Translations.getTranslatedWrapped("SIDEBAR.HEIGHT")},
      {
        type: "inputNumber", value: entity.getHeight(), step: 0.1, id: "entity_height",
        onchange: function (val) {
          if (entity.type === "CIRCLE") {
            entity.resize(val / 2);

            return;
          }

          entity.resize(entity.getWidth() / 2, val / 2);
        },
        onupdate: function (action, detail) {
          if (action === UpdateEvent.RESIZE)
            $("#" + this.id).val(entity.getHeight());
        }
      },
      {type: "html", content: el("p")},

      // Rotation
      {type: "html", content: Translations.getTranslatedWrapped("SIDEBAR.ROTATION")},
      {
        type: "range",
        min: 0,
        max: 360,
        step: 1,
        value: entity.getAngle(true),
        id: "entity_rotation",
        onchange: function (val) {
          entity.setAngle(val * 1, true);
        },
        onupdate: function (action, detail) {
          if (action === UpdateEvent.ROTATE) {
            $("#" + this.id).val(entity.getAngle(true));
            $("#" + this.id + "-input").val(entity.getAngle(true));
          }
        }
      },
      {type: "html", content: el("p")},

      // Fixed rotation
      {type: "html", content: Translations.getTranslatedWrapped("SIDEBAR.FIXED_ROTATION")},
      {
        type: "checkbox", checked: entity.fixedRotation, onchange: function (val) {
        entity.disableRotation(val);
      }
      },
      {type: "html", content: el("p")},

      // Restitution
      {type: "html", content: Translations.getTranslatedWrapped("SIDEBAR.RESTITUTION")},
      {
        type: "range", min: 0, max: 1, step: 0.1, value: entity.getRestitution(),
        onchange: function (val) {
          entity.setRestitution(val * 1);
        }
      },
      {type: "html", content: el("p")},

      // Friction
      {type: "html", content: Translations.getTranslatedWrapped("SIDEBAR.FRICTION")},
      {
        type: "range", min: 0, max: 1, step: 0.1, value: entity.getFriction(),
        onchange: function (val) {
          entity.setFriction(val * 1);
        }
      },
      {type: "html", content: el("p")},

      // Density
      {type: "html", content: Translations.getTranslatedWrapped("SIDEBAR.DENSITY")},
      {
        type: "inputNumber", value: entity.getDensity(), min: 0,
        onchange: function (val) {
          entity.setDensity(val * 1);
        }
      },
      {type: "html", content: el("p")},

      // Color
      {type: "html", content: Translations.getTranslatedWrapped("SIDEBAR.COLOR")},
      {
        type: "inputColor", value: entity.getColor(), oninput: function (val) {
        entity.setColor(val);
      }
      },
      {type: "html", content: el("p")},

      // Body type
      {type: "html", content: Translations.getTranslatedWrapped("SIDEBAR.BODY_TYPE")},
      {
        type: "select", selected: entity.getBodyType(), onchange: function (val) {
        entity.setBodyType(val * 1);
      },
        options: [
          {text: Translations.getTranslatedWrapped("SIDEBAR.BODY_TYPES.DYNAMIC"), value: BodyType.DYNAMIC_BODY},
          {text: Translations.getTranslatedWrapped("SIDEBAR.BODY_TYPES.KINEMATIC"), value: BodyType.KINEMATIC_BODY},
          {text: Translations.getTranslatedWrapped("SIDEBAR.BODY_TYPES.STATIC"), value: BodyType.STATIC_BODY},
        ]
      },
      {type: "html", content: el("p")},

      {
        type: "button", text: Translations.getTranslatedWrapped("SIDEBAR.DELETE_BUTTON"), onclick: function () {
        if (confirm(Translations.getTranslated("SIDEBAR.DELETE_CONFIRM")))
          _engine.removeEntity(entity);
      }
      },
      {type: "html", content: el("p")},

      {
        type: "button", text: Translations.getTranslatedWrapped("SIDEBAR.SET_BEHAVIORS"), onclick: function () {
        UIBuilder.popup(UI.createBehavior(entity));
      }
      },
      {type: "html", content: el("p")},

    ];

    sidebar[0].appendChild(UIBuilder.build(properties));
  },

  buildEntityList: function () {
    var ret = el("div.entityList");

    for (var i = 0; i < Constants.LAYERS_NUMBER; i++) {
      if (_engine.layers[i].length === 0)
        continue;

      var layerElement = el("div.layer", {}, [Translations.getTranslatedWrapped("LAYER"), " " + (i + 1) + ":"]);

      for (var j = 0; j < _engine.layers[i].length; j++) {
        var entity = _engine.layers[i][j];

        var entityElement = el("div.entity", {}, [
          el("span", {}, [
            el("span.id", {}, [entity.id]), ": ", Translations.getTranslatedWrapped(entity.type),
          ]),
          el("div.entity-color", {style: "background:" + entity.getColor()})
        ]);

        if (entity === _engine.selectedEntity)
          entityElement.classList.add("selected");

        entityElement.onclick = (function (entity) {
          return function () {
            _engine.selectEntity(entity);
          };
        })(entity);

        layerElement.appendChild(entityElement);
      }

      ret.appendChild(layerElement);
    }

    $(".sidebarBottom").html(ret);
  }
};

$(document).on("update", function (e) {
  var action = e.detail.action;

  if (
    action === UpdateEvent.STATE_CHANGE ||
    action === UpdateEvent.COLOR_CHANGE ||
    action === UpdateEvent.ENTITY_ADD ||
    action === UpdateEvent.ENTITY_DELETE ||
    action === UpdateEvent.ID_CHANGE ||
    action === UpdateEvent.SELECTION_CHANGE ||
    action === UpdateEvent.LAYER_CHANGE
  )
    UI.buildEntityList();
});

module.exports = UI;