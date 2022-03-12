import parse from "html-dom-parser";
import benchmark from 'htmlparser-benchmark';

export default function high5() {
	return new Promise((res) => {
		var bench = benchmark(function (html, callback) {
			parse(html);
			callback();
		});

		bench.on('progress', function (key) {
			// console.log('finished parsing ' + key + '.html');
		});

		bench.on('result', function (stat) {
			console.log('html-dom-parser :' + stat.mean().toPrecision(6) + ' ms/file ± ' + stat.sd().toPrecision(6));
			res();
		});
	});
}
