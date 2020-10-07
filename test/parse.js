const { parse } = require('../dist');

// https://github.com/taoqf/node-html-parser/issues/38
describe('HTML Parser', function () {
	it('should parse text element', function () {
		const root = parse('foo bar<div>aaa</div>');
		root.toString().should.eql('foo bar<div>aaa</div>');
	});
	it('should parse pure text element', function () {
		const root = parse('foo bar');
		root.toString().should.eql('foo bar');
	});
	it('should parse text element in style', function () {
		const root = parse('<style>  .my-class {    font-size: 90%;  }</style>');
		root.toString().should.eql('<style>  .my-class {    font-size: 90%;  }</style>');
	});
	it('issue#55', function () {
		const root = parse('<!DOCTYPE html><html lang="en"><head></head><body><script id="storeFinder" type="application/json">{"key":true}</script></body></html>');
		root.toString().should.eql('<!DOCTYPE html><html lang="en"><head></head><body><script id="storeFinder" type="application/json">{"key":true}</script></body></html>');
	});
});
