import CommentNode from './nodes/comment';
import HTMLElement, { Options } from './nodes/html';
import Node from './nodes/node';
import TextNode from './nodes/text';
import NodeType from './nodes/type';
import baseParse from './parse';
import valid from './valid';

export { Options } from './nodes/html';
export {
	parse,
	HTMLElement,
	CommentNode,
	valid,
	Node,
	TextNode,
	NodeType
};

export default function parse(data: string, options = {
	lowerCaseTagName: false,
	comment: false
} as Partial<Options>) {
	return baseParse(data, options);
}

parse.parse = baseParse;
parse.HTMLElement = HTMLElement;
parse.CommentNode = CommentNode;
parse.valid = valid;
parse.Node = Node;
parse.TextNode = TextNode;
parse.NodeType = NodeType;
