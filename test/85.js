const { parse } = require('../dist');

// https://github.com/taoqf/node-html-parser/issues/85
describe('#remove()', function () {
	it('remove current element', function () {
		const root = parse('<div><a id=el></a></div>');
		const div = root.firstChild;
		const a = root.querySelector('#el');
		div.childNodes.length.should.eql(1);
		a.remove();
		div.childNodes.length.should.eql(0);
	});

	it('remove current element without method remove', function () {
		const root = parse('<div><a id=el></a></div>');
		const div = root.firstChild;
		const a = root.querySelector('#el');
		div.childNodes.length.should.eql(1);
		const children = div.childNodes;
		div.childNodes = children.filter((child) => {
			return a !== child;
		});
		div.childNodes.length.should.eql(0);
	});
});
