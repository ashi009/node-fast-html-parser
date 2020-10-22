const { parse } = require('../dist');

// https://github.com/taoqf/node-html-parser/issues/77
describe('pre tag', function () {
	it('should parse pre tag correctly', function () {
		const html = `
    <div class="language-python highlighter-rouge">
      <div class="highlight"> <pre class="highlight"><code><span class="k">print</span><span class="p">(</span><span class="s">'hello'</span><span class="p">)</span><br><span class="n">i</span> <span class="o">=</span> <span class="n">i</span> <span class="o">+</span> <span class="mi">1</span><br></code></pre>
      </div>
    </div>
    `;
		const root = parse(html);
		root.toString().should.eql(html);
	});
});
