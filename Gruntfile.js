/*
 * Copyright (c) 2017 Jeremy Thomerson
 * Licensed under the MIT license.
 */
'use strict';

var path = require('path'),
    getCodeVersion = require('silvermine-serverless-utils/src/get-code-version'),
    sass = require('sass'),
    join = path.join.bind(path);

module.exports = function(grunt) {

   var DEBUG = !!grunt.option('debug'),
       config;

   config = {
      js: {
         all: [ 'Gruntfile.js', 'src/**/*.js', 'tests/**/*.js' ],
         standalone: join(__dirname, 'src', 'js', 'standalone.js'),
      },

      sass: {
         all: [ '**/*.scss', '!**/node_modules/**/*' ],
         main: join('src', 'scss', 'videojs-airplay.scss'),
      },

      images: {
         base: join('src', 'images'),
      },

      dist: {
         base: join(__dirname, 'dist'),
      },
   };

   config.dist.js = {
      bundle: join(config.dist.base, 'silvermine-videojs-airplay.js'),
      minified: join(config.dist.base, 'silvermine-videojs-airplay.min.js'),
   };

   config.dist.css = {
      base: config.dist.base,
      main: join(config.dist.base, 'silvermine-videojs-airplay.css'),
   };

   config.dist.images = join(config.dist.base, 'images');

   grunt.initConfig({

      pkg: grunt.file.readJSON('package.json'),
      versionInfo: getCodeVersion.both(),
      config: config,

      clean: {
         build: [ config.dist.base ],
      },

      copy: {
         images: {
            files: [
               {
                  expand: true,
                  cwd: config.images.base,
                  src: '**/*',
                  dest: config.dist.images,
               },
            ],
         },
      },

      browserify: {
         standalone: {
            src: config.js.standalone,
            dest: config.dist.js.bundle,
         },
      },

      uglify: {
         main: {
            files: {
               '<%= config.dist.js.minified %>': config.dist.js.bundle,
            },
            options: {
               banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> <%= versionInfo %> */\n',
               sourceMap: DEBUG,
               sourceMapIncludeSources: DEBUG,
               mangle: DEBUG,
               compress: DEBUG,
               beautify: !DEBUG,
            },
         },
      },

      sass: {
         main: {
            files: [
               {
                  src: config.sass.main,
                  dest: config.dist.css.main,
                  ext: '.css',
                  extDot: 'first',
               },
            ],
         },
         options: {
            sourceMap: DEBUG,
            implementation: sass,
            indentWidth: 3,
            outputStyle: DEBUG ? 'expanded' : 'compressed',
            sourceComments: DEBUG,
         },
      },

      postcss: {
         options: {
            map: DEBUG,
            processors: [
               require('autoprefixer')({ browsers: '> .05%' }), // eslint-disable-line global-require
            ],
         },
         styles: {
            src: config.dist.css.main,
         },
      },

      watch: {
         grunt: {
            files: [ 'Gruntfile.js' ],
            tasks: [ 'build' ],
         },

         js: {
            files: [ 'src/**/*.js' ],
            tasks: [ 'build-js' ],
         },

         css: {
            files: [ 'src/**/*.scss' ],
            tasks: [ 'build-css' ],
         },
      },

   });

   grunt.loadNpmTasks('grunt-contrib-clean');
   grunt.loadNpmTasks('grunt-contrib-uglify');
   grunt.loadNpmTasks('grunt-contrib-watch');
   grunt.loadNpmTasks('grunt-browserify');
   grunt.loadNpmTasks('grunt-contrib-copy');
   grunt.loadNpmTasks('grunt-sass');
   grunt.loadNpmTasks('grunt-postcss');

   grunt.registerTask('build-js', [ 'browserify', 'uglify' ]);
   grunt.registerTask('build-css', [ 'sass', 'postcss:styles' ]);
   grunt.registerTask('build', [ 'build-js', 'build-css', 'copy:images' ]);
   grunt.registerTask('develop', [ 'build', 'watch' ]);
   grunt.registerTask('default', [ 'build' ]);

};
