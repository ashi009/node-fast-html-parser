const { parse } = require('../dist');

// https://github.com/taoqf/node-html-parser/issues/70
describe('issues/70', function () {
	it('should parse element embed as selfclosed tag', function () {
		const html = `<html><meta property="og:type" content="product"></html>`;
		const root = parse(html);
		const el = root.querySelector('meta');
		el.getAttribute('property').should.eql('og:type');
	});
});
