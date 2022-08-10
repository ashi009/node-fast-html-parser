const { parse } = require('@test/test-target');

// https://github.com/taoqf/node-html-parser/pull/207
describe('void tags', function () {
	it('default', function () {
		const root = parse('<div><br></div>');
		root.toString().should.eql('<div><br></div>');
	});
	it('closingSlash', function () {
		const root = parse('<div><br></div>', {
			voidTag: {
				closingSlash: true
			}
		});
		root.toString().should.eql('<div><br/></div>');
	});
	it('closingSlash with space', function () {
		const root = parse('<div><br></div>', {
			voidTag: {
				closingSlash: true
			}
		});
		root.toString().should.eql('<div><br/></div>');
	});
	it('closingSlash with attribute ends with no blank space', function () {
		const root = parse('<foo attr=bar/>', {
			voidTag: {
				tags: ['foo'],
				closingSlash: true
			}
		});
		root.toString().should.eql('<foo attr=bar />');
	});
	it('closingSlash with attribute ends with blank space', function () {
		const root = parse('<div foo=bar />', {
			voidTag: {
				tags: ['foo'],
				closingSlash: true
			}
		});
		root.toString().should.eql('<div foo=bar ></div>');
	});
});
