var FixType = require("./typing.js").FixType;
var Type = require("./typing.js").Type;

var BehaviorBuilder = function (tokenManager) {
  this.tokenManager = tokenManager;
};

BehaviorBuilder.prototype.initialize = function (type, container) {
  var btn = el("span.ui.button", {}, ["+"]);
  btn.type = type;

  btn.onclick = this.buildChoiceClick();

  $(container).html(btn);
};

BehaviorBuilder.prototype.buildChoiceClick = function () {
  var that = this;

  return function (e) {
    e.stopPropagation();

    that.buildChoice(that.tokenManager.getTokensByType(this.type), this);
  };
};

BehaviorBuilder.prototype.buildArgument = function (token, argIndex, argHolder) {
  // Builds an argument or argument placeholder. Returns false on bad literal input.

  if (token.args[argIndex] != undefined) {
    // Token in argument exists, build it
    
    if (token.argument_types[argIndex] === Type.LITERAL) {
      // Literals are dealt with and done

      $(argHolder).replaceWith(document.createTextNode(token.args[argIndex]));
      return true;
    }

    this.buildToken(token.args[argIndex], argHolder);
    return true;
  }
  else {
    // Argument is empty so far, add a button to create new

    if (token.argument_types[argIndex] === Type.LITERAL) {
      // Literals are dealt with and done

      token.populate();
      if (! token.validate())
        return false;

      $(argHolder).replaceWith(document.createTextNode(token.args[argIndex]));
      return true;
    }

    this.initialize(token.argument_types[argIndex], argHolder);
    return true;
  }
};

BehaviorBuilder.prototype.buildToken = function (token, holder) {
  var ret = el("span.token", {}, [el("span.name", {}, [token.name])]);

  ret.type = token.type;
  ret.onclick = this.buildChoiceClick();

  var argHolder;

  // Fix, so :hover triggers only on actual hovered token, not its ancestors
  ret.onmouseover = function (e) {
    e.stopPropagation();

    $(this).addClass("hover");
  };
  ret.onmouseout = function (e) {
    $(this).removeClass("hover");
  };

  if (token.fixType === FixType.PREFIX) {
    ret.appendChild(document.createTextNode("( "));

    var that = this;

    for (var index = 0; index < token.argument_types.length; index ++) {
      argHolder = el("span.argument");
      ret.appendChild(argHolder);

      if (! that.buildArgument(token, index, argHolder)) {
        return;
      }

      if (index !== token.argument_types.length - 1)
        ret.appendChild(document.createTextNode(", "));
    }

    ret.appendChild(document.createTextNode(" )"));
  }

  if (token.fixType === FixType.INFIX) {
    ret.insertBefore(document.createTextNode(" ) "), ret.firstChild);
    ret.appendChild(document.createTextNode(" ( "));

    argHolder = el("span");
    ret.insertBefore(argHolder, ret.firstChild);
    ret.insertBefore(document.createTextNode(" ( "), ret.firstChild);

    this.buildArgument(token, 0, argHolder);

    argHolder = el("span");
    ret.appendChild(argHolder);
    ret.appendChild(document.createTextNode(" ) "));

    this.buildArgument(token, 1, argHolder);
  }

  $(holder).replaceWith(ret);
};

BehaviorBuilder.prototype.buildChoice = function (tokens, holder) {
  $("div#tokenChoice").remove();
  var container = el("div#tokenChoice");
  var that = this;

  tokens.forEach(function (token) {
    var text = el("div.token", {}, [el("span.name", {}, [token.name])]);

    if (token.fixType === FixType.PREFIX)
      text.appendChild(el("span.argument", {}, ["( ", token.argument_types.join(", "), " )"]));

    if (token.fixType === FixType.INFIX) {
      text.insertBefore(el("span.argument", {}, ["( ", token.argument_types[0], " )"]), text.firstChild);
      text.appendChild(el("span.argument", {}, ["( ", token.argument_types[1], " )"]));
    }

    $(text).on("click", function (e) {
      that.buildToken(new token.constructor(), holder);
    });

    container.appendChild(text);
  });

  document.body.appendChild(container);

  $(document).one("click", function(e) {
    $("div#tokenChoice").remove();
  });

  var offset = 15;

  $(container).css("left", _engine.input.mouse.realX + offset + "px");
  $(container).css("top", _engine.input.mouse.realY + offset + "px");
};

module.exports = BehaviorBuilder;
