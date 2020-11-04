import HTMLElement from './nodes/html';

interface MatherFunction {
	func(el: HTMLElement, tagName: string, classes: string[] | string, attr_key: string, value: string): boolean;
	tagName: string;
	classes: string | string[];
	attr_key: string;
	value: string;
}

/**
 * Cache to store generated match functions
 * @type {Object}
 */
let pMatchFunctionCache = {} as { [name: string]: MatherFunction };

function compare_tagname(tag1: string, tag2: string) {
	if (!tag1) {
		return !tag2;
	}
	if (!tag2) {
		return !tag1;
	}
	return tag1.toLowerCase() === tag2.toLowerCase();
}

/**
 * Function cache
 */
const functionCache = {
	f145(el: HTMLElement, tagName: string, classes: string[]) {
		'use strict';
		tagName = tagName || '';
		classes = classes || [];
		if (el.id !== tagName.substr(1)) {
			return false;
		}
		for (let cls = classes, i = 0; i < cls.length; i++) {
			if (el.classNames.indexOf(cls[i]) === -1) {
				return false;
			}
		}
		return true;
	},
	f45(el: HTMLElement, tagName: string, classes: string[]) {
		'use strict';
		tagName = tagName || '';
		classes = classes || [];
		for (let cls = classes, i = 0; i < cls.length; i++) {
			if (el.classNames.indexOf(cls[i]) === -1) {
				return false;
			}
		}
		return true;
	},
	f15(el: HTMLElement, tagName: string) {
		'use strict';
		tagName = tagName || '';
		if (el.id !== tagName.substr(1)) {
			return false;
		}
		return true;
	},
	f1(el: HTMLElement, tagName: string) {
		'use strict';
		tagName = tagName || '';
		if (el.id !== tagName.substr(1)) {
			return false;
		}
	},
	f5() {
		'use strict';
		return true;
	},
	f55(el: HTMLElement, tagName: string, classes: string[], attr_key: string) {
		'use strict';
		tagName = tagName || '';
		classes = classes || [];
		attr_key = attr_key || '';
		const attrs = el.attributes;
		return attrs.hasOwnProperty(attr_key);
	},
	f245(el: HTMLElement, tagName: string, classes: string[], attr_key: string, value: string) {
		'use strict';
		tagName = tagName || '';
		classes = classes || [];
		attr_key = (attr_key || '').toLowerCase();
		value = value || '';
		const attrs = el.attributes;
		return Object.keys(attrs).some((key) => {
			const val = attrs[key];
			return key.toLowerCase() === attr_key && val === value;
		});
		// for (let cls = classes, i = 0; i < cls.length; i++) {if (el.classNames.indexOf(cls[i]) === -1){ return false;}}
		// return true;
	},
	f25(el: HTMLElement, tagName: string, classes: string[], attr_key: string, value: string) {
		'use strict';
		tagName = tagName || '';
		classes = classes || [];
		attr_key = (attr_key || '').toLowerCase();
		value = value || '';
		const attrs = el.attributes;
		return Object.keys(attrs).some((key) => {
			const val = attrs[key];
			return key.toLowerCase() === attr_key && val === value;
		});
		// return true;
	},
	f2(el: HTMLElement, tagName: string, classes: string[], attr_key: string, value: string) {
		'use strict';
		tagName = tagName || '';
		classes = classes || [];
		attr_key = (attr_key || '').toLowerCase();
		value = value || '';
		const attrs = el.attributes;
		return Object.keys(attrs).some((key) => {
			const val = attrs[key];
			return key.toLowerCase() === attr_key && val === value;
		});
	},
	f345(el: HTMLElement, tagName: string, classes: string[]) {
		'use strict';
		tagName = tagName || '';
		classes = classes || [];
		if (!compare_tagname(el.tagName, tagName)) {
			return false;
		}
		for (let cls = classes, i = 0; i < cls.length; i++) {
			if (el.classNames.indexOf(cls[i]) === -1) {
				return false;
			}
		}
		return true;
	},
	f35(el: HTMLElement, tagName: string) {
		'use strict';
		tagName = tagName || '';
		return compare_tagname(el.tagName, tagName);
	},
	f3(el: HTMLElement, tagName: string) {
		'use strict';
		tagName = tagName || '';
		// if (el.tagName !== tagName) {
		// 	return false;
		// }
		return compare_tagname(el.tagName, tagName);
	}
};

