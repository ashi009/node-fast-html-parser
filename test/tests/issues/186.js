const { parse } = require('@test/test-target');

// https://github.com/taoqf/node-html-parser/issues/186
describe('replace children', function () {
	it('use innerHTML to replace children', function () {
		const root = parse('<ul id="list"><li>Hello World</li></ul>');
		root.querySelector('li').innerHTML = '<a href="#">Some link</a>';
		root.toString().should.eql('<ul id="list"><li><a href="#">Some link</a></li></ul>');
		root.querySelector('a').remove();
		root.toString().should.eql('<ul id="list"><li></li></ul>');
	});
	it('use set_content() to replace children', function () {
		const root = parse('<ul id="list"><li>Hello World</li></ul>');
		root.querySelector('li').set_content('<a href="#">Some link</a>');
		root.toString().should.eql('<ul id="list"><li><a href="#">Some link</a></li></ul>');
		root.querySelector('a').remove();
		root.toString().should.eql('<ul id="list"><li></li></ul>');
	});
	it('use replaceWith to replace children', function () {
		const root = parse('<ul id="list"><li><a href="#">Some link</a></li></ul>');
		root.querySelector('a').replaceWith('Hello World');
		root.toString().should.eql('<ul id="list"><li>Hello World</li></ul>');
	});
	it('use insertAdjacentHTML to insert elements', function () {
		const root = parse('<ul id="list"><li><a href="#">Some link</a></li></ul>');
		root.querySelector('li').insertAdjacentHTML('afterbegin', '<b>Hello World</b>');
		root.toString().should.eql('<ul id="list"><li><b>Hello World</b><a href="#">Some link</a></li></ul>');
	});
});
