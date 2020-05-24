import benchmark from 'htmlparser-benchmark';
import node_html_parser from '../dist/index.js';

var bench = benchmark(function (html, callback) {
	node_html_parser.parse(html);
	callback();
});

bench.on('progress', function (key) {
	// console.log('finished parsing ' + key + '.html');
});

bench.on('result', function (stat) {
	console.log('node-html-parser:' + stat.mean().toPrecision(6) + ' ms/file ± ' + stat.sd().toPrecision(6));
});