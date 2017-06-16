import { decode } from 'he';

export enum NodeType {
	ELEMENT_NODE = 1,
	TEXT_NODE = 3
}

/**
 * Node Class as base class for TextNode and HTMLElement.
 */
export abstract class Node {
	nodeType: NodeType;
	childNodes = [] as Node[];
	text: string;
	rawText: string;
	abstract toString(): String;
}
/**
 * TextNode to contain a text element in DOM tree.
 * @param {string} value [description]
 */
export class TextNode extends Node {
	constructor(value: string) {
		super();
		this.rawText = value;
	}

	/**
	 * Node Type declaration.
	 * @type {Number}
	 */
	nodeType = NodeType.TEXT_NODE;

	/**
	 * Get unescaped text value of current node and its children.
	 * @return {string} text content
	 */
	get text() {
		return decode(this.rawText);
	}

	/**
	 * Detect if the node contains only white space.
	 * @return {bool}
	 */
	get isWhitespace() {
		return /^(\s|&nbsp;)*$/.test(this.rawText);
	}

	toString() {
		return this.text;
	}
}

const kBlockElements = {
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

export interface KeyAttributes {
	id?: string;
	class?: string;
}

export interface Attributes {
	[key: string]: string;
}

export interface RawAttributes {
	[key: string]: string;
}

function arr_back<T>(arr: T[]) {
	return arr[arr.length - 1];
}

/**
 * HTMLElement, which contains a set of children.
 *
 * Note: this is a minimalist implementation, no complete tree
 *   structure provided (no parentNode, nextSibling,
 *   previousSibling etc).
 * @class HTMLElement
 * @extends {Node}
 */
export class HTMLElement extends Node {
	private _attrs: Attributes;
	private _rawAttrs: RawAttributes;
	id: string;
	classNames = [] as string[];
	tagName: string;
	rawAttrs: string;
	/**
	 * Node Type declaration.
	 * @type {Number}
	 */
	nodeType = NodeType.ELEMENT_NODE;
	/**
	 * Creates an instance of HTMLElement.
	 * @param {string} name				tagName
	 * @param {KeyAttributes} keyAttrs	id and class attribute
	 * @param {string} [rawAttrs]	attributes in string
	 *
	 * @memberof HTMLElement
	 */
	constructor(name: string, keyAttrs: KeyAttributes, rawAttrs?: string) {
		super();
		this.tagName = name;
		this.rawAttrs = rawAttrs || '';
		// this.parentNode = null;
		this.childNodes = [];
		if (keyAttrs.id) {
			this.id = keyAttrs.id;
		}
		if (keyAttrs.class) {
			this.classNames = keyAttrs.class.split(/\s+/);
		}
	}
	/**
	 * Get escpaed (as-it) text value of current node and its children.
	 * @return {string} text content
	 */
	get rawText() {
		let res = '';
		for (let i = 0; i < this.childNodes.length; i++)
			res += this.childNodes[i].rawText;
		return res;
	}
	/**
	 * Get unescaped text value of current node and its children.
	 * @return {string} text content
	 */
	get text() {
		return decode(this.rawText);
	}
	/**
	 * Get structured Text (with '\n' etc.)
	 * @return {string} structured text
	 */
	get structuredText() {
		let currentBlock = [] as string[];
		const blocks = [currentBlock];
		function dfs(node: Node) {
			if (node.nodeType === NodeType.ELEMENT_NODE) {
				if (kBlockElements[(node as HTMLElement).tagName]) {
					if (currentBlock.length > 0) {
						blocks.push(currentBlock = []);
					}
					node.childNodes.forEach(dfs);
					if (currentBlock.length > 0) {
						blocks.push(currentBlock = []);
					}
				} else {
					node.childNodes.forEach(dfs);
				}
			} else if (node.nodeType === NodeType.TEXT_NODE) {
				if ((node as TextNode).isWhitespace) {
					// Whitespace node, postponed output
					(currentBlock as any).prependWhitespace = true;
				} else {
					let text = node.text;
					if ((currentBlock as any).prependWhitespace) {
						text = ' ' + text;
						(currentBlock as any).prependWhitespace = false;
					}
					currentBlock.push(text);
				}
			}
		}
		dfs(this);
		return blocks
			.map(function (block) {
				// Normalize each line's whitespace
				return block.join('').trim().replace(/\s{2,}/g, ' ');
			})
			.join('\n').replace(/\s+$/, '');	// trimRight;
	}

	toString() {
		const tag = this.tagName;
		if (tag) {
			const is_un_closed = /^meta$/i.test(tag);
			const is_self_closed = /^(img|br|hr|area|base|input|doctype|link)$/i.test(tag);
			const attrs = this.rawAttrs ? ' ' + this.rawAttrs : '';
			if (is_un_closed) {
				return `<${tag}${attrs}>`;
			} else if (is_self_closed) {
				return `<${tag}${attrs} />`;
			} else {
				return `<${tag}${attrs}>${this.innerHTML}</${tag}>`;
			}
		} else {
			return this.innerHTML;
		}
	}

	get innerHTML() {
		return this.childNodes.map((child) => {
			return child.toString();
		}).join('');
	}

	set_content(content: string | Node | Node[]) {
		if (content instanceof Node) {
			content = [content];
		} else if (typeof content == 'string') {
			const r = parse(content);
			content = r.childNodes.length ? r.childNodes : [new TextNode(content)];
		}
		this.childNodes = content;
	}

	get outerHTML() {
		return this.toString();
	}

	/**
	 * Trim element from right (in block) after seeing pattern in a TextNode.
	 * @param  {RegExp} pattern pattern to find
	 * @return {HTMLElement}    reference to current node
	 */
	trimRight(pattern: RegExp) {
		function dfs(node: Node) {
			for (let i = 0; i < node.childNodes.length; i++) {
				const childNode = node.childNodes[i];
				if (childNode.nodeType === NodeType.ELEMENT_NODE) {
					dfs(childNode);
				} else {
					const index = childNode.rawText.search(pattern);
					if (index > -1) {
						childNode.rawText = childNode.rawText.substr(0, index);
						// trim all following nodes.
						node.childNodes.length = i + 1;
					}
				}
			}
		}
		dfs(this);
		return this;
	}
	/**
	 * Get DOM structure
	 * @return {string} strucutre
	 */
	get structure() {
		const res = [] as string[];
		let indention = 0;
		function write(str: string) {
			res.push('  '.repeat(indention) + str);
		}
		function dfs(node: HTMLElement) {
			const idStr = node.id ? ('#' + node.id) : '';
			const classStr = node.classNames.length ? ('.' + node.classNames.join('.')) : '';
			write(node.tagName + idStr + classStr);
			indention++;
			for (let i = 0; i < node.childNodes.length; i++) {
				const childNode = node.childNodes[i];
				if (childNode.nodeType === NodeType.ELEMENT_NODE) {
					dfs(childNode as HTMLElement);
				} else if (childNode.nodeType === NodeType.TEXT_NODE) {
					if (!(childNode as TextNode).isWhitespace)
						write('#text');
				}
			}
			indention--;
		}
		dfs(this);
		return res.join('\n');
	}

	/**
	 * Remove whitespaces in this sub tree.
	 * @return {HTMLElement} pointer to this
	 */
	removeWhitespace() {
		let o = 0;
		for (let i = 0; i < this.childNodes.length; i++) {
			const node = this.childNodes[i];
			if (node.nodeType === NodeType.TEXT_NODE) {
				if ((node as TextNode).isWhitespace)
					continue;
				node.rawText = node.rawText.trim();
			} else if (node.nodeType === NodeType.ELEMENT_NODE) {
				(node as HTMLElement).removeWhitespace();
			}
			this.childNodes[o++] = node;
		}
		this.childNodes.length = o;
		return this;
	}

	/**
	 * Query CSS selector to find matching nodes.
	 * @param  {string}         selector Simplified CSS selector
	 * @param  {Matcher}        selector A Matcher instance
	 * @return {HTMLElement[]}  matching elements
	 */
	querySelectorAll(selector: string | Matcher) {
		let matcher: Matcher;
		if (selector instanceof Matcher) {
			matcher = selector;
			matcher.reset();
		} else {
			matcher = new Matcher(selector);
		}
		const res = [] as Node[];
		const stack = [] as { 0: Node; 1: 0 | 1; 2: boolean; }[];
		for (let i = 0; i < this.childNodes.length; i++) {
			stack.push([this.childNodes[i], 0, false]);
			while (stack.length) {
				const state = arr_back(stack);
				const el = state[0];
				if (state[1] === 0) {
					// Seen for first time.
					if (el.nodeType !== NodeType.ELEMENT_NODE) {
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
	}

	/**
	 * Query CSS Selector to find matching node.
	 * @param  {string}         selector Simplified CSS selector
	 * @param  {Matcher}        selector A Matcher instance
	 * @return {HTMLElement}    matching node
	 */
	querySelector(selector: string | Matcher) {
		let matcher: Matcher;
		if (selector instanceof Matcher) {
			matcher = selector;
			matcher.reset();
		} else {
			matcher = new Matcher(selector);
		}
		const stack = [] as { 0: Node; 1: 0 | 1; 2: boolean; }[];
		for (let i = 0; i < this.childNodes.length; i++) {
			stack.push([this.childNodes[i], 0, false]);
			while (stack.length) {
				const state = arr_back(stack);
				const el = state[0];
				if (state[1] === 0) {
					// Seen for first time.
					if (el.nodeType !== NodeType.ELEMENT_NODE) {
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
	}

	/**
	 * Append a child node to childNodes
	 * @param  {Node} node node to append
	 * @return {Node}      node appended
	 */
	appendChild(node: Node) {
		// node.parentNode = this;
		this.childNodes.push(node);
		return node;
	}

	/**
	 * Get first child node
	 * @return {Node} first child node
	 */
	get firstChild() {
		return this.childNodes[0];
	}

	/**
	 * Get last child node
	 * @return {Node} last child node
	 */
	get lastChild() {
		return arr_back(this.childNodes);
	}

	/**
	 * Get attributes
	 * @return {Object} parsed and unescaped attributes
	 */
	get attributes() {
		if (this._attrs)
			return this._attrs;
		this._attrs = {};
		const attrs = this.rawAttributes;
		for (const key in attrs) {
			this._attrs[key] = decode(attrs[key]);
		}
		return this._attrs;
	}

	/**
	 * Get escaped (as-it) attributes
	 * @return {Object} parsed attributes
	 */
	get rawAttributes() {
		if (this._rawAttrs)
			return this._rawAttrs;
		const attrs = {} as RawAttributes;
		if (this.rawAttrs) {
			const re = /\b([a-z][a-z0-9\-]*)\s*=\s*("([^"]+)"|'([^']+)'|(\S+))/ig;
			let match: RegExpExecArray;
			while (match = re.exec(this.rawAttrs)) {
				attrs[match[1]] = match[3] || match[4] || match[5];
			}
		}
		this._rawAttrs = attrs;
		return attrs;
	}
}

interface MatherFunction {
	(el: Node): boolean;
}

/**
 * Cache to store generated match functions
 * @type {Object}
 */
let pMatchFunctionCache = {} as { [name: string]: MatherFunction };
/**
 * Matcher class to make CSS match
 *
 * @class Matcher
 */
export class Matcher {
	private matchers: MatherFunction[];
	private nextMatch = 0;
	/**
	 * Creates an instance of Matcher.
	 * @param {string} selector
	 *
	 * @memberof Matcher
	 */
	constructor(selector: string) {
		this.matchers = selector.split(' ').map((matcher) => {
			if (pMatchFunctionCache[matcher])
				return pMatchFunctionCache[matcher];
			const parts = matcher.split('.');
			const tagName = parts[0];
			const classes = parts.slice(1).sort();
			let source = '';
			if (tagName && tagName != '*') {
				if (tagName[0] == '#')
					source += 'if (el.id != ' + JSON.stringify(tagName.substr(1)) + ') return false;';
				else
					source += 'if (el.tagName != ' + JSON.stringify(tagName) + ') return false;';
			}
			if (classes.length > 0)
				source += 'for (var cls = ' + JSON.stringify(classes) + ', i = 0; i < cls.length; i++) if (el.classNames.indexOf(cls[i]) === -1) return false;';
			source += 'return true;';
			return pMatchFunctionCache[matcher] = new Function('el', source) as MatherFunction;
		});
	}
	/**
	 * Trying to advance match pointer
	 * @param  {HTMLElement} el element to make the match
	 * @return {bool}           true when pointer advanced.
	 */
	advance(el: Node) {
		if (this.nextMatch < this.matchers.length &&
			this.matchers[this.nextMatch](el)) {
			this.nextMatch++;
			return true;
		}
		return false;
	}
	/**
	 * Rewind the match pointer
	 */
	rewind() {
		this.nextMatch--;
	}
	/**
	 * Trying to determine if match made.
	 * @return {bool} true when the match is made
	 */
	get matched() {
		return this.nextMatch == this.matchers.length;
	}
	/**
	 * Rest match pointer.
	 * @return {[type]} [description]
	 */
	reset() {
		this.nextMatch = 0;
	}
	/**
	 * flush cache to free memory
	 */
	flushCache() {
		pMatchFunctionCache = {};
	}
}

const kMarkupPattern = /<!--[^]*?(?=-->)-->|<(\/?)([a-z][a-z0-9]*)\s*([^>]*?)(\/?)>/ig;
const kAttributePattern = /\b(id|class)\s*=\s*("([^"]+)"|'([^']+)'|(\S+))/ig;
const kSelfClosingElements = {
	meta: true,
	img: true,
	link: true,
	input: true,
	area: true,
	br: true,
	hr: true
};
const kElementsClosedByOpening = {
	li: { li: true },
	p: { p: true, div: true },
	td: { td: true, th: true },
	th: { td: true, th: true }
};
const kElementsClosedByClosing = {
	li: { ul: true, ol: true },
	a: { div: true },
	b: { div: true },
	i: { div: true },
	p: { div: true },
	td: { tr: true, table: true },
	th: { tr: true, table: true }
};
const kBlockTextElements = {
	script: true,
	noscript: true,
	style: true,
	pre: true
};

/**
 * Parses HTML and returns a root element
 * Parse a chuck of HTML source.
 * @param  {string} data      html
 * @return {HTMLElement}      root element
 */
export function parse(data: string, options?: {
	lowerCaseTagName: boolean;
}) {
	const root = new HTMLElement(null, {});
	let currentParent = root;
	const stack = [root];
	let lastTextPos = -1;

	options = options || {} as any;
	let match: RegExpExecArray;
	while (match = kMarkupPattern.exec(data)) {
		if (lastTextPos > -1) {
			if (lastTextPos + match[0].length < kMarkupPattern.lastIndex) {
				// if has content
				const text = data.substring(lastTextPos, kMarkupPattern.lastIndex - match[0].length);
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
			for (var attMatch; attMatch = kAttributePattern.exec(match[3]);)
				attrs[attMatch[1]] = attMatch[3] || attMatch[4] || attMatch[5];
			// console.log(attrs);
			if (!match[4] && kElementsClosedByOpening[currentParent.tagName]) {
				if (kElementsClosedByOpening[currentParent.tagName][match[2]]) {
					stack.pop();
					currentParent = arr_back(stack);
				}
			}
			currentParent = currentParent.appendChild(
				new HTMLElement(match[2], attrs, match[3])) as HTMLElement;
			stack.push(currentParent);
			if (kBlockTextElements[match[2]]) {
				// a little test to find next </script> or </style> ...
				var closeMarkup = '</' + match[2] + '>';
				var index = data.indexOf(closeMarkup, kMarkupPattern.lastIndex);
				if (options[match[2]]) {
					let text: string;
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
					match[1] = 'true';
				}
			}
		}
		if (match[1] || match[4] ||
			kSelfClosingElements[match[2]]) {
			// </ or /> or <br> etc.
			while (true) {
				if (currentParent.tagName == match[2]) {
					stack.pop();
					currentParent = arr_back(stack);
					break;
				} else {
					// Trying to close current tag, and move on
					if (kElementsClosedByClosing[currentParent.tagName]) {
						if (kElementsClosedByClosing[currentParent.tagName][match[2]]) {
							stack.pop();
							currentParent = arr_back(stack);
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
