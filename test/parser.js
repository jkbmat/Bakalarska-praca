require("./setup/base");
var expect = require("chai").expect;

var parser, setup;

module.exports = {
  "before": function () {
    setup = require("./setup/parser");
    parser = new setup.Parser(new setup.TokenManager());
  },

  "Parser": {
    "empty input": function () {
      expect(parser.parse("")).to.be.null;
    },

    "literal command is of type literal": function () {
      expect(parser.parse('"haha"')).to.have.property("type", setup.Type.LITERAL);
    },

    "infix command": function () {
      var parsed = parser.parse('( true() ) AND ( false() )');
      expect(parsed).to.have.property("type", setup.Type.BOOLEAN);
      expect(parsed.evaluate()).to.be.false;

      parsed = parser.parse('( true() ) OR ( false() )');
      expect(parsed).to.have.property("type", setup.Type.BOOLEAN);
      expect(parsed.evaluate()).to.be.true;
    },

    "prefix command": function () {
      var parsed = parser.parse('setGravity(number("0"), number("12345"))');
      expect(parsed).to.have.property("type", setup.Type.ACTION);
      parsed.execute();

      parsed = parser.parse('getGravityY()');
      expect(parsed).to.have.property("type", setup.Type.NUMBER);
      expect(parsed.evaluate()).to.equal(12345);
    },

    "complicated command": function () {
      var command = '( ( ( number( "1" ) ) > ( number( "0" ) ) ) AND ( true(  ) ) ) OR ( ( ( number( "5" ) ) - ( number( "2" ) ) ) = ( number( "3" ) ) )';

      var fn = function () {
        return parser.parse(command);
      };

      expect(fn).to.not.throw(Error);
      expect(fn()).to.have.property("type", setup.Type.BOOLEAN);
      expect(fn().toString()).to.equal(command.replace(/ /g, ""));
    },
  }
};