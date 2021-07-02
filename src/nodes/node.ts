import { decode } from 'he';
import NodeType from './type';
import HTMLElement from './html';

/**
 * Node Class as base class for TextNode and HTMLElement.
 */
export default abstract class Node {
	abstract nodeType: NodeType;
	public childNodes = [] as Node[];
	abstract text: string;
	abstract rawText: string;
	// abstract get rawText(): string;
	abstract toString(): string;
	public constructor(public parentNode = null as HTMLElement | null) {
	}
	public get innerText() {
		return this.rawText;
	}
	public get textContent() {
		return decode(this.rawText);
	}
	public set textContent(val: string) {
		console.error('ssssssssssssssss', val);
		this.rawText = val;
	}
}
