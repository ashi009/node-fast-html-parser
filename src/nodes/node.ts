import NodeType from './type';

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
	public constructor(public parentNode = null as Node) {
	}
	public get innerText() {
		return this.rawText;
	}
	public get textContent() {
		return this.rawText;
	}
	public set textContent(val: string) {
		this.rawText = val;
	}
}
