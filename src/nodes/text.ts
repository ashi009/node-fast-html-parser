import { decode } from 'he';
import NodeType from './type';
import Node from './node';
import HTMLElement from './html';
import { trimText } from '../utils';


/**
 * TextNode to contain a text element in DOM tree.
 * @param {string} value [description]
 */
export default class TextNode extends Node {
	public constructor(rawText: string, parentNode: HTMLElement) {
		super(parentNode);
		this._rawText = rawText;
	}

	/**
	 * Node Type declaration.
	 * @type {Number}
	 */
	public nodeType = NodeType.TEXT_NODE;

	private _rawText: string;
	private _trimmedRawText?: string;
	private _trimmedText?: string;

	public get rawText() {
	  return this._rawText;
  }

  /**
   * Set rawText and invalidate trimmed caches
   */
	public set rawText(text: string) {
	  this._rawText = text;
	  this._trimmedRawText = void 0;
	  this._trimmedText = void 0;
  }

	/**
	 * Returns raw text with all whitespace trimmed except single leading/trailing non-breaking space
	 */
	public get trimmedRawText() {
		if (this._trimmedRawText !== undefined) return this._trimmedRawText;
		this._trimmedRawText = trimText(this.rawText);
		return this._trimmedRawText;
	}

	/**
	 * Returns text with all whitespace trimmed except single leading/trailing non-breaking space
	 */
	public get trimmedText() {
		if (this._trimmedText !== undefined) return this._trimmedText;
		this._trimmedText = trimText(this.text);
		return this._trimmedText;
	}

	/**
	 * Get unescaped text value of current node and its children.
	 * @return {string} text content
	 */
	public get text() {
		return decode(this.rawText);
	}

	/**
	 * Detect if the node contains only white space.
	 * @return {boolean}
	 */
	public get isWhitespace() {
		return /^(\s|&nbsp;)*$/.test(this.rawText);
	}

	public toString() {
		return this.text;
	}
}
