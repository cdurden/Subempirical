(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],2:[function(require,module,exports){
const AlgebraLatex = require("algebra-latex");
window.AlgebraLatex = AlgebraLatex;

},{"algebra-latex":6}],3:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Lexer = require('./lexers/Lexer');

var _Lexer2 = _interopRequireDefault(_Lexer);

var _functions = require('./models/functions');

var _functions2 = _interopRequireDefault(_functions);

var _greekLetters = require('./models/greek-letters');

var _greekLetters2 = _interopRequireDefault(_greekLetters);

var _logger = require('./logger');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ParserLatex = function () {
  function ParserLatex(latex, Lexer) {
    var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

    _classCallCheck(this, ParserLatex);

    // if (!(Lexer instanceof LexerClass)) {
    //   throw Error('Please parse a valid lexer as second argument')
    // }

    this.lexer = new Lexer(latex);
    this.options = options;
    this.ast = null;
    this.current_token = null;
    this.peek_token = null;
    this.functions = _functions2.default.concat(options.functions || []);
  }

  _createClass(ParserLatex, [{
    key: 'parse',
    value: function parse() {
      (0, _logger.debug)('\nLatex parser .parse()');
      this.ast = this.equation();

      this.eat('EOF');

      return this.ast;
    }
  }, {
    key: 'next_token',
    value: function next_token() {
      if (this.peek_token != null) {
        this.current_token = this.peek_token;
        this.peek_token = null;
        (0, _logger.debug)('next token from peek', this.current_token);
      } else {
        this.current_token = this.lexer.next_token();
        (0, _logger.debug)('next token', this.current_token);
      }
      return this.current_token;
    }
  }, {
    key: 'peek',
    value: function peek() {
      if (this.peek_token == null) {
        this.peek_token = this.lexer.next_token();
      }

      (0, _logger.debug)('next token from peek', this.peek_token);
      return this.peek_token;
    }
  }, {
    key: 'error',
    value: function error(message) {
      var line = this.lexer.text.split('\n')[this.lexer.line];
      var spacing = '';

      for (var i = 0; i < this.lexer.col; i++) {
        spacing += ' ';
      }

      throw Error('Parser error\n' + line + '\n' + spacing + '^\nError at line: ' + (this.lexer.line + 1) + ' col: ' + (this.lexer.col + 1) + '\n' + message);
    }
  }, {
    key: 'eat',
    value: function eat(token_type) {
      if (this.next_token().type != token_type) {
        this.error('Expected ' + token_type + ' found ' + JSON.stringify(this.current_token));
      }
    }
  }, {
    key: 'equation',
    value: function equation() {
      // equation : expr ( EQUAL expr )?
      var lhs = this.expr();

      if (this.peek().type != 'equal') {
        return lhs;
      } else {
        this.next_token();
      }

      var rhs = this.expr();

      return {
        type: 'equation',
        lhs: lhs,
        rhs: rhs
      };
    }
  }, {
    key: 'expr',
    value: function expr() {
      // expr : operator

      (0, _logger.debug)('expr');

      this.peek();

      if (this.peek_token.type == 'number' || this.peek_token.type == 'operator' || this.peek_token.type == 'variable' || this.peek_token.type == 'function' || this.peek_token.type == 'keyword' || (this.peek_token.type == 'bracket' && this.peek_token.open == true)) {
        return this.operator();
      }

      if (this.peek_token.type == 'bracket' && this.peek_token.open == false) {
        return null;
      }

      if (this.peek_token.type == 'EOF') {
        this.next_token();
        return null;
      }

      this.next_token();
      this.error('Unexpected token: ' + JSON.stringify(this.current_token));
    }
  }, {
    key: 'keyword',
    value: function keyword() {
      // keyword : KEYWORD
      //         | fraction
      //         | function

      (0, _logger.debug)('keyword');

      if (this.peek().type != 'keyword') {
        throw Error('Expected keyword found ' + JSON.stringify(this.peek_token));
      }

      var kwd = this.peek_token.value;
      kwd = kwd.toLowerCase();

      (0, _logger.debug)('keyword -', kwd);

      if (kwd == 'frac') {
        return this.fraction();
      }

      if (kwd == 'sqrt') {
        return this.sqrt();
      }

      if (this.functions.includes(kwd.toLowerCase())) {
        return this.function();
      }

      this.eat('keyword');
      return {
        type: 'keyword',
        value: this.current_token.value
      };
    }
  }, {
    key: 'sqrt',
    value: function sqrt() {
      // sqrt : SQRT (L_SQUARE_BRAC NUMBER R_SQUARE_BRAC)? GROUP
      (0, _logger.debug)('sqrt');

      this.eat('keyword');

      if (this.current_token.value != 'sqrt') {
        this.error('Expected sqrt found ' + JSON.stringify(this.current_token));
      }

      if (this.peek().value != '[') {
        var content = this.group();

        return {
          type: 'function',
          value: 'sqrt',
          content: content
        };
      }

      this.eat('bracket');
      if (this.current_token.value != '[') {
        this.error('Expected "[" bracket, found ' + JSON.stringify(this.current_token));
      }

      var base = this.number();

      this.eat('bracket');
      if (this.current_token.value != ']') {
        this.error('Expected "]" bracket, found ' + JSON.stringify(this.current_token));
      }

      var value = this.group();

      return {
        type: 'operator',
        operator: 'exponent',
        lhs: value,
        rhs: {
          type: 'operator',
          operator: 'divide',
          lhs: {
            type: 'number',
            value: 1
          },
          rhs: base
        }
      };
    }
  }, {
    key: 'fraction',
    value: function fraction() {
      // fraction : FRAC group group

      (0, _logger.debug)('fraction');

      this.eat('keyword');

      if (this.current_token.value != 'frac') {
        this.error('Expected fraction found ' + JSON.stringify(this.current_token));
      }

      var nominator = this.group();
      var denominator = this.group();

      return {
        type: 'operator',
        operator: 'divide',
        lhs: nominator,
        rhs: denominator
      };
    }
  }, {
    key: 'function',
    value: function _function() {
      // function : FUNCTION ( group | number )

      (0, _logger.debug)('function');

      this.eat('keyword');
      var value = this.current_token.value;

      var content = void 0;
      if (this.peek().type == 'bracket') {
        content = this.group();
      } else {
        content = this.number();
      }

      return {
        type: 'function',
        value: value,
        content: content
      };
    }
  }, {
    key: 'group',
    value: function group() {
      // group : LBRACKET expr RBRACKET

      (0, _logger.debug)('start group');

      this.eat('bracket');
      if (this.current_token.open != true) {
        this.error('Expected opening bracket found ' + this.current_token);
      }

      var content = this.expr();

      this.eat('bracket');
      if (this.current_token.open != false) {
        this.error('Expected closing bracket found ' + this.current_token);
      }

      (0, _logger.debug)('end group');

      return content;
    }
  }, {
    key: 'operator',
    value: function operator() {
      // operator : operator_term ((PLUS | MINUS) operator)?
      (0, _logger.debug)('operator left');
      var lhs = this.operator_multiply();
      var op = this.peek();

      if (op.type != 'operator' || op.value != 'plus' && op.value != 'minus') {
        (0, _logger.debug)('operator only left side');
        return lhs;
      }

      // Operator token
      this.next_token();

      (0, _logger.debug)('operator right');
      var rhs = this.operator();

      return {
        type: 'operator',
        operator: op.value,
        lhs: lhs,
        rhs: rhs
      };
    }
  }, {
    key: 'operator_multiply',
    value: function operator_multiply() {
      // operator_multiply : (operator_divide | GROUP) ( (MULTIPLY operator_multiply) | number )?

      (0, _logger.debug)('op mul left');

      var lhs = this.operator_divide();

      var op = this.peek();

      if (op.type == 'number' || op.type == 'variable' || op.type == 'keyword' || op.type == 'bracket' && op.value == '(') {
        op = {
          type: 'operator',
          value: 'multiply'
        };
      } else if (op.type != 'operator' || op.value != 'multiply' && op.value != 'divide') {
        (0, _logger.debug)('term only left side');
        return lhs;
      } else {
        // Operator token
        this.next_token();
      }

      (0, _logger.debug)('op mul right');

      var rhs = this.operator_multiply();

      return {
        type: 'operator',
        operator: op.value,
        lhs: lhs,
        rhs: rhs
      };
    }
  }, {
    key: 'operator_divide',
    value: function operator_divide() {
      // operator_divide : operator_mod operator_divide_prime

      (0, _logger.debug)('operator_divide');

      var lhs = this.operator_mod();

      var divideResult = this.operator_divide_prime(lhs);

      return divideResult;
    }
  }, {
    key: 'operator_divide_prime',
    value: function operator_divide_prime(lhs) {
      // operator_divide_prime : epsilon | DIVIDE operator_mod operator_divide_prime

      var op = this.peek();

      if (op.type != 'operator' || op.value != 'divide') {
        (0, _logger.debug)('operator_divide_prime - epsilon');
        return lhs;
      } else {
        // Operator token
        this.next_token();
      }

      (0, _logger.debug)('operator_divide_prime - next operator');

      var rhs = this.operator_mod();

      return this.operator_divide_prime({
        type: 'operator',
        operator: 'divide',
        lhs: lhs,
        rhs: rhs
      });
    }
  }, {
    key: 'operator_mod',
    value: function operator_mod() {
      // operator_mod : operator_exp ( MODULUS operator_mod )?

      (0, _logger.debug)('modulus left');

      var lhs = this.operator_exp();
      var op = this.peek();

      if (op.type != 'operator' || op.value != 'modulus') {
        (0, _logger.debug)('modulus only left side');
        return lhs;
      } else {
        // Operator token
        this.next_token();
      }

      (0, _logger.debug)('modulus right');

      var rhs = this.operator_mod();

      return {
        type: 'operator',
        operator: 'modulus',
        lhs: lhs,
        rhs: rhs
      };
    }
  }, {
    key: 'operator_exp',
    value: function operator_exp() {
      // operator_exp : subscript ( EXPONENT operator_exp )?

      var lhs = this.subscript();
      var op = this.peek();

      if (op.type != 'operator' || op.value != 'exponent') {
        (0, _logger.debug)('modulus only left side');
        return lhs;
      } else {
        // Operator token
        this.next_token();
      }

      var rhs = this.operator_exp();

      return {
        type: 'operator',
        operator: 'exponent',
        lhs: lhs,
        rhs: rhs
      };
    }
  }, {
    key: 'variable',
    value: function variable() {
      this.eat('variable');

      return {
        type: 'variable',
        value: this.current_token.value
      };
    }
  }, {
    key: 'subscript',
    value: function subscript() {
      // subscript : number ( SUBSCRIPT subscript )?
      var base_num = this.number();

      if (this.peek().type == 'underscore') {
        this.eat('underscore');

        var sub_value = this.subscript();

        return {
          type: 'subscript',
          base: base_num,
          subscript: sub_value
        };
      }

      return base_num;
    }
  }, {
    key: 'number',
    value: function number() {
      // number : NUMBER
      //        | uni_operator
      //        | variable
      //        | keyword
      //        | symbol
      //        | group

      (0, _logger.debug)('number');

      this.peek();

      if (this.peek_token.type == 'number') {
        this.next_token();
        return {
          type: this.current_token.type,
          value: this.current_token.value
        };
      }

      if (this.peek_token.type == 'operator') {
        return this.uni_operator();
      }

      if (this.peek_token.type == 'variable') {
        return this.variable();
      }

      if (this.peek_token.type == 'keyword') {
        return this.keyword();
      }

      if (this.peek_token.type == 'bracket') {
        return this.group();
      }

      this.next_token();
      this.error('Expected number, variable, function, group, or + - found ' + JSON.stringify(this.current_token));
    }
  }, {
    key: 'uni_operator',
    value: function uni_operator() {
      this.eat('operator');
      if (this.current_token.value == 'plus' || this.current_token.value == 'minus') {
        var prefix = this.current_token.value;
        var value = this.number();

        if (value.type == 'number') {
          return {
            type: 'number',
            value: prefix == 'minus' ? -value.value : value.value
          };
        }

        return {
          type: 'uni-operator',
          operator: prefix,
          value: value
        };
      }
    }
  }]);

  return ParserLatex;
}();

