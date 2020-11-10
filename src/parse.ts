import arr_back from './back';
import { base_parse, Options } from './nodes/html';

/**
 * Parses HTML and returns a root element
 * Parse a chuck of HTML source.
 */
export default function parse(data: string, options = { lowerCaseTagName: false, comment: false } as Partial<Options>) {
	const stack = base_parse(data, options);
	const [root] = stack;
	while (stack.length > 1) {
		// Handle each error elements.
		const last = stack.pop();
		const oneBefore = arr_back(stack);
		if (last.parentNode && last.parentNode.parentNode) {
			if (last.parentNode === oneBefore && last.tagName === oneBefore.tagName) {
				// Pair error case <h3> <h3> handle : Fixes to <h3> </h3>
				oneBefore.removeChild(last);
				last.childNodes.forEach((child) => {
					oneBefore.parentNode.appendChild(child);
				});
				stack.pop();
			} else {
				// Single error  <div> <h3> </div> handle: Just removes <h3>
				oneBefore.removeChild(last);
				last.childNodes.forEach((child) => {
					oneBefore.appendChild(child);
				});
			}
		} else {
			// If it's final element just skip.
		}
	}
	// response.childNodes.forEach((node) => {
	// 	if (node instanceof HTMLElement) {
	// 		node.parentNode = null;
	// 	}
	// });
	return root;
}
