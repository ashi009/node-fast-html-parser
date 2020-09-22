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
}