exports.default = ParserLatex;

},{"./lexers/Lexer":7,"./logger":10,"./models/functions":11,"./models/greek-letters":12}],4:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _greekLetters = require('../models/greek-letters');

var _greekLetters2 = _interopRequireDefault(_greekLetters);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var LatexFormatter = function () {
  function LatexFormatter(ast) {
    _classCallCheck(this, LatexFormatter);

    this.ast = ast;
  }

  _createClass(LatexFormatter, [{
    key: 'format',
    value: function format() {
      var root = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.ast;

      if (root == null) {
        return '';
      }

      switch (root.type) {
        case 'operator':
          return this.operator(root);
        case 'number':
          return this.number(root);
        case 'function':
          return this.function(root);
        case 'variable':
          return this.variable(root);
        case 'equation':
          return this.equation(root);
        case 'subscript':
          return this.subscript(root);
        case 'uni-operator':
          return this.uni_operator(root);
        default:
          throw Error('Unexpected type: ' + root.type);
      }
    }
  }, {
    key: 'operator',
    value: function operator(root) {
      var op = root.operator;

      switch (op) {
        case 'plus':
          op = '+';
          break;
        case 'minus':
          op = '-';
          break;
        case 'multiply':
          op = '\\cdot ';
          break;
        case 'divide':
          return this.fragment(root);
        case 'modulus':
          op = '%';
          break;
        case 'exponent':
          op = '^';
          break;
        default:
      }

      var lhs = this.format(root.lhs);
      var rhs = this.format(root.rhs);

      var precedensOrder = [['modulus'], ['exponent'], ['multiply'], ['plus', 'minus']];

      var higherPrecedens = function higherPrecedens(a, b) {
        var depth = function depth(op) {
          return precedensOrder.findIndex(function (val) {
            return val.includes(op);
          });
        };

        return depth(b) > depth(a);
      };

      var shouldHaveParenthesis = function shouldHaveParenthesis(child) {
        return child.type == 'operator' && higherPrecedens(root.operator, child.operator);
      };

      var lhsParen = shouldHaveParenthesis(root.lhs);
      var rhsParen = shouldHaveParenthesis(root.rhs);

      lhs = lhsParen ? '\\left(' + lhs + '\\right)' : lhs;

      if (root.operator == 'exponent') {
        rhsParen = true;
        rhs = rhsParen ? '{' + rhs + '}' : rhs;
      } else {
        rhs = rhsParen ? '\\left(' + rhs + '\\right)' : rhs;
      }

      return '' + lhs + op + rhs;
    }
  }, {
    key: 'fragment',
    value: function fragment(root) {
      var lhs = this.format(root.lhs);
      var rhs = this.format(root.rhs);

      return '\\frac{' + lhs + '}{' + rhs + '}';
    }
  }, {
    key: 'number',
    value: function number(root) {
      return '' + root.value;
    }
  }, {
    key: 'function',
    value: function _function(root) {
      if (root.value == 'sqrt') {
        return '\\' + root.value + '{' + this.format(root.content) + '}';
      }
      return '\\' + root.value + '\\left(' + this.format(root.content) + '\\right)';
    }
  }, {
    key: 'variable',
    value: function variable(root) {
      if (_greekLetters2.default.map(function (l) {
        return l.name;
      }).includes(root.value.toLowerCase())) {
        return '\\' + root.value;
      }
      return '' + root.value;
    }
  }, {
    key: 'equation',
    value: function equation(root) {
      return this.format(root.lhs) + '=' + this.format(root.rhs);
    }
  }, {
    key: 'subscript',
    value: function subscript(root) {
      if (root.subscript === null) {
        return this.format(root.base);
      } else if (root.subscript.type == 'variable' && root.subscript.value.length == 1) {
        return this.format(root.base) + '_' + this.format(root.subscript);
      }

      return this.format(root.base) + '_{' + this.format(root.subscript) + '}';
    }
  }, {
    key: 'uni_operator',
    value: function uni_operator(root) {
      if (root.operator == 'minus') {
        return '-' + this.format(root.value);
      }

      return this.format(root.value);
    }
  }]);

  return LatexFormatter;
}();

