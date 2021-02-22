const { parse } = require('../dist');

// https://github.com/taoqf/node-html-parser/issues/98
describe('getAttribute should be case insensitive', function () {
	it('namal', function () {
		const root = parse('<a onclick="listener()"></a>');
		root.firstChild.getAttribute('onclick').should.eql('listener()');
	});
	it('get attribute in origin name', function () {
		const root = parse('<a onClick="listener()"></a>');
		root.firstChild.getAttribute('onClick').should.eql('listener()');
	});
	it('get attribute in lowercase', function () {
		const root = parse('<a onClick="listener()"></a>');
		root.firstChild.getAttribute('onclick').should.eql('listener()');
	});
});
