var FixType = require("./typing.js").FixType;

var BehaviorBuilder = function (tokenManager) {
  this.tokenManager = tokenManager;
};

BehaviorBuilder.prototype.initialize = function (type, container) {
  var holder = el("span");
  var btn = el("span.ui.button", {}, ["+"]);

  var that = this;
  btn.onclick = function (e) {
    e.stopPropagation();

    that.buildChoice(that.tokenManager.getTokensByType(type), holder);
  };

  holder.appendChild(btn);
  $(container).html(holder);
};

BehaviorBuilder.prototype.buildChoice = function (tokens, holder) {
  var container = el("div#tokenChoice");
  var that = this;

  tokens.forEach(function (token) {
    var text = el("div.token", {}, [el("span.name", {}, [token.name])]);

    if (token.fixType === FixType.PREFIX && token.argument_types.length)
      text.appendChild(el("span.argument", {}, ["( ", token.argument_types.join(", "), " )"]));

    if (token.fixType === FixType.INFIX) {
      text.insertBefore(el("span.argument", {}, ["( ", token.argument_types[0], " )"]), text.firstChild);
      text.appendChild(el("span.argument", {}, ["( ", token.argument_types[1], " )"]));
    }

    $(text).on("click", function (e) {
      var ret = el("span", {}, [el("span.name", {}, [token.name])]);

      if (token.fixType === FixType.PREFIX && token.argument_types.length) {
        ret.appendChild(document.createTextNode("( "));

        token.argument_types.forEach(function (argument, index) {
          var argHolder = el("span");
          ret.appendChild(argHolder);

          that.initialize(argument, argHolder);

          if (index != token.argument_types.length - 1)
            ret.appendChild(document.createTextNode(", "));
        });

        ret.appendChild(document.createTextNode(" )"));
      }
      
      $(holder).html(ret);
    });

    container.appendChild(text);
  });

  document.body.appendChild(container);

  $(document).one("click", function(e) {
    container.parentNode.removeChild(container);
  });

  var offset = 15;

  $(container).css("left", Input.mouse.realX + offset + "px");
  $(container).css("top", Input.mouse.realY + offset + "px");
};

module.exports = BehaviorBuilder;