exports.default = LatexFormatter;

},{"../models/greek-letters":12}],5:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _greekLetters = require('../models/greek-letters');

var greekLetters = _interopRequireWildcard(_greekLetters);

var _logger = require('../logger');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var MathFormatter = function () {
  function MathFormatter(ast) {
    _classCallCheck(this, MathFormatter);

    this.ast = ast;
  }

  _createClass(MathFormatter, [{
    key: 'format',
    value: function format() {
      var root = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.ast;

      if (root == null) {
        return '';
      }

      switch (root.type) {
        case 'operator':
          return this.operator(root);
        case 'number':
          return this.number(root);
        case 'function':
          return this.function(root);
        case 'variable':
          return this.variable(root);
        case 'equation':
          return this.equation(root);
        case 'subscript':
          return this.subscript(root);
        case 'uni-operator':
          return this.uni_operator(root);
        default:
          throw Error('Unexpected type: ' + root.type);
      }
    }
  }, {
    key: 'operator',
    value: function operator(root) {
      var op = root.operator;

      switch (op) {
        case 'plus':
          op = '+';
          break;
        case 'minus':
          op = '-';
          break;
        case 'multiply':
          op = '*';
          break;
        case 'divide':
          op = '/';
          break;
        case 'modulus':
          op = '%';
          break;
        case 'exponent':
          op = '^';
          break;
        default:
      }

      var lhs = this.format(root.lhs);
      var rhs = this.format(root.rhs);

      var precedensOrder = [['modulus'], ['exponent'], ['multiply', 'divide'], ['plus', 'minus']];

      var higherPrecedens = function higherPrecedens(a, b) {
        var depth = function depth(op) {
          return precedensOrder.findIndex(function (val) {
            return val.includes(op);
          });
        };

        return depth(b) > depth(a);
      };

      var shouldHaveParenthesis = function shouldHaveParenthesis(child) {
        return child.type == 'operator' && higherPrecedens(root.operator, child.operator);
      };

      var lhsParen = shouldHaveParenthesis(root.lhs);
      lhs = lhsParen ? '(' + lhs + ')' : lhs;

      if (root.rhs === null) {
        return lhs;
      }
      var rhsParen = shouldHaveParenthesis(root.rhs);

      // Special case for division
      rhsParen = rhsParen || op == '/' && root.rhs.type == 'operator';

      if (root.operator == 'exponent') {
        if (root.rhs.type == 'number' && root.rhs.value < 0) {
          rhsParen = true;
        }
      }

      rhs = rhsParen ? '(' + rhs + ')' : rhs;

      return lhs + op + rhs;
    }
  }, {
    key: 'number',
    value: function number(root) {
      return '' + root.value;
    }
  }, {
    key: 'function',
    value: function _function(root) {
      return root.value + '(' + this.format(root.content) + ')';
    }
  }, {
    key: 'variable',
    value: function variable(root) {
      var greekLetter = greekLetters.getSymbol(root.value);

      if (greekLetter) {
        return greekLetter;
      }

      return '' + root.value;
    }
  }, {
    key: 'equation',
    value: function equation(root) {
      return this.format(root.lhs) + '=' + this.format(root.rhs);
    }
  }, {
    key: 'subscript',
    value: function subscript(root) {
      if (root.subscript === null) {
        return this.format(root.base);
      } else if (root.subscript.type == 'variable' && root.subscript.value.length == 1) {
        return this.format(root.base) + '_' + this.format(root.subscript);
      }

      return this.format(root.base) + '_(' + this.format(root.subscript) + ')';
    }
  }, {
    key: 'uni_operator',
    value: function uni_operator(root) {
      if (root.operator == 'minus') {
        return '-' + this.format(root.value);
      }

      return this.format(root.value);
    }
  }]);

  return MathFormatter;
}();

