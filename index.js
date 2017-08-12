require('apollojs');
var entities = require('entities');

/**
 * Node Class as base class for TextNode and HTMLElement.
 */
function Node() {}

$declare(Node, {});
$defenum(Node, {
  ELEMENT_NODE:  1,
  TEXT_NODE:     3
});

/**
 * TextNode to contain a text element in DOM tree.
 * @param {string} value [description]
 */
function TextNode(value) {
  this.rawText = value;
}
$inherit(TextNode, Node, {
  /**
   * Node Type declaration.
   * @type {Number}
   */
  nodeType: Node.TEXT_NODE
});

/**
 * HTMLElement, which contains a set of children.
 * Note: this is a minimalist implementation, no complete tree
 *   structure provided (no parentNode, nextSibling,
 *   previousSibling etc).
 * @param {string} name     tagName
 * @param {Object} keyAttrs id and class attribute
 * @param {Object} rawAttrs attributes in string
 */
function HTMLElement(name, keyAttrs, rawAttrs) {
  this.tagName = name;
  this.rawAttrs = rawAttrs || '';
  this.childNodes = [];
  if (keyAttrs.id)
    this.id = keyAttrs.id;
}
$inherit(HTMLElement, Node, {
  /**
   * Node Type declaration.
   * @type {Number}
   */
  nodeType: Node.ELEMENT_NODE,
  /**
   * Get unescaped text value of current node and its children.
   * @return {string} text content
   */

  /**
   * Get escpaed (as-it) text value of current node and its children.
   * @return {string} text content
   */
  get rawText() {
    var res = '';
    for (var i = 0; i < this.childNodes.length; i++)
      res += this.childNodes[i].rawText;
    return res;
  },

  /**
   * Append a child node to childNodes
   * @param  {Node} node node to append
   * @return {Node}      node appended
   */
  appendChild: function(node) {
    // node.parentNode = this;
    this.childNodes.push(node);
    return node;
  },
  /**
   * Get attributes
   * @return {Object} parsed and unescaped attributes
   */
  get attributes() {
    if (this._attrs)
      return this._attrs;
    this._attrs = {};
    var attrs = this.rawAttributes;
    for (var key in attrs) {
      this._attrs[key] = entities.decodeHTML5(attrs[key]);
    }
    return this._attrs;
  },

  /**
   * Get escaped (as-it) attributes
   * @return {Object} parsed attributes
   */
  get rawAttributes() {
    if (this._rawAttrs)
      return this._rawAttrs;
    var attrs = {};
    if (this.rawAttrs) {
      var re = /\b([_a-z][a-z0-9\-]*)\s*=\s*("([^"]+)"|'([^']+)'|(\S+))/ig;
      for (var match; match = re.exec(this.rawAttrs); )
        attrs[match[1]] = match[3] || match[4] || match[5];
    }
    this._rawAttrs = attrs;
    return attrs;
  }
});
$define(HTMLElement, {});

// parser states
var INITIAL = 'INITIAL';
var TAG_OPENED = 'TAG_OPENED';
var READ_TAG_NAME = 'READ_TAG_NAME';
var READ_ATTRIBUTES = 'READ_ATTRIBUTES';
var IS_SELF_CLOSING = 'IS_SELF_CLOSING';
var TAG_CLOSE = 'TAG_CLOSE';

var kMarkupPattern = (function () {
    var lastIndex = 0;

    function makeState(state, match, bracketStack ) {
      return {
          state: state,
          match: match,
          bracketStack: bracketStack
      };
    }

    function initial(match, sym, index) {
        if (sym === '<' ) {
            match['index'] = index;
            return makeState(TAG_OPENED, match, 1);
        }

        return makeState(INITIAL, match, 0);
    }

    function tagOpened(match, sym) {
        if (sym === '!') {
            return makeState(INITIAL, match, 0);
        }

        if (sym === '/') {
            match[1] = '/';
        } else {
            match[2] += sym;
        }

        return makeState(READ_TAG_NAME, match, 1);
    }

    function readTagName(match, sym) {
        switch (sym) {
            case ' ':
                return makeState(READ_ATTRIBUTES, match, 1);
            case '/':
                return makeState(IS_SELF_CLOSING, match, 1);
            case '>':
                return makeState(TAG_CLOSE, match, 1);
            default:
                match[2] += sym;
                return makeState(READ_TAG_NAME, match, 1);
        }
    }

    function readAttributes(match, sym, bracketStack) {
        switch (sym) {
            case '/':
                if (bracketStack === 1) {
                    return makeState(IS_SELF_CLOSING, match, bracketStack);
                }

                match[3] += sym;
                return makeState(READ_ATTRIBUTES, match, bracketStack);
            case '>':
                if (--bracketStack) {
                    match[3] += sym;
                    return makeState(READ_ATTRIBUTES, match, bracketStack);
                }

                return makeState(TAG_CLOSE, match, bracketStack);
            case '<':
                ++bracketStack;
            default:
                match[3] += sym;
                return makeState(READ_ATTRIBUTES, match, bracketStack);
        }
    }

    function isSelfClosing(match, sym) {
        if (sym === '>') {
            match[4] = '/';
            return makeState(TAG_CLOSE, match, 0);
        }

        match[3] += '/' + sym;
        return makeState(READ_ATTRIBUTES, match, 1);
    }

    function tagClose(match, str, index) {
        lastIndex = index;
        match[0] = str.slice(match['index'], index);

        return makeState(INITIAL, match, 0);
    }

    return {
        exec: function (str) {
            var state = {
                state: INITIAL,
                match: ['', '', '', '', ''],
                bracketStack: 0
            };
            state.match['input'] = str;

            for (var i = lastIndex; i < str.length; ++i) {
                switch (state.state) {
                    case INITIAL:
                        state = initial(state.match, str[i], i);
                        break;
                    case TAG_OPENED:
                        state = tagOpened(state.match, str[i]);
                        break;
                    case READ_TAG_NAME:
                        state = readTagName(state.match, str[i]);
                        break;
                    case READ_ATTRIBUTES:
                        state = readAttributes(state.match, str[i], state.bracketStack);
                        break;
                    case IS_SELF_CLOSING:
                        state = isSelfClosing(state.match, str[i]);
                        break;
                    case TAG_CLOSE:
                        state = tagClose(state.match, str, i);
                        return state.match;
                    default:
                          break;
                }
            }
            if (state.state === TAG_CLOSE) {
                state = tagClose(state.match, str, str.length);
                return state.match;
            }

            lastIndex = 0;
            return null;
        },
        get lastIndex() {
          return lastIndex;
        },
        set lastIndex(newLastIndex) {
            lastIndex = newLastIndex;
        }
    }
})();

