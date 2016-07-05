var UIBuilder = {
  radio: function (properties) {
    var ret = el("ul.ui.radioGroup", {id: properties.id});

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

      var input = el("input", {type: "radio", id: element.id, name: properties.id});
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

      var option = el("li", {}, [
        input,
        label
      ]);

      ret.appendChild(option);
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
    var ret = el("select.ui", {id: properties.id});

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

  build: function (properties) {
    var ret = el.div();

    properties.forEach(function (element) {
      var generated;
      
      switch (element.type) {
        case "radio":
          generated = this.radio(element.properties);
          break;

        case "button":
          generated = this.button(element.properties);
          break;

        case "select":
          generated = this.select(element.properties);
          break;
      }
      
      ret.appendChild(generated);
    }, this);
    
    return ret;
  },

  test: function () {
    var properties = [
      {
        type: "radio",
        properties: {
          id: "klikaj",
          elements: [
            { text: Translations.getTranslatedWrapped(3) },
            { text: Translations.getTranslatedWrapped(4), id: "ha", checked: true, onclick: function () {
              alert("klik");
            }
            }
          ]
        }
      },

      {
        type: "button",
        properties: {
          id: "Button1", text: "Enable", onclick: function () { $("#Button3")[0].enable(); }
        }
      },

      {
        type: "button",
        properties: {
          id: "Button2", text: "Disable", onclick: function () { $("#Button3")[0].disable(); }
        }
      },

      {
        type: "button",
        properties: {
          id: "Button3", text: "Button 3", onclick: function () { alert("Kliky haky"); }
        }
      },

      {
        type: "select",
        properties:
        {
          id: "language",
          onchange: function (val) {
            Translations.setLanguage(val);
          },

          options: [
            {text: Translations.getTranslated(0, 0), value: 0},
            {text: Translations.getTranslated(0, 1), value: 1}
          ]
        }
      }
    ];


    document.body.appendChild(this.build(properties));
  }
};