exports.default = MathFormatter;

},{"../logger":10,"../models/greek-letters":12}],6:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Parser = require('./Parser');

var _Parser2 = _interopRequireDefault(_Parser);

var _FormatterMath = require('./formatters/FormatterMath');

var _FormatterMath2 = _interopRequireDefault(_FormatterMath);

var _FormatterLatex = require('./formatters/FormatterLatex');

var _FormatterLatex2 = _interopRequireDefault(_FormatterLatex);

var _logger = require('./logger');

var _greekLetters = require('./models/greek-letters');

var greekLetters = _interopRequireWildcard(_greekLetters);

var _LexerLatex = require('./lexers/LexerLatex');

var _LexerLatex2 = _interopRequireDefault(_LexerLatex);

var _LexerMath = require('./lexers/LexerMath');

var _LexerMath2 = _interopRequireDefault(_LexerMath);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * A class for parsing latex math
 */
var AlgebraLatex = function () {
  /**
   * Create an AlgebraLatex object, to be converted
   * The latex paremeter was removed as of v2.0, use parseLatex()
   * @param options the options to provide to the library
   * @return {AlgebraLatex} object to be converted
   */
  function AlgebraLatex() {
    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, AlgebraLatex);

    this.options = options;
  }

  _createClass(AlgebraLatex, [{
    key: 'parseLatex',
    value: function parseLatex(latex) {
      // Replace , with . for european decimal separators
      latex = latex.replace(/,/g, '.');

      this.input = latex;
      this.parser = new _Parser2.default(latex, _LexerLatex2.default, this.options);
      this.parser.parse();

      return this;
    }
  }, {
    key: 'parseMath',
    value: function parseMath(math) {
      // Replace , with . for european decimal separators
      math = math.replace(/,/g, '.');

      this.input = math;
      this.parser = new _Parser2.default(math, _LexerMath2.default, this.options);
      this.parser.parse();

      return this;
    }
  }, {
    key: 'getAst',
    value: function getAst() {
      return this.parser.ast;
    }

    /**
     * Will return a serialized string eg. 2*(3+4)/(sqrt(5))-8
     * @return string The serialized string
     */

  }, {
    key: 'toMath',
    value: function toMath() {
      return new _FormatterMath2.default(this.getAst()).format();
    }

    /**
     * Will return a formatted latex string eg. \frac{1}{\sqrt{2}}
     * @return string The formatted latex string
     */

  }, {
    key: 'toLatex',
    value: function toLatex() {
      return new _FormatterLatex2.default(this.getAst()).format();
    }

    /**
     * @deprecated toLatex() should be used instead
     */

  }, {
    key: 'toTex',
    value: function toTex() {
      return self.toLatex();
    }

    /**
     * Will return an algebra.js Expression or Equation
     * @param {Object} algebraJS an instance of algebra.js
     * @return {(Expression|Equation)} an Expression or Equation
     */

  }, {
    key: 'toAlgebra',
    value: function toAlgebra(algebraJS) {
      if (algebraJS === null) {
        throw new Error('Algebra.js must be passed as a parameter for toAlgebra');
      }

      var mathToParse = this.toMath();
      mathToParse = greekLetters.convertSymbols(mathToParse);

      return algebraJS.parse(mathToParse);
    }

    /**
     * Will return an algebrite object
     * @param {Object} algebrite an instance of algebrite
     * @return {Object} an algebrite object
     */

  }, {
    key: 'toAlgebrite',
    value: function toAlgebrite(algebrite) {
      if (algebrite === null) {
        return new Error('Algebrite must be passed as a parameter for toAlgebrite');
      }

      if (this.isEquation()) {
        return new Error('Algebrite can not handle equations, only expressions');
      }

      var mathToParse = this.toMath();
      mathToParse = greekLetters.convertSymbols(mathToParse);

      return algebrite.eval(mathToParse);
    }

    /**
     * Will return a coffequate object
     * @return {Object} a coffeequate object
     */

  }, {
    key: 'toCoffeequate',
    value: function toCoffeequate(coffeequate) {
      if (coffeequate === null) {
        return new Error('Coffeequante must be passed as a parameter for toCoffeequante');
      }

      var result = this.toMath();
      result = result.replace(/\^/g, '**');

      return coffeequate(result);
    }

    /**
     * Wether or not the object is an equation or an expression
     * @return Boolean true if expression
     */

  }, {
    key: 'isEquation',
    value: function isEquation() {
      return this.input.includes('=');
    }
  }]);

  return AlgebraLatex;
}();

