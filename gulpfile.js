'use strict';

const del = require('del');
const gulp = require('gulp');
const runSequence = require('run-sequence');
const pkg = require('./package.json');

const plugins = {
  autoprefixer: require('gulp-autoprefixer'),
  babel: require('gulp-babel'),
  concat: require('gulp-concat'),
  cssnano: require('gulp-cssnano'),
  eslint: require('gulp-eslint'),
  favicons: require('gulp-favicons'),
  groupCssMediaQueries: require('gulp-group-css-media-queries'),
  imagemin: require('gulp-imagemin'),
  livereload: require('gulp-livereload'),
  newer: require('gulp-newer'),
  plumber: require('gulp-plumber'),
  rename: require('gulp-rename'),
  sourcemaps: require('gulp-sourcemaps'),
  stylus: require('gulp-stylus'),
  uglify: require('gulp-uglify'),
  util: require('gulp-util'),
  watch: require('gulp-watch'),
};

const config = {};

config.paths = {};
config.paths.basedir = global.process.env.INIT_CWD;
config.paths.sourcemaps = './';

config.paths.srcDir = `${config.paths.basedir}/assets/src`;
config.paths.src = {
  styles: `${config.paths.srcDir}/styles`,
  scripts: `${config.paths.srcDir}/scripts`,
  images: `${config.paths.srcDir}/images`,
  fonts: `${config.paths.srcDir}/fonts`,
};

config.paths.distDir = `${config.paths.basedir}/assets/dist`;
config.paths.dist = {
  styles: `${config.paths.distDir}/css`,
  scripts: `${config.paths.distDir}/js`,
  images: `${config.paths.distDir}/img`,
  fonts: `${config.paths.distDir}/font`,
  favicons: `${config.paths.distDir}/favicon`,
};

config.files = {
  src: {
    styles: {
      app: config.paths.src.styles + '/app.styl',
    },
    scripts: {
      app: config.paths.src.scripts + '/app.js',
    },
    images: {
      favicon: config.paths.src.images + '/favicon.svg',
    },
  },
  dist: {
    styles: {
      app: 'app.css',
    },
    scripts: {
      app: 'app.js',
    },
  }
};

config.match = {
  dist: {
    styles: config.paths.dist.styles + '/**/*.css',
    scripts: config.paths.dist.scripts + '/**/*.js',
    images: config.paths.dist.images + '/**/*.{jpg,jpeg,png,gif,svg}',
    fonts: config.paths.dist.fonts + '/**/*.{woff,woff2,ttf,svg,eot}',
  },
  src: {
    styles: config.paths.src.styles + '/**/*.styl',
    scripts: config.paths.src.scripts + '/**/*.js',
    images: config.paths.src.images + '/**/*.{jpg,jpeg,png,gif,svg}',
    fonts: config.paths.src.fonts + '/**/*.{woff,woff2,ttf,svg,eot}',
  },
  php: config.paths.basedir + '/{*.php,inc/*.php}',
  twig: config.paths.basedir + '/templates/**/*.twig',
};

config.plugins = {
  autoprefixer: {
    // List of browsers which are supported in your project
    browsers: [
      'last 2 versions',
    ],
    cascade: true, // Use Visual Cascade if CSS is uncompressed
    add: true, // Add prefixes
    remove: true, // Remove outdated prefixes
  },
  babel: {
    babelrc: true, // Specify whether or not to use .babelrc and .babelignore files
    code: true, // Enable code generation
    compact: false, // Do not include superfluous whitespace characters and line terminators
    comments: true, // Output comments in generated output
  },
  cssnano: {
    discardComments: {
      removeAll: true, // Remove all comments marked as important
    },
    discardDuplicates: true, // Discard duplicate rules in your CSS
    discardEmpty: true, // Discard empty rules and values
    discardUnused: {
      fontFace: true, // Pass false to disable discarding unused font face rules
      counterStyle: true, // Pass false to disable discarding unused counter style rules
      keyframes: true, // Pass false to disable discarding unused keyframe rules.
      namespace: true, // Pass false to disable discarding unused namespace rules.
    }
  },
  eslint: {
    useEslintrc: true, // When false, ESLint will not load .eslintrc files.
  },
  favicons: {
    appName: pkg.name, // Your application's name.
    appDescription: pkg.description, // Your application's description.
    developerName: pkg.author.name, // Your (or your developer's) name.
    developerURL: pkg.author.url, // Your (or your developer's) URL.
    background: '#fff', // Background colour for flattened icons.
    theme_color: '#fff', // Theme color for browser chrome.
    path: '/assets/dist/favicon', // Path for overriding default icons path.
    display: 'standalone', // Android display: 'browser' or 'standalone'.
    orientation: 'any', // Android orientation: 'portrait' or 'landscape'.
    start_url: '/', // Android start application's URL.
    version: pkg.version, // Your application's version number.
    logging: false, // Print logs to console?
    online: false, // Use RealFaviconGenerator to create favicons?
    preferOnline: false, // Use offline generation, if online generation has failed.
    html: "index.html",
    pipeHTML: true,
    icons: {
      android: false, // Create Android homescreen icon.
      appleIcon: false, // Create Apple touch icons.
      appleStartup: false, // Create Apple startup images.
      coast: false, // Create Opera Coast icon.
      favicons: true, // Create regular favicons.
      firefox: false, // Create Firefox OS icons.
      windows: false, // Create Windows 8 tile icons.
      yandex: false, // Create Yandex browser icon.
    }
  },
  imagemin: {
    optimizationLevel: 5, // Optimization level between 0 and 7
    progressive: true, // Lossless conversion to progressive
    interlaced: true, // Interlace gif for progressive rendering
    multipass: true, // Optimize svg multiple times until it's fully optimized
  },
  livereload: {
    port: 35729, // Server port
    host: '127.0.0.1', // Server host
    start: false, // Automatically start
    quiet: false, // Disable console logging
  },
  plumber: {
    'errorHandler': function (err) {
      const message = plugins.util.colors.red(err);
      plugins.util.beep();
      plugins.util.log(message);
      this.emit('end');
    }
  },
  rename: {
    suffix: '.min',
  },
  stylus: {
    compress: false, // Compress CSS output
    compare: false, // Display input along with output
    linenos: false, // Emits comments in the generated CSS indicating the corresponding Stylus line
  },
  sourcemaps: {
    addComment: true, // By default a comment referencing the source map is added. Set this to false to disable the comment
    includeContent: false, // By default the source maps include the source code. Pass false to use the original files
    sourceRoot: config.paths.sourcemaps, // Set the path where the source files are hosted
  },
  uglify: {
    mangle: true, // Pass false to skip mangling names
    compress: {
      drop_debugger: false, // discard “debugger” statements
    }
  },
  watch: {
    verbose: false, // Enable verbose output
    ignoreInitial: true, // Indicates whether chokidar should ignore the initial add events or not
  }
};

