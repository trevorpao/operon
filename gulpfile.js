// generated on 2017-10-01 using generator-webapp 2.4.1
const gulp = require('gulp');
const babel = require('gulp-babel');
const gulpLoadPlugins = require('gulp-load-plugins');
const browserSync = require('browser-sync').create();
const del = require('del');
const wiredep = require('wiredep').stream;
const runSequence = require('gulp4-run-sequence'); // Runs a sequence of gulp tasks in the specified order
const $ = gulpLoadPlugins();
const reload = browserSync.reload;
const sass = require('gulp-sass')(require('sass'));
var f3CMSPath = '../www/f3cms/';
var dev = false;
gulp.task('styles', (done) => {
    gulp.src('app/styles/*.scss').pipe($.plumber()).pipe($.if(dev, $.sourcemaps.init())).pipe(sass.sync({
        outputStyle: 'expanded',
        precision: 10,
        includePaths: ['.']
    }).on('error', sass.logError)).pipe($.autoprefixer()).pipe($.if(dev, $.sourcemaps.write())).pipe(gulp.dest('.tmp/styles')).pipe(reload({
        stream: true
    }));
    done();
});
gulp.task('scripts', (done) => {
    gulp.src('app/scripts/**/*.js').pipe($.plumber()).pipe($.if(dev, $.sourcemaps.init())).pipe(babel()).pipe($.if(dev, $.sourcemaps.write('.'))).pipe(gulp.dest('.tmp/scripts')).pipe(reload({
        stream: true
    }));
    done();
});
gulp.task('tmpls', (done) => {
    gulp.src('app/tmpls/**/*.html').pipe($.if(dev, gulp.dest('.tmp/tmpls'), gulp.dest('dist/tmpls')));
    done();
});
gulp.task('lint', (done) => {
    return lint('app/scripts/**/*.js').pipe(gulp.dest('app/scripts'));
});
gulp.task('images', (done) => {
    gulp.src('app/images/**/*').pipe($.cache($.imagemin())).pipe(gulp.dest('dist/images'));
    done();
});
gulp.task('fonts', (done) => {
    gulp.src(require('main-bower-files')('**/*.{eot,svg,ttf,woff,woff2}', function(err) {}).concat('app/fonts/**/*')).pipe($.if(dev, gulp.dest('.tmp/fonts'), gulp.dest('dist/fonts')));
    done();
});
gulp.task('extras', (done) => {
    gulp.src(['app/*', '!app/*.html'], {
        dot: true
    }).pipe(gulp.dest('dist'));
    done();
});
gulp.task('move', (done) => {
    gulp.src(['dist/images/*', 'dist/scripts/*', 'dist/styles/*', 'dist/tmpls/**/*', ], {
        base: 'dist'
    }).pipe(gulp.dest(f3CMSPath + 'assets/'));
    done();
});
// inject bower components
gulp.task('wiredep', (done) => {
    gulp.src('app/styles/*.scss').pipe($.filter(file => file.stat && file.stat.size)).pipe(wiredep({
        ignorePath: /^(\.\.\/)+/
    })).pipe(gulp.dest('app/styles'));
    gulp.src('app/*.html').pipe(wiredep({
        exclude: ['bootstrap'],
        ignorePath: /^(\.\.\/)*\.\./
    })).pipe(gulp.dest('app'));
    done();
});
gulp.task('clean', del.bind(null, ['.tmp', 'dist']));
gulp.task('serve', (done) => {
    dev = true;
    runSequence(['clean', 'wiredep'], ['styles', 'scripts', 'fonts'], () => {
        browserSync.init({
            notify: false,
            port: 9001,
            open: 'external',
            host: 'loc.f3cms.com',
            https: {
                key: "./letsencrypt/loc.f3cms.com+1-key.pem",
                cert: "./letsencrypt/loc.f3cms.com+1.pem"
            },
            server: {
                baseDir: ['.tmp', 'app'],
                routes: {
                    '/bower_components': 'bower_components',
                    '/node_modules': 'node_modules'
                }
            }
        });
        gulp.watch(['app/*.html', 'app/tmpls/**/*.html', 'app/images/**/*', '.tmp/fonts/**/*']).on('change', reload);
        gulp.watch('app/styles/**/*.scss', gulp.series('styles'));
        gulp.watch('app/scripts/**/*.js', gulp.series('scripts'));
        gulp.watch('app/fonts/**/*', gulp.series('fonts'));
        gulp.watch('bower.json', gulp.series('wiredep', 'fonts'));
    });
    done();
});
gulp.task('html', gulp.series('styles', 'scripts', 'tmpls', (done) => {
    gulp.src('app/*.html').pipe($.useref({
        searchPath: ['.tmp', 'app', '.']
    })).pipe($.if(/\.js$/, $.uglify({
        compress: {
            drop_console: true
        }
    }))).pipe($.if(/\.css$/, $.cssnano({
        safe: true,
        autoprefixer: false
    }))).pipe($.if(/\.html$/, $.htmlmin({
        collapseWhitespace: true,
        minifyCSS: true,
        minifyJS: {
            compress: {
                drop_console: true
            }
        },
        processConditionalComments: true,
        removeComments: true,
        removeEmptyAttributes: true,
        removeScriptTypeAttributes: true,
        removeStyleLinkTypeAttributes: true
    }))).pipe(gulp.dest('dist'));
    done();
}));
gulp.task('build', gulp.series('lint', 'html', 'images', 'fonts', 'extras', (done) => {
    return gulp.src('dist/**/*').pipe($.size({
        title: 'build',
        gzip: true
    }));
}));
gulp.task('default', () => {
    return new Promise(resolve => {
        dev = false;
        runSequence(['clean', 'wiredep'], 'build', resolve);
    });
});

function lint(files) {
    return gulp.src(files).pipe($.eslint({
        fix: true
    })).pipe(reload({
        stream: true,
        once: true
    })).pipe($.eslint.format()).pipe($.if(!browserSync.active, $.eslint.failAfterError()));
}