module.exports = AlgebraLatex;
},{"./Parser":3,"./formatters/FormatterLatex":4,"./formatters/FormatterMath":5,"./lexers/LexerLatex":8,"./lexers/LexerMath":9,"./logger":10,"./models/greek-letters":12}],7:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * An abstract class shared between lexers
 */
var Lexer = function () {
  function Lexer(text) {
    _classCallCheck(this, Lexer);

    this.text = text;
    this.pos = 0;

    this.col = 0;
    this.line = 0;
    this.prev_col = 0;
    this.prev_line = 0;
  }

  _createClass(Lexer, [{
    key: 'increment',
    value: function increment() {
      var amount = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1;

      this.pos += amount;
      this.col += amount;
    }
  }, {
    key: 'error',
    value: function error(message) {
      var line = this.text.split('\n')[this.prev_line];
      var spacing = '';

      for (var i = 0; i < this.prev_col; i++) {
        spacing += ' ';
      }

      throw Error('Lexer error\n' + line + '\n' + spacing + '^\nError at line: ' + (this.prev_line + 1) + ' col: ' + (this.prev_col + 1) + '\n' + message);
    }
  }, {
    key: 'current_char',
    value: function current_char() {
      return this.text.charAt(this.pos);
    }
  }, {
    key: 'eat',
    value: function eat(char) {
      if (this.current_char() == char) {
        this.pos += 1;
      } else {
        this.error('Expected ' + char + ' found ' + this.current_char());
      }
    }
  }, {
    key: 'number',
    value: function number() {
      var num = '';
      var separator = false;

      while (this.current_char().match(/[0-9\.]/)) {
        if (this.current_char() == '.') {
          if (separator) {
            break;
          } else {
            separator = true;
          }
        }

        num += this.current_char();
        this.increment();
      }

      var result = Number(num);
      if (isNaN(result)) {
        this.error('Could not parse number: \'' + num + '\'');
      }

      return {
        type: 'number',
        value: result
      };
    }
  }]);

  return Lexer;
}();

