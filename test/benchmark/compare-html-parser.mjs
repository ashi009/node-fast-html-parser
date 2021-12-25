import benchmark from 'htmlparser-benchmark';
import htmlParser from "html-parser";

var bench = benchmark(function (html, callback) {
	htmlParser.parse(html);
	callback();
});

bench.on('progress', function (key) {
	// console.log('finished parsing ' + key + '.html');
});

bench.on('result', function (stat) {
	console.log('html-parser     :' + stat.mean().toPrecision(6) + ' ms/file ± ' + stat.sd().toPrecision(6));
});