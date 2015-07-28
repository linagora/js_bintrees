'use strict';

module.exports = function(grunt) {
  var CI = grunt.option('ci');

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    mochaTest: {
      test: {
        options: {
          reporter: 'spec'
        },
        src: ['test/test.js']
      }
    },

    jshint: {
      options: {
        jshintrc: '.jshintrc',
        reporter: CI && 'checkstyle',
        reporterOutput: CI && 'jshint.xml'
      },
      all: {
        src: [
          'Gruntfile.js',
          'lib/*.js',
        ]
      },
      quick: {
        // You must run the prepare-quick-lint target before jshint:quick,
        // files are filled in dynamically.
        src: []
      }
    },
    gjslint: {
      options: {
        flags: [
          '--disable 0110',
          '--nojsdoc',
          '-e test/karma-include'
        ],
        reporter: {
          name: CI ? 'gjslint_xml' : 'console',
          dest: CI ? 'gjslint.xml' : undefined
        }
      },
      all: {
        src: ['<%= jshint.all.src %>']
      },
      quick: {
        src: ['<%= jshint.quick.src %>']
      }
    },
    lint_pattern: {
      options: {
        rules: [
          { pattern: /(describe|it)\.only/, message: 'Must not use .only in tests' }
        ]
      },
      all: {
        src: ['<%= jshint.all.src %>']
      },
      quick: {
        src: ['<%= jshint.quick.src %>']
      }
    },

    browserify: {
      main: {
        src: 'lib/rbtree_by_index.js',
        dest: 'dist/rbtree_by_index.js'
      },
      options: {
        browserifyOptions: {
          standalone: 'RBTreeByIndex'
        }
      }
    },
    uglify: {
      main: {
        src: 'dist/rbtree_by_index.js',
        dest: 'dist/rbtree_by_index.min.js'
      }
    }

  });

  grunt.loadNpmTasks('grunt-mocha-test');
  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-gjslint');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-lint-pattern');

  grunt.registerTask('linters', 'Check code for lint', ['jshint:all', 'gjslint:all', 'lint_pattern:all']);
  grunt.registerTask('build', ['browserify', 'uglify']);
  grunt.registerTask('default', ['linters', 'mochaTest', 'build']);
};