exports.default = Lexer;
},{}],8:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Lexer2 = require('./Lexer');

var _Lexer3 = _interopRequireDefault(_Lexer2);

var _greekLetters = require('../models/greek-letters');

var _greekLetters2 = _interopRequireDefault(_greekLetters);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var LatexLexer = function (_Lexer) {
  _inherits(LatexLexer, _Lexer);

  function LatexLexer(latex) {
    _classCallCheck(this, LatexLexer);

    return _possibleConstructorReturn(this, (LatexLexer.__proto__ || Object.getPrototypeOf(LatexLexer)).call(this, latex));
  }

  _createClass(LatexLexer, [{
    key: 'next_token',
    value: function next_token() {
      this.prev_col = this.col;
      this.prev_line = this.line;

      if (this.pos >= this.text.length) {
        return { type: 'EOF' };
      }

      if (this.current_char() == '\n') {
        this.col = 0;
        this.line++;
      }

      var blank_chars = [' ', '\n', '\\ ', '\\!', '&', '\\,', '\\:', '\\;', '\\quad', '\\qquad'];

      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = blank_chars[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var blank = _step.value;

          if (this.text.startsWith(blank, this.pos)) {
            this.increment(blank.length);
            return this.next_token();
          }
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }

      if (this.current_char() == '\\') {
        return this.keyword();
      }

      if (this.current_char().match(/[0-9]/)) {
        return this.number();
      }

      if (this.current_char().match(/[a-zA-Z]/)) {
        return this.variable();
      }

      if (this.current_char() == '{') {
        this.increment();
        return { type: 'bracket', open: true, value: '{' };
      }

      if (this.current_char() == '}') {
        this.increment();
        return { type: 'bracket', open: false, value: '}' };
      }

      if (this.current_char() == '(') {
        this.increment();
        return { type: 'bracket', open: true, value: '(' };
      }

      if (this.current_char() == ')') {
        this.increment();
        return { type: 'bracket', open: false, value: ')' };
      }

      if (this.current_char() == '[') {
        this.increment();
        return { type: 'bracket', open: true, value: '[' };
      }

      if (this.current_char() == ']') {
        this.increment();
        return { type: 'bracket', open: false, value: ']' };
      }

      if (this.current_char() == '+') {
        this.increment();
        return { type: 'operator', value: 'plus' };
      }

      if (this.current_char() == '-') {
        this.increment();
        return { type: 'operator', value: 'minus' };
      }

      if (this.current_char() == '*') {
        this.increment();
        return { type: 'operator', value: 'multiply' };
      }

      if (this.current_char() == '/') {
        this.increment();
        return { type: 'operator', value: 'divide' };
      }

      if (this.current_char() == '^') {
        this.increment();
        return { type: 'operator', value: 'exponent' };
      }

      if (this.current_char() == '=') {
        this.increment();
        return { type: 'equal' };
      }

      if (this.current_char() == '_') {
        this.increment();
        return { type: 'underscore' };
      }

      this.error('Unknown symbol: ' + this.current_char());
    }
  }, {
    key: 'keyword',
    value: function keyword() {
      this.eat('\\');

      var variable = this.variable();

      if (variable.value == 'cdot') {
        return { type: 'operator', value: 'multiply' };
      }

      if (variable.value == 'mod') {
        return { type: 'operator', value: 'modulus' };
      }

      if (variable.value == 'left') {
        var bracket = this.next_token();

        if (bracket.type != 'bracket' && bracket.open != true) {
          this.error('Expected opening bracket found ' + JSON.stringify(bracket));
        }

        return bracket;
      }

      if (variable.value == 'right') {
        var _bracket = this.next_token();

        if (_bracket.type != 'bracket' && _bracket.open != false) {
          this.error('Expected closing bracket found ' + JSON.stringify(_bracket));
        }

        return _bracket;
      }

      if (_greekLetters2.default.map(function (x) {
        return x.name;
      }).includes(variable.value.toLowerCase())) {
        return { type: 'variable', value: variable.value };
      }

      return {
        type: 'keyword',
        value: variable.value
      };
    }
  }, {
    key: 'variable',
    value: function variable() {
      var token = '';
      while (this.current_char().match(/[a-zA-Z]/) && this.pos <= this.text.length) {
        token += this.current_char();
        this.increment();
      }

      return {
        type: 'variable',
        value: token
      };
    }
  }]);

  return LatexLexer;
}(_Lexer3.default);

