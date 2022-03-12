import node_html_parser from '@test/root';
import benchmark from 'htmlparser-benchmark';

// const { parse } = node_html_parser;

export default function nhpRoot() {
	return new Promise((res) => {
		var bench = benchmark(function (html, callback) {
			// parse(html);
			node_html_parser.parse(html);
			callback();
		});

		bench.on('progress', function (key) {
			// console.log('finished parsing ' + key + '.html');
		});

		bench.on('result', function (stat) {
			console.log('node-html-parser:' + stat.mean().toPrecision(6) + ' ms/file ± ' + stat.sd().toPrecision(6));
			res();
		});
	});
}
