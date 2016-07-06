var UIBuilder = {
  radio: function (properties) {
    var ret = el("div.ui.radioGroup", {id: properties.id});

    ret.disable = function () {
      $("input[type=radio]", this).each(function(){
        this.disable();
      });
    };

    ret.enable = function () {
      $("input[type=radio]", this).each(function(){
        this.enable();
      });
    };
    
    var idCount = $("input[type=radio]").length;

    properties.elements.forEach(function(element) {

      element.id = element.id == undefined ? "radio-" + idCount++ : element.id;

      var input = el("input.ui", {type: "radio", id: element.id, name: properties.id});
      var label = el("label.ui.button", {for: element.id}, [element.text]);

      input.enable = function() {
        this.disabled = false;
        $("+label", this).removeClass("disabled");
      };

      input.disable = function() {
        this.disabled = true;
        $("+label", this).addClass("disabled");
      };

      if (element.onclick !== undefined) {
        label.onclick = function () {
          if($(this).hasClass("disabled"))
            return;

          element.onclick();
        };
      }

      if (element.checked === true) {
        input.checked = true;
      }

      ret.appendChild(input);
      ret.appendChild(label);
    });

    return ret;
  },
  
  button: function (properties) {
    var ret = el("span.ui.button", {}, [properties.text]);

    ret.disable = function ()
    {
      $(this).addClass("disabled");
    };

    ret.enable = function () {
      $(this).removeClass("disabled");
    };

    if (properties.onclick != undefined)
      ret.onclick = function () {
        if($(this).hasClass("disabled"))
          return;

        properties.onclick();
      };

    if (properties.id != undefined)
      ret.id = properties.id;

    return ret;
  },

  select: function (properties) {
    var ret = el("select.ui");

    if (properties.id != undefined)
      ret.id = properties.id;

    if (properties.onchange != undefined) {
      ret.onchange = function () {
        properties.onchange(this.value);
      };
    }

    ret.disable = function () {
      $(this).addClass("disabled");
      this.disabled = true;
    };

    ret.enable = function () {
      $(this).removeClass("disabled");
      this.disabled = enable;
    };


    properties.options.forEach(function (option) {
      ret.appendChild(el("option", {value: option.value}, [option.text]));
    });

    return ret;
  },

  break: function () {
    return el("span.ui.break");
  },

  inputText: function (properties) {
    var ret = el("input.ui", { type: "text" });

    ret.disable = function () {
      $(this).addClass("disabled");
      this.disabled = true;
    };

    ret.enable = function () {
      $(this).removeClass("disabled");
      this.disabled = false;
    };

    if (properties.id != undefined)
      ret.id = properties.id;

    if (properties.oninput != undefined)
      ret.oninput = function () {
        properties.oninput(this.value);
      };

    if (properties.value != undefined)
      ret.value = properties.value;

    return ret;
  },

  inputNumber: function (properties) {
    var ret = el("input.ui", { type: "number" });

    ret.disable = function () {
      $(this).addClass("disabled");
      this.disabled = true;
    };

    ret.enable = function () {
      $(this).removeClass("disabled");
      this.disabled = false;
    };

    if (properties.id != undefined)
      ret.id = properties.id;

    if (properties.oninput != undefined)
      ret.oninput = function (e) {
        properties.oninput(this.value);
      };

    if (properties.value != undefined)
      ret.value = properties.value;

    if (properties.min != undefined)
      ret.min = properties.min;

    if (properties.max != undefined)
      ret.max = properties.max;

    return ret;
  },

  html: function (properties) {
    return properties.content;
  },

  inputColor: function (properties) {
    var ret = el("input.ui", { type: "color" });

    ret.disable = function () {
      $(this).addClass("disabled");
      this.disabled = true;
    };

    ret.enable = function () {
      $(this).removeClass("disabled");
      this.disabled = false;
    };

    if (properties.id != undefined)
      ret.id = properties.id;

    if (properties.value != undefined)
      ret.value = properties.value;

    if (properties.oninput != undefined)
      ret.oninput = function () {
        properties.oninput(this.value);
      };

    return ret;
  },

  checkbox: function (properties) {
    var ret = el("span");

    var id = properties.id != undefined ? properties.id : "checkbox-" + $("input[type=checkbox]").length;
    
    var checkbox = el("input.ui", { type: "checkbox", id: id });
    var label = el("label.ui.button", { for: id });

    ret.appendChild(checkbox);
    ret.appendChild(label);

    checkbox.disable = function () {
      $("+label", this).addClass("disabled");
      this.disabled = true;
    };

    checkbox.enable = function () {
      $("+label", this).removeClass("disabled");
      this.disabled = false;
    };

    if (properties.checked != undefined && properties.checked === true)
      checkbox.checked = true;

    if (properties.onchange != undefined)
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

        case "inputNumber":
          generated = this.inputNumber(element);
          break;

        case "inputColor":
          generated = this.inputColor(element);
          break;

        case "checkbox":
          generated = this.checkbox(element);
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
  
  buildLayout: function() {
    var content = el("div.ui.content.panel");
    var sidebar = el("div.ui.sidebar.panel", {}, [ el("div.content") ]);
    var resizer = el("div.ui.resizer");
    var toolbar = el("div.ui.toolbar");

    var w = $("body").outerWidth();
    var sidebarWidth = 250;

    content.style.width = w - 250 + "px";
    sidebar.style.width = sidebarWidth + "px";

    var sidebarResizeEvent = function (e) {
      e.preventDefault();

      var windowWidth = $("body").outerWidth();
      var sidebarWidth = Math.max(30, Math.min(windowWidth * 0.6, windowWidth - e.clientX));
      var contentWidth = windowWidth - sidebarWidth;

      sidebar.style.width = sidebarWidth + "px";
      content.style.width = contentWidth + "px";

      window.onresize();
    };

    var mouseUpEvent = function (e) {
      sidebar.resizing = false;

      $(".resizer.ui").removeClass("resizing");

      window.removeEventListener("mousemove", sidebarResizeEvent);
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
    }

    resizer.onmousedown = function (e) {
      sidebar.resizing = true;

      $(this).addClass("resizing");

      window.addEventListener("mousemove", sidebarResizeEvent);
      window.addEventListener("mouseup", mouseUpEvent);
    };

    window.addEventListener("resize", windowResizeEvent);

    content.appendChild(toolbar);
    sidebar.appendChild(resizer);
    document.body.appendChild(content);
    document.body.appendChild(sidebar);
  },

  // Creating a popup message
  popup: function(data) {
    var overlay = el("div#popupOverlay", [el("div#popupContent", [el("div.w2ui-centered", [data])])]);
    overlay.onclick = function(e) {
      UIBuilder.closePopup(e);
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



};

module.exports = UIBuilder;