exports.default = LatexLexer;
},{"../models/greek-letters":12,"./Lexer":7}],9:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Lexer2 = require('./Lexer');

var _Lexer3 = _interopRequireDefault(_Lexer2);

var _functions = require('../models/functions');

var _functions2 = _interopRequireDefault(_functions);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var LatexLexer = function (_Lexer) {
  _inherits(LatexLexer, _Lexer);

  function LatexLexer(mathString) {
    _classCallCheck(this, LatexLexer);

    return _possibleConstructorReturn(this, (LatexLexer.__proto__ || Object.getPrototypeOf(LatexLexer)).call(this, mathString));
  }

  _createClass(LatexLexer, [{
    key: 'next_token',
    value: function next_token() {
      this.prev_col = this.col;
      this.prev_line = this.line;

      if (this.pos >= this.text.length) {
        return { type: 'EOF' };
      }

      if (this.current_char() == '\n') {
        this.col = 0;
        this.line++;
      }

      var blank_chars = [' ', '\n'];

      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = blank_chars[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var blank = _step.value;

          if (this.text.startsWith(blank, this.pos)) {
            this.increment(blank.length);
            return this.next_token();
          }
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }

      if (this.current_char().match(/[0-9]/)) {
        return this.number();
      }

      if (this.current_char().match(/[a-zA-Z]/)) {
        return this.alphabetic();
      }

      if (this.current_char() == '(') {
        this.increment();
        return { type: 'bracket', open: true, value: '(' };
      }

      if (this.current_char() == ')') {
        this.increment();
        return { type: 'bracket', open: false, value: ')' };
      }

      if (this.current_char() == '+') {
        this.increment();
        return { type: 'operator', value: 'plus' };
      }

      if (this.current_char() == '-') {
        this.increment();
        return { type: 'operator', value: 'minus' };
      }

      if (this.current_char() == '*') {
        this.increment();
        return { type: 'operator', value: 'multiply' };
      }

      if (this.current_char() == '/') {
        this.increment();
        return { type: 'operator', value: 'divide' };
      }

      if (this.current_char() == '^') {
        this.increment();
        return { type: 'operator', value: 'exponent' };
      }

      if (this.current_char() == '=') {
        this.increment();
        return { type: 'equal' };
      }

      if (this.current_char() == '_') {
        this.increment();
        return { type: 'underscore' };
      }

      this.error('Unknown symbol: ' + this.current_char());
    }

    // Token contains string of alphabetic characters

  }, {
    key: 'alphabetic',
    value: function alphabetic() {
      var token = '';
      while (this.current_char().match(/[a-zA-Z]/) && this.pos <= this.text.length) {
        token += this.current_char();
        this.increment();
      }

      if (_functions2.default.includes(token)) {
        return {
          type: 'keyword',
          value: token
        };
      }

      return {
        type: 'variable',
        value: token
      };
    }
  }]);

  return LatexLexer;
}(_Lexer3.default);

