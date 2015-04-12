require('apollojs');

var entities = require('entities');

/**
 * Node Class as base class for TextNode and HTMLElement.
 */
function Node() {

}
$declare(Node, {

});
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
  nodeType: Node.TEXT_NODE,

  /**
   * Get unescaped text value of current node and its children.
   * @return {string} text content
   */
  get text() {
    return entities.decodeHTML5(this.rawText);
  },

  /**
   * Detect if the node contains only white space.
   * @return {bool}
   */
  get isWhitespace() {
    return /^(\s|&nbsp;)*$/.test(this.rawText);
  }

});

var kBlockElements = {
  div: true,
  p: true,
  // ul: true,
  // ol: true,
  li: true,
  // table: true,
  // tr: true,
  td: true,
  section: true,
  br: true
};

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
  // this.parentNode = null;
  this.childNodes = [];
  if (keyAttrs.id)
    this.id = keyAttrs.id;
  if (keyAttrs.class)
    this.classNames = keyAttrs.class.split(/\s+/);
  else
    this.classNames = [];
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
  get text() {
    return entities.decodeHTML5(this.rawText);
  },

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
   * Get structured Text (with '\n' etc.)
   * @return {string} structured text
   */
  get structuredText() {
    var currentBlock = [];
    var blocks = [currentBlock];
    function dfs(node) {
      if (node.nodeType === Node.ELEMENT_NODE) {
        if (kBlockElements[node.tagName]) {
          if (currentBlock.length > 0)
            blocks.push(currentBlock = []);
          node.childNodes.forEach(dfs);
          if (currentBlock.length > 0)
            blocks.push(currentBlock = []);
        } else {
          node.childNodes.forEach(dfs);
        }
      } else if (node.nodeType === Node.TEXT_NODE) {
        if (node.isWhitespace) {
          // Whitespace node, postponed output
          currentBlock.prependWhitespace = true;
        } else {
          var text = node.text;
          if (currentBlock.prependWhitespace) {
            text = ' ' + text;
            currentBlock.prependWhitespace = false;
          }
          currentBlock.push(text);
        }
      }
    }
    dfs(this);
    return blocks
        .map(function(block) {
          // Normalize each line's whitespace
          return block.join('').trim().replace(/\s{2,}/g, ' ');
        })
        .join('\n').trimRight();
  },

  /**
   * Trim element from right (in block) after seeing pattern in a TextNode.
   * @param  {RegExp} pattern pattern to find
   * @return {HTMLElement}    reference to current node
   */
  trimRight: function(pattern) {
    function dfs(node) {
      for (var i = 0; i < node.childNodes.length; i++) {
        var childNode = node.childNodes[i];
        if (childNode.nodeType === Node.ELEMENT_NODE) {
          dfs(childNode);
        } else {
          var index = childNode.rawText.search(pattern);
          if (index > -1) {
            childNode.rawText = childNode.rawText.substr(0, index);
            // trim all following nodes.
            node.childNodes.length = i+1;
          }
        }
      }
    }
    dfs(this);
    return this;
  },

  /**
   * Get DOM structure
   * @return {string} strucutre
   */
  get structure() {
    var res = [];
    var indention = 0;
    function write(str) {
      res.push('  '.repeat(indention) + str);
    }
    function dfs(node) {
      var idStr = node.id ? ('#' + node.id) : '';
      var classStr = node.classNames.length ? ('.' + node.classNames.join('.')) : '';
      write(node.tagName + idStr + classStr);
      indention++;
      for (var i = 0; i < node.childNodes.length; i++) {
        var childNode = node.childNodes[i];
        if (childNode.nodeType === Node.ELEMENT_NODE) {
          dfs(childNode);
        } else if (childNode.nodeType === Node.TEXT_NODE) {
          if (!childNode.isWhitespace)
            write('#text');
        }
      }
      indention--;
    }
    dfs(this);
    return res.join('\n');
  },

  /**
   * Remove whitespaces in this sub tree.
   * @return {HTMLElement} pointer to this
   */
  removeWhitespace: function() {
    var i = 0, o = 0;
    for (; i < this.childNodes.length; i++) {
      var node = this.childNodes[i];
      if (node.nodeType === Node.TEXT_NODE) {
        if (node.isWhitespace)
          continue;
        node.rawText = node.rawText.trim();
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        node.removeWhitespace();
      }
      this.childNodes[o++] = node;
    }
    this.childNodes.length = o;
    return this;
  },

  /**
   * Query CSS selector to find matching nodes.
   * @param  {string}         selector Simplified CSS selector
   * @param  {Matcher}        selector A Matcher instance
   * @return {HTMLElement[]}  matching elements
   */
  querySelectorAll: function(selector) {
    var matcher;
    if (selector instanceof Matcher) {
      matcher = selector;
      matcher.reset();
    } else {
      matcher = new Matcher(selector);
    }
    var res = [];
    var stack = [];
    for (var i = 0; i < this.childNodes.length; i++) {
      stack.push([this.childNodes[i], 0, false]);
      while (stack.length) {
        var state = stack.back;
        var el = state[0];
        if (state[1] === 0) {
          // Seen for first time.
          if (el.nodeType !== Node.ELEMENT_NODE) {
            stack.pop();
            continue;
          }
          if (state[2] = matcher.advance(el)) {
            if (matcher.matched) {
              res.push(el);
              // no need to go further.
              matcher.rewind();
              stack.pop();
              continue;
            }
          }
        }
        if (state[1] < el.childNodes.length) {
          stack.push([el.childNodes[state[1]++], 0, false]);
        } else {
          if (state[2])
            matcher.rewind();
          stack.pop();
        }
      }
    }
    return res;
  },

  /**
   * Query CSS Selector to find matching node.
   * @param  {string}         selector Simplified CSS selector
   * @param  {Matcher}        selector A Matcher instance
   * @return {HTMLElement}    matching node
   */
  querySelector: function(selector) {
    var matcher;
    if (selector instanceof Matcher) {
      matcher = selector;
      matcher.reset();
    } else {
      matcher = new Matcher(selector);
    }
    var stack = [];
    for (var i = 0; i < this.childNodes.length; i++) {
      stack.push([this.childNodes[i], 0, false]);
      while (stack.length) {
        var state = stack.back;
        var el = state[0];
        if (state[1] === 0) {
          // Seen for first time.
          if (el.nodeType !== Node.ELEMENT_NODE) {
            stack.pop();
            continue;
          }
          if (state[2] = matcher.advance(el)) {
            if (matcher.matched) {
              return el;
            }
          }
        }
        if (state[1] < el.childNodes.length) {
          stack.push([el.childNodes[state[1]++], 0, false]);
        } else {
          if (state[2])
            matcher.rewind();
          stack.pop();
        }
      }
    }
    return null;
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
   * Get first child node
   * @return {Node} first child node
   */
  get firstChild() {
    return this.childNodes.front;
  },

  /**
   * Get last child node
   * @return {Node} last child node
   */
  get lastChild() {
    return this.childNodes.back;
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
      var re = /\b([a-z][a-z0-9\-]*)\s*=\s*("([^"]+)"|'([^']+)'|(\S+))/ig;
      for (var match; match = re.exec(this.rawAttrs); )
        attrs[match[1]] = match[3] || match[4] || match[5];
    }
    this._rawAttrs = attrs;
    return attrs;
  }

});
$define(HTMLElement, {
  __wrap: function(el) {
    el.childNodes.forEach(function(node) {
      if (node.rawText) {
        $wrap(node, TextNode);
      } else {
        $wrap(node, HTMLElement);
      }
    });
  }
});

