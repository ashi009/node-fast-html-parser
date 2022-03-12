const { parse } = require('@test/test-target');

// https://github.com/taoqf/node-html-parser/issues/171
describe('appendChild', function () {
	it('node should not be it\' previous parent', function () {
		const root = parse('<a><b><d></d></b><c></c></a>');
		const d = root.querySelector('d');
		const c = root.querySelector('c');
		c.appendChild(d);
		root.toString().should.eql('<a><b></b><c><d></d></c></a>');
	});
});
