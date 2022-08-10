const { parse } = require('@test/test-target');

// https://github.com/taoqf/node-html-parser/issues/186
describe('angular template', function () {
	it('attribute name contains []', function () {
		const root = parse('<input [(ngModel)]="foo">');
		const input = root.firstChild;
		'foo'.should.eql(input.getAttribute('[(ngModel)]'));
		root.toString().should.eql('<input [(ngModel)]="foo">');
	});
});
