import cheerio from './compare-cheerio.mjs';
import high5 from './compare-high5.mjs';
import htmlDomParser from './compare-html-dom-parser.mjs';
import htmlparser from './compare-html-parser.mjs';
import html5parser from './compare-html5parser.mjs';
import htmlJsParser from './compare-htmljs-parser.mjs';
import htmlParser from './compare-htmlparser.mjs';
import htmlParser2 from './compare-htmlparser2.mjs';
import nhpLast from './compare-nhp-last.mjs';
import nhp from './compare-node-html-parser.mjs';
import parse5 from './compare-parse5.mjs';
// import saxes from './compare-saxes.mjs';	// errors

async function main() {
	// await saxes();
	await htmlparser();
	await htmlJsParser();
	await htmlDomParser();
	await html5parser();
	await cheerio();
	await parse5();
	await htmlParser2();
	await htmlParser();
	await high5();
	await nhp();
	await nhpLast();
}

main();
