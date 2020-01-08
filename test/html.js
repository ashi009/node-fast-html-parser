var should = require('should');
var fs = require('fs');
var util = require('util');

var HTMLParser = require('../dist');

describe('HTML Parser', function () {

	var Matcher = HTMLParser.Matcher;
	var HTMLElement = HTMLParser.HTMLElement;
	var TextNode = HTMLParser.TextNode;

	describe('Matcher', function () {
		it('should match corrent elements', function () {
			var matcher = new Matcher('#id .a a.b *.a.b .a.b * a');
			var MatchesNothingButStarEl = new HTMLElement('_', {});
			var withIdEl = new HTMLElement('p', { id: 'id' });
			var withClassNameEl = new HTMLElement('a', { class: 'a b' });

			matcher.advance(MatchesNothingButStarEl).should.not.be.ok; // #id
			matcher.advance(withClassNameEl).should.not.be.ok; // #id
			matcher.advance(withIdEl).should.be.ok; // #id

			matcher.advance(MatchesNothingButStarEl).should.not.be.ok; // .a
			matcher.advance(withIdEl).should.not.be.ok; // .a
			matcher.advance(withClassNameEl).should.be.ok; // .a

			matcher.advance(MatchesNothingButStarEl).should.not.be.ok; // a.b
			matcher.advance(withIdEl).should.not.be.ok; // a.b
			matcher.advance(withClassNameEl).should.be.ok; // a.b

			matcher.advance(withIdEl).should.not.be.ok; // *.a.b
			matcher.advance(MatchesNothingButStarEl).should.not.be.ok; // *.a.b
			matcher.advance(withClassNameEl).should.be.ok; // *.a.b

			matcher.advance(withIdEl).should.not.be.ok; // .a.b
			matcher.advance(MatchesNothingButStarEl).should.not.be.ok; // .a.b
			matcher.advance(withClassNameEl).should.be.ok; // .a.b

			matcher.advance(withIdEl).should.be.ok; // *
			matcher.rewind();
			matcher.advance(MatchesNothingButStarEl).should.be.ok; // *
			matcher.rewind();
			matcher.advance(withClassNameEl).should.be.ok; // *

			matcher.advance(withIdEl).should.not.be.ok; // a
			matcher.advance(MatchesNothingButStarEl).should.not.be.ok; // a
			matcher.advance(withClassNameEl).should.be.ok; // a

			matcher.matched.should.be.ok;
		});
	});

	var parseHTML = HTMLParser.parse;

	describe('parse()', function () {
		it('should parse "<p id=\\"id\\"><a class=\'cls\'>Hello</a><ul><li><li></ul><span></span></p>" and return root element', function () {

			var root = parseHTML('<p id="id"><a class=\'cls\'>Hello</a><ul><li><li></ul><span></span></p>');

			var p = new HTMLElement('p', { id: 'id' }, 'id="id"');
			p.appendChild(new HTMLElement('a', { class: 'cls' }, 'class=\'cls\''))
				.appendChild(new TextNode('Hello'));
			var ul = p.appendChild(new HTMLElement('ul', {}, ''));
			ul.appendChild(new HTMLElement('li', {}, ''));
			ul.appendChild(new HTMLElement('li', {}, ''));
			p.appendChild(new HTMLElement('span', {}, ''));

			root.firstChild.should.eql(p);
		});

		it('should parse "<DIV><a><img/></A><p></P></div>" and return root element', function () {

			var root = parseHTML('<DIV><a><img/></A><p></P></div>', {
				lowerCaseTagName: true
			});

			var div = new HTMLElement('div', {}, '');
			var a = div.appendChild(new HTMLElement('a', {}, ''));
			var img = a.appendChild(new HTMLElement('img', {}, ''));
			var p = div.appendChild(new HTMLElement('p', {}, ''));

			root.firstChild.should.eql(div);

		});

		it('should parse "<div><a><img/></a><p></p></div>" and return root element', function () {

			var root = parseHTML('<div><a><img/></a><p></p></div>');

			var div = new HTMLElement('div', {}, '');
			var a = div.appendChild(new HTMLElement('a', {}, ''));
			var img = a.appendChild(new HTMLElement('img', {}, ''));
			var p = div.appendChild(new HTMLElement('p', {}, ''));

			root.firstChild.should.eql(div);

		});

		it('should parse picture element', function () {

			var root = parseHTML('<picture><source srcset="/images/example-1.jpg 1200w, /images/example-2.jpg 1600w" sizes="100vw"><img src="/images/example.jpg" alt="Example"/></picture>');
			
			var picture = new HTMLElement('picture', {}, '');
			var source = picture.appendChild(new HTMLElement('source', {}, 'srcset="/images/example-1.jpg 1200w, /images/example-2.jpg 1600w" sizes="100vw"'));
			var img = picture.appendChild(new HTMLElement('img', {}, 'src="/images/example.jpg" alt="Example"'));

			root.firstChild.should.eql(picture);

		});

		it('should not extract text in script and style by default', function () {

			var root = parseHTML('<script>1</script><style>2</style>');

			root.firstChild.childNodes.should.be.empty;
			root.lastChild.childNodes.should.be.empty;

		});

		it('should extract text in script and style when ask so', function () {

			var root = parseHTML('<script>1</script><style>2&amp;</style>', {
				script: true,
				style: true
			});

			root.firstChild.childNodes.should.not.be.empty;
			root.firstChild.childNodes.should.eql([new TextNode('1')]);
			root.firstChild.text.should.eql('1');
			root.lastChild.childNodes.should.not.be.empty;
			root.lastChild.childNodes.should.eql([new TextNode('2&amp;')]);
			root.lastChild.text.should.eql('2&');
			root.lastChild.rawText.should.eql('2&amp;');
		});

		it('should be able to parse "html/incomplete-script" file', function () {

			var root = parseHTML(fs.readFileSync(__dirname + '/html/incomplete-script').toString(), {
				script: true
			});

		});

		it('should parse "<div><a><img/></a><p></p></div>.." very fast', function () {

			for (var i = 0; i < 100; i++)
				parseHTML('<div><a><img/></a><p></p></div><div><a><img/></a><p></p></div><div><a><img/></a><p></p></div><div><a><img/></a><p></p></div><div><a><img/></a><p></p></div><div><a><img/></a><p></p></div><div><a><img/></a><p></p></div><div><a><img/></a><p></p></div><div><a><img/></a><p></p></div><div><a><img/></a><p></p></div><div><a><img/></a><p></p></div><div><a><img/></a><p></p></div><div><a><img/></a><p></p></div><div><a><img/></a><p></p></div><div><a><img/></a><p></p></div><div><a><img/></a><p></p></div><div><a><img/></a><p></p></div><div><a><img/></a><p></p></div><div><a><img/></a><p></p></div><div><a><img/></a><p></p></div>');

		});

		it('should parse "<DIV><a><img/></A><p></P></div>.." fast', function () {

			for (var i = 0; i < 100; i++)
				parseHTML('<DIV><a><img/></A><p></P></div><DIV><a><img/></A><p></P></div><DIV><a><img/></A><p></P></div><DIV><a><img/></A><p></P></div><DIV><a><img/></A><p></P></div><DIV><a><img/></A><p></P></div><DIV><a><img/></A><p></P></div><DIV><a><img/></A><p></P></div><DIV><a><img/></A><p></P></div><DIV><a><img/></A><p></P></div><DIV><a><img/></A><p></P></div><DIV><a><img/></A><p></P></div><DIV><a><img/></A><p></P></div><DIV><a><img/></A><p></P></div><DIV><a><img/></A><p></P></div><DIV><a><img/></A><p></P></div><DIV><a><img/></A><p></P></div><DIV><a><img/></A><p></P></div><DIV><a><img/></A><p></P></div><DIV><a><img/></A><p></P></div>', {
					lowerCaseTagName: true
				});

		});

		// Test for broken tags. <h3>something<h3>

		it('should parse "<div><h3>content<h3> <span> other <span></div>" (fix h3, span closing tag) very fast', function () {
			var root = parseHTML(fs.readFileSync(__dirname + '/html/incomplete-script').toString());
		});

	});

	describe('parseWithValidation', function () {
		// parse with validation tests

		it('should return Object with valid: true.  does not count <p><p></p> as error. instead fixes it to <p></p><p></p>', function () {
			var result = parseHTML('<p><p></p>');
			result.valid.should.eql(true);
		})

		it('should return Object with valid: true.  does not count <p><p/></p> as error. instead fixes it to <p><p></p></p>', function () {
			var result = parseHTML('<p><p/></p>');
			result.valid.should.eql(true);
		})

		it('should return Object with valid: false.  does not count <p><h3></p> as error', function () {
			var result = parseHTML('<p><h3></p>');
			result.valid.should.eql(false);
		})

		it('hillcrestpartyrentals.html  should return Object with valid: false.  not closing <p> tag on line 476', function () {
			var result = parseHTML(fs.readFileSync(__dirname + '/html/hillcrestpartyrentals.html').toString(), {
				noFix: true
			});
			result.valid.should.eql(false);
		})

		it('google.html  should return Object with valid: true', function () {
			var result = parseHTML(fs.readFileSync(__dirname + '/html/google.html').toString(), {
				noFix: true
			});
			result.valid.should.eql(true);
		})

		it('gmail.html  should return Object with valid: true', function () {
			var result = parseHTML(fs.readFileSync(__dirname + '/html/gmail.html').toString(), {
				noFix: true
			});
			result.valid.should.eql(true);
		})

		it('ffmpeg.html  should return Object with valid: false (extra opening <div>', function () {
			var result = parseHTML(fs.readFileSync(__dirname + '/html/ffmpeg.html').toString(), {
				noFix: true
			});
			result.valid.should.eql(false);
		})

		// fix issue speed test

		it('should fix "<div><h3><h3><div>" to "<div><h3></h3></div>"', function () {
			var result = parseHTML('<div data-id=1><h3 data-id=2><h3><div>');
			result.valid.should.eql(false);
			result.toString().should.eql('<div data-id=1><h3 data-id=2></h3></div>');
		})

		it('should fix "<div><h3><h3><span><span><div>" to "<div><h3></h3><span></span></div>"', function () {
			var result = parseHTML('<div><h3><h3><span><span><div>');
			result.valid.should.eql(false);
			result.toString().should.eql('<div><h3></h3><span></span></div>');
		})

		it('gmail.html  should return Object with valid: true', function () {
			var result = parseHTML(fs.readFileSync(__dirname + '/html/gmail.html').toString().replace(/<\//gi, '<'));
			result.valid.should.eql(false);
		})

		it('gmail.html  should return Object with valid: true', function () {
			var result = parseHTML(fs.readFileSync(__dirname + '/html/nice.html').toString().replace(/<\//gi, '<'));
			result.valid.should.eql(false);
		})

	});

	describe('TextNode', function () {
		describe('#isWhitespace', function () {
			var node = new TextNode('');
			node.isWhitespace.should.be.ok;
			node = new TextNode(' \t');
			node.isWhitespace.should.be.ok;
			node = new TextNode(' \t&nbsp; \t');
			node.isWhitespace.should.be.ok;
		});
	});

	describe('HTMLElement', function () {

		describe('#removeWhitespace()', function () {
			it('should remove whitespaces while preserving nodes with content', function () {
				var root = parseHTML('<p> \r \n  \t <h5> 123 </h5></p>');

				var p = new HTMLElement('p', {}, '');
				p.appendChild(new HTMLElement('h5', {}, ''))
					.appendChild(new TextNode('123'));

				root.firstChild.removeWhitespace().should.eql(p);
			});
		});

		describe('#rawAttributes', function () {
			it('should return escaped attributes of the element', function () {
				var root = parseHTML('<p a=12 data-id="!$$&amp;" yAz=\'1\'></p>');
				root.firstChild.rawAttributes.should.eql({
					'a': '12',
					'data-id': '!$$&amp;',
					'yAz': '1'
				});
			});
		});

		describe('#attributes', function () {
			it('should return attributes of the element', function () {
				var root = parseHTML('<p a=12 data-id="!$$&amp;" yAz=\'1\' class="" disabled></p>');
				root.firstChild.attributes.should.eql({
					'a': '12',
					'data-id': '!$$&',
					'yAz': '1',
					'disabled': '',
					'class': ''
				});
			});
		});

		describe('#querySelector()', function () {
			it('should return correct elements in DOM tree', function () {
				var root = parseHTML('<a id="id" data-id="myid"><div><span class="a b"></span><span></span><span></span></div></a>');
				root.querySelector('#id').should.eql(root.firstChild);
				root.querySelector('span.a').should.eql(root.firstChild.firstChild.firstChild);
				root.querySelector('span.b').should.eql(root.firstChild.firstChild.firstChild);
				root.querySelector('span.a.b').should.eql(root.firstChild.firstChild.firstChild);
				root.querySelector('#id .b').should.eql(root.firstChild.firstChild.firstChild);
				root.querySelector('#id span').should.eql(root.firstChild.firstChild.firstChild);
				root.querySelector('[data-id=myid]').should.eql(root.firstChild);
				root.querySelector('[data-id="myid"]').should.eql(root.firstChild);
			});
		});

		describe('#querySelectorAll()', function () {
			it('should return correct elements in DOM tree', function () {
				var root = parseHTML('<a id="id"><div><span class="a b"></span><span></span><span></span></div></a>');
				root.querySelectorAll('#id').should.eql([root.firstChild]);
				root.querySelectorAll('span.a').should.eql([root.firstChild.firstChild.firstChild]);
				root.querySelectorAll('span.b').should.eql([root.firstChild.firstChild.firstChild]);
				root.querySelectorAll('span.a.b').should.eql([root.firstChild.firstChild.firstChild]);
				root.querySelectorAll('#id .b').should.eql([root.firstChild.firstChild.firstChild]);
				root.querySelectorAll('#id span').should.eql(root.firstChild.firstChild.childNodes);
				root.querySelectorAll('#id, #id .b').should.eql([root.firstChild, root.firstChild.firstChild.firstChild]);
			});
		});

		describe('#structuredText', function () {
			it('should return correct structured text', function () {
				var root = parseHTML('<span>o<p>a</p><p>b</p>c</span>');
				root.structuredText.should.eql('o\na\nb\nc');
			});
		});
		describe('#set_content', function () {
			it('set content string', function () {
				var root = parseHTML('<div></div>');
				root.childNodes[0].set_content('<span><div>abc</div>bla</span>');
				root.toString().should.eql('<div><span><div>abc</div>bla</span></div>');
			});
			it('set content nodes', function () {
				var root = parseHTML('<div></div>');
				root.childNodes[0].set_content(parseHTML('<span><div>abc</div>bla</span>').childNodes);
				root.toString().should.eql('<div><span><div>abc</div>bla</span></div>');
			});
			it('set content node', function () {
				var root = parseHTML('<div></div>');
				root.childNodes[0].set_content(parseHTML('<span><div>abc</div>bla</span>').childNodes[0]);
				root.toString().should.eql('<div><span><div>abc</div>bla</span></div>');
			});
			it('set content text', function () {
				var root = parseHTML('<div></div>');
				root.childNodes[0].set_content('abc');
				root.toString().should.eql('<div>abc</div>');
			});
		});
	});

	describe('stringify', function () {
		it('#toString()', function () {
			const html = '<p id="id" data-feidao-actions="ssss"><a class=\'cls\'>Hello</a><ul><li>aaaaa</li></ul><span>bbb</span></p>';
			const root = parseHTML(html);
			root.toString().should.eql(html)
		});
	});

	describe('Custom Element', function () {
		it('parse "<my-widget></my-widget>" tagName should be "my-widget"', function () {

			var root = parseHTML('<my-widget></my-widget>');

			root.firstChild.tagName.should.eql('my-widget');
		});
	});

	describe('Custom Element multiple dash', function () {
		it('parse "<my-new-widget></my-new-widget>" tagName should be "my-new-widget"', function () {

			var root = parseHTML('<my-new-widget></my-new-widget>');

			root.firstChild.tagName.should.eql('my-new-widget');
		});
	});
});