exports.default = LatexLexer;
},{"../models/functions":11,"./Lexer":7}],10:[function(require,module,exports){
(function (process){(function (){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var stackLevelRef = null;

var debug = exports.debug = function debug() {
  for (var _len = arguments.length, msg = Array(_len), _key = 0; _key < _len; _key++) {
    msg[_key] = arguments[_key];
  }

  if ((typeof process === 'undefined' ? 'undefined' : _typeof(process)) === 'object') {
    if (process.env.TEX_DEBUG) {
      var _console;

      var stackLevel = new Error().stack.split('\n').length;
      if (stackLevelRef == null) {
        stackLevelRef = stackLevel;
      }
      stackLevel -= stackLevelRef;

      var stackSpacing = '';

      for (var i = 0; i < stackLevel; i++) {
        stackSpacing += '-';
      }

      (_console = console).log.apply(_console, [stackSpacing].concat(msg));
    }
  }
};
}).call(this)}).call(this,require('_process'))
},{"_process":1}],11:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = ['sin', 'cos', 'tan', 'arcsin', 'arccos', 'arctan', 'log', 'ln', 'sqrt', 'max', 'min'];
},{}],12:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.letters = undefined;
exports.toUpperCase = toUpperCase;
exports.isUpperCase = isUpperCase;
exports.getSymbol = getSymbol;
exports.getName = getName;
exports.convertSymbols = convertSymbols;

var _logger = require('../logger');

var letters = exports.letters = [{
  name: 'alpha',
  symbol: 'α'
}, {
  name: 'beta',
  symbol: 'β'
}, {
  name: 'gamma',
  symbol: 'γ'
}, {
  name: 'delta',
  symbol: 'δ'
}, {
  name: 'epsilon',
  symbol: 'ϵ'
}, {
  name: 'zeta',
  symbol: 'ζ'
}, {
  name: 'eta',
  symbol: 'η'
}, {
  name: 'theta',
  symbol: 'θ'
}, {
  name: 'iota',
  symbol: 'ι'
}, {
  name: 'kappa',
  symbol: 'κ'
}, {
  name: 'lambda',
  symbol: 'λ'
}, {
  name: 'mu',
  symbol: 'μ'
}, {
  name: 'nu',
  symbol: 'ν'
}, {
  name: 'omicron',
  symbol: 'ο'
}, {
  name: 'pi',
  symbol: 'π'
}, {
  name: 'rho',
  symbol: 'ρ'
}, {
  name: 'sigma',
  symbol: 'σ'
}, {
  name: 'tau',
  symbol: 'τ'
}, {
  name: 'upsilon',
  symbol: 'υ'
}, {
  name: 'phi',
  symbol: 'ϕ'
}, {
  name: 'chi',
  symbol: 'χ'
}, {
  name: 'psi',
  symbol: 'ψ'
}, {
  name: 'omega',
  symbol: 'ω'
}];

function toUpperCase(x) {
  return x.charAt(0).toUpperCase() + x.slice(1);
}

function isUpperCase(x) {
  return x.charAt(0).toUpperCase() === x.charAt(0);
}

function getSymbol(name) {
  var symbol = letters.find(function (x) {
    return x.name === name.toLowerCase();
  });
  if (typeof symbol === 'undefined') return null;
  symbol = symbol.symbol;
  if (isUpperCase(name)) symbol = toUpperCase(symbol);
  return symbol;
}

function getName(symbol) {
  var name = letters.find(function (x) {
    return x.symbol === symbol.toLowerCase();
  });
  if (typeof name === 'undefined') return null;
  name = name.name;
  if (isUpperCase(symbol)) name = toUpperCase(name);
  return name;
}

function convertSymbols(math) {
  (0, _logger.debug)('Converting math symbols ' + math);
  letters.forEach(function (letter) {
    math = math.split(letter.symbol).join(letter.name);
    math = math.split(toUpperCase(letter.symbol)).join(toUpperCase(letter.name));
  });
  (0, _logger.debug)('Converted math symbols ' + math);
  return math;
}

exports.default = letters;
},{"../logger":10}]},{},[2]);
