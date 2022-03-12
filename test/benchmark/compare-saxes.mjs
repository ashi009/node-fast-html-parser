import benchmark from 'htmlparser-benchmark';
import saxes from "saxes";

export default function saxesparse() {
	return new Promise((res) => {
		var bench = benchmark(function (html, callback) {
			var parser = new saxes.SaxesParser();
			parser.write(html).close();
			callback();
		});

		bench.on('progress', function (key) {
			// console.log('finished parsing ' + key + '.html');
		});

		bench.on('result', function (stat) {
			console.log('saxes           :' + stat.mean().toPrecision(6) + ' ms/file ± ' + stat.sd().toPrecision(6));
			res();
		});
	});
}
