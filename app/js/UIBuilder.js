var Translations = require("./translations.js");
var Utils = require("./utils.js");
var UpdateEvent = require("./updateEvent.js");
var Tools = require("./tools.js");
var $ = require("jquery");

var UIBuilder = {
  element: function (elem, properties) {
    properties = $.extend({
      disabled: false,
      onclick: function () {
      },
      onupdate: function () {
      },
      tooltip: "",
      classList: [],
    }, properties);

    elem.disable = function () {
      this.disabled = true;
      $(this).addClass("disabled");
    };

    elem.enable = function () {
      this.disabled = false;
      $(this).removeClass("disabled");
    };

    elem.onclick = function (e) {
      if ($(this).hasClass("disabled")) {
        e.preventDefault();
        return;
      }

      properties.onclick();
    };

    if (properties.classList.length)
      elem.classList.add(properties.classList);

    if (properties.disabled) {
      elem.disable();
    }

    document.addEventListener("update", function updateFn(e) {
      if ($("#" + properties.id).length === 0) {
        document.removeEventListener("update", updateFn);
        return;
      }

      properties.onupdate(e.detail.action, e.detail);
    });

    if (properties.tooltip !== "") {
      var offset = [15, 20];
      elem.setAttribute("tooltip", properties.tooltip);

      elem.addEventListener("mouseenter", function (e) {
        $("#tooltip").remove();
        if (elem.disabled)
          return;

        var tooltip = el.div({id: "tooltip"}, [Translations.getTranslatedWrapped(elem.getAttribute("tooltip"))]);
        document.body.appendChild(tooltip);
        tooltip.style.left = e.pageX + offset[0];
        tooltip.style.top = e.pageY + offset[1];
      });

      elem.addEventListener("mouseleave", function (e) {
        $("#tooltip").remove();
      });

      elem.addEventListener("mousemove", function (e) {
        if (elem.disabled)
          return;

        var tooltip = $("#tooltip")[0];

        tooltip.style.left = e.pageX + offset[0];
        tooltip.style.top = e.pageY + offset[1];
      });
    }

    return elem;
  },

  radio: function (properties) {
    properties = $.extend({}, {
      id: "radioGroup-" + Utils.generateUUID(),
    }, properties);

    var ret = el("div.ui.radioGroup", {id: properties.id});

    ret.disable = function () {
      $("label", this).each(function () {
        this.disable();
      });
    };

    ret.enable = function () {
      $("label", this).each(function () {
        this.enable();
      });
    };

    properties.elements.forEach((function (element) {
      element = $.extend({}, {
        id: "radio-" + Utils.generateUUID(),
        checked: false,
        onclick: function () {
        }
      }, element);

      var input = el("input.ui", {type: "radio", id: element.id, name: properties.id});
      var label = el("label.ui.button", {for: element.id}, [element.text]);

      label = this.element(label, element);

      input.checked = element.checked;

      ret.appendChild(input);
      ret.appendChild(label);
    }).bind(this));

    return ret;
  },

  button: function (properties) {
    properties = $.extend({}, {
      id: "button-" + Utils.generateUUID(),
      onclick: function () {
      },
      onupdate: function () {
      },
      disabled: false
    }, properties);

    var ret = el("span.ui.button", {id: properties.id}, [properties.text]);

    return this.element(ret, properties);
  },

  select: function (properties) {
    properties = $.extend({}, {
      id: "select-" + Utils.generateUUID(),
      selected: "",
      onchange: function () {
      }
    }, properties);

    var ret = el("select.ui", {id: properties.id});

    ret.onchange = function () {
      properties.onchange(this.value);
    };

    properties.options.forEach(function (option, index) {
      ret.appendChild(el("option", {value: option.value}, [option.text]));

      if (option.value == properties.selected)
        ret.selectedIndex = index;
    });

    return this.element(ret, properties);
  },

  break: function () {
    return el("span.ui.break");
  },

  inputText: function (properties) {
    properties = $.extend({}, {
      id: "inputText-" + Utils.generateUUID(),
      value: "",
      oninput: function () {
      },
      onchange: function () {
      }
    }, properties);

    var ret = el("input.ui", {type: "text", id: properties.id, value: properties.value});

    $(ret).on("blur keyup", function (e) {
      if (e.type === "keyup" && e.keyCode != 13)
        return;

      properties.onchange(this.value);
    });

    ret.oninput = function () {
      properties.oninput(this.value);
    };

    return this.element(ret, properties);
  },

  inputNumber: function (properties) {
    properties = $.extend({}, {
      id: "inputNumber-" + Utils.generateUUID(),
      value: 0,
      min: -Infinity,
      max: Infinity,
      step: 1,
      oninput: function () {
      },
      onchange: function () {
      },
      onupdate: function () {
      }
    }, properties);

    var ret = el("input.ui", {
      type: "number",
      id: properties.id,
      value: properties.value,
      min: properties.min,
      max: properties.max,
      step: properties.step
    });

    $(ret).on("blur keyup", function (e) {
      if (e.type === "keyup" && e.keyCode != 13)
        return;

      properties.onchange(this.value);
    });

    ret.oninput = function () {
      properties.oninput(this.value);
    };

    return this.element(ret, properties);
  },

  inputEntity: function (properties) {
    properties = $.extend({}, {
      id: "inputEntity-" + Utils.generateUUID(),
      value: "",
      classList: [],
      oninput: function () {
      },
      onchange: function () {
      }
    }, properties);

    var input = el("input.ui", {type: "text", id: properties.id, value: properties.value});
    var button = UIBuilder.button({
      id: properties.id + "-button",
      text: el.img({src: "./img/selectEntity.svg"}),
      classList: properties.classList,
      onclick: function () {
        var elem = $(button);
        elem.toggleClass("active");
        $("#" + properties.id + "-error").html("");

        _engine.selectTool(Tools.Selection);

        if (elem.hasClass("active")) {
          _engine.selectedTool.mode = "entity-pick";
        }
        else {
          _engine.selectedTool.mode = "";
        }
      }
    });

    $(input).on("blur keyup", function (e) {
      if (e.type === "keyup" && e.keyCode != 13)
        return;

      if (!_engine.entityManager.getEntityById(this.value)) {
        $("#" + this.id + "-error").html(el("span.failure", {}, [Translations.getTranslatedWrapped("NO_ENTITY_WITH_ID")]));
      }
      else {
        $(input).addClass("success");
        properties.onchange(this.value);
      }
    });

    input.oninput = function () {
      $(input).removeClass("success");
      $("#" + this.id + "-error").html("");
      properties.oninput(this.value);
    };

    properties.onupdate = function (action, details) {
      if (action === UpdateEvent.ENTITY_PICKED && $(button).hasClass("active")) {
        $(input).val(details.entityId);
        $(button).removeClass("active");
        $(input).removeClass("success");
        void $(input)[0].offsetWidth;
        $(input).addClass("success");

        properties.onchange($(input).val());
      }
    };

    var ret = el.div({}, [
      el("div.ui.entitySelect", {}, [this.element(input, properties), button]),
      el("p"), el("span#" + properties.id + "-error")
    ]);

    return ret;

  },

  html: function (properties) {
    properties = $.extend({}, {
      content: ""
    }, properties);

    return this.element(properties.content, properties);
  },

  inputColor: function (properties) {
    properties = $.extend({}, {
      id: "inputColor-" + Utils.generateUUID(),
      value: "#000000",
      oninput: function () {
      }
    }, properties);

    var ret = el("input.ui.button", {type: "color", id: properties.id, value: properties.value});

    ret.oninput = function () {
      properties.oninput(this.value);
    };

    return this.element(ret, properties);
  },

  range: function (properties) {
    properties = $.extend({}, {
      id: "range-" + Utils.generateUUID(),
      value: 0,
      min: 0,
      max: 10,
      step: 1,
      width: "100%",
      disableWrite: false,
      oninput: function () {
      },
      onchange: function () {
      },
      onupdate: function () {
      }
    }, properties);

    var inputProperties = $.extend({}, properties);
    inputProperties.id += "-input";

    var ret = this.element(el("div.ui.range", {style: "width:" + properties.width}), properties);
    var slider = el("input.ui", {
      type: "range",
      min: properties.min,
      max: properties.max,
      step: properties.step,
      value: properties.value,
      id: properties.id
    });
    var input = this.inputNumber(inputProperties);

    input.oninput = function () {
      properties.oninput(input.value);
    };

    $(input).on("blur keyup", function (e) {
      if (e.type === "keyup" && e.keyCode != 13)
        return;

      slider.value = input.value;
      properties.onchange(this.value);
    });

    slider.oninput = function () {
      input.value = this.value;
      properties.oninput(this.value);
    };

    slider.onmouseup = function () {
      properties.onchange(this.value);
    };

    ret.appendChild(slider);
    if (!properties.disableWrite)
      ret.appendChild(input);

    return ret;
  },

  checkbox: function (properties) {
    properties = $.extend({}, {
      id: "checkbox-" + Utils.generateUUID(),
      checked: false,
      onchange: function () {
      }
    }, properties);

    var ret = this.element(el("span"), properties);
    var checkbox = el("input.ui", {type: "checkbox", id: properties.id});
    var label = el("label.ui.button", {for: properties.id});

    ret.appendChild(checkbox);
    ret.appendChild(label);

    checkbox.checked = properties.checked;

    checkbox.onchange = function () {
      properties.onchange(this.checked);
    };

    return ret;
  },

  build: function (properties) {
    var ret = el.div();

    properties.forEach(function (element) {
      var generated;

      switch (element.type) {
        case "radio":
          generated = this.radio(element);
          break;

        case "button":
          generated = this.button(element);
          break;

        case "select":
          generated = this.select(element);
          break;

        case "inputText":
          generated = this.inputText(element);
          break;

        case "inputEntity":
          generated = this.inputEntity(element);
          break;

        case "inputNumber":
          generated = this.inputNumber(element);
          break;

        case "inputColor":
          generated = this.inputColor(element);
          break;

        case "checkbox":
          generated = this.checkbox(element);
          break;

        case "range":
          generated = this.range(element);
          break;

        case "html":
          generated = this.html(element);
          break;

        case "break":
          generated = this.break();
          break;
      }

      ret.appendChild(generated);
    }, this);

    return ret;
  },

  buildLayout: function () {
    var content = el("div.ui.content.panel");
    var sidebarTop = el("div.ui.sidebarTop.panel");
    var sidebarBottom = el("div.ui.sidebarBottom.panel");
    var resizerH = el("div.ui.resizer-horizontal.resizer");
    var resizerV = el("div.ui.resizer-vertical.resizer");
    var sidebar = el("div.ui.sidebar.panel", {}, [resizerH, sidebarTop, resizerV, sidebarBottom]);
    var toolbar = el("div.ui.toolbar");
    var main = el("div.ui.main.panel", {}, [content, sidebar]);

    var sidebarResizeEvent = function (e) {
      e.preventDefault();

      var windowWidth = $("body").outerWidth();
      var sidebarWidth = Math.max(150, Math.min(windowWidth * 0.6, windowWidth - e.clientX));

      sidebar.style.width = sidebarWidth + "px";
      content.style.width = windowWidth - sidebarWidth + "px";

      window.onresize();
    };

    var resizerVResizeEvent = function (e) {
      e.preventDefault();

      var sidebarHeight = $(sidebar).outerHeight();
      var topHeight = Math.max(
        sidebarHeight * 0.1,
        Math.min(
          sidebarHeight * 0.9,
          _engine.input.mouse.realY - $(sidebar).offset().top - parseInt($(resizerV).css("border-top-width"))
        )
      );
      console.log(_engine.input.mouse.realY, parseInt($(resizerV).css("border-top-width")));
      var bottomHeight = sidebarHeight - topHeight - $(resizerV).outerHeight();

      sidebarTop.style.height = topHeight + "px";
      sidebarBottom.style.height = bottomHeight + "px";
      resizerV.style.top = $(sidebar).offset().top + topHeight + "px";
    };

    var mouseUpEvent = function (e) {
      sidebar.resizing = false;
      resizerV.resizing = false;

      $(".resizer.ui").removeClass("resizing");

      window.removeEventListener("mousemove", sidebarResizeEvent);
      window.removeEventListener("mousemove", resizerVResizeEvent);
      window.removeEventListener("mouseup", mouseUpEvent);
    };

    var windowResizeEvent = function () {
      var windowWidth = $("body").outerWidth();
      var contentWidth = Math.max(windowWidth * 0.4, Math.min(
        windowWidth - 30,
        windowWidth - $(".sidebar.ui").outerWidth()
      ));
      var sidebarWidth = windowWidth - contentWidth;

      sidebar.style.width = sidebarWidth + "px";
      content.style.width = contentWidth + "px";
    };

    resizerH.onmousedown = function (e) {
      sidebar.resizing = true;

      $(this).addClass("resizing");

      window.addEventListener("mousemove", sidebarResizeEvent);
      window.addEventListener("mouseup", mouseUpEvent);
    };

    resizerV.onmousedown = function (e) {
      $(this).addClass("resizing");

      window.addEventListener("mousemove", resizerVResizeEvent);
      window.addEventListener("mouseup", mouseUpEvent);
    };

    window.addEventListener("resize", windowResizeEvent);

    document.body.appendChild(toolbar);
    document.body.appendChild(main);

    sidebar.style.width = $(".ui.sidebar").css("width");
  },

  // Creating a popup message
  popup: function (data) {
    var overlay = el("div#popupOverlay", [el("div#popupContent.ui", [data])]);
    overlay.onclick = function (e) {
      UIBuilder.closePopup(e);
    };

    document.body.insertBefore(overlay, document.body.firstChild);

    Translations.refresh();
  },

  // Closing a popup message
  closePopup: function (e) {
    var overlay = document.getElementById("popupOverlay");
    var content = document.getElementById("popupContent");

    // Make sure it was the overlay that was clicked, not an element above it
    if (typeof e !== "undefined" && e.target !== overlay)
      return true;

    content.parentNode.removeChild(content);
    overlay.parentNode.removeChild(overlay);
  },


};

module.exports = UIBuilder;