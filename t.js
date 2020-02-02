function rawAttributes(rawAttrs) {
	const attrs = {};
	if (rawAttrs) {
		// const re = /\b([a-z][a-z0-9\-]*)(?:\s*=\s*(?:("[^"]*")|('[^']*')|(\S+)))?/ig;
		const re = /\b([a-z][a-z0-9\-]*)(?:\s*=\s*("(?:[^"]*)"|'(?:[^']*)'|(?:\S+)))?/ig;
		let match;
		console.debug('0000', rawAttrs);
		while (match = re.exec(rawAttrs)) {
			console.debug('1111', match[1]);
			const v = match[2] || '';
			console.debug('2222', v.replace(/^['"]/, '').replace(/['"]$/, ''));
			attrs[match[1]] = v.replace(/^['"]/, '').replace(/['"]$/, '');
		}
	}
	return attrs;
}

function attr2str(attrs) {
	return Object.keys(attrs).map((name) => {
		const val = attrs[name];
		if (val === undefined || val === null) {
			return name;
		} else {
			return name + '=' + val
		}
	}).join(' ')
}

function main() {
	let r;
	// r = rawAttributes('a="1"');
	// r = rawAttributes('a=\'1\'');
	// r = rawAttributes('a=');
	// r = rawAttributes('a');
	// r = rawAttributes('a=1');
	// r = rawAttributes('a=aa b="bb" c= \'cc\' d="\'dd\'" e=e\'e\"e f');
	r = attr2str({
		a: 'aa',
		b: '"bb"',
		c: "'cc'",
		d: "'dd'",
		e: `e'e"e`,
		f: null
	});
	console.debug(r);
}

main();

