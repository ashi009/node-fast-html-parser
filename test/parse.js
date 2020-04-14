const { parse } = require('../dist');

// https://github.com/taoqf/node-html-parser/issues/38
describe('HTML Parser', function () {
	it('should parse text element', function () {
		const root = parse('foo bar<div>aaa</div>');
		root.toString().should.eql('foo bar<div>aaa</div>');
	});
	it('should parse pure text element', function () {
		const root = parse('foo bar');
		root.toString().should.eql('foo bar');
	});
})
