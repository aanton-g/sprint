// VARIABLES & PATHS

let preprocessor = 'scss', // Preprocessor (sass, scss, less, styl)
		fileswatch   = 'html,htm,txt,json,md,woff2', // List of files extensions for watching & hard reload (comma separated)
		baseDir      = 'docs', // Base directory path without «/» at the end
		online       = true; // If «false» - Browsersync will work offline without internet connection

let paths = {

	userscripts: {
		src: [
			baseDir + '/js/app.js' // app.js. Always at the end
		]
	},

	styles: {
		src:  baseDir + '/' + preprocessor + '/main.*',
		dest: baseDir + '/css',
	},

	images: {
		src:  baseDir + '/images/src/**/*',
		dest: baseDir + '/images/dest',
	},

	cssOutputName: 'app.min.css',
	jsOutputName:  'app.min.js',

}

// LOGIC

const { src, dest, parallel, series, watch } = require('gulp');
const sass         = require('gulp-sass');
const scss         = require('gulp-sass');
const less         = require('gulp-less');
const styl         = require('gulp-stylus');
const cleancss     = require('gulp-clean-css');
const concat       = require('gulp-concat');
const browserSync  = require('browser-sync').create();
const babel        = require('gulp-babel');
const uglify       = require('gulp-uglify');
const autoprefixer = require('gulp-autoprefixer');

function browsersync() {
	browserSync.init({
		server: { baseDir: baseDir + '/' },
		notify: false,
		online: online
	})
}

function scripts() {
	return src([
		baseDir + '/js/app.js',
	])
	.pipe(concat(paths.jsOutputName))
	.pipe(uglify())
	.pipe(dest(baseDir + '/js'))
}

function styles() {
	return src(paths.styles.src)
	.pipe(eval(preprocessor)())
	.pipe(concat(paths.cssOutputName))
	.pipe(autoprefixer({ overrideBrowserslist: ['last 10 versions'], grid: true }))
	.pipe(cleancss({ level: { 1: { specialComments: 0 } },/* format: 'beautify' */ }))
	.pipe(dest(paths.styles.dest))
	.pipe(browserSync.stream())
}

function startwatch() {
	watch(baseDir  + '/' + preprocessor + '/**/*', {usePolling: true}, styles);
	watch(baseDir  + '/**/*.{' + fileswatch + '}', {usePolling: true}).on('change', browserSync.reload);
	watch([baseDir + '/js/**/*.js', '!' + baseDir + '/js/**/*.min.js', '!' + baseDir + '/js/**/*.tmp.js'], {usePolling: true}, series(scripts)).on('change', browserSync.reload);
}

exports.browsersync = browsersync;
exports.scripts     = series(scripts);
exports.assets      = series(styles, scripts);
exports.styles      = styles;
exports.default     = series(scripts, styles, parallel(browsersync, startwatch));
