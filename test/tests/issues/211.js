const { parse, NodeType } = require('@test/test-target');

describe('issue 211', function () {
	it('Nested A tags break', function () {
		const html = `<A href="#"><b>link <a href="#">nested link</a> end</b></A>`;

		const root = parse(html);

		root.innerHTML.should.eql(`<A href="#"><b>link <a href="#">nested link</a> end</b></A>`);
		root.childNodes.length.should.eql(1);

		const a1 = root.childNodes[0];
		a1.tagName.should.eql('A');
		a1.nodeType.should.eql(NodeType.ELEMENT_NODE);
		a1.childNodes.length.should.eql(1);

		const b = a1.childNodes[0];
		b.tagName.should.eql('B');
		b.childNodes.length.should.eql(3);
		b.text.should.eql('link nested link end');

		const a2 = b.childNodes[1];
		a2.tagName.should.eql('A');
		a2.nodeType.should.eql(NodeType.ELEMENT_NODE);
		a2.childNodes.length.should.eql(1);
		a2.childNodes[0].nodeType.should.eql(NodeType.TEXT_NODE);
		a2.text.should.eql('nested link');

		const endText = b.childNodes[2];
		endText.nodeType.should.eql(NodeType.TEXT_NODE);
		endText.textContent.should.eql(' end');
	});
});
