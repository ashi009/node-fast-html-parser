var should = require('should');
var fs = require('fs');
var util = require('util');

var HTMLParser = require('../');

describe('HTML Parser', function() {

  var Matcher = HTMLParser.Matcher;
  var HTMLElement = HTMLParser.HTMLElement;
  var TextNode = HTMLParser.TextNode;

  describe('Matcher', function() {

    it('should match corrent elements', function() {

      var matcher = new Matcher('#id .a a.b *.a.b .a.b * a');
      var MatchesNothingButStarEl = new HTMLElement('_', {});
      var withIdEl = new HTMLElement('p', { id: 'id' });
      var withClassNameEl = new HTMLElement('a', { class: 'a b' });

      // console.log(util.inspect([withIdEl, withClassNameEl], {
      //     showHidden: true,
      //     depth: null
      //   }));

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

  describe('parse()', function() {

    it('should parse "<p id=\\"id\\"><a class=\'cls\'>Hello</a><ul><li><li></ul><span></span></p>" and return root element', function() {

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

    it('should parse "<DIV><a><img/></A><p></P></div>" and return root element', function() {

      var root = parseHTML('<DIV><a><img/></A><p></P></div>', {
        lowerCaseTagName: true
      });

      var div = new HTMLElement('div', {}, '');
      var a = div.appendChild(new HTMLElement('a', {}, ''));
      var img = a.appendChild(new HTMLElement('img', {}, ''));
      var p = div.appendChild(new HTMLElement('p', {}, ''));

      root.firstChild.should.eql(div);

    });

    it('should parse "<div><a><img/></a><p></p></div>" and return root element', function() {

      var root = parseHTML('<div><a><img/></a><p></p></div>');

      var div = new HTMLElement('div', {}, '');
      var a = div.appendChild(new HTMLElement('a', {}, ''));
      var img = a.appendChild(new HTMLElement('img', {}, ''));
      var p = div.appendChild(new HTMLElement('p', {}, ''));

      root.firstChild.should.eql(div);

    });

    it('should not extract text in script and style by default', function() {

      var root = parseHTML('<script>1</script><style>2</style>');

      root.firstChild.childNodes.should.be.empty;
      root.lastChild.childNodes.should.be.empty;

    });

    it('should extract text in script and style when ask so', function() {

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

    it('should be able to parse "html/incomplete-script" file', function() {

      var root = parseHTML(fs.readFileSync(__dirname + '/html/incomplete-script').toString(), {
        script: true
      });

    });

    it('should parse "<div><a><img/></a><p></p></div>.." very fast', function() {

      for (var i = 0; i < 100; i++)
        parseHTML('<div><a><img/></a><p></p></div><div><a><img/></a><p></p></div><div><a><img/></a><p></p></div><div><a><img/></a><p></p></div><div><a><img/></a><p></p></div><div><a><img/></a><p></p></div><div><a><img/></a><p></p></div><div><a><img/></a><p></p></div><div><a><img/></a><p></p></div><div><a><img/></a><p></p></div><div><a><img/></a><p></p></div><div><a><img/></a><p></p></div><div><a><img/></a><p></p></div><div><a><img/></a><p></p></div><div><a><img/></a><p></p></div><div><a><img/></a><p></p></div><div><a><img/></a><p></p></div><div><a><img/></a><p></p></div><div><a><img/></a><p></p></div><div><a><img/></a><p></p></div>');

    });

    it('should parse "<DIV><a><img/></A><p></P></div>.." fast', function() {

      for (var i = 0; i < 100; i++)
        parseHTML('<DIV><a><img/></A><p></P></div><DIV><a><img/></A><p></P></div><DIV><a><img/></A><p></P></div><DIV><a><img/></A><p></P></div><DIV><a><img/></A><p></P></div><DIV><a><img/></A><p></P></div><DIV><a><img/></A><p></P></div><DIV><a><img/></A><p></P></div><DIV><a><img/></A><p></P></div><DIV><a><img/></A><p></P></div><DIV><a><img/></A><p></P></div><DIV><a><img/></A><p></P></div><DIV><a><img/></A><p></P></div><DIV><a><img/></A><p></P></div><DIV><a><img/></A><p></P></div><DIV><a><img/></A><p></P></div><DIV><a><img/></A><p></P></div><DIV><a><img/></A><p></P></div><DIV><a><img/></A><p></P></div><DIV><a><img/></A><p></P></div>', {
          lowerCaseTagName: true
        });

    });

  });

  describe('TextNode', function() {

    describe('#isWhitespace', function() {
      var node = new TextNode('');
      node.isWhitespace.should.be.ok;
      node = new TextNode(' \t');
      node.isWhitespace.should.be.ok;
      node = new TextNode(' \t&nbsp; \t');
      node.isWhitespace.should.be.ok;
    });

  });

  describe('HTMLElement', function() {

    describe('#removeWhitespace()', function() {

      it('should remove whitespaces while preserving nodes with content', function() {

        var root = parseHTML('<p> \r \n  \t <h5> 123 </h5></p>');

        var p = new HTMLElement('p', {}, '');
        p.appendChild(new HTMLElement('h5', {}, ''))
            .appendChild(new TextNode('123'));

        root.firstChild.removeWhitespace().should.eql(p);

      });

    });

    describe('#rawAttributes', function() {

      it('should return escaped attributes of the element', function() {

        var root = parseHTML('<p a=12 data-id="!$$&amp;" yAz=\'1\'></p>');

        root.firstChild.rawAttributes.should.eql({
          'a': '12',
          'data-id': '!$$&amp;',
          'yAz': '1'
        });

      });

    });

    describe('#attributes', function() {

      it('should return attributes of the element', function() {

        var root = parseHTML('<p a=12 data-id="!$$&amp;" yAz=\'1\'></p>');

        root.firstChild.attributes.should.eql({
          'a': '12',
          'data-id': '!$$&',
          'yAz': '1'
        });

      });

    });

    describe('#querySelectorAll()', function() {

      it('should return correct elements in DOM tree', function() {

        var root = parseHTML('<a id="id"><div><span class="a b"></span><span></span><span></span></div></a>');

        root.querySelectorAll('#id').should.eql([root.firstChild]);
        root.querySelectorAll('span.a').should.eql([root.firstChild.firstChild.firstChild]);
        root.querySelectorAll('span.b').should.eql([root.firstChild.firstChild.firstChild]);
        root.querySelectorAll('span.a.b').should.eql([root.firstChild.firstChild.firstChild]);
        root.querySelectorAll('#id .b').should.eql([root.firstChild.firstChild.firstChild]);
        root.querySelectorAll('#id span').should.eql(root.firstChild.firstChild.childNodes);

      });

    });

    describe('#structuredText', function() {

      it('should return correct structured text', function() {

        var root = parseHTML('<span>o<p>a</p><p>b</p>c</span>');
        root.structuredText.should.eql('o\na\nb\nc');

      });

    });

  });

});
