const fs = require('fs');
const { parse } = require('@test/test-target');

describe('issue 214', function () {
	it('default', function () {
		const html = fs.readFileSync(__dirname + '/../../assets/html/codes.html', 'utf-8');
		const root = parse(html);
		const table = root.querySelector('table.restable');
		table.tagName.should.eql('TABLE');
	});
});
