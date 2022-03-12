const { parse } = require('@test/test-target');

// https://github.com/taoqf/node-html-parser/issues/185
describe('clone elememt', function () {
	it('clone html element', function () {
		const root = parse('<div foo><bar>text</bar></div>');
		const div = root.firstChild;
		const newel = div.clone();
		newel.toString().should.eql('<div foo><bar>text</bar></div>');
	});
	it('clone text element', function () {
		const root = parse('<div foo>txt</div>');
		const txt = root.firstChild.firstChild;
		const newel = txt.clone();
		newel.toString().should.eql('txt');
	});
	it('clone comment element', function () {
		const root = parse('<div foo><!== comment ==></div>');
		const comment = root.firstChild.firstChild;
		const newel = comment.clone();
		newel.toString().should.eql('<!== comment ==>');
	});
});