/**
 * Matcher class to make CSS match
 *
 * @class Matcher
 */
export default class Matcher {
	private matchers: MatherFunction[];
	private nextMatch = 0;
	/**
	 * Creates an instance of Matcher.
	 * @param {string} selector
	 *
	 * @memberof Matcher
	 */
	public constructor(selector: string) {
		this.matchers = selector.split(' ').map((matcher) => {
			if (pMatchFunctionCache[matcher]) {
				return pMatchFunctionCache[matcher];
			}
			const parts = matcher.split('.');
			const tagName = parts[0];
			const classes = parts.slice(1).sort();
			// let source = '"use strict";';
			let function_name = 'f';
			let attr_key = '';
			let value = '';
			if (tagName && tagName !== '*') {
				if (tagName.startsWith('#')) {
					// source += 'if (el.id != ' + JSON.stringify(tagName.substr(1)) + ') return false;';// 1
					function_name += '1';
				} else {
					const reg = /\[\s*([\w-]+)(\s*=\s*(((?<quote>'|")\s*(.*)(\k<quote>))|(\S*)))?\s*\]/.exec(tagName);
					if (reg) {
						attr_key = reg[1];
						value = reg[6] || reg[8];

						// source += `let attrs = el.attributes;for (let key in attrs){const val = attrs[key]; if (key == "${attr_key}" && val == "${value}"){return true;}} return false;`;// 2
						function_name += '2';
					} else {
						// source += 'if (el.tagName != ' + JSON.stringify(tagName) + ') return false;';// 3
						function_name += '3';
					}
				}
			}
			if (classes.length > 0) {
				// source += 'for (let cls = ' + JSON.stringify(classes) + ', i = 0; i < cls.length; i++) if (el.classNames.indexOf(cls[i]) === -1) return false;';// 4
				function_name += '4';
			}
			// source += 'return true;';// 5
			function_name += '5';
			const obj = {
				func: functionCache[function_name] as (el: HTMLElement, tagName: string, classes: string | string[], attr_key: string, value: string) => boolean,
				tagName: tagName || '',
				classes: classes || '',
				attr_key: attr_key || '',
				value: value || ''
			} as MatherFunction;
			// source = source || '';
			return (pMatchFunctionCache[matcher] = obj);
		});
	}
	/**
	 * Trying to advance match pointer
	 * @param  {HTMLElement} el element to make the match
	 * @return {bool}           true when pointer advanced.
	 */
	public advance(el: HTMLElement) {
		if (this.nextMatch < this.matchers.length &&
			this.matchers[this.nextMatch].func(el, this.matchers[this.nextMatch].tagName, this.matchers[this.nextMatch].classes, this.matchers[this.nextMatch].attr_key, this.matchers[this.nextMatch].value)) {
			this.nextMatch++;
			return true;
		}
		return false;
	}
	/**
	 * Rewind the match pointer
	 */
	public rewind() {
		this.nextMatch--;
	}
	/**
	 * Trying to determine if match made.
	 * @return {bool} true when the match is made
	 */
	public get matched() {
		return this.nextMatch === this.matchers.length;
	}
	/**
	 * Rest match pointer.
	 * @return {[type]} [description]
	 */
	public reset() {
		this.nextMatch = 0;
	}
	/**
	 * flush cache to free memory
	 */
	public flushCache() {
		pMatchFunctionCache = {};
	}
}
