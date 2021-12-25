const { parse } = require('@test/test-target');

describe('change tag name', function () {
	it('tagname should changed', function () {
		const html = `<foo></foo>`;
		const root = parse(html);
		root.firstChild.tagName = 'bar';
		root.toString().should.eql('<bar></bar>');
	});
	it('tagname should changed use uppercase name', function () {
		const html = `<foo></foo>`;
		const root = parse(html);
		root.firstChild.tagName = 'BAR';
		root.toString().should.eql('<bar></bar>');
	});
});
