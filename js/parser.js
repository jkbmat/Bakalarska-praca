"use strict";
var behavior_1 = require("./behavior");
var Parser;
(function (Parser) {
    var Machine = (function () {
        function Machine(tokenManager, parserInput) {
            this.tokenManager = tokenManager;
            this.parserInput = parserInput;
            this.stopChars = ["(", ")", ","];
            this.parserInputWhole = parserInput;
        }
        Machine.prototype.parse = function () {
            do {
                this.parseStep();
            } while (this.parserInput.length);
            var ret = this.parserStack.pop();
            if (this.parserStack.length)
                throw "Unexpected " + ret.identifier;
            return ret;
        };
        Machine.prototype.readWhitespace = function () {
            while (/\s/.test(this.parserInput[0]) && this.parserInput.length) {
                this.parserInput = this.parserInput.slice(1);
            }
        };
        Machine.prototype.parseName = function () {
            this.readWhitespace();
            var ret = "";
            while (!/\s/.test(this.parserInput[0]) &&
                this.parserInput.length &&
                this.stopChars.indexOf(this.parserInput[0]) === -1) {
                ret += this.parserInput[0];
                this.parserInput = this.parserInput.slice(1);
            }
            this.readWhitespace();
            return ret;
        };
        Machine.prototype.readChar = function (char) {
            this.readWhitespace();
            if (this.parserInput[0] !== char) {
                throw "Expected '" + char + "' at position " + this.getPosition() + " at '" + this.parserInput + "'";
            }
            this.parserInput = this.parserInput.slice(1);
            this.readWhitespace();
        };
        Machine.prototype.getPosition = function () {
            return this.parserInputWhole.length - this.parserInput.length;
        };
        Machine.prototype.parseStep = function () {
            var name = this.parseName();
            var token = this.tokenManager.getToken(name);
            if (token === null && expectedType === Type.LITERAL) {
                return name;
            }
            if (token === null) {
                throw "Expected argument with type " + expectedType;
            }
            if (expectedType != undefined && !(token instanceof expectedType)) {
                throw "Unexpected " + token.type + " (was expecting " + expectedType + ")";
            }
            var numArgs = token.argument_types.length;
            var args = [];
            if (token.fixType === behavior_1.FixType.FixType.INFIX) {
                var a = behavior_1.Token.parserStack.pop();
                if (a.type !== token.argument_types[0])
                    throw "Unexpected " + a.type + " (was expecting " + token.argument_types[0] + ")";
                args = [a, behavior_1.Token.parseStep(token.argument_types[1])];
                behavior_1.Token.parserStack.pop();
            }
            if (token.fixType === behavior_1.FixType.FixType.PREFIX) {
                behavior_1.Token.readChar("(");
                for (var i = 0; i < numArgs; i++) {
                    args.push(behavior_1.Token.parseStep(token.argument_types[i]));
                    behavior_1.Token.readWhitespace();
                    if (behavior_1.Token.parserInput[0] === ",")
                        behavior_1.Token.parserInput = behavior_1.Token.parserInput.slice(1);
                }
                behavior_1.Token.readChar(")");
            }
            var newToken = new token.constructor();
            for (var i = 0; i < args.length; i++) {
                newToken.args[i] = args[i];
                behavior_1.Token.parserStack.pop();
            }
            behavior_1.Token.parserStack.push(newToken);
            return newToken;
        };
        return Machine;
    }());
})(Parser || (Parser = {}));
//# sourceMappingURL=parser.js.map