var kAttributePattern = /\b(id|class)\s*=\s*("([^"]+)"|'([^']+)'|(\S+))/ig;
var kSelfClosingElements = {
  meta: true,
  img: true,
  link: true,
  input: true,
  area: true,
  br: true,
  hr: true,
  wbr: true,
  col: true
};
var kElementsClosedByOpening = {
  li: {li: true},
  p: {p: true, div: true},
  td: {td: true, th: true},
  th: {td: true, th: true}
};
var kElementsClosedByClosing = {
  li: {ul: true, ol: true},
  a: {div: true},
  b: {div: true},
  i: {div: true},
  p: {div: true},
  td: {tr: true, table: true},
  th: {tr: true, table: true}
};
var kBlockTextElements = {
  script: true,
  noscript: true,
  style: true,
  pre: true
};

/**
 * Parses HTML and returns a root element
 */
module.exports = {

  Node: Node,
  HTMLElement: HTMLElement,
  TextNode: TextNode,

  /**
   * Parse a chuck of HTML source.
   * @param  {string} data      html
   * @return {HTMLElement}      root element
   */
  parse: function(data, options) {

    var root = new HTMLElement(null, {});
    var currentParent = root;
    var stack = [root];
    var lastTextPos = -1;

    options = options || {};

    for (var match, text; match = kMarkupPattern.exec(data); ) {
      if (lastTextPos > -1) {
        if (lastTextPos + match[0].length < kMarkupPattern.lastIndex) {
          // if has content
          text = data.substring(lastTextPos, kMarkupPattern.lastIndex - match[0].length);
          currentParent.appendChild(new TextNode(text));
        }
      }
      lastTextPos = kMarkupPattern.lastIndex;
      if (match[0][1] == '!') {
        // this is a comment
        continue;
      }
      if (options.lowerCaseTagName)
        match[2] = match[2].toLowerCase();
      if (!match[1]) {
        // not </ tags
        var attrs = {};
        for (var attMatch; attMatch = kAttributePattern.exec(match[3]); )
          attrs[attMatch[1]] = attMatch[3] || attMatch[4] || attMatch[5];
        // console.log(attrs);
        if (!match[4] && kElementsClosedByOpening[currentParent.tagName]) {
          if (kElementsClosedByOpening[currentParent.tagName][match[2]]) {
            stack.pop();
            currentParent = stack.back;
          }
        }
        currentParent = currentParent.appendChild(
            new HTMLElement(match[2], attrs, match[3]));
        stack.push(currentParent);
        if (kBlockTextElements[match[2]]) {
          // a little test to find next </script> or </style> ...
          var closeMarkup = '</' + match[2] + '>';
          var index = data.indexOf(closeMarkup, kMarkupPattern.lastIndex);
          if (options[match[2]]) {
            if (index == -1) {
              // there is no matching ending for the text element.
              text = data.substr(kMarkupPattern.lastIndex);
            } else {
              text = data.substring(kMarkupPattern.lastIndex, index);
            }
            if (text.length > 0)
              currentParent.appendChild(new TextNode(text));
          }
          if (index == -1) {
            lastTextPos = kMarkupPattern.lastIndex = data.length + 1;
          } else {
            lastTextPos = kMarkupPattern.lastIndex = index + closeMarkup.length;
            match[1] = true;
          }
        }
      }
      if (match[1] || match[4] ||
          kSelfClosingElements[match[2]]) {
        // </ or /> or <br> etc.
        while (true) {
          if (currentParent.tagName == match[2]) {
            stack.pop();
            currentParent = stack.back;
            break;
          } else {
            // Trying to close current tag, and move on
            if (kElementsClosedByClosing[currentParent.tagName]) {
              if (kElementsClosedByClosing[currentParent.tagName][match[2]]) {
                stack.pop();
                currentParent = stack.back;
                continue;
              }
            }
            // Use aggressive strategy to handle unmatching markups.
            break;
          }
        }
      }
    }

    return root;

  }

};
