import benchmark from 'htmlparser-benchmark';
import libxmljs from "libxmljs";

var bench = benchmark(function (html, callback) {
	libxmljs.parseHtml(html);
	callback();
});

bench.on('progress', function (key) {
	// console.log('finished parsing ' + key + '.html');
});

bench.on('result', function (stat) {
	console.log('libxmljs        :' + stat.mean().toPrecision(6) + ' ms/file ± ' + stat.sd().toPrecision(6));
});