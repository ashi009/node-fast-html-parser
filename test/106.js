const { parse } = require('../dist');
const fs = require('fs');

describe.skip('Memory leak', function () {
	it('nothing mached', function (done) {
		this.timeout(6000000);
		const lang = 'en';
		let i = 0;
		const content = fs.readFileSync(__dirname + '/html/view-source_https___epicentrk.ua_shop_kirpich-ogneupornyy_.html', 'utf-8');
		while (++i < 100000) {
			const cat = {};
			let root = parse(content);
			let name;
			const parent = Math.random().toString();
			try {
				name = root.querySelector(`.shop-categories__title`);
				if (!name) name = root.querySelector(`.headList h1`);
				// name = JSON.parse(JSON.stringify(name.text)).trim();
				// name = name.text.trim();
				name = name.text;
				if (!cat[parent]) {
					cat[parent] = {
						name: {},
					};
				}
				cat[parent][`name`][lang] = name;
			} catch (error) { console.error(error); }

			if (!name) {
				console.error(`not found name`);
			}
			name.should.eql('Кирпич огнеупорный');
		}
		done();
	});
});
