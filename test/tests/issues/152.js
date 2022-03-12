const { parse } = require('@test/test-target');

describe.skip('issue 152', function () {
	it('shoud parse attributes right', function () {
		const html = `<div>
<div id="chr-content">
<span>
  lkjasdkjasdkljakldj
</div>
</div>`;
		const root = parse(html);
		root.toString().should.eql(html);
	});
	it('shoud parse attributes right with option parseNoneClosedTags', function () {
		const html = `<div>
<div id="chr-content">
<span>
  lkjasdkjasdkljakldj
</div>
</div>`;
		const expected = `<div>
<div id="chr-content">
<span>
  lkjasdkjasdkljakldj

</span></div></div>`;

		const root = parse(html, { parseNoneClosedTags: true });
		root.toString().should.eql(expected);
	});
});
