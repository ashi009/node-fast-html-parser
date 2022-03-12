const { parse } = require('@test/test-target');

// https://github.com/taoqf/node-html-parser/issues/165
describe('method getElementById', function () {
	it('get element by id with .', function () {
		const root = parse('<div><foo id="foo.bar">bar</foo></div>');
		const div = root.querySelector('div');
		const el1 = div.querySelector('#foo.bar');
		const foo = div.querySelector('foo');
		should.equal(el1, null);
		const el2 = div.getElementById('foo.bar');
		el2.should.eql(foo);
	});
	it('get element by id with space', function () {
		const root = parse('<div><foo id="foo bar">bar</foo></div>');
		const div = root.querySelector('div');
		const el1 = div.querySelector('#foo bar');
		const foo = div.querySelector('foo');
		should.equal(el1, null);
		const el2 = div.getElementById('foo bar');
		el2.should.eql(foo);
	});
});