/**
 * Cache to store generated match functions
 * @type {Object}
 */
var pMatchFunctionCache = {};

/**
 * Matcher class to make CSS match
 * @param {string} selector Selector
 */
function Matcher(selector) {
  this.matchers = selector.split(' ').map(function(matcher) {
    if (pMatchFunctionCache[matcher])
      return pMatchFunctionCache[matcher];
    var parts = matcher.split('.');
    var tagName = parts[0];
    var classes = parts.slice(1).sort();
    var source = '';
    if (tagName && tagName != '*') {
      if (tagName[0] == '#')
        source += 'if (el.id != ' + JSON.stringify(tagName.substr(1)) + ') return false;';
      else
        source += 'if (el.tagName != ' + JSON.stringify(tagName) + ') return false;';
    }
    if (classes.length > 0)
      source += 'for (var cls = ' + JSON.stringify(classes) + ', i = 0; i < cls.length; i++) if (el.classNames.indexOf(cls[i]) === -1) return false;';
    source += 'return true;';
    return pMatchFunctionCache[matcher] = new Function('el', source);
  });
  this.nextMatch = 0;
}
$declare(Matcher, {
  /**
   * Trying to advance match pointer
   * @param  {HTMLElement} el element to make the match
   * @return {bool}           true when pointer advanced.
   */
  advance: function(el) {
    if (this.nextMatch < this.matchers.length &&
        this.matchers[this.nextMatch](el)) {
      this.nextMatch++;
      return true;
    }
    return false;
  },
  /**
   * Rewind the match pointer
   */
  rewind: function() {
    this.nextMatch--;
  },
  /**
   * Trying to determine if match made.
   * @return {bool} true when the match is made
   */
  get matched() {
    return this.nextMatch == this.matchers.length;
  },
  /**
   * Rest match pointer.
   * @return {[type]} [description]
   */
  reset: function() {
    this.nextMatch = 0;
  }
});
$define(Matcher, {
  /**
   * flush cache to free memory
   */
  flushCache: function() {
    pMatchFunctionCache = {};
  }
});

var kMarkupPattern = /<!--[^]*?(?=-->)-->|<(\/?)([a-z][a-z0-9]*)\s*([^>]*?)(\/?)>/ig;
var kAttributePattern = /\b(id|class)\s*=\s*("([^"]+)"|'([^']+)'|(\S+))/ig;
var kSelfClosingElements = {
  meta: true,
  img: true,
  link: true,
  input: true,
  area: true,
  br: true,
  hr: true
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

  Matcher: Matcher,
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
