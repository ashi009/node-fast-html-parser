var should = require('should');
var fs = require('fs');
var util = require('util');

var HTMLParser = require('../');

describe('HTML Parser', function() {

  var HTMLElement = HTMLParser.HTMLElement;
  var TextNode = HTMLParser.TextNode;

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

        console.time('timer1');
        for (var i = 0; i < 100; i++)
          parseHTML('<div><a><img/></a><p></p></div><div><a><img/></a><p></p></div><div><a><img/></a><p></p></div><div><a><img/></a><p></p></div><div><a><img/></a><p></p></div><div><a><img/></a><p></p></div><div><a><img/></a><p></p></div><div><a><img/></a><p></p></div><div><a><img/></a><p></p></div><div><a><img/></a><p></p></div><div><a><img/></a><p></p></div><div><a><img/></a><p></p></div><div><a><img/></a><p></p></div><div><a><img/></a><p></p></div><div><a><img/></a><p></p></div><div><a><img/></a><p></p></div><div><a><img/></a><p></p></div><div><a><img/></a><p></p></div><div><a><img/></a><p></p></div><div><a><img/></a><p></p></div>');
        console.timeEnd('timer1');
        console.log('\n');

    });

    it('should parse "<DIV><a><img/></A><p></P></div>.." fast', function() {

      console.time('timer');
      for (var i = 0; i < 100; i++)
        parseHTML('<DIV><a><img/></A><p></P></div><DIV><a><img/></A><p></P></div><DIV><a><img/></A><p></P></div><DIV><a><img/></A><p></P></div><DIV><a><img/></A><p></P></div><DIV><a><img/></A><p></P></div><DIV><a><img/></A><p></P></div><DIV><a><img/></A><p></P></div><DIV><a><img/></A><p></P></div><DIV><a><img/></A><p></P></div><DIV><a><img/></A><p></P></div><DIV><a><img/></A><p></P></div><DIV><a><img/></A><p></P></div><DIV><a><img/></A><p></P></div><DIV><a><img/></A><p></P></div><DIV><a><img/></A><p></P></div><DIV><a><img/></A><p></P></div><DIV><a><img/></A><p></P></div><DIV><a><img/></A><p></P></div><DIV><a><img/></A><p></P></div>', {
          lowerCaseTagName: true
        });
      console.timeEnd('timer');
    });

  });

  describe('HTMLElement', function() {

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

  });

});
