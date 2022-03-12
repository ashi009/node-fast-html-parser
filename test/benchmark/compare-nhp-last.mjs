import node_html_parser from '@test/last-release';
import benchmark from 'htmlparser-benchmark';

export default function nhpLast() {
	return new Promise((res) => {
		var bench = benchmark(function (html, callback) {
			node_html_parser.parse(html);
			callback();
		});

		bench.on('result', function (stat) {
			console.log('node-html-parser (last release):' + stat.mean().toPrecision(6) + ' ms/file ± ' + stat.sd().toPrecision(6));
			res();
		});
	});
}
