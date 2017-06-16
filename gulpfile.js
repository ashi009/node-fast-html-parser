const gulp = require('gulp');

gulp.task('clean', () => {
	const del = require('del');
	return del('./dist/');
});

gulp.task('compile-ts', () => {
	const ts = require('gulp-typescript');
	const tsProject = ts.createProject('./tsconfig.json');
	const dest = tsProject.options.outDir;
	return tsProject.src()
		.pipe(tsProject())
		.pipe(gulp.dest(dest));
});

gulp.task('compile-ts-umd', () => {
	const ts = require('gulp-typescript');
	const tsProject = ts.createProject('./tsconfig.json');
	const path = require('path');
	const dest = path.join(tsProject.options.outDir, 'umd');
	tsProject.options.module = 3;
	return tsProject.src()
		.pipe(tsProject())
		.pipe(gulp.dest(dest));
});

gulp.task('watch-ts', async () => {
	const ts = require('gulp-typescript');
	const tsProject = ts.createProject('./tsconfig.json');
	const path = require('path');
	const dest = tsProject.options.outDir;
	await tsProject.src()
		.pipe(tsProject())
		.pipe(gulp.dest(dest));
	return gulp.watch(['./src/**/*.ts'], (file) => {
		const tsProject = ts.createProject('./tsconfig.json');
		const relative = path.relative('./', path.dirname(file.path));
		const outDir = tsProject.options.outDir;
		const dest = path.join(outDir, relative);
		return gulp.src(file.path)
			.pipe(tsProject())
			.pipe(gulp.dest(dest));
	});
});

gulp.task('default', (cb) => {
	const sequence = require('gulp-sequence');
	sequence('clean', 'compile-ts', 'compile-ts-umd', cb);
});

gulp.task('dev', ['watch-ts']);
