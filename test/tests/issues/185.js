const { parse } = require('@test/test-target');

// https://github.com/taoqf/node-html-parser/issues/185
describe('previous sibling', function () {
	it('get previous sibling', function () {
		const root = parse('<div>ccc<a></a><b></b></div>');
		const a = root.querySelector('a');
		const b = root.querySelector('b');
		b.previousSibling.should.eql(a);
		should.notEqual(a.previousSibling, null);
	});

	it('get previous element sibling', function () {
		const root = parse('<div>ccc<a></a><b></b></div>');
		const a = root.querySelector('a');
		const b = root.querySelector('b');
		b.previousElementSibling.should.eql(a);
		should.equal(a.previousElementSibling, null);
	});
});