gulp.task('clean', function () {
  return del([config.paths.distDir]);
});

gulp.task('images', function () {
  return gulp.src(config.match.src.images)
    .pipe(plugins.newer(config.paths.dist.images))
    .pipe(plugins.imagemin(config.imagemin))
    .pipe(gulp.dest(config.paths.dist.images));
});

gulp.task('favicon', function () {
  return gulp.src(config.files.src.images.favicon)
    .pipe(plugins.favicons(config.plugins.favicons))
    .on("error", plugins.util.log)
    .pipe(gulp.dest(config.paths.dist.favicons));
});

gulp.task('fonts', function () {
  return gulp.src(config.match.src.fonts)
    .pipe(gulp.dest(config.paths.dist.fonts));
});

gulp.task('scripts', function () {
  return gulp.src(config.files.src.scripts.app)
    .pipe(plugins.plumber(config.plugins.plumber))
    .pipe(plugins.sourcemaps.init())
    .pipe(plugins.eslint(config.plugins.eslint))
    .pipe(plugins.eslint.format())
    .pipe(plugins.concat(config.files.dist.scripts.app))
    .pipe(plugins.babel(config.plugins.babel))
    .pipe(gulp.dest(config.paths.dist.scripts))
    .pipe(plugins.rename(config.plugins.rename))
    .pipe(plugins.uglify(config.plugins.uglify))
    .pipe(plugins.sourcemaps.write(config.paths.sourcemaps, config.plugins.sourcemaps))
    .pipe(gulp.dest(config.paths.dist.scripts));
});

gulp.task('styles', function () {
  return gulp.src(config.files.src.styles.app)
    .pipe(plugins.plumber(config.plugins.plumber))
    .pipe(plugins.sourcemaps.init())
    .pipe(plugins.stylus(config.plugins.stylus))
    .pipe(plugins.autoprefixer(config.plugins.autoprefixer))
    .pipe(plugins.groupCssMediaQueries())
    .pipe(plugins.concat(config.files.dist.styles.app))
    .pipe(gulp.dest(config.paths.dist.styles))
    .pipe(plugins.rename(config.plugins.rename))
    .pipe(plugins.cssnano(config.plugins.cssnano))
    .pipe(plugins.sourcemaps.write(config.paths.sourcemaps, config.plugins.sourcemaps))
    .pipe(gulp.dest(config.paths.dist.styles));
});

gulp.task('watch', function () {
  // Start the reload server
  plugins.livereload.listen(config.plugins.livereload);
  // Watch sources and trigger build tasks on change
  for (let key in config.match.src) {
    if (config.match.src.hasOwnProperty(key)) {
      plugins.watch(
        config.match.src[key],
        config.plugins.watch,
        function () {
          gulp.start(key);
        }
      );
    }
  }
  // Watch build files to trigger reload
  plugins.watch(
    [
      config.match.php,
      config.match.twig,
      config.match.dist.styles,
      config.match.dist.scripts,
      config.match.dist.images,
      config.match.dist.fonts,
    ],
    config.plugins.watch,
    function (file) {
      plugins.livereload.changed(file);
    }
  );
});

gulp.task('build', function (callback) {
  runSequence('clean', 'styles', 'scripts', 'images', 'fonts', 'favicon', callback);
});

gulp.task('default', function (callback) {
  runSequence('build', callback);
});
