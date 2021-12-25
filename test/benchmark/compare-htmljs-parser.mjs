import benchmark from 'htmlparser-benchmark';
import { createParser } from "htmljs-parser";

var bench = benchmark(function (html, callback) {
	const parser = createParser({
    onText: function(event) {
        // Text within an HTML element
        var value = event.value;
    },

    onPlaceholder: function(event) {
        //  ${<value>]} // escape = true
        // $!{<value>]} // escape = false
        var value = event.value; // String
        var escaped = event.escaped; // boolean
        var withinBody = event.withinBody; // boolean
        var withinAttribute = event.withinAttribute; // boolean
        var withinString = event.withinString; // boolean
        var withinOpenTag = event.withinOpenTag; // boolean
        var pos = event.pos; // Integer
    },

    onString: function(event) {
        // Text within ""
        var value = event.value; // String
        var stringParts = event.stringParts; // Array
        var isStringLiteral = event.isStringLiteral // Boolean
        var pos = event.pos; // Integer
    },

    onCDATA: function(event) {
        // <![CDATA[<value>]]>
        var value = event.value; // String
        var pos = event.pos; // Integer
    },

    onOpenTag: function(event) {
        var tagName = event.tagName; // String
        var attributes = event.attributes; // Array
        var argument = event.argument; // Object
        var pos = event.pos; // Integer
    },

    onCloseTag: function(event) {
        // close tag
        var tagName = event.tagName; // String
        var pos = event.pos; // Integer
    },

    onDocumentType: function(event) {
        // Document Type/DTD
        // <!<value>>
        // Example: <!DOCTYPE html>
        var value = event.value; // String
        var pos = event.pos; // Integer
    },

    onDeclaration: function(event) {
        // Declaration
        // <?<value>?>
        // Example: <?xml version="1.0" encoding="UTF-8" ?>
        var value = event.value; // String
        var pos = event.pos; // Integer
    },

    onComment: function(event) {
        // Text within XML comment
        var value = event.value; // String
        var pos = event.pos; // Integer
    },

    onScriptlet: function(event) {
        // Text within <% %>
        var value = event.value; // String
        var pos = event.pos; // Integer
    },

    onError: function(event) {
        // Error
        var message = event.message; // String
        var code = event.code; // String
        var pos = event.pos; // Integer
    }
});
	parser.parse(html);
	callback();
});

bench.on('progress', function (key) {
	// console.log('finished parsing ' + key + '.html');
});

bench.on('result', function (stat) {
	console.log('htmljs-parser   :' + stat.mean().toPrecision(6) + ' ms/file ± ' + stat.sd().toPrecision(6));
});